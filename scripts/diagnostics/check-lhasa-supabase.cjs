#!/usr/bin/env node
/**
 * Check Lhasa Sensei's Supabase workouts in detail
 */

require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Lhasa Sensei's npub
const LHASA_NPUB = 'npub1mtnnlhvsmxxmr2zqt08v43sv6m8g6yyfdf4zchsyqygjtctv6seqp93ten';

// Heiunter's npub
const HEIUNTER_NPUB = 'npub1t4q9w5kpknwaqu2t4u7wg9wm2tj4qcpk7dzl7467u9hzkn833xlskuf4sn';

async function fetchWorkouts(npub, name) {
  const url = `${SUPABASE_URL}/rest/v1/workout_submissions?npub=eq.${npub}&select=event_id,activity_type,distance_meters,duration_seconds,created_at,source&order=created_at.asc`;

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  const workouts = await response.json();

  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${name} - Supabase Workouts`);
  console.log('='.repeat(70));
  console.log(`Total: ${workouts.length}\n`);

  // Group by source
  const bySeason2 = workouts.filter(w => new Date(w.created_at) >= new Date('2026-01-01'));
  const preSeason2 = workouts.filter(w => new Date(w.created_at) < new Date('2026-01-01'));

  console.log(`Pre-Season 2 (before Jan 1, 2026): ${preSeason2.length}`);
  console.log(`Season 2 (Jan 1, 2026+): ${bySeason2.length}`);

  // Group by source
  const sources = {};
  for (const w of workouts) {
    sources[w.source || 'unknown'] = (sources[w.source || 'unknown'] || 0) + 1;
  }
  console.log('\nBy source:');
  for (const [source, count] of Object.entries(sources)) {
    console.log(`  ${source}: ${count}`);
  }

  console.log('\n--- Season 2 Workouts Detail ---');
  for (const w of bySeason2) {
    const date = new Date(w.created_at).toLocaleDateString();
    const dist = w.distance_meters ? `${(w.distance_meters / 1000).toFixed(2)} km` : 'no dist';
    const dur = w.duration_seconds ? `${Math.round(w.duration_seconds / 60)} min` : 'no dur';
    console.log(`  ${date} | ${(w.activity_type || 'unknown').padEnd(10)} | ${dist.padEnd(12)} | ${dur.padEnd(10)} | src: ${w.source || 'unknown'}`);
  }
}

async function main() {
  await fetchWorkouts(LHASA_NPUB, 'Lhasa Sensei');
  await fetchWorkouts(HEIUNTER_NPUB, 'Heiunter');
}

main().catch(console.error);
