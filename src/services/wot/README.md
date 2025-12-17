# Web of Trust (WoT) Service

This folder contains services for integrating with NIP-85 Trusted Assertions via Brainstorm.

## Overview

RUNSTR uses Brainstorm's Web of Trust calculations to provide a "RUNSTR Rank" for users. This rank represents how trustworthy a user appears from RUNSTR's perspective in the Nostr network.

## How It Works

1. RUNSTR is registered as a "customer" with Brainstorm
2. Brainstorm calculates WoT scores from RUNSTR's perspective for all Nostr pubkeys
3. Brainstorm publishes kind 30382 events (NIP-85 Trusted Assertions) containing these scores
4. The app queries these events to get a user's RUNSTR Rank

**Important**: Users don't publish anything. Brainstorm publishes events ABOUT users.

## Files

| File | Description |
|------|-------------|
| `WoTService.ts` | Main service for fetching and caching RUNSTR Rank scores |

## Configuration

- **Brainstorm Relay**: `wss://nip85.brainstorm.world`
- **Brainstorm Pubkey**: `3eaeb02c4f94a0aabf016527c35222a2ede49b3981df32aa9096f5db2dad58e2`
- **Event Kind**: 30382 (NIP-85 Trusted Assertions)

## Usage

```typescript
import { WoTService } from './WoTService';

const wotService = WoTService.getInstance();

// Fetch and cache user's RUNSTR Rank
const score = await wotService.fetchAndCacheScore(userHexPubkey);

// Get cached score (no network call)
const cached = await wotService.getCachedScore(userHexPubkey);

// Force refresh from network
const refreshed = await wotService.refreshScore(userHexPubkey);
```

## Caching

Scores are cached permanently in AsyncStorage with key format:
```
@runstr:wot_score:{hexPubkey}
```

Scores are only updated when the user manually refreshes from the Stats screen.

## Future Plans

- Phase 2: Use RUNSTR Rank to filter daily leaderboards
- Phase 3: Allow event creators to set custom rank thresholds
