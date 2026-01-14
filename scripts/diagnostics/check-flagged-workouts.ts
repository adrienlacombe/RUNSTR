#!/usr/bin/env tsx
/**
 * Check Flagged Workouts
 *
 * Queries the flagged_workouts table to see why workouts were rejected.
 * Also checks if specific event IDs are flagged.
 *
 * Usage: npx tsx scripts/diagnostics/check-flagged-workouts.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

interface FlaggedWorkout {
  event_id: string;
  npub: string;
  reason: string;
  activity_type: string | null;
  distance_meters: number | null;
  duration_seconds: number | null;
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

async function main() {
  console.log('========================================');
  console.log('Flagged Workouts Diagnostic');
  console.log('========================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('\nERROR: Missing environment variables!');
    process.exit(1);
  }

  // Get all flagged workouts
  console.log('\n1. Fetching flagged workouts...');
  const url = `${SUPABASE_URL}/rest/v1/flagged_workouts?select=event_id,npub,reason,activity_type,distance_meters,duration_seconds,created_at&order=created_at.desc&limit=500`;

  const flagged = await fetchJson<FlaggedWorkout[]>(url);
  console.log(`   Found ${flagged.length} flagged workouts`);

  // Group by reason
  const byReason = new Map<string, FlaggedWorkout[]>();
  for (const f of flagged) {
    const existing = byReason.get(f.reason) || [];
    existing.push(f);
    byReason.set(f.reason, existing);
  }

  console.log('\n========================================');
  console.log('FLAGGED BY REASON');
  console.log('========================================');

  const sortedReasons = Array.from(byReason.entries()).sort((a, b) => b[1].length - a[1].length);
  for (const [reason, workouts] of sortedReasons) {
    console.log(`\n${reason}: ${workouts.length} workouts`);
    // Show sample
    const sample = workouts.slice(0, 3);
    for (const w of sample) {
      const distKm = w.distance_meters ? (w.distance_meters / 1000).toFixed(2) : '?';
      const durMin = w.duration_seconds ? (w.duration_seconds / 60).toFixed(1) : '?';
      console.log(`  - ${w.event_id.slice(0, 12)}... (${w.activity_type}, ${distKm}km, ${durMin}min)`);
    }
    if (workouts.length > 3) {
      console.log(`  ... and ${workouts.length - 3} more`);
    }
  }

  // Group by npub
  const byNpub = new Map<string, number>();
  for (const f of flagged) {
    byNpub.set(f.npub, (byNpub.get(f.npub) || 0) + 1);
  }

  console.log('\n========================================');
  console.log('TOP USERS WITH FLAGGED WORKOUTS');
  console.log('========================================');

  const sortedUsers = Array.from(byNpub.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [npub, count] of sortedUsers) {
    console.log(`${npub.slice(0, 25)}...: ${count} flagged`);
  }

  // Recent flagged
  console.log('\n========================================');
  console.log('RECENT FLAGGED (Last 10)');
  console.log('========================================');

  for (const f of flagged.slice(0, 10)) {
    const date = new Date(f.created_at).toLocaleDateString();
    const distKm = f.distance_meters ? (f.distance_meters / 1000).toFixed(2) : '?';
    console.log(`${date} | ${f.reason.slice(0, 30).padEnd(30)} | ${distKm}km | ${f.npub.slice(0, 20)}...`);
  }

  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`Total flagged: ${flagged.length}`);
  console.log(`Unique reasons: ${byReason.size}`);
  console.log(`Unique users: ${byNpub.size}`);
}

main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
