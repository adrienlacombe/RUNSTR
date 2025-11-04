# Challenge Components Directory

Challenge display and management components for individual competition challenges.

## Files

- **ChallengeAnnouncementPreview.tsx** - Preview and share kind 30102 challenge announcements to Nostr (kind 1 social posts with embedded 800x600 SVG cards)
- **ChallengeHeader.tsx** - Header component for challenge detail screens
- **ChallengePaymentModal.tsx** - Modal for handling challenge wager payments
- **ChallengePreviewModal.tsx** - ⚠️ DEPRECATED: Modal for previewing challenges from deep links (shows migration message to use Challenge Wizard)
- **ChallengeStatus.tsx** - Status indicator for challenge progress and state
- **ChallengeVersus.tsx** - Versus display component showing competing participants
- **CompetitorSection.tsx** - Section displaying challenge competitors and their scores
- **RulesSection.tsx** - Challenge rules and requirements display component

## Architecture Notes

- **Instant Challenges**: Created via `SimplifiedChallengeWizard` as kind 30102 events with participant 'p' tags
- **Social Sharing**: After creation, wizards show announcement preview with "Skip" or "Share to Nostr" options
- **Notifications**: Users tagged in 'p' tags automatically receive in-app notifications via `ChallengeNotificationHandler`
- **No Acceptance Flow**: Challenges are active immediately when created (no kind 1105/1106 request/accept)