#!/usr/bin/env tsx
/**
 * Backfill Competition Profiles
 *
 * Fetches Nostr profiles (kind 0) for competition participants
 * who are missing name/picture in the database.
 *
 * Usage: npx tsx scripts/maintenance/backfill-competition-profiles.ts
 *
 * What it does:
 * 1. Queries competition_participants for entries with NULL name or picture
 * 2. Fetches their Nostr profiles from relays
 * 3. Updates Supabase with the profile data
 *
 * Environment: Requires EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
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

interface ParticipantToUpdate {
  id: string;
  npub: string;
  pubkey: string;
  name: string | null;
  picture: string | null;
}

interface NostrProfile {
  name?: string;
  display_name?: string;
  picture?: string;
  about?: string;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY!,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  // For PATCH requests, there's no body
  if (options?.method === 'PATCH') {
    return {} as T;
  }

  return response.json();
}

async function getParticipantsMissingProfiles(): Promise<ParticipantToUpdate[]> {
  // Query participants where name OR picture is NULL
  const url = `${SUPABASE_URL}/rest/v1/competition_participants?or=(name.is.null,picture.is.null)&select=id,npub,name,picture`;
  const participants = await fetchJson<Array<{ id: string; npub: string; name: string | null; picture: string | null }>>(url);

  // Convert npub to pubkey for each
  const result: ParticipantToUpdate[] = [];
  for (const p of participants) {
    try {
      const decoded = nip19.decode(p.npub);
      if (decoded.type === 'npub' && typeof decoded.data === 'string') {
        result.push({
          ...p,
          pubkey: decoded.data,
        });
      }
    } catch {
      console.warn(`  Skipping invalid npub: ${p.npub.slice(0, 20)}...`);
    }
  }

  return result;
}

async function fetchNostrProfiles(ndk: NDK, pubkeys: string[]): Promise<Map<string, NostrProfile>> {
  const profiles = new Map<string, NostrProfile>();

  if (pubkeys.length === 0) return profiles;

  console.log(`  Fetching ${pubkeys.length} profiles from Nostr...`);

  const filter: NDKFilter = {
    kinds: [0],
    authors: pubkeys,
  };

  try {
    const events = await ndk.fetchEvents(filter, { closeOnEose: true }, undefined, 10000);

    for (const event of events) {
      try {
        const content = JSON.parse(event.content) as NostrProfile;
        profiles.set(event.pubkey, content);
      } catch {
        // Skip invalid JSON
      }
    }

    console.log(`  Found ${profiles.size} profiles on Nostr`);
  } catch (error) {
    console.error(`  Error fetching profiles:`, error);
  }

  return profiles;
}

async function updateParticipantProfile(
  participantId: string,
  name: string | null,
  picture: string | null
): Promise<boolean> {
  const url = `${SUPABASE_URL}/rest/v1/competition_participants?id=eq.${participantId}`;

  const updateData: Record<string, string | null> = {};
  if (name) updateData.name = name;
  if (picture) updateData.picture = picture;

  if (Object.keys(updateData).length === 0) {
    return false;
  }

  try {
    await fetchJson(url, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    return true;
  } catch (error) {
    console.error(`  Failed to update ${participantId}:`, error);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('Competition Profile Backfill');
  console.log('========================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('\nERROR: Missing environment variables!');
    console.error('Required: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  try {
    // Step 1: Get participants missing profiles
    console.log('\n1. Querying participants missing profiles...');
    const participantsToUpdate = await getParticipantsMissingProfiles();
    console.log(`   Found ${participantsToUpdate.length} participants needing profile data`);

    if (participantsToUpdate.length === 0) {
      console.log('\n✅ All participants already have profile data!');
      process.exit(0);
    }

    // Show first few
    console.log('\n   Sample (first 5):');
    for (const p of participantsToUpdate.slice(0, 5)) {
      console.log(`   - ${p.npub.slice(0, 20)}... (name: ${p.name || 'NULL'}, pic: ${p.picture ? 'Yes' : 'NULL'})`);
    }

    // Step 2: Initialize NDK and connect to relays
    console.log('\n2. Connecting to Nostr relays...');
    const ndk = new NDK({
      explicitRelayUrls: RELAYS,
    });
    await ndk.connect(5000);

    // Wait a bit for connections
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('   Connected to relays');

    // Step 3: Fetch profiles in batches
    console.log('\n3. Fetching Nostr profiles...');
    const pubkeys = participantsToUpdate.map(p => p.pubkey);
    const profiles = await fetchNostrProfiles(ndk, pubkeys);

    // Step 4: Update Supabase
    console.log('\n4. Updating Supabase...');
    let updated = 0;
    let skipped = 0;
    let noProfile = 0;

    for (const participant of participantsToUpdate) {
      const profile = profiles.get(participant.pubkey);

      if (!profile) {
        noProfile++;
        continue;
      }

      const name = profile.name || profile.display_name || null;
      const picture = profile.picture || null;

      // Only update if we have new data
      const needsName = !participant.name && name;
      const needsPicture = !participant.picture && picture;

      if (!needsName && !needsPicture) {
        skipped++;
        continue;
      }

      const success = await updateParticipantProfile(
        participant.id,
        needsName ? name : null,
        needsPicture ? picture : null
      );

      if (success) {
        updated++;
        console.log(`   ✅ Updated: ${name || '(no name)'} - ${participant.npub.slice(0, 20)}...`);
      }
    }

    // Step 5: Summary
    console.log('\n========================================');
    console.log('BACKFILL COMPLETE');
    console.log('========================================');
    console.log(`Total participants needing update: ${participantsToUpdate.length}`);
    console.log(`Profiles found on Nostr: ${profiles.size}`);
    console.log(`Successfully updated: ${updated}`);
    console.log(`Skipped (no new data): ${skipped}`);
    console.log(`No Nostr profile found: ${noProfile}`);

    if (noProfile > 0) {
      console.log('\n⚠️  Some participants have no Nostr profile (kind 0 event).');
      console.log('    These users may have never set up a profile on Nostr.');
    }

    // Cleanup
    await ndk.pool?.destroy?.();

  } catch (error) {
    console.error('\nERROR:', error);
    process.exit(1);
  }
}

main();
