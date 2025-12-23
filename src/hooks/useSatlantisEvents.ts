/**
 * useSatlantisEvents - React hooks for Satlantis event discovery and detail
 *
 * Provides hooks for:
 * - Discovery feed (list of sports events)
 * - Event detail with participant list and leaderboard
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SatlantisEventService } from '../services/satlantis/SatlantisEventService';
import { SatlantisRSVPService } from '../services/satlantis/SatlantisRSVPService';
import { Competition1301QueryService, WorkoutMetrics } from '../services/competition/Competition1301QueryService';
import { SatlantisEventScoringService } from '../services/scoring/SatlantisEventScoringService';
import { UnifiedCacheService } from '../services/cache/UnifiedCacheService';
import { FrozenEventStore } from '../services/cache/FrozenEventStore';
import { AppStateManager } from '../services/core/AppStateManager';
import { WorkoutEventStore, StoredWorkout } from '../services/fitness/WorkoutEventStore';
import { hexToNpub } from '../utils/ndkConversion';
import type {
  SatlantisEvent,
  SatlantisEventFilter,
  SatlantisLeaderboardEntry,
  SatlantisEventStatus,
} from '../types/satlantis';
import {
  getEventStatus,
  mapSportToActivityType,
} from '../types/satlantis';

// ============================================================================
// Helper: Convert StoredWorkout[] to WorkoutMetrics Map
// ============================================================================

/**
 * Convert StoredWorkout[] from WorkoutEventStore to Map<string, WorkoutMetrics>
 * This enables Satlantis events to use the unified workout cache
 */
function convertStoredWorkoutsToMetrics(
  workouts: StoredWorkout[],
  activityType: string
): Map<string, WorkoutMetrics> {
  const metricsMap = new Map<string, WorkoutMetrics>();

  // Filter by activity type
  const filteredWorkouts = workouts.filter(
    (w) => w.activityType?.toLowerCase() === activityType.toLowerCase()
  );

  // Group by pubkey
  const workoutsByUser = new Map<string, StoredWorkout[]>();
  for (const workout of filteredWorkouts) {
    const existing = workoutsByUser.get(workout.pubkey) || [];
    existing.push(workout);
    workoutsByUser.set(workout.pubkey, existing);
  }

  // Build WorkoutMetrics for each user
  for (const [pubkey, userWorkouts] of workoutsByUser) {
    const npub = hexToNpub(pubkey) || pubkey;

    // Calculate aggregated metrics
    let totalDistance = 0; // km
    let totalDuration = 0; // minutes
    let totalCalories = 0;
    let longestDistance = 0;
    let longestDuration = 0;
    const activeDaysSet = new Set<string>();

    for (const w of userWorkouts) {
      const distanceKm = (w.distance || 0) / 1000;
      const durationMin = (w.duration || 0) / 60;

      totalDistance += distanceKm;
      totalDuration += durationMin;
      totalCalories += w.calories || 0;
      longestDistance = Math.max(longestDistance, distanceKm);
      longestDuration = Math.max(longestDuration, durationMin);

      // Track unique days
      const date = new Date(w.createdAt * 1000).toDateString();
      activeDaysSet.add(date);
    }

    // Convert StoredWorkout to scoring-compatible format
    // The scoring service will use parseSplitsFromWorkout() which now accepts pre-parsed splits
    const scoringWorkouts = userWorkouts.map((w) => ({
      id: w.id,
      nostrPubkey: w.pubkey,
      distance: w.distance || 0, // meters
      duration: w.duration || 0, // seconds
      calories: w.calories || 0,
      splits: w.splits, // Pre-parsed Map<number, number> - scoring service now accepts this
      startTime: new Date(w.createdAt * 1000).toISOString(),
      source: 'nostr' as const,
      nostrEventId: w.id,
      nostrCreatedAt: w.createdAt,
      unitSystem: 'metric' as const,
    }));

    const metrics: WorkoutMetrics = {
      npub,
      totalDistance,
      totalDuration,
      totalCalories,
      workoutCount: userWorkouts.length,
      activeDays: activeDaysSet.size,
      longestDistance,
      longestDuration,
      averagePace: totalDistance > 0 ? totalDuration / totalDistance : undefined,
      averageSpeed: totalDuration > 0 ? (totalDistance / totalDuration) * 60 : undefined,
      streakDays: 0, // Not calculated for simplicity
      workouts: scoringWorkouts as any, // Cast to any since we're providing a compatible subset
    };

    metricsMap.set(npub, metrics);
  }

  return metricsMap;
}

