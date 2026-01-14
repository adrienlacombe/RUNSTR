#!/usr/bin/env tsx
/**
 * Verify Competition Workouts
 *
 * Compares kind 1301 events on Nostr with workout_submissions in Supabase
 * to identify any discrepancies or missing workouts.
 *
 * Usage:
 *   npx tsx scripts/diagnostics/verify-competition-workouts.ts running-bitcoin
 *   npx tsx scripts/diagnostics/verify-competition-workouts.ts january-walking
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import NDK, { NDKFilter } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.primal.net',
  'wss://nos.lol',
  'wss://relay.nostr.band',
];

interface Competition {
  id: string;
  external_id: string;
  name: string;
  activity_type: string;
  start_date: string;
  end_date: string;
}

interface Participant {
  npub: string;
  pubkey: string;
  name: string | null;
}

interface NostrWorkout {
  eventId: string;
  pubkey: string;
  npub: string;
  activityType: string;
  distanceKm: number;
  steps: number;
  createdAt: number;
}

interface SupabaseWorkout {
  event_id: string;
  npub: string;
  activity_type: string;
  distance_meters: number;
  step_count: number | null;
  created_at: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY!,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

async function getCompetition(externalId: string): Promise<Competition | null> {
  const url = `${SUPABASE_URL}/rest/v1/competitions?external_id=eq.${externalId}&select=*`;
  const result = await fetchJson<Competition[]>(url);
  return result.length > 0 ? result[0] : null;
}

async function getParticipants(competitionId: string): Promise<Participant[]> {
  const url = `${SUPABASE_URL}/rest/v1/competition_participants?competition_id=eq.${competitionId}&select=npub,name`;
  const participants = await fetchJson<Array<{ npub: string; name: string | null }>>(url);

  const result: Participant[] = [];
  for (const p of participants) {
    try {
      const decoded = nip19.decode(p.npub);
      if (decoded.type === 'npub' && typeof decoded.data === 'string') {
        result.push({
          npub: p.npub,
          pubkey: decoded.data,
          name: p.name,
        });
      }
    } catch {
      // Skip invalid npubs
    }
  }

  return result;
}

async function getSupabaseWorkouts(
  npubs: string[],
  activityTypes: string[],
  startDate: string,
  endDate: string
): Promise<SupabaseWorkout[]> {
  if (npubs.length === 0) return [];

  // Build filter - encode timestamps properly
  const npubFilter = npubs.map(n => `npub.eq.${n}`).join(',');
  const typeFilter = activityTypes.map(t => `activity_type.eq.${t}`).join(',');
  const encodedStart = encodeURIComponent(startDate);
  const encodedEnd = encodeURIComponent(endDate);

  const url = `${SUPABASE_URL}/rest/v1/workout_submissions?or=(${npubFilter})&or=(${typeFilter})&created_at=gte.${encodedStart}&created_at=lte.${encodedEnd}&select=event_id,npub,activity_type,distance_meters,step_count,created_at&order=created_at.desc`;

  return fetchJson<SupabaseWorkout[]>(url);
}

function parseDistanceFromTags(tags: string[][]): number {
  const distanceTag = tags.find(t => t[0] === 'distance');
  if (distanceTag && distanceTag.length >= 2) {
    const value = parseFloat(distanceTag[1]);
    const unit = distanceTag[2]?.toLowerCase() || 'km';
    if (!isNaN(value)) {
      return unit === 'mi' ? value * 1.60934 : value;
    }
  }
  return 0;
}

function parseStepsFromTags(tags: string[][]): number {
  const stepsTag = tags.find(t => t[0] === 'steps');
  if (stepsTag && stepsTag.length >= 2) {
    const value = parseInt(stepsTag[1], 10);
    if (!isNaN(value)) return value;
  }
  return 0;
}

function parseActivityType(tags: string[][]): string {
  const exerciseTag = tags.find(t => t[0] === 'exercise');
  if (exerciseTag && exerciseTag.length >= 2) {
    return exerciseTag[1].toLowerCase();
  }
  return 'unknown';
}

async function fetchNostrWorkouts(
  ndk: NDK,
  pubkeys: string[],
  activityTypes: string[],
  since: number,
  until: number
): Promise<NostrWorkout[]> {
  const workouts: NostrWorkout[] = [];

  if (pubkeys.length === 0) return workouts;

  console.log(`  Fetching kind 1301 events from Nostr...`);
  console.log(`  Authors: ${pubkeys.length}`);
  console.log(`  Time range: ${new Date(since * 1000).toISOString()} - ${new Date(until * 1000).toISOString()}`);

  const filter: NDKFilter = {
    kinds: [1301],
    authors: pubkeys,
    since,
    until,
  };

  try {
    const events = await ndk.fetchEvents(filter, { closeOnEose: true }, undefined, 30000);

    for (const event of events) {
      const activityType = parseActivityType(event.tags);

      // Filter by activity type
      if (!activityTypes.includes(activityType)) continue;

      const distanceKm = parseDistanceFromTags(event.tags);
      const steps = parseStepsFromTags(event.tags);

      // Convert pubkey to npub
      let npub = '';
      try {
        npub = nip19.npubEncode(event.pubkey);
      } catch {
        continue;
      }

      workouts.push({
        eventId: event.id,
        pubkey: event.pubkey,
        npub,
        activityType,
        distanceKm,
        steps,
        createdAt: event.created_at || 0,
      });
    }

    console.log(`  Found ${workouts.length} workouts on Nostr`);
  } catch (error) {
    console.error(`  Error fetching from Nostr:`, error);
  }

  return workouts;
}

interface UserComparison {
  npub: string;
  name: string | null;
  nostrWorkouts: number;
  nostrDistanceKm: number;
  nostrSteps: number;
  supabaseWorkouts: number;
  supabaseDistanceKm: number;
  supabaseSteps: number;
  missingEventIds: string[];
}

function compareWorkouts(
  participants: Participant[],
  nostrWorkouts: NostrWorkout[],
  supabaseWorkouts: SupabaseWorkout[]
): { comparisons: UserComparison[]; missingTotal: number } {
  // Index Supabase workouts by event_id
  const supabaseByEventId = new Map<string, SupabaseWorkout>();
  for (const w of supabaseWorkouts) {
    if (w.event_id) {
      supabaseByEventId.set(w.event_id, w);
    }
  }

  // Group by npub
  const nostrByNpub = new Map<string, NostrWorkout[]>();
  for (const w of nostrWorkouts) {
    const existing = nostrByNpub.get(w.npub) || [];
    existing.push(w);
    nostrByNpub.set(w.npub, existing);
  }

  const supabaseByNpub = new Map<string, SupabaseWorkout[]>();
  for (const w of supabaseWorkouts) {
    const existing = supabaseByNpub.get(w.npub) || [];
    existing.push(w);
    supabaseByNpub.set(w.npub, existing);
  }

  const comparisons: UserComparison[] = [];
  let missingTotal = 0;

  for (const participant of participants) {
    const nostr = nostrByNpub.get(participant.npub) || [];
    const supabase = supabaseByNpub.get(participant.npub) || [];

    // Find missing workouts
    const missingEventIds: string[] = [];
    for (const w of nostr) {
      if (!supabaseByEventId.has(w.eventId)) {
        missingEventIds.push(w.eventId);
        missingTotal++;
      }
    }

    const nostrDistanceKm = nostr.reduce((sum, w) => sum + w.distanceKm, 0);
    const nostrSteps = nostr.reduce((sum, w) => sum + w.steps, 0);
    const supabaseDistanceKm = supabase.reduce((sum, w) => sum + (w.distance_meters || 0) / 1000, 0);
    const supabaseSteps = supabase.reduce((sum, w) => sum + (w.step_count || 0), 0);

    comparisons.push({
      npub: participant.npub,
      name: participant.name,
      nostrWorkouts: nostr.length,
      nostrDistanceKm,
      nostrSteps,
      supabaseWorkouts: supabase.length,
      supabaseDistanceKm,
      supabaseSteps,
      missingEventIds,
    });
  }

  return { comparisons, missingTotal };
}

async function main() {
  const competitionExternalId = process.argv[2];

  if (!competitionExternalId) {
    console.error('Usage: npx tsx verify-competition-workouts.ts <competition-external-id>');
    console.error('Example: npx tsx verify-competition-workouts.ts running-bitcoin');
    process.exit(1);
  }

  console.log('========================================');
  console.log('Competition Workout Verification');
  console.log('========================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('\nERROR: Missing environment variables!');
    process.exit(1);
  }

  // Get competition
  console.log(`\n1. Getting competition: ${competitionExternalId}...`);
  const competition = await getCompetition(competitionExternalId);

  if (!competition) {
    console.error(`Competition not found: ${competitionExternalId}`);
    process.exit(1);
  }

  console.log(`   Name: ${competition.name}`);
  console.log(`   Activity Type: ${competition.activity_type}`);
  console.log(`   Date Range: ${competition.start_date} - ${competition.end_date}`);

  // Determine activity types to query
  const activityTypes = competition.activity_type === 'running'
    ? ['running', 'walking'] // Running Bitcoin includes walking
    : [competition.activity_type];

  // Get participants
  console.log(`\n2. Getting participants...`);
  const participants = await getParticipants(competition.id);
  console.log(`   Found ${participants.length} participants with valid npubs`);

  if (participants.length === 0) {
    console.log('\nNo participants found.');
    process.exit(0);
  }

  // Connect to Nostr
  console.log('\n3. Connecting to Nostr relays...');
  const ndk = new NDK({
    explicitRelayUrls: RELAYS,
  });
  await ndk.connect(5000);
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('   Connected');

  // Fetch Nostr workouts
  console.log('\n4. Fetching workouts from Nostr...');
  const since = Math.floor(new Date(competition.start_date).getTime() / 1000);
  const until = Math.floor(new Date(competition.end_date).getTime() / 1000) + 86400; // Add 1 day buffer
  const pubkeys = participants.map(p => p.pubkey);

  const nostrWorkouts = await fetchNostrWorkouts(ndk, pubkeys, activityTypes, since, until);

  // Fetch Supabase workouts
  console.log('\n5. Fetching workouts from Supabase...');
  const npubs = participants.map(p => p.npub);
  const supabaseWorkouts = await getSupabaseWorkouts(
    npubs,
    activityTypes,
    competition.start_date,
    competition.end_date
  );
  console.log(`   Found ${supabaseWorkouts.length} workouts in Supabase`);

  // Compare
  console.log('\n6. Comparing workouts...');
  const { comparisons, missingTotal } = compareWorkouts(participants, nostrWorkouts, supabaseWorkouts);

  // Report
  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`Competition: ${competition.name}`);
  console.log(`Date Range: ${competition.start_date} - ${competition.end_date}`);
  console.log(`Activity Types: ${activityTypes.join(', ')}`);
  console.log();
  console.log(`Participants: ${participants.length}`);
  console.log(`Nostr Workouts Found: ${nostrWorkouts.length}`);
  console.log(`Supabase Workouts: ${supabaseWorkouts.length}`);
  console.log(`Missing from Supabase: ${missingTotal}`);

  // Show users with discrepancies
  const usersWithMissing = comparisons.filter(c => c.missingEventIds.length > 0);
  const usersWithNostrWorkouts = comparisons.filter(c => c.nostrWorkouts > 0);

  if (missingTotal > 0) {
    console.log('\n========================================');
    console.log('USERS WITH MISSING WORKOUTS');
    console.log('========================================');

    for (const user of usersWithMissing) {
      console.log(`\n${user.name || 'Anonymous'} (${user.npub.slice(0, 20)}...)`);
      console.log(`  Nostr: ${user.nostrWorkouts} workouts, ${user.nostrDistanceKm.toFixed(2)} km`);
      console.log(`  Supabase: ${user.supabaseWorkouts} workouts, ${user.supabaseDistanceKm.toFixed(2)} km`);
      console.log(`  Missing ${user.missingEventIds.length} workout(s):`);
      for (const eventId of user.missingEventIds.slice(0, 5)) {
        console.log(`    - ${eventId.slice(0, 16)}...`);
      }
      if (user.missingEventIds.length > 5) {
        console.log(`    ... and ${user.missingEventIds.length - 5} more`);
      }
    }
  } else {
    console.log('\n✅ All Nostr workouts are synced to Supabase!');
  }

  // Show top users by Nostr distance
  console.log('\n========================================');
  console.log('TOP 10 BY NOSTR DISTANCE');
  console.log('========================================');

  const sortedByDistance = [...usersWithNostrWorkouts]
    .sort((a, b) => b.nostrDistanceKm - a.nostrDistanceKm)
    .slice(0, 10);

  for (let i = 0; i < sortedByDistance.length; i++) {
    const user = sortedByDistance[i];
    const status = user.missingEventIds.length > 0 ? '⚠️' : '✅';
    console.log(
      `${i + 1}. ${status} ${user.name || 'Anonymous'}: ` +
      `${user.nostrDistanceKm.toFixed(2)} km (Nostr) vs ${user.supabaseDistanceKm.toFixed(2)} km (Supabase)`
    );
  }

  // Cleanup
  await ndk.pool?.destroy?.();

  console.log('\n========================================');
  console.log('VERIFICATION COMPLETE');
  console.log('========================================');

  if (missingTotal > 0) {
    console.log(`\n⚠️  ${missingTotal} workouts need to be synced.`);
    console.log('The sync-nostr-workouts function runs every 2 minutes.');
    console.log('Or you can trigger it manually via Supabase dashboard.');
  }
}

main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
