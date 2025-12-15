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
import { Competition1301QueryService } from '../services/competition/Competition1301QueryService';
import { SatlantisEventScoringService } from '../services/scoring/SatlantisEventScoringService';
import { UnifiedCacheService } from '../services/cache/UnifiedCacheService';
import { AppStateManager } from '../services/core/AppStateManager';
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

    // Clear local participants on force refresh to prevent double-counting
    if (forceRefresh) {
      setLocalParticipants([]);
    }

    setError(null);

    try {
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

          console.log(`[useSatlantisEventDetail] 🎉 Cached data displayed - no refresh needed`);
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

      const queryService = Competition1301QueryService.getInstance();

      // Map Satlantis sport type to RUNSTR activity type
      const activityType = mapSportToActivityType(eventData.sportType);
      console.log(`[useSatlantisEventDetail]   - Mapped activity type: ${activityType}`);

      // Query workouts from RSVPed participants only
      // Satlantis events require RSVP to appear on leaderboard
      let result;

      if (participantPubkeys.length > 0) {
        // Query workouts from RSVPed participants
        console.log(`[useSatlantisEventDetail] 📋 Querying ${participantPubkeys.length} participants' workouts`);
        console.log(`[useSatlantisEventDetail]   - Date range: ${new Date(eventData.startTime * 1000).toISOString()} to ${new Date(eventData.endTime * 1000).toISOString()}`);
        result = await queryService.queryMemberWorkouts({
          memberNpubs: participantPubkeys,
          activityType: activityType as any,
          startDate: new Date(eventData.startTime * 1000),
          endDate: new Date(eventData.endTime * 1000),
        });
        console.log(`[useSatlantisEventDetail] 📊 queryMemberWorkouts returned ${result.metrics.size} users with workouts`);
      } else {
        // No RSVPs yet - empty leaderboard
        console.log('[useSatlantisEventDetail] ⚠️ No participants yet - empty leaderboard');
        result = { metrics: new Map(), workouts: [] };
      }

      if (!isMounted.current) return;

      // Build leaderboard entries using scoring service
      // Supports: fastest_time, most_distance, participation
      console.log(`[useSatlantisEventDetail] 🧮 Building leaderboard with ${result.metrics.size} users...`);
      const entries = SatlantisEventScoringService.buildLeaderboard(
        result.metrics,
        eventData.scoringType || 'fastest_time',
        eventData.distance
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

      setLeaderboard(entries);
    } catch (err) {
      console.error('[useSatlantisEventDetail] ❌ Leaderboard error:', err);
    } finally {
      if (isMounted.current) {
        setIsLoadingLeaderboard(false);
      }
    }
  };

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
    refresh: () => loadEventDetail(true), // Force refresh on pull-to-refresh
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
