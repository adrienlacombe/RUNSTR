#!/usr/bin/env tsx
/**
 * Diagnose Competition Join Flow
 *
 * Verifies that the competition join system works correctly:
 * 1. Queries competition_participants for January Walking and Running Bitcoin
 * 2. Shows all registered participants with their profile data
 * 3. Queries workout_submissions to show aggregated data
 * 4. Helps verify that new users can join and appear on leaderboards
 *
 * Usage: npx tsx scripts/diagnostics/diagnose-competition-join.ts
 *
 * Environment: Requires EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

interface Competition {
  id: string;
  external_id: string;
  name: string;
  activity_type: string;
  start_date: string;
  end_date: string;
}

interface Participant {
  id: string;
  competition_id: string;
  npub: string;
  name: string | null;
  picture: string | null;
  joined_at: string;
}

interface WorkoutSubmission {
  id: string;
  npub: string;
  activity_type: string;
  distance_meters: number;
  step_count: number | null;
  profile_name: string | null;
  profile_picture: string | null;
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

async function getCompetitions(): Promise<Competition[]> {
  const url = `${SUPABASE_URL}/rest/v1/competitions?select=id,external_id,name,activity_type,start_date,end_date`;
  return fetchJson<Competition[]>(url);
}

async function getParticipants(competitionId: string): Promise<Participant[]> {
  const url = `${SUPABASE_URL}/rest/v1/competition_participants?competition_id=eq.${competitionId}&select=id,competition_id,npub,name,picture,joined_at&order=joined_at.desc`;
  return fetchJson<Participant[]>(url);
}

async function getWorkoutSubmissions(npubs: string[], activityType: string): Promise<WorkoutSubmission[]> {
  if (npubs.length === 0) return [];

  // Build filter for multiple npubs
  const npubFilter = npubs.map(n => `npub.eq.${n}`).join(',');
  const url = `${SUPABASE_URL}/rest/v1/workout_submissions?or=(${npubFilter})&activity_type=eq.${activityType}&select=id,npub,activity_type,distance_meters,step_count,profile_name,profile_picture,created_at&order=created_at.desc&limit=100`;

  return fetchJson<WorkoutSubmission[]>(url);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncate(str: string | null, len: number): string {
  if (!str) return '(none)';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

async function analyzeCompetition(competition: Competition) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`COMPETITION: ${competition.name}`);
  console.log(`${'='.repeat(70)}`);
  console.log(`  ID: ${competition.id}`);
  console.log(`  External ID: ${competition.external_id}`);
  console.log(`  Activity Type: ${competition.activity_type}`);
  console.log(`  Date Range: ${formatDate(competition.start_date)} - ${formatDate(competition.end_date)}`);

  // Get participants
  const participants = await getParticipants(competition.id);
  console.log(`\n  PARTICIPANTS (${participants.length} total):`);
  console.log(`  ${'-'.repeat(66)}`);

  if (participants.length === 0) {
    console.log('    No participants registered yet.');
  } else {
    // Header
    console.log(`  ${'npub'.padEnd(20)} | ${'name'.padEnd(20)} | ${'picture'.padEnd(15)} | joined`);
    console.log(`  ${'-'.repeat(66)}`);

    for (const p of participants.slice(0, 25)) {
      const npubShort = p.npub.slice(0, 18) + '...';
      const name = truncate(p.name, 18);
      const pic = p.picture ? 'Yes' : 'No';
      const joined = formatDate(p.joined_at);
      console.log(`  ${npubShort.padEnd(20)} | ${name.padEnd(20)} | ${pic.padEnd(15)} | ${joined}`);
    }

    if (participants.length > 25) {
      console.log(`  ... and ${participants.length - 25} more participants`);
    }
  }

  // Get workouts for these participants
  const npubs = participants.map(p => p.npub);
  const workouts = await getWorkoutSubmissions(npubs, competition.activity_type);

  console.log(`\n  WORKOUT SUBMISSIONS (${workouts.length} total for ${competition.activity_type}):`);
  console.log(`  ${'-'.repeat(66)}`);

  if (workouts.length === 0) {
    console.log('    No workouts submitted yet.');
  } else {
    // Aggregate by user
    const userStats = new Map<string, { name: string; distance: number; steps: number; count: number }>();

    for (const w of workouts) {
      const existing = userStats.get(w.npub) || { name: w.profile_name || '(unknown)', distance: 0, steps: 0, count: 0 };
      // Convert meters to km
      existing.distance += (w.distance_meters || 0) / 1000;
      existing.steps += w.step_count || 0;
      existing.count += 1;
      userStats.set(w.npub, existing);
    }

    // Sort by distance (or steps for walking)
    const sortedUsers = Array.from(userStats.entries()).sort((a, b) => {
      if (competition.activity_type === 'walking') {
        return b[1].steps - a[1].steps;
      }
      return b[1].distance - a[1].distance;
    });

    console.log(`  ${'#'.padEnd(3)} | ${'name'.padEnd(20)} | ${'distance'.padEnd(12)} | ${'steps'.padEnd(10)} | workouts`);
    console.log(`  ${'-'.repeat(66)}`);

    let rank = 1;
    for (const [npub, stats] of sortedUsers.slice(0, 15)) {
      const name = truncate(stats.name, 18);
      const distance = `${stats.distance.toFixed(2)} km`;
      const steps = stats.steps > 0 ? stats.steps.toLocaleString() : '-';
      console.log(`  ${String(rank).padEnd(3)} | ${name.padEnd(20)} | ${distance.padEnd(12)} | ${steps.padEnd(10)} | ${stats.count}`);
      rank++;
    }

    if (sortedUsers.length > 15) {
      console.log(`  ... and ${sortedUsers.length - 15} more users with workouts`);
    }
  }

  // Summary
  const withProfile = participants.filter(p => p.name || p.picture).length;
  console.log(`\n  SUMMARY:`);
  console.log(`    Total participants: ${participants.length}`);
  console.log(`    With profile data: ${withProfile} (${Math.round(withProfile / Math.max(participants.length, 1) * 100)}%)`);
  console.log(`    Total workouts: ${workouts.length}`);
}

async function main() {
  console.log('========================================');
  console.log('RUNSTR Competition Join Diagnostic');
  console.log('========================================');
  console.log(`Supabase URL: ${SUPABASE_URL?.slice(0, 40)}...`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('\nERROR: Missing environment variables!');
    console.error('Required: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY');
    console.error('Make sure your .env file exists and has these values.');
    process.exit(1);
  }

  try {
    // Get all competitions
    const competitions = await getCompetitions();
    console.log(`\nFound ${competitions.length} competitions in database.`);

    // Filter for our target competitions
    const targetCompetitions = competitions.filter(c =>
      c.external_id === 'january-walking' ||
      c.external_id === 'running-bitcoin' ||
      c.name.toLowerCase().includes('january') ||
      c.name.toLowerCase().includes('running bitcoin')
    );

    if (targetCompetitions.length === 0) {
      console.log('\nNo January Walking or Running Bitcoin competitions found.');
      console.log('Available competitions:');
      for (const c of competitions) {
        console.log(`  - ${c.external_id}: ${c.name}`);
      }
    } else {
      for (const competition of targetCompetitions) {
        await analyzeCompetition(competition);
      }
    }

    console.log('\n========================================');
    console.log('DIAGNOSTIC COMPLETE');
    console.log('========================================\n');

    // Provide guidance
    console.log('WHAT TO CHECK:');
    console.log('1. Are there participants registered? (They clicked "Join")');
    console.log('2. Do participants have name/picture? (Profile was fetched)');
    console.log('3. Are there workout submissions? (They submitted workouts)');
    console.log('4. Does the leaderboard show all participants?\n');

    console.log('IF NO PARTICIPANTS:');
    console.log('- Users need to click "Join Contest" / "Join Challenge" in the app');
    console.log('- The join flow stores their npub in competition_participants\n');

    console.log('IF NO PROFILE DATA:');
    console.log('- Check if ProfileCache.fetchProfiles() is working');
    console.log('- Verify user has a Nostr profile (kind 0 event)\n');

  } catch (error) {
    console.error('\nERROR:', error);
    process.exit(1);
  }
}

main();
