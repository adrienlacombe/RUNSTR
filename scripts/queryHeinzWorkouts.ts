import NDK, { NDKFilter } from '@nostr-dev-kit/ndk';

async function queryHeinzData() {
  console.log('Initializing NDK...');
  const ndk = new NDK({
    explicitRelayUrls: [
      'wss://relay.damus.io',
      'wss://relay.primal.net',
      'wss://nos.lol',
      'wss://relay.nostr.band'
    ]
  });

  await ndk.connect();
  console.log('Connected to relays\n');

  // Step 1: Find heinz's profile
  console.log('=== Searching for user "heinz" ===');
  const profileFilter: NDKFilter = {
    kinds: [0],
    limit: 100
  };

  const profiles = await ndk.fetchEvents(profileFilter);
  console.log(`Found ${profiles.size} profiles, searching for "heinz"...\n`);

  let heinzPubkey: string | null = null;
  let heinzProfile: any = null;

  for (const event of profiles) {
    try {
      const content = JSON.parse(event.content);
      const name = content.name?.toLowerCase() || '';
      const displayName = content.display_name?.toLowerCase() || '';
      const nip05 = content.nip05?.toLowerCase() || '';
      
      if (name.includes('heinz') || displayName.includes('heinz') || nip05.includes('heinz')) {
        heinzPubkey = event.pubkey;
        heinzProfile = content;
        console.log('✅ Found heinz!');
        console.log('Pubkey (hex):', heinzPubkey);
        console.log('Name:', content.name);
        console.log('Display Name:', content.display_name);
        console.log('About:', content.about);
        console.log('Lightning Address (lud16):', content.lud16);
        console.log('Lightning Address (lud06):', content.lud06);
        console.log('NIP-05:', content.nip05);
        console.log('\n');
        break;
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }

  if (!heinzPubkey) {
    console.log('❌ Could not find user "heinz"');
    console.log('Trying alternative search by querying recent kind 1301 events...\n');
    
    // Alternative: Search recent workouts and look for heinz-related content
    const recentWorkouts: NDKFilter = {
      kinds: [1301 as any],
      since: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // Last 30 days
      limit: 500
    };
    
    const workouts = await ndk.fetchEvents(recentWorkouts);
    console.log(`Found ${workouts.size} recent workout events\n`);
    
    // Check authors and find heinz
    const authorPubkeys = new Set<string>();
    for (const workout of workouts) {
      authorPubkeys.add(workout.pubkey);
    }
    
    console.log('Fetching profiles for workout authors...');
    const authorProfiles = await ndk.fetchEvents({
      kinds: [0],
      authors: Array.from(authorPubkeys)
    });
    
    for (const profile of authorProfiles) {
      try {
        const content = JSON.parse(profile.content);
        const name = content.name?.toLowerCase() || '';
        const displayName = content.display_name?.toLowerCase() || '';
        
        if (name.includes('heinz') || displayName.includes('heinz')) {
          heinzPubkey = profile.pubkey;
          heinzProfile = content;
          console.log('✅ Found heinz via workout author search!');
          console.log('Pubkey (hex):', heinzPubkey);
          console.log('Name:', content.name);
          console.log('Display Name:', content.display_name);
          console.log('Lightning Address (lud16):', content.lud16);
          console.log('\n');
          break;
        }
      } catch (e) {
        // Skip
      }
    }
  }

  if (!heinzPubkey) {
    console.log('❌ Still could not find heinz. Exiting.');
    process.exit(1);
  }

  // Step 2: Query heinz's kind 1301 workout events
  console.log('=== Querying heinz\'s workout events (kind 1301) ===');
  
  // Target timestamps for failed payments
  const failedPaymentTime1 = 1768495058; // Jan 15, 16:37 UTC (50 sats - workout)
  const failedPaymentTime2 = 1768493293; // Jan 15, 16:08 UTC (5 sats - steps)
  
  console.log('Failed payment timestamps:');
  console.log('- Workout (50 sats):', new Date(failedPaymentTime1 * 1000).toISOString());
  console.log('- Steps (5 sats):', new Date(failedPaymentTime2 * 1000).toISOString());
  console.log('\n');

  // Query workouts around January 15, 2026
  const jan15Start = Math.floor(new Date('2026-01-15T00:00:00Z').getTime() / 1000);
  const jan15End = Math.floor(new Date('2026-01-16T00:00:00Z').getTime() / 1000);

  const workoutFilter: NDKFilter = {
    kinds: [1301 as any],
    authors: [heinzPubkey],
    since: jan15Start,
    until: jan15End
  };

  console.log(`Querying workouts from Jan 15, 2026 (${jan15Start} to ${jan15End})...\n`);
  const heinzWorkouts = await ndk.fetchEvents(workoutFilter);
  
  console.log(`Found ${heinzWorkouts.size} workout events on Jan 15, 2026\n`);

  if (heinzWorkouts.size === 0) {
    console.log('No workouts found on Jan 15. Querying last 30 days instead...\n');
    const last30Days = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const allWorkoutsFilter: NDKFilter = {
      kinds: [1301 as any],
      authors: [heinzPubkey],
      since: last30Days,
      limit: 50
    };
    
    const allWorkouts = await ndk.fetchEvents(allWorkoutsFilter);
    console.log(`Found ${allWorkouts.size} total workouts in last 30 days\n`);
    
    for (const workout of allWorkouts) {
      console.log('---');
      console.log('Event ID:', workout.id);
      console.log('Created:', new Date(workout.created_at! * 1000).toISOString());
      console.log('Content:', workout.content);
      console.log('Tags:', JSON.stringify(workout.tags, null, 2));
      console.log('\n');
    }
  } else {
    // Display Jan 15 workouts
    for (const workout of heinzWorkouts) {
      console.log('---');
      console.log('Event ID:', workout.id);
      console.log('Created:', new Date(workout.created_at! * 1000).toISOString());
      console.log('Timestamp:', workout.created_at);
      
      // Calculate time difference from failed payment timestamps
      const diff1 = Math.abs(workout.created_at! - failedPaymentTime1);
      const diff2 = Math.abs(workout.created_at! - failedPaymentTime2);
      
      if (diff1 < 300) { // Within 5 minutes
        console.log(`⚠️  This workout is ${diff1} seconds from failed 50 sat payment!`);
      }
      if (diff2 < 300) {
        console.log(`⚠️  This workout is ${diff2} seconds from failed 5 sat payment!`);
      }
      
      console.log('Content:', workout.content);
      console.log('Tags:', JSON.stringify(workout.tags, null, 2));
      console.log('\n');
    }
  }

  console.log('=== Summary ===');
  console.log('User:', heinzProfile?.name || 'heinz');
  console.log('Pubkey:', heinzPubkey);
  console.log('Lightning Address:', heinzProfile?.lud16 || heinzProfile?.lud06 || 'NOT SET');
  console.log('Total workouts on Jan 15:', heinzWorkouts.size);
  
  if (!heinzProfile?.lud16 && !heinzProfile?.lud06) {
    console.log('\n❌ ISSUE FOUND: No Lightning address set in profile!');
    console.log('This would cause reward payment failures.');
  }

  process.exit(0);
}

queryHeinzData().catch(console.error);
