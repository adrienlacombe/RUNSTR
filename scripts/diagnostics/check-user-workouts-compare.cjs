#!/usr/bin/env node
/**
 * Compare user's Nostr 1301 events vs Supabase workout_submissions
 * Helps identify missing workouts in competitions
 */

const NDK = require('@nostr-dev-kit/ndk').default;
const { nip19 } = require('nostr-tools');
require('dotenv').config();

const SEASON_2_START = new Date('2026-01-01T00:00:00Z').getTime() / 1000;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.primal.net',
  'wss://nos.lol',
  'wss://relay.nostr.band',
];

// Users to check
const USERS = [
  { name: 'Lhasa Sensei', pubkey: 'dae73fdd90d98db1a8405bcecac60cd6ce8d10896a6a2c5e04011125e16cd432' },
  { name: 'Heiunter', pubkey: '5d405752c1b4ddd0714baf3ce415db52e5506036f345ff575ee16e2b4cf189bf' },
];

function parseWorkoutEvent(event) {
  const tags = event.tags || [];
  const getTag = (name) => tags.find((t) => t[0] === name)?.[1];

  const activityType = getTag('exercise') || 'other';

  const distanceTag = tags.find((t) => t[0] === 'distance');
  let distanceKm = null;
  if (distanceTag) {
    const value = parseFloat(distanceTag[1]);
    const unit = distanceTag[2]?.toLowerCase();
    if (!isNaN(value)) {
      switch (unit) {
        case 'km': distanceKm = value; break;
        case 'mi': distanceKm = value * 1.60934; break;
        case 'm': distanceKm = value / 1000; break;
        default: distanceKm = value / 1000; break;
      }
    }
  }

  const durationStr = getTag('duration');
  let durationMin = null;
  if (durationStr) {
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 3) {
      durationMin = parts[0] * 60 + parts[1] + parts[2] / 60;
    } else if (parts.length === 2) {
      durationMin = parts[0] + parts[1] / 60;
    }
  }

  return { activityType, distanceKm, durationMin };
}

async function fetchNostrWorkouts(ndk, pubkey) {
  const filter = {
    kinds: [1301],
    authors: [pubkey],
    since: SEASON_2_START,
  };

  const events = await ndk.fetchEvents(filter);
  return Array.from(events).map(e => ({
    id: e.id,
    created_at: e.created_at,
    ...parseWorkoutEvent(e),
  }));
}

async function fetchSupabaseWorkouts(npub) {
  const url = `${SUPABASE_URL}/rest/v1/workout_submissions?npub=eq.${npub}&select=event_id,activity_type,distance_meters,duration_seconds,created_at,verified,source`;

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  return response.json();
}

async function fetchFlaggedWorkouts(npub) {
  const url = `${SUPABASE_URL}/rest/v1/flagged_workouts?npub=eq.${npub}&select=event_id,activity_type,distance_meters,duration_seconds,created_at,reason`;

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  return response.json();
}

async function main() {
  console.log('=== User Workout Comparison ===\n');
  console.log('Connecting to Nostr relays...');

  const ndk = new NDK({ explicitRelayUrls: RELAYS });
  try {
    await Promise.race([
      ndk.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
    ]);
  } catch {
    console.log('NDK connect timeout, continuing...');
  }
  await new Promise(r => setTimeout(r, 5000));
  console.log('Ready\n');

  for (const user of USERS) {
    const npub = nip19.npubEncode(user.pubkey);

    console.log('='.repeat(70));
    console.log(`  ${user.name}`);
    console.log('='.repeat(70));
    console.log(`Pubkey: ${user.pubkey.slice(0, 20)}...`);
    console.log(`npub: ${npub.slice(0, 25)}...`);

    // Fetch from both sources
    const [nostrWorkouts, supabaseWorkouts, flaggedWorkouts] = await Promise.all([
      fetchNostrWorkouts(ndk, user.pubkey),
      fetchSupabaseWorkouts(npub),
      fetchFlaggedWorkouts(npub),
    ]);

    console.log(`\n📡 NOSTR: ${nostrWorkouts.length} kind 1301 events found`);
    console.log(`💾 SUPABASE workout_submissions: ${supabaseWorkouts.length}`);
    console.log(`🚫 SUPABASE flagged_workouts: ${flaggedWorkouts.length}`);

    // Build sets for comparison
    const supabaseIds = new Set(supabaseWorkouts.map(w => w.event_id));
    const flaggedIds = new Set(flaggedWorkouts.map(w => w.event_id));

    // Find missing workouts
    const missing = nostrWorkouts.filter(w => !supabaseIds.has(w.id) && !flaggedIds.has(w.id));

    console.log(`\n${'─'.repeat(70)}`);
    console.log('NOSTR WORKOUTS (Season 2):');
    console.log('─'.repeat(70));

    // Sort by date
    nostrWorkouts.sort((a, b) => a.created_at - b.created_at);

    for (const w of nostrWorkouts) {
      const date = new Date(w.created_at * 1000).toLocaleDateString();
      const time = new Date(w.created_at * 1000).toLocaleTimeString();
      const inSupabase = supabaseIds.has(w.id);
      const isFlagged = flaggedIds.has(w.id);

      let status = '❓ MISSING';
      if (inSupabase) status = '✅ In Supabase';
      if (isFlagged) status = '🚫 Flagged';

      const dist = w.distanceKm ? `${w.distanceKm.toFixed(2)} km` : 'no dist';
      const dur = w.durationMin ? `${Math.round(w.durationMin)} min` : 'no dur';

      console.log(`  ${date} ${time} | ${w.activityType.padEnd(8)} | ${dist.padEnd(10)} | ${dur.padEnd(8)} | ${status}`);
      console.log(`    Event: ${w.id.slice(0, 16)}...`);
    }

    if (missing.length > 0) {
      console.log(`\n⚠️  MISSING FROM SUPABASE: ${missing.length} workouts`);
      console.log('These workouts exist on Nostr but are NOT in workout_submissions or flagged_workouts:');
      for (const w of missing) {
        console.log(`  - ${w.id}`);
      }
    }

    if (flaggedWorkouts.length > 0) {
      console.log(`\n🚫 FLAGGED WORKOUTS (rejected by anti-cheat):`);
      for (const w of flaggedWorkouts) {
        const date = new Date(w.created_at).toLocaleDateString();
        console.log(`  - ${date} | ${w.activity_type} | Reason: ${w.reason}`);
      }
    }

    console.log('\n');
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