// ============================================================================
// useSatlantisEvents - Discovery feed hook
// ============================================================================

interface UseSatlantisEventsReturn {
  events: SatlantisEvent[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for discovering Satlantis sports events
 */
export function useSatlantisEvents(
  filter?: SatlantisEventFilter
): UseSatlantisEventsReturn {
  const [events, setEvents] = useState<SatlantisEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const loadEvents = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const discovered = await SatlantisEventService.discoverSportsEvents(filter, forceRefresh);
      if (isMounted.current) {
        setEvents(discovered);
      }
    } catch (err) {
      console.error('[useSatlantisEvents] Error:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [JSON.stringify(filter)]);

  // Refresh function that bypasses cache
  const refresh = useCallback(async () => {
    await loadEvents(true);
  }, [loadEvents]);

  useEffect(() => {
    isMounted.current = true;
    loadEvents(false); // Use cache on initial load

    return () => {
      isMounted.current = false;
    };
  }, [loadEvents]);

  // Refresh events when app returns to foreground
  useEffect(() => {
    const unsubscribe = AppStateManager.onStateChange((isActive) => {
      if (isActive && isMounted.current) {
        console.log('[useSatlantisEvents] App returned to foreground - refreshing events');
        loadEvents(true); // Force refresh from relays
      }
    });

    return () => unsubscribe();
  }, [loadEvents]);

  return {
    events,
    isLoading,
    error,
    refresh,
  };
}

// ============================================================================
// useSatlantisEventDetail - Event detail with leaderboard hook
// ============================================================================

interface UseSatlantisEventDetailReturn {
  event: SatlantisEvent | null;
  participants: string[];
  leaderboard: SatlantisLeaderboardEntry[];
  eventStatus: SatlantisEventStatus;
  isLoading: boolean;
  isLoadingLeaderboard: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addLocalParticipant: (pubkey: string) => void; // Optimistic UI - add participant locally
}

/**
 * Hook for single event detail with leaderboard
 */
export function useSatlantisEventDetail(
  eventPubkey: string,
  eventId: string
): UseSatlantisEventDetailReturn {
  const [event, setEvent] = useState<SatlantisEvent | null>(null);
  const [fetchedParticipants, setFetchedParticipants] = useState<string[]>([]);
  const [localParticipants, setLocalParticipants] = useState<string[]>([]); // Optimistic UI
  const [leaderboard, setLeaderboard] = useState<SatlantisLeaderboardEntry[]>([]);
  const [eventStatus, setEventStatus] = useState<SatlantisEventStatus>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Merge fetched and local participants (for optimistic UI)
  const participants = useMemo(() => {
    return [...new Set([...fetchedParticipants, ...localParticipants])];
  }, [fetchedParticipants, localParticipants]);

  // Add local participant for optimistic UI
  const addLocalParticipant = useCallback((pubkey: string) => {
    setLocalParticipants(prev => {
      if (prev.includes(pubkey)) return prev;
      return [...prev, pubkey];
    });
  }, []);

  const loadEventDetail = useCallback(async (forceRefresh: boolean = false) => {
    if (!eventPubkey || !eventId) return;

    console.log(`[useSatlantisEventDetail] 🚀 Loading event detail...`);
    console.log(`[useSatlantisEventDetail]   - eventPubkey: ${eventPubkey.slice(0, 16)}...`);
    console.log(`[useSatlantisEventDetail]   - eventId: ${eventId}`);
    console.log(`[useSatlantisEventDetail]   - forceRefresh: ${forceRefresh}`);

    // NOTE: Do NOT clear local participants on refresh
    // The useMemo merge already deduplicates, and clearing causes RSVP to "disappear"
    // while the Nostr query is in progress (user sees themselves removed temporarily)

    setError(null);

    try {
      // ============================================================================
      // FROZEN EVENT CHECK: Return permanently stored data for ended events
      // ============================================================================
      if (!forceRefresh) {
        const frozenData = await FrozenEventStore.get(eventId);
        if (frozenData) {
          console.log(`[useSatlantisEventDetail] ❄️ Using frozen data for ended event`);
          console.log(`[useSatlantisEventDetail]   - Participants: ${frozenData.participants.length}`);
          console.log(`[useSatlantisEventDetail]   - Leaderboard entries: ${frozenData.leaderboard.length}`);

          // Load event metadata from cache (just for display, frozen data is authoritative)
          const cachedEvent = await SatlantisEventService.getEventById(eventId, eventPubkey, false);
          if (cachedEvent) {
            setEvent(cachedEvent);
            setEventStatus('ended');
          }

          setFetchedParticipants(frozenData.participants);
          setLeaderboard(frozenData.leaderboard);
          setIsLoading(false);
          setIsLoadingLeaderboard(false);
          return; // Done - frozen data is permanent
        }
      }

      // ============================================================================
      // CACHE-FIRST PATTERN: Show cached data immediately, refresh in background
      // ============================================================================

      // Step 1: Try to load cached data immediately (no network, instant display)
      if (!forceRefresh) {
        console.log(`[useSatlantisEventDetail] 📦 Checking cache...`);
        const cachedEvent = await SatlantisEventService.getEventById(eventId, eventPubkey, false);

        if (cachedEvent) {
          console.log(`[useSatlantisEventDetail] ✅ Cache hit! Showing cached data instantly`);
          setEvent(cachedEvent);
          setEventStatus(getEventStatus(cachedEvent));

          // Load cached participants in parallel
          const cachedParticipants = await SatlantisRSVPService.getEventParticipants(
            eventPubkey,
            eventId,
            false // Don't skip cache
          );
          setFetchedParticipants(cachedParticipants);
          setIsLoading(false); // Stop spinner - user sees cached data immediately!

          // Load cached leaderboard if event has started
          const now = Math.floor(Date.now() / 1000);
          if (now >= cachedEvent.startTime) {
            await loadLeaderboard(cachedEvent, cachedParticipants, false);
          }

          // IMPORTANT: If participants is empty, trigger background refresh
          // This handles the case where relay was down when RSVPs were initially fetched
          if (cachedParticipants.length === 0) {
            console.log(`[useSatlantisEventDetail] ⚠️ Cached participants empty - triggering background refresh`);
            // Don't await - let it run in background while user sees cached event data
            SatlantisRSVPService.getEventParticipants(eventPubkey, eventId, true)
              .then((freshParticipants) => {
                if (isMounted.current && freshParticipants.length > 0) {
                  console.log(`[useSatlantisEventDetail] 🔄 Background refresh found ${freshParticipants.length} participants!`);
                  setFetchedParticipants(freshParticipants);
                  // Also refresh leaderboard with new participants
                  if (now >= cachedEvent.startTime) {
                    loadLeaderboard(cachedEvent, freshParticipants, true);
                  }
                }
              })
              .catch((err) => {
                console.warn(`[useSatlantisEventDetail] Background refresh failed:`, err);
              });
          }

          console.log(`[useSatlantisEventDetail] 🎉 Cached data displayed${cachedParticipants.length === 0 ? ' (background refresh in progress)' : ''}`);
          return; // Done! User sees cached data instantly
        }
      }

      // Step 2: No cache or forceRefresh - need to load fresh data
      console.log(`[useSatlantisEventDetail] 🌐 Loading fresh data from Nostr...`);
      setIsLoading(true);

      // Load event details with retry logic for relay latency
      console.log(`[useSatlantisEventDetail] 📥 Fetching event data...`);
      let eventData = await SatlantisEventService.getEventById(eventId, eventPubkey, true);

      // Retry up to 3 times with exponential backoff if event not found
      if (!eventData) {
        const retryDelays = [1000, 2000, 4000]; // 1s, 2s, 4s
        for (let i = 0; i < retryDelays.length && !eventData; i++) {
          console.log(`[useSatlantisEventDetail] ⏳ Event not found, retry ${i + 1}/3 in ${retryDelays[i]}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelays[i]));
          if (!isMounted.current) return;
          eventData = await SatlantisEventService.getEventById(eventId, eventPubkey, true);
        }
      }

      if (!isMounted.current) return;

      if (!eventData) {
        console.log(`[useSatlantisEventDetail] ❌ Event not found after retries!`);
        setError('Event not found');
        setIsLoading(false);
        return;
      }

      console.log(`[useSatlantisEventDetail] ✅ Event found: "${eventData.title}"`);
      setEvent(eventData);
      setEventStatus(getEventStatus(eventData));

      // Load participants from RSVPs (fresh data)
      console.log(`[useSatlantisEventDetail] 👥 Loading participants...`);
      const participantPubkeys = await SatlantisRSVPService.getEventParticipants(
        eventPubkey,
        eventId,
        true // Skip cache for fresh data
      );
      if (!isMounted.current) return;

      console.log(`[useSatlantisEventDetail] 👥 Participants found: ${participantPubkeys.length}`);
      if (participantPubkeys.length > 0) {
        console.log(`[useSatlantisEventDetail]   - Participant pubkeys:`, participantPubkeys.map(p => p.slice(0, 16) + '...'));
      }

      setFetchedParticipants(participantPubkeys);
      setIsLoading(false);

      // Load leaderboard if event has started/ended
      const now = Math.floor(Date.now() / 1000);

      console.log(`[useSatlantisEventDetail] 📊 Event timing check:`);
      console.log(`   - Now: ${new Date(now * 1000).toISOString()}`);
      console.log(`   - Event start: ${new Date(eventData.startTime * 1000).toISOString()}`);
      console.log(`   - Event end: ${new Date(eventData.endTime * 1000).toISOString()}`);
      console.log(`   - Has started: ${now >= eventData.startTime}`);
      console.log(`   - Participants from RSVPs + local: ${participantPubkeys.length}`);

      if (now >= eventData.startTime) {
        console.log(`[useSatlantisEventDetail] ⏱️ Event has started - loading leaderboard...`);
        await loadLeaderboard(eventData, participantPubkeys, true);
      } else {
        console.log(`[useSatlantisEventDetail] ⏳ Event hasn't started yet, skipping leaderboard load`);
      }
    } catch (err) {
      console.error('[useSatlantisEventDetail] ❌ Error:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
        setIsLoading(false);
      }
    }
  }, [eventPubkey, eventId]);

  const loadLeaderboard = async (
    eventData: SatlantisEvent,
    participantPubkeys: string[],
    forceRefresh: boolean = false
  ) => {
    if (!isMounted.current) return;
    setIsLoadingLeaderboard(true);

    const cacheKey = `satlantis_leaderboard_${eventData.id}`;
    const now = Math.floor(Date.now() / 1000);
    const isCompleted = eventData.endTime < now;

    console.log(`[useSatlantisEventDetail] 🏁 loadLeaderboard called`);
    console.log(`[useSatlantisEventDetail]   - Event: "${eventData.title}"`);
    console.log(`[useSatlantisEventDetail]   - Participants count: ${participantPubkeys.length}`);
    console.log(`[useSatlantisEventDetail]   - Sport type: ${eventData.sportType}`);
    console.log(`[useSatlantisEventDetail]   - Scoring type: ${eventData.scoringType || 'fastest_time'}`);
    console.log(`[useSatlantisEventDetail]   - Target distance: ${eventData.distance || 'none'}`);
    console.log(`[useSatlantisEventDetail]   - Event completed: ${isCompleted}`);
    console.log(`[useSatlantisEventDetail]   - Force refresh: ${forceRefresh}`);

    try {
      // Check cache first (unless forceRefresh)
      // Now accepts empty arrays too (with shorter TTL) to prevent relay spam
      if (!forceRefresh) {
        const cached = await UnifiedCacheService.get<SatlantisLeaderboardEntry[]>(cacheKey);
        if (cached !== null && cached !== undefined) {
          console.log(`[useSatlantisEventDetail] 💾 Leaderboard cache hit: ${cached.length} entries`);
          setLeaderboard(cached);
          setIsLoadingLeaderboard(false);
          return;
        }
        console.log(`[useSatlantisEventDetail] 📭 Leaderboard cache miss - fetching from Nostr...`);
      } else {
        console.log(`[useSatlantisEventDetail] 🔄 Force refresh - bypassing cache`);
      }

      // Map Satlantis sport type to RUNSTR activity type
      const activityType = mapSportToActivityType(eventData.sportType);
      console.log(`[useSatlantisEventDetail]   - Mapped activity type: ${activityType}`);

      // Query workouts from RSVPed participants only
      // Satlantis events require RSVP to appear on leaderboard
      let metrics: Map<string, WorkoutMetrics>;

      if (participantPubkeys.length > 0) {
        console.log(`[useSatlantisEventDetail] 📋 Querying ${participantPubkeys.length} participants' workouts`);
        console.log(`[useSatlantisEventDetail]   - Date range: ${new Date(eventData.startTime * 1000).toISOString()} to ${new Date(eventData.endTime * 1000).toISOString()}`);

        // Check if event is within WorkoutEventStore's 7-day window (reduced from 14 for speed)
        const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
        const eventIsRecent = eventData.startTime >= sevenDaysAgo;

        if (eventIsRecent) {
          // Use WorkoutEventStore (unified cache) for recent events
          console.log(`[useSatlantisEventDetail] 📦 Using WorkoutEventStore (event within 7-day window)`);
          const store = WorkoutEventStore.getInstance();

          // Convert npubs to hex pubkeys for store query
          const hexPubkeys = participantPubkeys.map((npub) => {
            // participantPubkeys might be npub or hex - handle both
            if (npub.startsWith('npub')) {
              try {
                const { nip19 } = require('@nostr-dev-kit/ndk');
                const decoded = nip19.decode(npub);
                return decoded.data as string;
              } catch {
                return npub;
              }
            }
            return npub;
          });

          // Get workouts from unified cache
          const storedWorkouts = store.getEventWorkouts(
            eventData.startTime,
            eventData.endTime,
            hexPubkeys
          );
          console.log(`[useSatlantisEventDetail] 📊 WorkoutEventStore returned ${storedWorkouts.length} workouts`);

          // Convert to WorkoutMetrics format (with pre-parsed splits)
          metrics = convertStoredWorkoutsToMetrics(storedWorkouts, activityType);
          console.log(`[useSatlantisEventDetail] 📊 Converted to ${metrics.size} users with workouts`);
        } else {
          // Event is older than 7 days - use direct Nostr query
          console.log(`[useSatlantisEventDetail] 🔍 Using direct Nostr query (event older than 7 days)`);
          const queryService = Competition1301QueryService.getInstance();
          const result = await queryService.queryMemberWorkouts({
            memberNpubs: participantPubkeys,
            activityType: activityType as any,
            startDate: new Date(eventData.startTime * 1000),
            endDate: new Date(eventData.endTime * 1000),
          });
          metrics = result.metrics;
          console.log(`[useSatlantisEventDetail] 📊 queryMemberWorkouts returned ${metrics.size} users with workouts`);
        }
      } else {
        // No RSVPs yet - empty leaderboard
        console.log('[useSatlantisEventDetail] ⚠️ No participants yet - empty leaderboard');
        metrics = new Map();
      }

      if (!isMounted.current) return;

      // Build leaderboard entries using scoring service
      // Supports: fastest_time, most_distance, participation
      // Pass all participants so 0-workout participants are included
      console.log(`[useSatlantisEventDetail] 🧮 Building leaderboard with ${metrics.size} users, ${participantPubkeys.length} total participants...`);
      const entries = SatlantisEventScoringService.buildLeaderboard(
        metrics,
        eventData.scoringType || 'fastest_time',
        eventData.distance,
        participantPubkeys  // Include all registered participants (even with 0 workouts)
      );

      console.log(
        `[useSatlantisEventDetail] 🏆 Leaderboard built with ${entries.length} entries ` +
          `(scoring: ${eventData.scoringType || 'fastest_time'})`
      );

      if (entries.length > 0) {
        console.log(`[useSatlantisEventDetail] 📋 Leaderboard entries:`);
        entries.slice(0, 5).forEach((e, i) => {
          console.log(`   ${i + 1}. ${e.npub.slice(0, 16)}... - ${e.formattedScore} (${e.workoutCount} workouts)`);
        });
      } else {
        console.log(`[useSatlantisEventDetail] ⚠️ No leaderboard entries! Check workout query.`);
      }

      // Cache the leaderboard result
      // Completed events: 24 hours | Active events: 5 minutes (live competition)
      const cacheTTL = isCompleted ? 86400 : 300;
      await UnifiedCacheService.setWithCustomTTL(cacheKey, entries, cacheTTL);
      console.log(`[useSatlantisEventDetail] 💾 Leaderboard cached (TTL: ${isCompleted ? '24 hours' : '5 minutes'})`);

      // FREEZE completed events permanently (never re-query)
      if (isCompleted && !await FrozenEventStore.isFrozen(eventData.id)) {
        console.log(`[useSatlantisEventDetail] ❄️ Freezing completed event permanently...`);
        await FrozenEventStore.freeze(
          eventData.id,
          eventData.pubkey,
          participantPubkeys,
          entries,
          eventData.endTime
        );
      }

      setLeaderboard(entries);
    } catch (err) {
      console.error('[useSatlantisEventDetail] ❌ Leaderboard error:', err);
    } finally {
      if (isMounted.current) {
        setIsLoadingLeaderboard(false);
      }
    }
  };

  /**
   * Refresh workouts only (for pull-to-refresh)
   * Does NOT re-fetch event metadata or RSVPs - those are cached
   * Only refreshes the WorkoutEventStore and rebuilds leaderboard
   */
  const refreshWorkoutsOnly = useCallback(async () => {
    if (!event) {
      console.log('[useSatlantisEventDetail] ⚠️ No event cached - doing full refresh');
      await loadEventDetail(true);
      return;
    }

    console.log('[useSatlantisEventDetail] 🔄 Pull-to-refresh: Workouts only');

    // Refresh WorkoutEventStore (fetch fresh 1301 events from Nostr)
    const store = WorkoutEventStore.getInstance();
    await store.refresh();

    // Reload leaderboard with fresh workout data (using cached participants)
    const now = Math.floor(Date.now() / 1000);
    if (now >= event.startTime) {
      await loadLeaderboard(event, participants, true);
    }

    // Background RSVP check (non-blocking) - catches new registrations
    SatlantisRSVPService.getEventParticipants(eventPubkey, eventId, true)
      .then((freshParticipants) => {
        if (isMounted.current && freshParticipants.length !== fetchedParticipants.length) {
          console.log(`[useSatlantisEventDetail] 🔔 Background RSVP check: ${fetchedParticipants.length} → ${freshParticipants.length} participants`);
          setFetchedParticipants(freshParticipants);
          // Rebuild leaderboard with updated participant list
          if (now >= event.startTime) {
            loadLeaderboard(event, freshParticipants, true);
          }
        }
      })
      .catch((err) => {
        console.warn('[useSatlantisEventDetail] Background RSVP check failed:', err);
      });

    console.log('[useSatlantisEventDetail] ✅ Workout refresh complete');
  }, [event, participants, fetchedParticipants, eventPubkey, eventId, loadEventDetail]);

  useEffect(() => {
    isMounted.current = true;
    loadEventDetail();

    return () => {
      isMounted.current = false;
    };
  }, [loadEventDetail]);

  // Update status periodically for live events
  useEffect(() => {
    if (!event) return;

    const interval = setInterval(() => {
      const newStatus = getEventStatus(event);
      if (newStatus !== eventStatus) {
        setEventStatus(newStatus);
        // Reload leaderboard when event goes live or ends
        loadLeaderboard(event, participants);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [event, eventStatus, participants]);

  // Refresh event detail when app returns to foreground
  useEffect(() => {
    const unsubscribe = AppStateManager.onStateChange((isActive) => {
      if (isActive && isMounted.current && eventPubkey && eventId) {
        console.log('[useSatlantisEventDetail] App returned to foreground - refreshing event detail');
        loadEventDetail(true); // Force refresh from relays
      }
    });

    return () => unsubscribe();
  }, [loadEventDetail, eventPubkey, eventId]);

  return {
    event,
    participants,
    leaderboard,
    eventStatus,
    isLoading,
    isLoadingLeaderboard,
    error,
    refresh: refreshWorkoutsOnly, // Pull-to-refresh: only updates workouts, not event/RSVPs
    addLocalParticipant,
  };
}


// ============================================================================
// Exports
// ============================================================================

export type {
  UseSatlantisEventsReturn,
  UseSatlantisEventDetailReturn,
};
