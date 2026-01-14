#!/usr/bin/env tsx
/**
 * Enroll Season II Participants in Running Bitcoin
 *
 * Imports the CORRECT participant data from src/constants/season2.ts
 * and enrolls them in the Running Bitcoin competition with profile data.
 *
 * Usage: npx tsx scripts/maintenance/enroll-season2-in-running-bitcoin.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { SEASON_2_PARTICIPANTS } from '../../src/constants/season2';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const COMPETITION_EXTERNAL_ID = 'running-bitcoin';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY!,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  if (options?.method === 'POST' || options?.method === 'PATCH') {
    const text = await response.text();
    if (text) {
      return JSON.parse(text);
    }
    return {} as T;
  }

  return response.json();
}

async function getCompetitionId(): Promise<string | null> {
  const url = `${SUPABASE_URL}/rest/v1/competitions?external_id=eq.${COMPETITION_EXTERNAL_ID}&select=id`;
  const result = await fetchJson<Array<{ id: string }>>(url);
  return result.length > 0 ? result[0].id : null;
}

async function enrollParticipant(
  competitionId: string,
  participant: (typeof SEASON_2_PARTICIPANTS)[0]
): Promise<boolean> {
  const url = `${SUPABASE_URL}/rest/v1/competition_participants`;

  try {
    await fetchJson(url, {
      method: 'POST',
      headers: {
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        competition_id: competitionId,
        npub: participant.npub,
        name: participant.name,
        picture: participant.picture || null,
      }),
    });
    return true;
  } catch (error) {
    // Ignore duplicate errors
    if (String(error).includes('duplicate')) {
      return true;
    }
    console.error(`  Failed to enroll ${participant.name}: ${error}`);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('Enroll Season II in Running Bitcoin');
  console.log('========================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Total participants: ${SEASON_2_PARTICIPANTS.length}`);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('\nERROR: Missing environment variables!');
    process.exit(1);
  }

  // Get competition ID
  const competitionId = await getCompetitionId();
  if (!competitionId) {
    console.error('\nERROR: Running Bitcoin competition not found!');
    process.exit(1);
  }
  console.log(`\nCompetition ID: ${competitionId}`);

  // Enroll each participant
  console.log('\nEnrolling participants...');
  let enrolled = 0;
  let errors = 0;

  for (const participant of SEASON_2_PARTICIPANTS) {
    const success = await enrollParticipant(competitionId, participant);
    if (success) {
      enrolled++;
      console.log(`  ✅ ${participant.name}`);
    } else {
      errors++;
    }
  }

  // Summary
  console.log('\n========================================');
  console.log('ENROLLMENT COMPLETE');
  console.log('========================================');
  console.log(`Successfully enrolled: ${enrolled}`);
  console.log(`Errors: ${errors}`);
}

main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
