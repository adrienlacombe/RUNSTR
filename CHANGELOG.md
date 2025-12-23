# Changelog

All notable changes to RUNSTR will be documented in this file.

## [1.2.2] - 2025-12-23

### Bug Fixes
- Fixed share screen crash on Android caused by invalid `transformOrigin` CSS property
- Improved walk tracker GPS accuracy with tuned thresholds (stricter 35m accuracy, looser 12m/s speed filter)
- Reduced GPS recovery skip points from 3 to 2 to minimize distance loss during walks

### Performance Improvements
- Added FrozenEventStore for permanent caching of ended event data (zero network calls for completed events)
- Memory cache initialization during app startup for instant frozen event access

### New Features
- GPS Permissions Diagnostics component in Settings > Fitness Tracking (Android only)
- Shows status and fix actions for: Location Services, Background Location, Location Accuracy, Battery Optimization

## [1.2.1] - 2025-12-20

### Bug Fixes
- Fixed version display in Settings screen (was showing outdated 1.0.5)
- Minor stability improvements

### Walk Tracker Simplification
- **Simplified to match Running Tracker**: Shows distance + duration as hero metrics during active tracking
- **No more step confusion**: Removed step count display during active walks (Health Connect batching caused 0-step display)
- **Clean data sources**: Tracked Steps card now only pulls from Health Connect (no local workout mixing)

## [1.2.0] - 2025-12-XX

### Features
- Major UI/UX improvements
- Enhanced user experience across all screens

## [1.1.0] - 2025-XX-XX

### Features
- Step counter integration
- Coach Claude AI assistant
- Various bug fixes

## [1.0.5] - 2025-XX-XX

### Bug Fixes
- Season II optimization
- Web of Trust (WOT) improvements
