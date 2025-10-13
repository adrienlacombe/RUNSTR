# Scripts Directory

Utility scripts, test scripts, and development tools for RUNSTR.

## Directory Structure

```
scripts/
├── README.md (this file)
├── database/ (SQL migrations and fixes - deprecated)
├── assets/ (Asset generation scripts)
└── [test and utility scripts]
```

## Available Scripts

### `preLaunchAudit.ts`
**Purpose**: Automated pre-launch code quality audit

**Usage**:
```bash
npm run audit:pre-launch
```

**What it does**:
- Scans the entire `src/` directory for common issues
- Categorizes findings by severity (Critical, High, Medium, Low)
- Generates detailed `AUDIT_REPORT.md` in project root
- Exits with error code if critical issues found (for CI integration)

**Checks performed**:
1. **Error Boundaries** - Identifies async operations without error handling
2. **Loading States** - Finds data-fetching screens without loading indicators
3. **Memory Leaks** - Detects useEffect hooks with subscriptions but no cleanup
4. **Hardcoded Colors** - Flags inline color values instead of theme usage
5. **Console Logs** - Identifies console.log/warn statements for production cleanup
6. **AsyncStorage** - Finds storage operations without try-catch blocks
7. **Nostr Queries** - Detects unbounded queries (missing limit/since/until)
8. **Empty States** - Identifies lists without empty state messages

**Output**:
- Terminal summary with color-coded severity levels
- `AUDIT_REPORT.md` with detailed findings and recommendations
- Exit code 0 (pass) or 1 (critical issues found)

**When to run**:
- Daily during pre-launch week
- After major feature implementations
- Before creating release builds
- As part of CI/CD pipeline

---

### `testActivityTrackerFixes.ts`
**Purpose**: Verification tests for activity tracker distance freeze and crash fixes

**Usage**:
```bash
npm run test:activity-tracker
```

**What it does**:
- Tests 20-minute workout duration handling
- Verifies distance calculation freeze prevention
- Validates workout query timeout implementation
- Confirms no crashes during extended workouts

**Tests**:
- ✅ 5-second timeout on workout queries
- ✅ Distance updates don't freeze during long workouts
- ✅ App remains stable during 20-minute sessions
- ✅ Proper error handling for query timeouts

---

### `query-1301-stats.js`
**Purpose**: Nostr kind 1301 event statistics and debugging

**Usage**:
```bash
node scripts/query-1301-stats.js
```

**What it does**:
- Queries Nostr relays for kind 1301 workout events
- Generates statistics about workout data
- Outputs results to `stats-output.json`
- Useful for debugging competition leaderboards

**Output**:
- `stats-output.json` - Detailed workout event statistics
- Console logs with relay connection status and event counts

---

### Wallet Testing Scripts
- **clear-app-data.js** - Clear AsyncStorage and reset app state for testing
- **recover-wallet.js** - Test wallet recovery flow and persistence
- **test-wallet-duplicate-prevention.js** - Verify no duplicate wallet creation
- **test-wallet-fixes.js** - Test wallet initialization and persistence fixes
- **test-wallet-fixes.ts** - TypeScript version of wallet testing suite
- **test-wallet-retrieval.js** - Test wallet data retrieval from storage

### Amber Integration Testing
- **test-amber-deeplink.sh** - Test Amber signer deep link integration
- **test-amber-solutions.ts** - Test Amber signing solutions and workflows
- **test-amber-wallet-flow.ts** - End-to-end Amber wallet flow testing

### Performance Testing
- **test-progressive-workout-loading.html** - Browser test for workout loading performance
- **test-workout-performance-browser.html** - Browser-based workout performance testing

### Nostr Testing
- **test1301Format.js** - Validate kind 1301 workout event format compliance
- **test-integration.js** - Integration tests for Nostr services

### General Testing
- **testRunner.js** - Custom test runner for specific test suites
- **runTerminalTests.js** - Run tests from terminal with output formatting
- **validateTestLogic.js** - Validate test logic and assertions

---

## Database Scripts (`database/`)

**NOTE**: These SQL scripts are legacy from when RUNSTR used Supabase. The app now uses pure Nostr for all data storage. Scripts kept for historical reference.

### Migration Scripts
- **HYBRID_SCHEMA_MIGRATION.sql** - Hybrid schema migration for Phase 2
- **complete-nuclear-fix.sql** - Complete database reset and rebuild
- **nuclear-option-fix.sql** - Emergency database fix script

### Targeted Fixes
- **fix-difficulty-enum.sql** - Fix difficulty level enum constraints
- **fix-function-overload.sql** - Fix function overload issues
- **fix-rls-policies.sql** - Fix Row Level Security policies
- **fix-simple-no-difficulty.sql** - Simplified fix without difficulty field
- **fix-stored-procedure.sql** - Fix stored procedure definitions

---

## Asset Generation Scripts (`assets/`)

Python scripts for generating app assets:

- **create_circular_android_icons.py** - Generate circular Android adaptive icons
- **generate_splash_screens.py** - Generate splash screens for iOS and Android
- **scale_android_icons.py** - Scale and resize Android launcher icons

**Requirements**: Python 3.x with Pillow (PIL) library

**Usage Example**:
```bash
cd scripts/assets
python3 generate_splash_screens.py
```

---

## Adding New Scripts

When adding a new script to this directory:

1. **Add npm script** in `package.json`:
   ```json
   "scripts": {
     "your-script": "npx tsx scripts/yourScript.ts"
   }
   ```

2. **Document it here** with:
   - Purpose (one sentence)
   - Usage command
   - What it does (bullet points)
   - Output/side effects
   - When to run it

3. **Add file header** in the script:
   ```typescript
   #!/usr/bin/env npx tsx

   /**
    * Script Name - Brief Description
    *
    * Detailed explanation of what the script does
    *
    * Usage: npm run your-script
    */
   ```

4. **Update CLAUDE.md** if the script is important for development workflow

---

## Script Development Guidelines

### TypeScript Scripts
- Use `#!/usr/bin/env npx tsx` shebang for direct execution
- Import types from `src/types` when needed
- Handle errors gracefully with try-catch
- Provide clear console output with colors (if applicable)
- Exit with appropriate exit codes (0 = success, 1 = failure)

### JavaScript Scripts
- Use `#!/usr/bin/env node` shebang
- Keep dependencies minimal
- Document any external package requirements

### Testing Scripts
- Name with `test*.ts` pattern
- Output clear pass/fail results
- Include test descriptions in output
- Return non-zero exit code on failures

### Audit/Analysis Scripts
- Generate markdown reports for human readability
- Use color-coded terminal output for quick scanning
- Categorize findings by priority/severity
- Include specific file:line references
- Provide actionable recommendations

---

## CI/CD Integration

Scripts can be integrated into CI/CD pipelines:

```yaml
# Example: GitHub Actions
- name: Run Pre-Launch Audit
  run: npm run audit:pre-launch

- name: Run Activity Tracker Tests
  run: npm run test:activity-tracker
```

The pre-launch audit returns exit code 1 if critical issues are found, failing the CI build.

---

## Related Documentation

- **Testing Guide**: docs/PHASE_1_2_TESTING_GUIDE.md
- **Pre-Launch Guide**: docs/PRE_LAUNCH_REVIEW_GUIDE.md
- **Test Scripts Summary**: docs/TEST_SCRIPTS_SUMMARY.md
- **Metro/Xcode Debugging**: docs/METRO_XCODE_DEBUGGING_GUIDE.md
- **Amber Integration**: docs/AMBER_INTEGRATION.md

---

**Last Updated**: 2025-01-13
