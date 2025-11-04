# Wizards Components Directory

Multi-step wizard components for competition creation and team setup workflows.

## Files

- **ChallengeCreationWizard.tsx** - Multi-step wizard for creating individual challenges
- **EventCreationWizard.tsx** - Multi-step wizard for creating team events
- **GlobalChallengeWizard.tsx** - Multi-step wizard for creating 1v1 challenges with any Nostr user globally
- **LeagueCreationWizard.tsx** - Multi-step wizard for creating team leagues
- **SimplifiedChallengeWizard.tsx** - Streamlined 3-step wizard for running-only instant challenges (5K, 10K, half/full marathon)
- **QuickChallengeWizard.tsx** - ⚠️ BROKEN: 5-step wizard for challenging specific opponent (imports deleted ChallengeRequestService, needs refactor to use ChallengeService)
- **TeamCreationWizard.tsx** - Multi-step wizard for team creation and setup
- **WizardStepContainer.tsx** - Container component providing consistent wizard UI and navigation

## Subdirectories

- **steps/** - Individual wizard step components used across different wizard workflows