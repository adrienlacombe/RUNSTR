/**
 * Simple Competition Service - MVP Implementation
 * Fetches leagues (kind 30100) and events (kind 30101) from Nostr
 * Now with UnifiedNostrCache integration for better performance
 */

import { GlobalNDKService } from '../nostr/GlobalNDKService';
import type { NDKFilter, NDKEvent } from '@nostr-dev-kit/ndk';
import unifiedCache from '../cache/UnifiedNostrCache';
import { CacheKeys, CacheTTL } from '../../constants/cacheTTL';

export interface League {
  id: string; // d tag
  teamId: string;
  captainPubkey: string;
  name: string;
  description?: string;
  activityType: string;
  metric: string; // total_distance, fastest_time, most_workouts, etc.
  startDate: string; // ISO date
  endDate: string; // ISO date
}

export interface CompetitionEvent {
  id: string; // d tag
  teamId: string;
  captainPubkey: string;
  name: string;
  description?: string;
  activityType: string;
  metric: string;
  eventDate: string; // ISO date
  targetDistance?: number;
  targetUnit?: string;
  entryFeesSats?: number;
  lightningAddress?: string;
  paymentDestination?: 'captain' | 'charity';
  paymentRecipientName?: string;
}

export class SimpleCompetitionService {
  private static instance: SimpleCompetitionService;

  private constructor() {}

  static getInstance(): SimpleCompetitionService {
    if (!SimpleCompetitionService.instance) {
      SimpleCompetitionService.instance = new SimpleCompetitionService();
    }
    return SimpleCompetitionService.instance;
  }

  /**
   * Fetch ALL leagues from Nostr (no team filter)
   * Used for prefetching during app initialization
   */
  async getAllLeagues(): Promise<League[]> {
    console.log('📋 Fetching ALL leagues from Nostr...');

    try {
      const connected = await GlobalNDKService.waitForMinimumConnection(
        2,
        4000
      ); // Progressive: 2/4 relays, 4s timeout
      if (!connected) {
        console.warn(
          '⚠️ Proceeding with minimal relay connectivity for all leagues query'
        );
      }

      const ndk = await GlobalNDKService.getInstance();

      const filter: NDKFilter = {
        kinds: [30100],
        limit: 500, // Fetch many leagues for caching
      };

      // ✅ PERFORMANCE: Reduced timeout from 3s → 2s for faster failures
      const events = await Promise.race([
        ndk.fetchEvents(filter),
        new Promise<Set<NDKEvent>>(
          (resolve) => setTimeout(() => resolve(new Set()), 2000) // 2s timeout
        ),
      ]);
      const leagues: League[] = [];

      events.forEach((event) => {
        try {
          const league = this.parseLeagueEvent(event);
          if (league) {
            leagues.push(league);
          }
        } catch (error) {
          console.error('Failed to parse league event:', error);
        }
      });

      console.log(`✅ Fetched ${leagues.length} total leagues`);
      return leagues;
    } catch (error) {
      console.error('Failed to fetch all leagues:', error);
      return [];
    }
  }

  /**
   * Fetch ALL events from Nostr (no team filter)
   * Used for prefetching during app initialization
   */
  async getAllEvents(): Promise<CompetitionEvent[]> {
    console.log('📋 Fetching ALL events from Nostr...');

    try {
      const connected = await GlobalNDKService.waitForMinimumConnection(
        2,
        4000
      ); // Progressive: 2/4 relays, 4s timeout
      if (!connected) {
        console.warn(
          '⚠️ Proceeding with minimal relay connectivity for all events query'
        );
      }

      const ndk = await GlobalNDKService.getInstance();

      const filter: NDKFilter = {
        kinds: [30101],
        limit: 500, // Fetch many events for caching
      };

      // ✅ PERFORMANCE: Reduced timeout from 3s → 2s for faster failures
      const events = await Promise.race([
        ndk.fetchEvents(filter),
        new Promise<Set<NDKEvent>>(
          (resolve) => setTimeout(() => resolve(new Set()), 2000) // 2s timeout
        ),
      ]);
      const competitionEvents: CompetitionEvent[] = [];

      events.forEach((event) => {
        try {
          const competitionEvent = this.parseEventEvent(event);
          if (competitionEvent) {
            competitionEvents.push(competitionEvent);
          }
        } catch (error) {
          console.error('Failed to parse event:', error);
        }
      });

      console.log(`✅ Fetched ${competitionEvents.length} total events`);
      return competitionEvents;
    } catch (error) {
      console.error('Failed to fetch all events:', error);
      return [];
    }
  }

