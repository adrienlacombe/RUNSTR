# AI Services

This folder contains AI-powered services for RUNSTR's fitness coach ("COACH RUNSTR"), using PPQ.AI's Claude Haiku API for fast, reliable workout analysis powered by anonymous Bitcoin payments.

## Overview

COACH RUNSTR provides AI-powered fitness insights by analyzing workout history via PPQ.AI's API (OpenAI-compatible endpoint using Claude Haiku 4.5). Users configure their own API keys, enabling anonymous Bitcoin payments and zero platform custody of AI costs.

## Files

### `CoachClaudeService.ts`
Core service class that wraps PPQ.AI's API (OpenAI-compatible) for workout analysis using Claude Haiku 4.5.

**Features:**
- Fast API-based inference (~2-3 seconds per analysis)
- Cost-effective (~$0.0010 per workout, ~$1.00 per 1,000 workouts)
- Anonymous Bitcoin payments via PPQ.AI
- User-controlled API keys (no platform custody)
- In-memory caching for recent analyses
- Automatic error handling with Bitcoin credit detection

### `useCoachRunstr.ts`
Custom React hook for AI-powered fitness insights using PPQ.AI's API.

**Features:**
- Three insight types: Weekly Summary, Trends, Tips
- User API key management via AsyncStorage (`@runstr:ppq_api_key`)
- 5-minute response caching to avoid redundant API calls
- Loading states and Bitcoin credit error handling
- Settings integration for API key configuration

### `PPQAPIKeyModal.tsx`
Modal component for configuring PPQ.AI API keys in settings.

**Features:**
- API key input with secure text entry
- "Get API Key" button with referral link integration
- Real-time validation and error handling
- Integration with Settings screen

**Usage:**
```typescript
import { useCoachRunstr } from '../services/ai/useCoachRunstr';
import localWorkoutStorage from '../services/fitness/LocalWorkoutStorageService';

function CoachComponent() {
  const { generateInsight, setApiKey, loading, error, modelReady } = useCoachRunstr();

  // First time setup: configure API key
  const handleSetupApiKey = async () => {
    await setApiKey('sk-ant-your-api-key-here');
  };

  const handleGenerateInsight = async () => {
    const workouts = await localWorkoutStorage.getAllWorkouts();
    const insight = await generateInsight('weekly', workouts);

    insight.bullets.forEach(bullet => console.log(bullet));
  };

  return (
    <View>
      {!modelReady ? (
        <Button onPress={handleSetupApiKey} title="Configure API Key" />
      ) : (
        <Button onPress={handleGenerateInsight} title="Get Insights" disabled={loading} />
      )}
    </View>
  );
}
```

**API:**

- `generateInsight(type, workouts, options?)` - Generate AI insight
  - `type`: 'weekly' | 'trends' | 'tips'
  - `workouts`: Array of LocalWorkout objects
  - `options.useCache`: Enable/disable caching (default: true)
  - Returns: `CoachInsight` with 3 bullet points

- `setApiKey(apiKey)` - Configure Anthropic API key
- `clearCache()` - Clear all cached insights
- `loading`: Boolean indicating if API call is in progress
- `error`: Error message if API call fails
- `modelReady`: Boolean indicating if API key is configured
- `apiKeyConfigured`: Boolean indicating if API key is stored

## Model Details

**Model:** Claude Haiku 4.5 (via PPQ.AI)
- **Provider:** PPQ.AI (OpenAI-compatible API)
- **Endpoint:** https://api.ppq.ai/chat/completions
- **Context Window:** 200,000 tokens
- **Output Limit:** 200 tokens per request (sufficient for 3 bullet points)
- **Speed:** ~2-3 seconds per analysis
- **Cost:**
  - Input: $1.00 per million tokens
  - Output: $5.00 per million tokens
  - **Per workout:** ~$0.0010 (one-tenth of a penny)
- **Payment:** Anonymous Bitcoin via Lightning Network

## Cost Analysis

```
Typical Workout Analysis:
- Input: ~500 tokens (workout data + prompt)
- Output: ~200 tokens (3 bullet points)
- Cost: ~$0.0010 per analysis

User Cost Scenarios (per user):
- Light user (10 workouts/month): ~$0.01/month (~1 cent)
- Active user (20 workouts/month): ~$0.02/month (~2 cents)
- Power user (50 workouts/month): ~$0.05/month (~5 cents)

Why This Works:
- Users pay their own AI costs with Bitcoin
- No platform custody or revenue sharing needed
- Referral kickback revenue for every signup
```

## Setup Instructions

### User Setup Flow

