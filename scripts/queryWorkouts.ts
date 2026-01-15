import NDK, { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';

/**
 * Quick script to query all kind 1301 workout events from a specific pubkey
 * Usage: npx ts-node scripts/queryWorkouts.ts
 */

const PUBKEY = '5d405752c1b4ddd0714baf3ce415db52e5506036f345ff575ee16e2b4cf189bf';

const RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.primal.net',
  'wss://nos.lol',
  'wss://relay.nostr.band'
];

async function queryWorkoutEvents() {
  console.log('Initializing NDK with relays...');

  const ndk = new NDK({
    explicitRelayUrls: RELAYS,
  });

  await ndk.connect();
  console.log('Connected to Nostr relays\n');

  const filter: NDKFilter = {
    kinds: [1301 as any], // Kind 1301 for workout events
    authors: [PUBKEY],
  };

  console.log(`Querying kind 1301 events for pubkey: ${PUBKEY}\n`);
  console.log('Fetching events...\n');

  const events = await ndk.fetchEvents(filter);

  console.log(`Found ${events.size} workout events\n`);
  console.log('='.repeat(80));

  // Convert Set to Array and sort by timestamp (newest first)
  const sortedEvents = Array.from(events).sort((a, b) => b.created_at! - a.created_at!);

  sortedEvents.forEach((event: NDKEvent, index: number) => {
    console.log(`\nEvent #${index + 1}`);
    console.log('-'.repeat(80));
    console.log(`Event ID: ${event.id}`);

    // Convert timestamp to readable date
    const date = new Date(event.created_at! * 1000);
    console.log(`Created At: ${date.toLocaleString()} (${event.created_at})`);

    // Extract relevant tags
    const tags = event.tags;
    const exerciseTag = tags.find(t => t[0] === 'exercise');
    const distanceTag = tags.find(t => t[0] === 'distance');
    const durationTag = tags.find(t => t[0] === 'duration');
    const caloriesTag = tags.find(t => t[0] === 'calories');
    const teamTag = tags.find(t => t[0] === 'team');
    const sourceTag = tags.find(t => t[0] === 'source');

    console.log(`Exercise: ${exerciseTag ? exerciseTag[1] : 'N/A'}`);

    if (distanceTag && distanceTag.length >= 3) {
      console.log(`Distance: ${distanceTag[1]} ${distanceTag[2]}`);
    }

    console.log(`Duration: ${durationTag ? durationTag[1] : 'N/A'}`);
    console.log(`Calories: ${caloriesTag ? caloriesTag[1] : 'N/A'}`);

    if (teamTag) {
      console.log(`Team: ${teamTag[1]}`);
    }

    if (sourceTag) {
      console.log(`Source: ${sourceTag[1]}`);
    }

    // Show content (should be plain text per spec)
    console.log(`Content: ${event.content.substring(0, 100)}${event.content.length > 100 ? '...' : ''}`);

    // Show all tags for debugging
    console.log(`All Tags: ${JSON.stringify(tags)}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log(`\nTotal Events: ${events.size}`);

  process.exit(0);
}

queryWorkoutEvents().catch(err => {
  console.error('Error querying workout events:', err);
  process.exit(1);
});