  /**
   * Get all leagues for a team (with caching)
   */
  async getTeamLeagues(teamId: string): Promise<League[]> {
    console.log(`📋 Fetching leagues for team: ${teamId}`);

    try {
      // ✅ Try to get from cache first
      const allLeagues = await unifiedCache.get(
        CacheKeys.LEAGUES,
        () => this.getAllLeagues(),
        { ttl: CacheTTL.LEAGUES, backgroundRefresh: true }
      );

      // Filter for this team
      const teamLeagues = allLeagues.filter(
        (league) => league.teamId === teamId
      );
      console.log(
        `✅ Found ${teamLeagues.length} leagues for team ${teamId} (${allLeagues.length} total cached)`
      );

      return teamLeagues;
    } catch (error) {
      console.error('Failed to fetch leagues:', error);
      return [];
    }
  }

  /**
   * Get all events for a team (with caching)
   * @param signal - Optional AbortSignal for cancellation
   */
  async getTeamEvents(teamId: string, signal?: AbortSignal): Promise<CompetitionEvent[]> {
    console.log(`📋 Fetching events for team: ${teamId}`);

    try {
      // Check if already aborted
      if (signal?.aborted) {
        throw new Error('Request aborted');
      }

      // ✅ Try to get from cache first
      const allEvents = await unifiedCache.get(
        CacheKeys.COMPETITIONS,
        () => this.getAllEvents(),
        { ttl: CacheTTL.COMPETITIONS, backgroundRefresh: true }
      );

      // Check if aborted after cache fetch
      if (signal?.aborted) {
        throw new Error('Request aborted');
      }

      // Filter for this team AND filter out old events
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const teamEvents = allEvents.filter((event) => {
        // Must be for this team
        if (event.teamId !== teamId) return false;

        // Parse event date
        const eventDate = new Date(event.eventDate);

        // Show events from:
        // - Past 7 days (recently completed)
        // - Today (active)
        // - Next 90 days (upcoming)
        if (eventDate < sevenDaysAgo) {
          console.log(`⏩ Filtering out old event: ${event.name} (${event.eventDate}) - older than 7 days`);
          return false;
        }

        if (eventDate > ninetyDaysFromNow) {
          console.log(`⏩ Filtering out distant event: ${event.name} (${event.eventDate}) - more than 90 days away`);
          return false;
        }

        return true;
      })
      // Sort by date - upcoming events first, then recent past events
      .sort((a, b) => {
        const dateA = new Date(a.eventDate).getTime();
        const dateB = new Date(b.eventDate).getTime();
        const nowTime = now.getTime();

        // Both in future - sort ascending (nearest first)
        if (dateA >= nowTime && dateB >= nowTime) {
          return dateA - dateB;
        }

        // Both in past - sort descending (most recent first)
        if (dateA < nowTime && dateB < nowTime) {
          return dateB - dateA;
        }

        // One future, one past - future comes first
        return dateA >= nowTime ? -1 : 1;
      });

      console.log(
        `✅ Found ${teamEvents.length} recent events for team ${teamId} (${allEvents.length} total cached)`
      );

      return teamEvents;
    } catch (error: any) {
      if (error?.message === 'Request aborted') {
        throw new Error('AbortError');
      }
      console.error('Failed to fetch events:', error);
      return [];
    }
  }