1. **Open Coach RUNSTR Card** in Profile screen
2. **Tap "Go to Settings"** when prompted to configure API key
3. **Open Settings → Coach RUNSTR AI** section
4. **Tap "Get API Key"** button (opens https://ppq.ai/invite/637cf3fc)
5. **Sign up with Bitcoin** on PPQ.AI website
   - Create account with Lightning wallet
   - Fund with sats (~$1 = 16,600 sats)
6. **Copy API key** from PPQ.AI dashboard
7. **Return to app** and paste API key in Settings
8. **Tap Save** to store locally

The API key is stored securely in AsyncStorage at:
```
@runstr:ppq_api_key
```

### Referral Benefits

Using the referral link (https://ppq.ai/invite/637cf3fc) provides:
- Kickback revenue for every new signup
- Users get same pricing, you get revenue share
- No platform custody - users pay directly with Bitcoin

## Prompt Templates

### Weekly Summary
Analyzes last 7 days of workouts:
- Total distance/time and workout frequency
- Average pace or notable performance metrics
- Specific achievements

### Trends
Analyzes all-time workout history (last 20 workouts for cost efficiency):
- Long-term improvement trends
- Consistency patterns
- Areas for focus

### Tips
Provides actionable training advice:
- Recovery recommendations
- Progression strategies
- Variety and cross-training suggestions

## Privacy & Security

✅ **API Key Security**: Stored locally in AsyncStorage, never transmitted except to PPQ.AI servers
✅ **HTTPS Only**: All API calls use encrypted HTTPS connections
✅ **No Data Persistence**: PPQ.AI does not store workout data
✅ **User Control**: Users can delete API key anytime via Settings
✅ **Bitcoin Payments**: Anonymous Lightning payments, no KYC required
⚠️ **Shared Responsibility**: API key gives access to user's PPQ.AI account - keep it secure!

## Performance Considerations

- **First Run:** Instant (no model download required)
- **API Call Time:** ~2-3 seconds per analysis
- **Memory Usage:** Minimal (~1MB for service code)
- **Battery Impact:** Negligible (just API calls)
- **Caching:**
  - In-memory cache: 5-minute TTL
  - AsyncStorage cache: 5-minute TTL
  - Reduces redundant API calls

## Technical Stack

- **fetch API** - Native HTTP client for PPQ.AI API calls
- **AsyncStorage** - Secure local storage for API key and cache
- **Claude Haiku 4.5** - Via PPQ.AI's OpenAI-compatible endpoint
- **OpenAI Chat Completions Format** - Standard API format for prompts/responses

## Migration History

### From On-Device to API-Based (Jan 2025)

#### llama.rn Attempt (Jan 2025)
**Reason:** Original attempt to use on-device TinyLlama 1.1B via llama.rn
**Result:** ❌ XCFramework header duplication errors prevented iOS builds
**Issue:** Multiple XCFrameworks copying duplicate headers to build output

#### react-native-executorch Attempt (Jan 2025)
**Reason:** Migrate from llama.rn to avoid XCFramework build issues
**Result:** ❌ Runtime error code 18 (InvalidArgument) during generation
**Models Tried:** LLAMA3_2_1B, QWEN2_5_0_5B_QUANTIZED (both failed)
**Issue:** Library-level bug in v0.5.15 affecting all models on iOS

#### Back to llama.rn (Jan 2025)
**Reason:** Try to fix XCFramework header duplication with Xcode configuration
**Result:** ❌ Same build errors persisted - unfixable without library changes

#### Final Solution: PPQ.AI API with User Keys (Jan 2025)
**Reason:** Both on-device solutions had blocking issues:
- llama.rn: Build fails (XCFramework headers)
- react-native-executorch: Runtime fails (error code 18)

**Why PPQ.AI Instead of Direct Anthropic:**
- ✅ **Anonymous Bitcoin Payments**: Users pay with Lightning, no KYC
- ✅ **Referral Revenue**: Kickback for every signup via referral link
- ✅ **No Platform Custody**: Users bring their own API keys
- ✅ **Better Alignment**: Matches RUNSTR's Bitcoin/Nostr ethos

**Benefits of API Approach:**
- ✅ **No Native Dependencies**: Pure TypeScript, zero build issues
- ✅ **Better Quality**: Claude Haiku >> any small on-device model
- ✅ **Cost-Effective**: ~$0.0010 per analysis (~1 cent per 10 workouts)
- ✅ **Fast**: ~2-3 seconds vs 5-10 seconds on-device
- ✅ **Reliable**: No platform-specific bugs or model downloads
- ✅ **Maintainable**: No need to track llama.cpp/ExecuTorch updates

**Current Implementation:**
```typescript
import { coachClaude } from './CoachClaudeService';

// User configures API key via Settings
coachClaude.initialize(userApiKey);

// Generate insights via PPQ.AI
const insight = await coachClaude.generateInsight('weekly', workouts);
```

## Future Improvements

- [ ] Prompt caching to reduce costs by 90% (reuse system prompts)
- [ ] Batch analysis for weekly summaries (1 API call for 7 workouts)
- [ ] Personalized coaching based on user goals and preferences
- [ ] Integration with Claude's multimodal capabilities (food photos, form analysis)
- [ ] Extended context for long-term training plan generation
- [ ] Custom prompt templates per user preference

## Troubleshooting

**API key not working:**
- Verify key starts with `sk-ant-`
- Check key is valid at https://console.anthropic.com/
- Ensure sufficient credits in Anthropic account
- Try refreshing API key

**Slow responses (>10 seconds):**
- Check internet connection
- Verify Anthropic API status at https://status.anthropic.com/
- Try reducing workout context (use fewer workouts)

**"Rate limit exceeded" error:**
- Wait 60 seconds and retry
- Check Anthropic account tier limits
- Consider upgrading to higher tier if needed

**Insights are generic/not specific:**
- Ensure user has sufficient workout history (5+ workouts)
- Check that workout data includes distance, pace, and dates
- Verify workouts are recent (within last 30 days)

**"Invalid API key" error:**
- Re-configure API key via `setApiKey()`
- Check for extra spaces or quotes in API key string
- Verify API key hasn't been revoked in Anthropic console