  /**
   * Get a specific league by ID
   */
  async getLeagueById(leagueId: string): Promise<League | null> {
    console.log(`🔍 Fetching league: ${leagueId}`);

    try {
      // Progressive: Accept 2/4 relays for faster queries with good coverage
      const connected = await GlobalNDKService.waitForMinimumConnection(
        2,
        4000
      );
      if (!connected) {
        console.warn(
          '⚠️ Proceeding with minimal relay connectivity for league by ID query'
        );
      }

      const ndk = await GlobalNDKService.getInstance();

      const filter: NDKFilter = {
        kinds: [30100],
        '#d': [leagueId],
        limit: 1,
      };

      const events = await ndk.fetchEvents(filter);

      for (const event of events) {
        const league = this.parseLeagueEvent(event);
        if (league) {
          return league;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch league:', error);
      return null;
    }
  }

  /**
   * Get a specific event by ID
   */
  async getEventById(eventId: string): Promise<CompetitionEvent | null> {
    console.log(`🔍 Fetching event: ${eventId}`);

    try {
      // Progressive: Accept 2/4 relays for faster queries with good coverage
      const connected = await GlobalNDKService.waitForMinimumConnection(
        2,
        4000
      );
      if (!connected) {
        console.warn(
          '⚠️ Proceeding with minimal relay connectivity for event by ID query'
        );
      }

      const ndk = await GlobalNDKService.getInstance();

      const filter: NDKFilter = {
        kinds: [30101],
        '#d': [eventId],
        limit: 1,
      };

      const events = await ndk.fetchEvents(filter);

      for (const event of events) {
        const competitionEvent = this.parseEventEvent(event);
        if (competitionEvent) {
          return competitionEvent;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch event:', error);
      return null;
    }
  }

  /**
   * Parse a kind 30100 Nostr event into a League
   */
  private parseLeagueEvent(event: NDKEvent): League | null {
    try {
      const getTag = (name: string) =>
        event.tags.find((t) => t[0] === name)?.[1];

      const id = getTag('d');
      const teamId = getTag('team');

      if (!id || !teamId) {
        console.warn('League missing required tags:', { id, teamId });
        return null;
      }

      return {
        id,
        teamId,
        captainPubkey: event.pubkey,
        name: getTag('name') || 'Unnamed League',
        description: getTag('description'),
        activityType: getTag('activity_type') || 'Any',
        metric: getTag('competition_type') || 'total_distance',
        startDate: getTag('start_date') || new Date().toISOString(),
        endDate: getTag('end_date') || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to parse league event:', error);
      return null;
    }
  }

  /**
   * Parse a kind 30101 Nostr event into a CompetitionEvent
   */
  private parseEventEvent(event: NDKEvent): CompetitionEvent | null {
    try {
      const getTag = (name: string) =>
        event.tags.find((t) => t[0] === name)?.[1];

      const id = getTag('d');
      const teamId = getTag('team') || getTag('team_id'); // Support both 'team' and 'team_id' tags

      if (!id) {
        console.warn('Event missing required id tag');
        return null;
      }

      // Log warning but don't reject if teamId is missing
      if (!teamId) {
        console.warn(`Event ${id} missing teamId tag - will attempt to infer from context`);
      }

      const targetValue = getTag('target_value');
      const entryFee = getTag('entry_fee');

      return {
        id,
        teamId,
        captainPubkey: event.pubkey,
        name: getTag('name') || 'Unnamed Event',
        description: getTag('description'),
        activityType: getTag('activity_type') || 'running',
        metric: getTag('competition_type') || 'fastest_time',
        eventDate: getTag('event_date') || new Date().toISOString(),
        targetDistance: targetValue ? parseFloat(targetValue) : undefined,
        targetUnit: getTag('target_unit'),
        entryFeesSats: entryFee ? parseInt(entryFee) : undefined,
        lightningAddress: getTag('lightning_address'),
        paymentDestination: getTag('payment_destination') as
          | 'captain'
          | 'charity'
          | undefined,
        paymentRecipientName: getTag('payment_recipient_name'),
      };
    } catch (error) {
      console.error('Failed to parse event:', error);
      return null;
    }
  }
}

// Export class instead of instance to prevent blocking module initialization
export default SimpleCompetitionService;
