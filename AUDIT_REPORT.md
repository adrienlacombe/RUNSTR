# RUNSTR Pre-Launch Audit Report

**Date**: 2025-10-14

## Summary

- 🔴 Critical: 4
- 🟠 High: 20
- 🟡 Medium: 616
- 🟢 Low: 3275
- **Total**: 3915

## 🔴 Critical Issues

### 1. Memory Leaks: useEffect with subscription but no cleanup function

- **File**: `src/components/profile/tabs/PublicWorkoutsTab.tsx`:53
- **Fix**: Add return () => { /* cleanup subscription */ } to useEffect

### 2. Memory Leaks: useEffect with subscription but no cleanup function

- **File**: `src/components/team/JoinRequestsSection.tsx`:56
- **Fix**: Add return () => { /* cleanup subscription */ } to useEffect

### 3. Memory Leaks: useEffect with subscription but no cleanup function

- **File**: `src/components/ui/NostrConnectionStatus.tsx`:32
- **Fix**: Add return () => { /* cleanup subscription */ } to useEffect

### 4. Memory Leaks: useEffect with subscription but no cleanup function

- **File**: `src/screens/ProfileImportScreen.tsx`:47
- **Fix**: Add return () => { /* cleanup subscription */ } to useEffect

## 🟠 High Priority Issues

### 1. User Experience: Data fetching without loading indicator

- **File**: `src/screens/ContactSupportScreen.tsx`
- **Fix**: Add loading state and ActivityIndicator while fetching data

### 2. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/chat/ChatService.ts`:122
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 3. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/chat/ChatService.ts`:156
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 4. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/chat/ChatService.ts`:216
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 5. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/competition/JoinRequestService.ts`:118
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 6. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/competition/SimpleCompetitionService.ts`:70
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 7. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/competition/SimpleCompetitionService.ts`:118
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 8. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/competition/SimpleCompetitionService.ts`:218
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 9. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/competition/SimpleCompetitionService.ts`:256
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 10. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/competition/SimpleLeaderboardService.ts`:237
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 11. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/fitness/NdkWorkoutService.ts`:9
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 12. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/nostr/GlobalNDKService.ts`:13
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 13. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/nostr/NostrCompetitionParticipantService.ts`:412
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 14. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/nostr/NostrCompetitionParticipantService.ts`:479
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 15. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/nutzap/WalletDetectionService.ts`:75
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 16. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/nutzap/WalletDetectionService.ts`:112
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 17. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/nutzap/WalletSync.ts`:503
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 18. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/nutzap/nutzapService.old.ts`:619
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 19. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/nutzap/nutzapService.old.ts`:770
- **Fix**: Add limit, since, or until to prevent fetching too many events

### 20. Performance: Unbounded Nostr query (no limit/since/until)

- **File**: `src/services/nutzap/nutzapService.old.ts`:876
- **Fix**: Add limit, since, or until to prevent fetching too many events

## 🟡 Medium Priority Issues

<details>
<summary>Click to expand (616 issues)</summary>

1. **UI Consistency**: Hardcoded color found: #000000 - `src/components/activity/BaseTrackerComponent.tsx`
2. **UI Consistency**: Hardcoded color found: #000 - `src/components/auth/GoogleSignInButton.tsx`
3. **UI Consistency**: Hardcoded color found: #00ff00 - `src/components/captain/CompetitionParticipantsSection.tsx`
4. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/competition/CompetitionDistributionPanel.tsx`
5. **UI Consistency**: Hardcoded color found: #000 - `src/components/competition/JoinRequestCard.tsx`
6. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/competition/JoinRequestCard.tsx`
7. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/competition/JoinRequestCard.tsx`
8. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/competition/JoinRequestCard.tsx`
9. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/competition/JoinRequestCard.tsx`
10. **UI Consistency**: Hardcoded color found: #000 - `src/components/competition/JoinRequestsSection.tsx`
11. **UI Consistency**: Hardcoded color found: #ffffff - `src/components/competition/LiveLeaderboard.tsx`
12. **UI Consistency**: Hardcoded color found: #cd7f32 - `src/components/competition/LiveLeaderboard.tsx`
13. **UI Consistency**: Hardcoded color found: #ffffff - `src/components/event/QREventDisplayModal.tsx`
14. **UI Consistency**: Hardcoded color found: #000000 - `src/components/event/QREventDisplayModal.tsx`
15. **UI Consistency**: Hardcoded color found: #ffffff - `src/components/event/QREventDisplayModal.tsx`
16. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/events/ActivityTypeSelector.tsx`
17. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/events/ActivityTypeSelector.tsx`
18. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/events/ActivityTypeSelector.tsx`
19. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/events/ActivityTypeSelector.tsx`
20. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/fitness/MonthlyWorkoutFolder.tsx`
21. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/fitness/MonthlyWorkoutFolder.tsx`
22. **UI Consistency**: Hardcoded color found: #999 - `src/components/fitness/MonthlyWorkoutFolder.tsx`
23. **UI Consistency**: Hardcoded color found: #000000 - `src/components/fitness/WorkoutActionButtons.tsx`
24. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/fitness/WorkoutActionButtons.tsx`
25. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/fitness/WorkoutActionButtons.tsx`
26. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/fitness/WorkoutActionButtons.tsx`
27. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/fitness/WorkoutActionButtons.tsx`
28. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/fitness/WorkoutActionButtons.tsx`
29. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/fitness/WorkoutActionButtons.tsx`
30. **UI Consistency**: Hardcoded color found: #000000 - `src/components/fitness/WorkoutActionButtons.tsx`
31. **UI Consistency**: Hardcoded color found: #000000 - `src/components/fitness/WorkoutActionButtons.tsx`
32. **UI Consistency**: Hardcoded color found: #000000 - `src/components/fitness/WorkoutActionButtons.tsx`
33. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/fitness/WorkoutActionButtons.tsx`
34. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/fitness/WorkoutActionButtons.tsx`
35. **UI Consistency**: Hardcoded color found: #000000 - `src/components/fitness/WorkoutActionButtons.tsx`
36. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/fitness/WorkoutActionButtons.tsx`
37. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/fitness/WorkoutActionButtons.tsx`
38. **UI Consistency**: Hardcoded color found: #000000 - `src/components/fitness/WorkoutActionButtons.tsx`
39. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/fitness/WorkoutCalendarHeatmap.tsx`
40. **UI Consistency**: Hardcoded color found: #FF9500 - `src/components/fitness/WorkoutSyncStatus.tsx`
41. **UI Consistency**: Hardcoded color found: #FF3B30 - `src/components/fitness/WorkoutSyncStatus.tsx`
42. **UI Consistency**: Hardcoded color found: #FF9500 - `src/components/fitness/WorkoutSyncStatus.tsx`
43. **UI Consistency**: Hardcoded color found: #FF9500 - `src/components/fitness/WorkoutSyncStatus.tsx`
44. **UI Consistency**: Hardcoded color found: #00ff00 - `src/components/notifications/ChallengeRequestCard.tsx`
45. **UI Consistency**: Hardcoded color found: #00ff00 - `src/components/notifications/ChallengeRequestCard.tsx`
46. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/notifications/EarningsDisplay.tsx`
47. **UI Consistency**: Hardcoded color found: #fff - `src/components/notifications/EarningsDisplay.tsx`
48. **UI Consistency**: Hardcoded color found: #666 - `src/components/notifications/EarningsDisplay.tsx`
49. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/notifications/GroupedNotificationCard.tsx`
50. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/notifications/GroupedNotificationCard.tsx`
51. **UI Consistency**: Hardcoded color found: #000 - `src/components/notifications/GroupedNotificationCard.tsx`
52. **UI Consistency**: Hardcoded color found: #fff - `src/components/notifications/GroupedNotificationCard.tsx`
53. **UI Consistency**: Hardcoded color found: #666 - `src/components/notifications/GroupedNotificationCard.tsx`
54. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/notifications/GroupedNotificationCard.tsx`
55. **UI Consistency**: Hardcoded color found: #333 - `src/components/notifications/GroupedNotificationCard.tsx`
56. **UI Consistency**: Hardcoded color found: #fff - `src/components/notifications/GroupedNotificationCard.tsx`
57. **UI Consistency**: Hardcoded color found: #ccc - `src/components/notifications/GroupedNotificationCard.tsx`
58. **UI Consistency**: Hardcoded color found: #666 - `src/components/notifications/GroupedNotificationCard.tsx`
59. **UI Consistency**: Hardcoded color found: #fff - `src/components/notifications/LiveIndicator.tsx`
60. **UI Consistency**: Hardcoded color found: #ccc - `src/components/notifications/LiveIndicator.tsx`
61. **UI Consistency**: Hardcoded color found: #333 - `src/components/notifications/MiniLeaderboard.tsx`
62. **UI Consistency**: Hardcoded color found: #fff - `src/components/notifications/MiniLeaderboard.tsx`
63. **UI Consistency**: Hardcoded color found: #fff - `src/components/notifications/MiniLeaderboard.tsx`
64. **UI Consistency**: Hardcoded color found: #000 - `src/components/notifications/MiniLeaderboard.tsx`
65. **UI Consistency**: Hardcoded color found: #ccc - `src/components/notifications/MiniLeaderboard.tsx`
66. **UI Consistency**: Hardcoded color found: #fff - `src/components/notifications/MiniLeaderboard.tsx`
67. **UI Consistency**: Hardcoded color found: #ccc - `src/components/notifications/MiniLeaderboard.tsx`
68. **UI Consistency**: Hardcoded color found: #333 - `src/components/notifications/NotificationActions.tsx`
69. **UI Consistency**: Hardcoded color found: #fff - `src/components/notifications/NotificationActions.tsx`
70. **UI Consistency**: Hardcoded color found: #fff - `src/components/notifications/NotificationActions.tsx`
71. **UI Consistency**: Hardcoded color found: #000 - `src/components/notifications/NotificationActions.tsx`
72. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/notifications/NotificationCard.tsx`
73. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/notifications/NotificationCard.tsx`
74. **UI Consistency**: Hardcoded color found: #fff - `src/components/notifications/NotificationCard.tsx`
75. **UI Consistency**: Hardcoded color found: #000 - `src/components/notifications/NotificationCard.tsx`
76. **UI Consistency**: Hardcoded color found: #fff - `src/components/notifications/NotificationCard.tsx`
77. **UI Consistency**: Hardcoded color found: #000 - `src/components/notifications/NotificationCard.tsx`
78. **UI Consistency**: Hardcoded color found: #ccc - `src/components/notifications/NotificationCard.tsx`
79. **UI Consistency**: Hardcoded color found: #666 - `src/components/notifications/NotificationCard.tsx`
80. **UI Consistency**: Hardcoded color found: #fff - `src/components/notifications/NotificationCard.tsx`
81. **UI Consistency**: Hardcoded color found: #999 - `src/components/notifications/NotificationCard.tsx`
82. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/notifications/NotificationCard.tsx`
83. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/nutzap/NutzapLightningButton.tsx`
84. **UI Consistency**: Hardcoded color found: #0f0f0f - `src/components/nutzap/NutzapLightningButton.tsx`
85. **UI Consistency**: Hardcoded color found: #ccc - `src/components/profile/AccountTab.tsx`
86. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/AccountTab.tsx`
87. **UI Consistency**: Hardcoded color found: #fff - `src/components/profile/AccountTab.tsx`
88. **UI Consistency**: Hardcoded color found: #666 - `src/components/profile/AccountTab.tsx`
89. **UI Consistency**: Hardcoded color found: #666 - `src/components/profile/AccountTab.tsx`
90. **UI Consistency**: Hardcoded color found: #FF8C00 - `src/components/profile/ChallengeNotificationsBox.tsx`
91. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/profile/CompactTeamCard.tsx`
92. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/CompactTeamCard.tsx`
93. **UI Consistency**: Hardcoded color found: #ffffff - `src/components/profile/CompactTeamCard.tsx`
94. **UI Consistency**: Hardcoded color found: #666666 - `src/components/profile/CompactTeamCard.tsx`
95. **UI Consistency**: Hardcoded color found: #ffffff - `src/components/profile/CompactTeamCard.tsx`
96. **UI Consistency**: Hardcoded color found: #000000 - `src/components/profile/CompactTeamCard.tsx`
97. **UI Consistency**: Hardcoded color found: #ffffff - `src/components/profile/CompactTeamCard.tsx`
98. **UI Consistency**: Hardcoded color found: #ffffff - `src/components/profile/CompactTeamCard.tsx`
99. **UI Consistency**: Hardcoded color found: #000000 - `src/components/profile/CompactTeamCard.tsx`
100. **UI Consistency**: Hardcoded color found: #000000 - `src/components/profile/CompactWallet.tsx`
101. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/profile/CompactWallet.tsx`
102. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/CompactWallet.tsx`
103. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/profile/CompactWallet.tsx`
104. **UI Consistency**: Hardcoded color found: #000000 - `src/components/profile/CompactWallet.tsx`
105. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/profile/MonthlyStatsPanel.tsx`
106. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/profile/MonthlyStatsPanel.tsx`
107. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/profile/MonthlyStatsPanel.tsx`
108. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/profile/MonthlyStatsPanel.tsx`
109. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/profile/MonthlyStatsPanel.tsx`
110. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/profile/MonthlyStatsPanel.tsx`
111. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/MonthlyStatsPanel.tsx`
112. **UI Consistency**: Hardcoded color found: #000000 - `src/components/profile/MonthlyStatsPanel.tsx`
113. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/MonthlyStatsPanel.tsx`
114. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/profile/MonthlyStatsPanel.tsx`
115. **UI Consistency**: Hardcoded color found: #CC7A33 - `src/components/profile/MonthlyStatsPanel.tsx`
116. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/MonthlyStatsPanel.tsx`
117. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/profile/MonthlyStatsPanel.tsx`
118. **UI Consistency**: Hardcoded color found: #CC7A33 - `src/components/profile/MonthlyStatsPanel.tsx`
119. **UI Consistency**: Hardcoded color found: #999999 - `src/components/profile/MonthlyStatsPanel.tsx`
120. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/MonthlyStatsPanel.tsx`
121. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/profile/MonthlyStatsPanel.tsx`
122. **UI Consistency**: Hardcoded color found: #FF7B1C - `src/components/profile/MonthlyStatsPanel.tsx`
123. **UI Consistency**: Hardcoded color found: #CC7A33 - `src/components/profile/MonthlyStatsPanel.tsx`
124. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/profile/MyTeamsBox.tsx`
125. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/MyTeamsBox.tsx`
126. **UI Consistency**: Hardcoded color found: #dc2626 - `src/components/profile/NotificationBadge.tsx`
127. **UI Consistency**: Hardcoded color found: #000 - `src/components/profile/NotificationBadge.tsx`
128. **UI Consistency**: Hardcoded color found: #ccc - `src/components/profile/NotificationsTab.tsx`
129. **UI Consistency**: Hardcoded color found: #fff - `src/components/profile/NotificationsTab.tsx`
130. **UI Consistency**: Hardcoded color found: #000 - `src/components/profile/NotificationsTab.tsx`
131. **UI Consistency**: Hardcoded color found: #ccc - `src/components/profile/NotificationsTab.tsx`
132. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/NotificationsTab.tsx`
133. **UI Consistency**: Hardcoded color found: #ccc - `src/components/profile/NotificationsTab.tsx`
134. **UI Consistency**: Hardcoded color found: #666 - `src/components/profile/NotificationsTab.tsx`
135. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/NotificationsTab.tsx`
136. **UI Consistency**: Hardcoded color found: #ccc - `src/components/profile/NotificationsTab.tsx`
137. **UI Consistency**: Hardcoded color found: #fff - `src/components/profile/NotificationsTab.tsx`
138. **UI Consistency**: Hardcoded color found: #666 - `src/components/profile/NotificationsTab.tsx`
139. **UI Consistency**: Hardcoded color found: #666 - `src/components/profile/NotificationsTab.tsx`
140. **UI Consistency**: Hardcoded color found: #fff - `src/components/profile/NotificationsTab.tsx`
141. **UI Consistency**: Hardcoded color found: #ccc - `src/components/profile/NotificationsTab.tsx`
142. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/profile/ProfileHeader.tsx`
143. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/ProfileHeader.tsx`
144. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/ProfileHeader.tsx`
145. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/ProfileHeader.tsx`
146. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/profile/SimpleNavigationBox.tsx`
147. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/SimpleNavigationBox.tsx`
148. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/profile/TabNavigation.tsx`
149. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/TabNavigation.tsx`
150. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/TabNavigation.tsx`
151. **UI Consistency**: Hardcoded color found: #666 - `src/components/profile/TabNavigation.tsx`
152. **UI Consistency**: Hardcoded color found: #fff - `src/components/profile/TabNavigation.tsx`
153. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/profile/TeamManagementSection.tsx`
154. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/TeamManagementSection.tsx`
155. **UI Consistency**: Hardcoded color found: #666666 - `src/components/profile/TeamManagementSection.tsx`
156. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/profile/WalletSection.tsx`
157. **UI Consistency**: Hardcoded color found: #666 - `src/components/profile/WalletSection.tsx`
158. **UI Consistency**: Hardcoded color found: #FF7B1C - `src/components/profile/WorkoutLevelRing.tsx`
159. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/profile/WorkoutLevelRing.tsx`
160. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/WorkoutLevelRing.tsx`
161. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/profile/WorkoutLevelRing.tsx`
162. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/WorkoutLevelRing.tsx`
163. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/profile/WorkoutLevelRing.tsx`
164. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/profile/WorkoutLevelRing.tsx`
165. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/profile/WorkoutLevelRing.tsx`
166. **UI Consistency**: Hardcoded color found: #CC7A33 - `src/components/profile/WorkoutLevelRing.tsx`
167. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/WorkoutLevelRing.tsx`
168. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/WorkoutLevelRing.tsx`
169. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/profile/WorkoutLevelRing.tsx`
170. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/profile/YourCompetitionsBox.tsx`
171. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/YourCompetitionsBox.tsx`
172. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/profile/YourWorkoutsBox.tsx`
173. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/profile/YourWorkoutsBox.tsx`
174. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/profile/shared/MonthlyWorkoutGroup.tsx`
175. **UI Consistency**: Hardcoded color found: #000 - `src/components/profile/shared/SyncDropdown.tsx`
176. **UI Consistency**: Hardcoded color found: #000 - `src/components/qr/JoinPreviewModal.tsx`
177. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/qr/JoinPreviewModal.tsx`
178. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/qr/JoinPreviewModal.tsx`
179. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/qr/JoinPreviewModal.tsx`
180. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/qr/JoinPreviewModal.tsx`
181. **UI Consistency**: Hardcoded color found: #fff - `src/components/qr/QRDisplayModal.tsx`
182. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/qr/QRDisplayModal.tsx`
183. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/qr/QRDisplayModal.tsx`
184. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/qr/QRDisplayModal.tsx`
185. **UI Consistency**: Hardcoded color found: #fff - `src/components/qr/QRDisplayModal.tsx`
186. **UI Consistency**: Hardcoded color found: #000 - `src/components/qr/QRScannerModal.tsx`
187. **UI Consistency**: Hardcoded color found: #ffffff - `src/components/qr/QRScannerModal.tsx`
188. **UI Consistency**: Hardcoded color found: #000 - `src/components/qr/QRScannerModal.tsx`
189. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/qr/QRScannerModal.tsx`
190. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/qr/QRScannerModal.tsx`
191. **UI Consistency**: Hardcoded color found: #ffffff - `src/components/qr/QRScannerModal.tsx`
192. **UI Consistency**: Hardcoded color found: #000 - `src/components/qr/QRScannerModal.tsx`
193. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/rewards/RewardEarnedModal.tsx`
194. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/rewards/RewardEarnedModal.tsx`
195. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/rewards/RewardEarnedModal.tsx`
196. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/rewards/RewardEarnedModal.tsx`
197. **UI Consistency**: Hardcoded color found: #FFFFFF - `src/components/rewards/RewardEarnedModal.tsx`
198. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/rewards/RewardEarnedModal.tsx`
199. **UI Consistency**: Hardcoded color found: #000000 - `src/components/rewards/RewardEarnedModal.tsx`
200. **UI Consistency**: Hardcoded color found: #fff - `src/components/team/CaptainHeader.tsx`
201. **UI Consistency**: Hardcoded color found: #000 - `src/components/team/CaptainHeader.tsx`
202. **UI Consistency**: Hardcoded color found: #fff - `src/components/team/CaptainHeader.tsx`
203. **UI Consistency**: Hardcoded color found: #333 - `src/components/team/CaptainHeader.tsx`
204. **UI Consistency**: Hardcoded color found: #fff - `src/components/team/CaptainHeader.tsx`
205. **UI Consistency**: Hardcoded color found: #fff - `src/components/team/CaptainHeader.tsx`
206. **UI Consistency**: Hardcoded color found: #ff6b35 - `src/components/team/CaptainHeader.tsx`
207. **UI Consistency**: Hardcoded color found: #4CAF50 - `src/components/team/CaptainHeader.tsx`
208. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/team/ChallengesCard.tsx`
209. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/team/CharitySection.tsx`
210. **UI Consistency**: Hardcoded color found: #000000 - `src/components/team/CharitySection.tsx`
211. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/team/CharitySection.tsx`
212. **UI Consistency**: Hardcoded color found: #000000 - `src/components/team/CharitySection.tsx`
213. **UI Consistency**: Hardcoded color found: #2a1a00 - `src/components/team/ChatHeader.tsx`
214. **UI Consistency**: Hardcoded color found: #3a2a10 - `src/components/team/ChatHeader.tsx`
215. **UI Consistency**: Hardcoded color found: #000 - `src/components/team/CompetitionTabs.tsx`
216. **UI Consistency**: Hardcoded color found: #000 - `src/components/team/CompetitionTabs.tsx`
217. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/team/CompetitionWinnersCard.tsx`
218. **UI Consistency**: Hardcoded color found: #333 - `src/components/team/DifficultyIndicator.tsx`
219. **UI Consistency**: Hardcoded color found: #fff - `src/components/team/DifficultyIndicator.tsx`
220. **UI Consistency**: Hardcoded color found: #666 - `src/components/team/DifficultyIndicator.tsx`
221. **UI Consistency**: Hardcoded color found: #4CAF50 - `src/components/team/JoinRequestCard.tsx`
222. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/team/JoinRequestsSection.tsx`
223. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/team/LeagueRankingsSection.tsx`
224. **UI Consistency**: Hardcoded color found: #22c55e - `src/components/team/LeagueRankingsSection.tsx`
225. **UI Consistency**: Hardcoded color found: #22c55e - `src/components/team/LeagueRankingsSection.tsx`
226. **UI Consistency**: Hardcoded color found: #ef4444 - `src/components/team/LeagueRankingsSection.tsx`
227. **UI Consistency**: Hardcoded color found: #FFD700 - `src/components/team/LeagueRankingsSectionCached.tsx`
228. **UI Consistency**: Hardcoded color found: #C0C0C0 - `src/components/team/LeagueRankingsSectionCached.tsx`
229. **UI Consistency**: Hardcoded color found: #CD7F32 - `src/components/team/LeagueRankingsSectionCached.tsx`
230. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/team/LeaguesCard.tsx`
231. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/team/NostrMemberManager.tsx`
232. **UI Consistency**: Hardcoded color found: #ff6b35 - `src/components/team/NostrMemberManager.tsx`
233. **UI Consistency**: Hardcoded color found: #ff4444 - `src/components/team/NostrMemberManager.tsx`
234. **UI Consistency**: Hardcoded color found: #ff4444 - `src/components/team/NostrMemberManager.tsx`
235. **UI Consistency**: Hardcoded color found: #ff4444 - `src/components/team/RewardDistributionPanel.tsx`
236. **UI Consistency**: Hardcoded color found: #ff4444 - `src/components/team/RewardDistributionPanel.tsx`
237. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/team/TeamActivityFeed.tsx`
238. **UI Consistency**: Hardcoded color found: #666 - `src/components/team/TeamActivityFeed.tsx`
239. **UI Consistency**: Hardcoded color found: #ccc - `src/components/team/TeamActivityFeed.tsx`
240. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/team/TeamCard.tsx`
241. **UI Consistency**: Hardcoded color found: #333333 - `src/components/team/TeamCard.tsx`
242. **UI Consistency**: Hardcoded color found: #666666 - `src/components/team/TeamCard.tsx`
243. **UI Consistency**: Hardcoded color found: #666666 - `src/components/team/TeamCard.tsx`
244. **UI Consistency**: Hardcoded color found: #999 - `src/components/team/TeamCardHeader.tsx`
245. **UI Consistency**: Hardcoded color found: #000 - `src/components/team/TeamJoinModal.tsx`
246. **UI Consistency**: Hardcoded color found: #000 - `src/components/team/TeamJoinModal.tsx`
247. **UI Consistency**: Hardcoded color found: #1a1a00 - `src/components/team/TeamJoinModal.tsx`
248. **UI Consistency**: Hardcoded color found: #333300 - `src/components/team/TeamJoinModal.tsx`
249. **UI Consistency**: Hardcoded color found: #ffcc00 - `src/components/team/TeamJoinModal.tsx`
250. **UI Consistency**: Hardcoded color found: #cccccc - `src/components/team/TeamJoinModal.tsx`
251. **UI Consistency**: Hardcoded color found: #999999 - `src/components/team/TeamJoinModal.tsx`
252. **UI Consistency**: Hardcoded color found: #ff4444 - `src/components/team/TeamJoinModal.tsx`
253. **UI Consistency**: Hardcoded color found: #ff4444 - `src/components/team/TeamJoinModal.tsx`
254. **UI Consistency**: Hardcoded color found: #1a0000 - `src/components/team/TeamJoinModal.tsx`
255. **UI Consistency**: Hardcoded color found: #330000 - `src/components/team/TeamJoinModal.tsx`
256. **UI Consistency**: Hardcoded color found: #ff6666 - `src/components/team/TeamJoinModal.tsx`
257. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/team/TeamMembersSection.tsx`
258. **UI Consistency**: Hardcoded color found: #666 - `src/components/team/TeamPrizeSection.tsx`
259. **UI Consistency**: Hardcoded color found: #666 - `src/components/team/TeamPrizeSection.tsx`
260. **UI Consistency**: Hardcoded color found: #666 - `src/components/team/TeamStatsGrid.tsx`
261. **UI Consistency**: Hardcoded color found: #000 - `src/components/testing/AuthFlowTestScreen.tsx`
262. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/testing/AuthFlowTestScreen.tsx`
263. **UI Consistency**: Hardcoded color found: #333 - `src/components/testing/AuthFlowTestScreen.tsx`
264. **UI Consistency**: Hardcoded color found: #666 - `src/components/testing/AuthFlowTestScreen.tsx`
265. **UI Consistency**: Hardcoded color found: #333 - `src/components/testing/AuthFlowTestScreen.tsx`
266. **UI Consistency**: Hardcoded color found: #333 - `src/components/testing/AuthFlowTestScreen.tsx`
267. **UI Consistency**: Hardcoded color found: #333 - `src/components/testing/AuthFlowTestScreen.tsx`
268. **UI Consistency**: Hardcoded color found: #4CAF50 - `src/components/testing/AuthFlowTestScreen.tsx`
269. **UI Consistency**: Hardcoded color found: #FF6B6B - `src/components/testing/AuthFlowTestScreen.tsx`
270. **UI Consistency**: Hardcoded color found: #666 - `src/components/testing/AuthFlowTestScreen.tsx`
271. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/testing/AuthFlowTestScreen.tsx`
272. **UI Consistency**: Hardcoded color found: #4A90E2 - `src/components/testing/AuthFlowTestScreen.tsx`
273. **UI Consistency**: Hardcoded color found: #0d4f2d - `src/components/testing/AuthFlowTestScreen.tsx`
274. **UI Consistency**: Hardcoded color found: #0d4f2d - `src/components/testing/AuthFlowTestScreen.tsx`
275. **UI Consistency**: Hardcoded color found: #ccc - `src/components/testing/AuthFlowTestScreen.tsx`
276. **UI Consistency**: Hardcoded color found: #ffcccb - `src/components/testing/AuthFlowTestScreen.tsx`
277. **UI Consistency**: Hardcoded color found: #ccc - `src/components/testing/AuthFlowTestScreen.tsx`
278. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/testing/AuthFlowTestScreen.tsx`
279. **UI Consistency**: Hardcoded color found: #0a84ff - `src/components/testing/HealthKitTestScreen.tsx`
280. **UI Consistency**: Hardcoded color found: #ff4444 - `src/components/testing/HealthKitTestScreen.tsx`
281. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/testing/NutzapTestComponent.tsx`
282. **UI Consistency**: Hardcoded color found: #000 - `src/components/testing/NutzapTestComponent.tsx`
283. **UI Consistency**: Hardcoded color found: #888 - `src/components/testing/NutzapTestComponent.tsx`
284. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/testing/NutzapTestComponent.tsx`
285. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/testing/NutzapTestComponent.tsx`
286. **UI Consistency**: Hardcoded color found: #888 - `src/components/testing/NutzapTestComponent.tsx`
287. **UI Consistency**: Hardcoded color found: #ff4444 - `src/components/testing/NutzapTestComponent.tsx`
288. **UI Consistency**: Hardcoded color found: #007AFF - `src/components/testing/NutzapTestComponent.tsx`
289. **UI Consistency**: Hardcoded color found: #333 - `src/components/testing/NutzapTestComponent.tsx`
290. **UI Consistency**: Hardcoded color found: #ff3b30 - `src/components/testing/NutzapTestComponent.tsx`
291. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/testing/NutzapTestComponent.tsx`
292. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/testing/NutzapTestComponent.tsx`
293. **UI Consistency**: Hardcoded color found: #ff4444 - `src/components/testing/NutzapTestComponent.tsx`
294. **UI Consistency**: Hardcoded color found: #333 - `src/components/ui/ActionButton.tsx`
295. **UI Consistency**: Hardcoded color found: #ccc - `src/components/ui/ActionButton.tsx`
296. **UI Consistency**: Hardcoded color found: #333 - `src/components/ui/Avatar.tsx`
297. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/ui/BottomNavigation.tsx`
298. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/ui/BottomNavigation.tsx`
299. **UI Consistency**: Hardcoded color found: #666 - `src/components/ui/BottomNavigation.tsx`
300. **UI Consistency**: Hardcoded color found: #fff - `src/components/ui/BottomNavigation.tsx`
301. **UI Consistency**: Hardcoded color found: #666 - `src/components/ui/BottomNavigation.tsx`
302. **UI Consistency**: Hardcoded color found: #000000 - `src/components/ui/Button.tsx`
303. **UI Consistency**: Hardcoded color found: #000000 - `src/components/ui/Button.tsx`
304. **UI Consistency**: Hardcoded color found: #000000 - `src/components/ui/Button.tsx`
305. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/ui/CustomAlert.tsx`
306. **UI Consistency**: Hardcoded color found: #333 - `src/components/ui/DifficultyIndicator.tsx`
307. **UI Consistency**: Hardcoded color found: #fff - `src/components/ui/DifficultyIndicator.tsx`
308. **UI Consistency**: Hardcoded color found: #666 - `src/components/ui/DifficultyIndicator.tsx`
309. **UI Consistency**: Hardcoded color found: #000 - `src/components/ui/DropdownMenu.tsx`
310. **UI Consistency**: Hardcoded color found: #ff4444 - `src/components/ui/DropdownMenu.tsx`
311. **UI Consistency**: Hardcoded color found: #333 - `src/components/ui/MemberAvatar.tsx`
312. **UI Consistency**: Hardcoded color found: #ff6b6b - `src/components/ui/NostrConnectionStatus.tsx`
313. **UI Consistency**: Hardcoded color found: #51cf66 - `src/components/ui/NostrConnectionStatus.tsx`
314. **UI Consistency**: Hardcoded color found: #ffd43b - `src/components/ui/NostrConnectionStatus.tsx`
315. **UI Consistency**: Hardcoded color found: #51cf66 - `src/components/ui/NostrConnectionStatus.tsx`
316. **UI Consistency**: Hardcoded color found: #ffd43b - `src/components/ui/NostrConnectionStatus.tsx`
317. **UI Consistency**: Hardcoded color found: #ff6b6b - `src/components/ui/NostrConnectionStatus.tsx`
318. **UI Consistency**: Hardcoded color found: #FFB366 - `src/components/ui/PrimaryButton.tsx`
319. **UI Consistency**: Hardcoded color found: #CCCCCC - `src/components/ui/PrimaryButton.tsx`
320. **UI Consistency**: Hardcoded color found: #666 - `src/components/ui/PrizeDisplay.tsx`
321. **UI Consistency**: Hardcoded color found: #666 - `src/components/ui/PrizeDisplay.tsx`
322. **UI Consistency**: Hardcoded color found: #000000 - `src/components/ui/SplashScreen.tsx`
323. **UI Consistency**: Hardcoded color found: #000000 - `src/components/ui/SplashScreen.tsx`
324. **UI Consistency**: Hardcoded color found: #FFFFFF - `src/components/ui/SplashScreen.tsx`
325. **UI Consistency**: Hardcoded color found: #666666 - `src/components/ui/SplashScreen.tsx`
326. **UI Consistency**: Hardcoded color found: #666666 - `src/components/ui/SplashScreen.tsx`
327. **UI Consistency**: Hardcoded color found: #333333 - `src/components/ui/SplashScreen.tsx`
328. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/ui/StatCard.tsx`
329. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/ui/StatCard.tsx`
330. **UI Consistency**: Hardcoded color found: #fff - `src/components/ui/StatCard.tsx`
331. **UI Consistency**: Hardcoded color found: #fff - `src/components/ui/StatCard.tsx`
332. **UI Consistency**: Hardcoded color found: #000 - `src/components/ui/StatCard.tsx`
333. **UI Consistency**: Hardcoded color found: #666 - `src/components/ui/StatCard.tsx`
334. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/AutoWithdrawSection.tsx`
335. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/AutoWithdrawSection.tsx`
336. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/AutoWithdrawSection.tsx`
337. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/AutoWithdrawSection.tsx`
338. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/wallet/AutoWithdrawSection.tsx`
339. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/AutoWithdrawSection.tsx`
340. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/EarningsSummary.tsx`
341. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/EarningsSummary.tsx`
342. **UI Consistency**: Hardcoded color found: #000000 - `src/components/wallet/HistoryModal.tsx`
343. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/wallet/HistoryModal.tsx`
344. **UI Consistency**: Hardcoded color found: #000000 - `src/components/wallet/HistoryModal.tsx`
345. **UI Consistency**: Hardcoded color found: #0a0a0a - `src/components/wallet/HistoryModal.tsx`
346. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/wallet/HistoryModal.tsx`
347. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/ReceiveBitcoinForm.tsx`
348. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/ReceiveBitcoinForm.tsx`
349. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/ReceiveBitcoinForm.tsx`
350. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/ReceiveBitcoinForm.tsx`
351. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/ReceiveBitcoinForm.tsx`
352. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/ReceiveBitcoinForm.tsx`
353. **UI Consistency**: Hardcoded color found: #ffffff - `src/components/wallet/RewardDistributionModal.tsx`
354. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/SendBitcoinForm.tsx`
355. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/SendBitcoinForm.tsx`
356. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/SendBitcoinForm.tsx`
357. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/SendBitcoinForm.tsx`
358. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/SendBitcoinForm.tsx`
359. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/SendBitcoinForm.tsx`
360. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/SendBitcoinForm.tsx`
361. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/SendBitcoinForm.tsx`
362. **UI Consistency**: Hardcoded color found: #999999 - `src/components/wallet/SendModal.tsx`
363. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/wallet/WalletActivityList.tsx`
364. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/WalletActivityList.tsx`
365. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/WalletActivityList.tsx`
366. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/WalletActivityList.tsx`
367. **UI Consistency**: Hardcoded color found: #ff6b6b - `src/components/wallet/WalletBalanceCard.tsx`
368. **UI Consistency**: Hardcoded color found: #ff6b6b - `src/components/wallet/WalletBalanceCard.tsx`
369. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/WalletBalanceCard.tsx`
370. **UI Consistency**: Hardcoded color found: #fff - `src/components/wallet/WalletBalanceCard.tsx`
371. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/wallet/WalletBalanceCard.tsx`
372. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/WalletBalanceCard.tsx`
373. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/WalletBalanceCard.tsx`
374. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/WalletBalanceCard.tsx`
375. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/WalletBalanceCard.tsx`
376. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/wallet/WalletConfigModal.tsx`
377. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/wallet/WalletConfigModal.tsx`
378. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/wallet/WalletConfigModal.tsx`
379. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/wallet/WalletConfigModal.tsx`
380. **UI Consistency**: Hardcoded color found: #000000 - `src/components/wallet/WalletConfigModal.tsx`
381. **UI Consistency**: Hardcoded color found: #000000 - `src/components/wallet/WalletConfigModal.tsx`
382. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/wallet/WalletConfigModal.tsx`
383. **UI Consistency**: Hardcoded color found: #FF9D42 - `src/components/wallet/WalletConfigModal.tsx`
384. **UI Consistency**: Hardcoded color found: #000000 - `src/components/wallet/WalletConfigModal.tsx`
385. **UI Consistency**: Hardcoded color found: #ff6b6b - `src/components/wallet/WalletConnectionError.tsx`
386. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/WalletConnectionError.tsx`
387. **UI Consistency**: Hardcoded color found: #666 - `src/components/wallet/WalletConnectionError.tsx`
388. **UI Consistency**: Hardcoded color found: #333 - `src/components/wizards/TeamCreationWizard.tsx`
389. **UI Consistency**: Hardcoded color found: #333 - `src/components/wizards/TeamCreationWizard.tsx`
390. **UI Consistency**: Hardcoded color found: #333 - `src/components/wizards/TeamCreationWizard.tsx`
391. **UI Consistency**: Hardcoded color found: #ff9500 - `src/components/wizards/steps/FirstEventStep.tsx`
392. **UI Consistency**: Hardcoded color found: #1a1a1a - `src/components/wizards/steps/FirstEventStep.tsx`
393. **UI Consistency**: Hardcoded color found: #ffffff - `src/components/wizards/steps/QRChallengeDisplayStep.tsx`
394. **UI Consistency**: Hardcoded color found: #000000 - `src/components/wizards/steps/QRChallengeDisplayStep.tsx`
395. **UI Consistency**: Hardcoded color found: #ffffff - `src/components/wizards/steps/QRChallengeDisplayStep.tsx`
396. **UI Consistency**: Hardcoded color found: #000 - `src/components/wizards/steps/SuccessScreen.tsx`
397. **UI Consistency**: Hardcoded color found: #fff - `src/components/wizards/steps/SuccessScreen.tsx`
398. **UI Consistency**: Hardcoded color found: #ff9500 - `src/components/wizards/steps/TeamBasicsStep.tsx`
399. **UI Consistency**: Hardcoded color found: #ff9500 - `src/components/wizards/steps/TeamBasicsStep.tsx`
400. **Error Handling**: AsyncStorage operation without try-catch - `src/App.tsx`
401. **Error Handling**: AsyncStorage operation without try-catch - `src/App.tsx`
402. **Error Handling**: AsyncStorage operation without try-catch - `src/App.tsx`
403. **Error Handling**: AsyncStorage operation without try-catch - `src/App.tsx`
404. **Error Handling**: AsyncStorage operation without try-catch - `src/components/activity/WorkoutSummaryModal.tsx`
405. **Error Handling**: AsyncStorage operation without try-catch - `src/components/competition/CompetitionDistributionPanel.tsx`
406. **Error Handling**: AsyncStorage operation without try-catch - `src/components/nutzap/NutzapLightningButton.tsx`
407. **Error Handling**: AsyncStorage operation without try-catch - `src/contexts/AuthContext.tsx`
408. **Error Handling**: AsyncStorage operation without try-catch - `src/contexts/AuthContext.tsx`
409. **Error Handling**: AsyncStorage operation without try-catch - `src/screens/ContactSupportScreen.tsx`
410. **Error Handling**: AsyncStorage operation without try-catch - `src/screens/ContactSupportScreen.tsx`
411. **Error Handling**: AsyncStorage operation without try-catch - `src/screens/EventDetailScreen.tsx`
412. **Error Handling**: AsyncStorage operation without try-catch - `src/screens/OnboardingScreen.tsx`
413. **Error Handling**: AsyncStorage operation without try-catch - `src/screens/ProfileScreen.tsx`
414. **Error Handling**: AsyncStorage operation without try-catch - `src/services/activity/ActivityMetricsService.ts`
415. **Error Handling**: AsyncStorage operation without try-catch - `src/services/activity/ActivityMetricsService.ts`
416. **Error Handling**: AsyncStorage operation without try-catch - `src/services/activity/BackgroundLocationTask.ts`
417. **Error Handling**: AsyncStorage operation without try-catch - `src/services/activity/BackgroundLocationTask.ts`
418. **Error Handling**: AsyncStorage operation without try-catch - `src/services/activity/LocationPermissionService.ts`
419. **Error Handling**: AsyncStorage operation without try-catch - `src/services/activity/LocationPermissionService.ts`
420. **Error Handling**: AsyncStorage operation without try-catch - `src/services/activity/SessionRecoveryService.ts`
421. **Error Handling**: AsyncStorage operation without try-catch - `src/services/activity/SessionRecoveryService.ts`
422. **Error Handling**: AsyncStorage operation without try-catch - `src/services/activity/SessionRecoveryService.ts`
423. **Error Handling**: AsyncStorage operation without try-catch - `src/services/activity/SessionRecoveryService.ts`
424. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/UnifiedSigningService.ts`
425. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/UnifiedSigningService.ts`
426. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/UnifiedSigningService.ts`
427. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
428. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
429. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
430. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
431. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
432. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
433. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
434. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
435. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
436. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
437. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
438. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
439. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
440. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
441. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
442. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
443. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
444. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
445. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
446. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
447. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
448. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
449. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
450. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
451. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
452. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
453. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
454. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
455. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
456. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/__tests__/UnifiedSigningService.test.ts`
457. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/amber/AmberNDKSigner.ts`
458. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/amber/AmberNDKSigner.ts`
459. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/amber/__tests__/AmberNDKSigner.test.ts`
460. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/amber/__tests__/AmberNDKSigner.test.ts`
461. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/amber/__tests__/AmberNDKSigner.test.ts`
462. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/amber/__tests__/AmberNDKSigner.test.ts`
463. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/amber/__tests__/AmberNDKSigner.test.ts`
464. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/providers/amberAuthProvider.ts`
465. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/providers/amberAuthProvider.ts`
466. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/providers/amberAuthProvider.ts`
467. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/providers/amberAuthProvider.ts`
468. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/providers/nostrAuthProvider.ts`
469. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/providers/nostrAuthProvider.ts`
470. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/providers/nostrAuthProvider.ts`
471. **Error Handling**: AsyncStorage operation without try-catch - `src/services/auth/providers/nostrAuthProvider.ts`
472. **Error Handling**: AsyncStorage operation without try-catch - `src/services/cache/OnboardingCacheService.ts`
473. **Error Handling**: AsyncStorage operation without try-catch - `src/services/cache/OnboardingCacheService.ts`
474. **Error Handling**: AsyncStorage operation without try-catch - `src/services/challenge/ChallengeEscrowService.ts`
475. **Error Handling**: AsyncStorage operation without try-catch - `src/services/challenge/QRChallengeService.ts`
476. **Error Handling**: AsyncStorage operation without try-catch - `src/services/chat/ChatService.ts`
477. **Error Handling**: AsyncStorage operation without try-catch - `src/services/chat/ChatService.ts`
478. **Error Handling**: AsyncStorage operation without try-catch - `src/services/competition/ChallengeService.ts`
479. **Error Handling**: AsyncStorage operation without try-catch - `src/services/competition/leagueDataBridge.ts`
480. **Error Handling**: AsyncStorage operation without try-catch - `src/services/competition/leagueDataBridge.ts`
481. **Error Handling**: AsyncStorage operation without try-catch - `src/services/competition/leagueDataBridge.ts`
482. **Error Handling**: AsyncStorage operation without try-catch - `src/services/competition/leagueDataBridge.ts`
483. **Error Handling**: AsyncStorage operation without try-catch - `src/services/database/workoutDatabase.ts`
484. **Error Handling**: AsyncStorage operation without try-catch - `src/services/event/EventParticipationStore.ts`
485. **Error Handling**: AsyncStorage operation without try-catch - `src/services/event/EventParticipationStore.ts`
486. **Error Handling**: AsyncStorage operation without try-catch - `src/services/event/QREventService.ts`
487. **Error Handling**: AsyncStorage operation without try-catch - `src/services/fitness/LocalWorkoutStorageService.ts`
488. **Error Handling**: AsyncStorage operation without try-catch - `src/services/fitness/LocalWorkoutStorageService.ts`
489. **Error Handling**: AsyncStorage operation without try-catch - `src/services/fitness/nostrWorkoutService.ts`
490. **Error Handling**: AsyncStorage operation without try-catch - `src/services/fitness/nostrWorkoutService.ts`
491. **Error Handling**: AsyncStorage operation without try-catch - `src/services/fitness/nostrWorkoutService.ts`
492. **Error Handling**: AsyncStorage operation without try-catch - `src/services/fitness/nostrWorkoutSyncService.ts`
493. **Error Handling**: AsyncStorage operation without try-catch - `src/services/fitness/optimizedWorkoutMergeService.ts`
494. **Error Handling**: AsyncStorage operation without try-catch - `src/services/fitness/workoutMergeService.ts`
495. **Error Handling**: AsyncStorage operation without try-catch - `src/services/fitness/workoutMergeService.ts`
496. **Error Handling**: AsyncStorage operation without try-catch - `src/services/initialization/AppInitializationService.ts`
497. **Error Handling**: AsyncStorage operation without try-catch - `src/services/integrations/NostrCompetitionContextService.ts`
498. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nostr/NostrTeamCreationService.ts`
499. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/WalletCore.ts`
500. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/WalletCore.ts`
501. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/WalletCore.ts`
502. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/WalletCore.ts`
503. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/WalletCore.ts`
504. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/WalletCore.ts`
505. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
506. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
507. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
508. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
509. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
510. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
511. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
512. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
513. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
514. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
515. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
516. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
517. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
518. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
519. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
520. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
521. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
522. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
523. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
524. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
525. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
526. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
527. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
528. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
529. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
530. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
531. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
532. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
533. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
534. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
535. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
536. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
537. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
538. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
539. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
540. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
541. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
542. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
543. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
544. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
545. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
546. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
547. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.old.ts`
548. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.ts`
549. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/nutzapService.ts`
550. **Error Handling**: AsyncStorage operation without try-catch - `src/services/nutzap/rewardService.ts`
551. **Error Handling**: AsyncStorage operation without try-catch - `src/services/rewards/DailyRewardService.ts`
552. **Error Handling**: AsyncStorage operation without try-catch - `src/services/season/Season1Service.ts`
553. **Error Handling**: AsyncStorage operation without try-catch - `src/services/team/teamMembershipService.ts`
554. **Error Handling**: AsyncStorage operation without try-catch - `src/services/team/teamMembershipService.ts`
555. **Error Handling**: AsyncStorage operation without try-catch - `src/services/team/teamMembershipService.ts`
556. **Error Handling**: AsyncStorage operation without try-catch - `src/services/team/teamMembershipService.ts`
557. **Error Handling**: AsyncStorage operation without try-catch - `src/services/team/teamMembershipService.ts`
558. **Error Handling**: AsyncStorage operation without try-catch - `src/services/user/profileService.ts`
559. **Error Handling**: AsyncStorage operation without try-catch - `src/services/user/profileService.ts`
560. **Error Handling**: AsyncStorage operation without try-catch - `src/services/wallet/NWCStorageService.ts`
561. **Error Handling**: AsyncStorage operation without try-catch - `src/services/wallet/NWCStorageService.ts`
562. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/authDebug.ts`
563. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/authDebug.ts`
564. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/authDebug.ts`
565. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/authDebug.ts`
566. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/authDebug.ts`
567. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/authDebug.ts`
568. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/authDebug.ts`
569. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/authDebugHelper.ts`
570. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/authDebugHelper.ts`
571. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/authDebugHelper.ts`
572. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/authDebugHelper.ts`
573. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/cache.ts`
574. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/captainCache.ts`
575. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostr.ts`
576. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostr.ts`
577. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
578. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
579. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
580. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
581. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
582. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
583. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
584. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
585. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
586. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
587. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
588. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
589. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
590. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
591. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
592. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
593. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
594. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
595. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
596. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
597. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
598. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
599. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/nostrAuth.ts`
600. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/notificationCache.ts`
601. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/notificationCache.ts`
602. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/notificationCache.ts`
603. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/notificationCache.ts`
604. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/notificationCache.ts`
605. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/testCaptainFlow.ts`
606. **Error Handling**: AsyncStorage operation without try-catch - `src/utils/walletRecovery.ts`
607. **User Experience**: List without empty state message - `src/screens/ContactSupportScreen.tsx`
608. **User Experience**: List without empty state message - `src/screens/EventsScreen.tsx`
609. **User Experience**: List without empty state message - `src/screens/HelpSupportScreen.tsx`
610. **User Experience**: List without empty state message - `src/screens/PrivacyPolicyScreen.tsx`
611. **User Experience**: List without empty state message - `src/screens/ProfileEditScreen.tsx`
612. **User Experience**: List without empty state message - `src/screens/ProfileScreen.tsx`
613. **User Experience**: List without empty state message - `src/screens/TeamScreen.tsx`
614. **User Experience**: List without empty state message - `src/screens/WalletScreen.tsx`
615. **User Experience**: List without empty state message - `src/screens/activity/ActivityTrackerScreen.tsx`
616. **User Experience**: List without empty state message - `src/screens/activity/ManualWorkoutScreen.tsx`

</details>

## 🟢 Low Priority Issues

<details>
<summary>Click to expand (3275 issues)</summary>

1. **Production Readiness**: Console.log statement found - `src/App.tsx`
2. **Production Readiness**: Console.log statement found - `src/App.tsx`
3. **Production Readiness**: Console.log statement found - `src/App.tsx`
4. **Production Readiness**: Console.log statement found - `src/App.tsx`
5. **Production Readiness**: Console.log statement found - `src/App.tsx`
6. **Production Readiness**: Console.log statement found - `src/App.tsx`
7. **Production Readiness**: Console.log statement found - `src/App.tsx`
8. **Production Readiness**: Console.log statement found - `src/App.tsx`
9. **Production Readiness**: Console.log statement found - `src/App.tsx`
10. **Production Readiness**: Console.log statement found - `src/App.tsx`
11. **Production Readiness**: Console.log statement found - `src/App.tsx`
12. **Production Readiness**: Console.log statement found - `src/App.tsx`
13. **Production Readiness**: Console.log statement found - `src/App.tsx`
14. **Production Readiness**: Console.log statement found - `src/App.tsx`
15. **Production Readiness**: Console.log statement found - `src/App.tsx`
16. **Production Readiness**: Console.log statement found - `src/App.tsx`
17. **Production Readiness**: Console.log statement found - `src/App.tsx`
18. **Production Readiness**: Console.log statement found - `src/App.tsx`
19. **Production Readiness**: Console.log statement found - `src/App.tsx`
20. **Production Readiness**: Console.log statement found - `src/App.tsx`
21. **Production Readiness**: Console.log statement found - `src/App.tsx`
22. **Production Readiness**: Console.log statement found - `src/App.tsx`
23. **Production Readiness**: Console.log statement found - `src/App.tsx`
24. **Production Readiness**: Console.log statement found - `src/App.tsx`
25. **Production Readiness**: Console.log statement found - `src/App.tsx`
26. **Production Readiness**: Console.log statement found - `src/App.tsx`
27. **Production Readiness**: Console.log statement found - `src/App.tsx`
28. **Production Readiness**: Console.log statement found - `src/App.tsx`
29. **Production Readiness**: Console.log statement found - `src/App.tsx`
30. **Production Readiness**: Console.log statement found - `src/App.tsx`
31. **Production Readiness**: Console.log statement found - `src/App.tsx`
32. **Production Readiness**: Console.log statement found - `src/App.tsx`
33. **Production Readiness**: Console.log statement found - `src/App.tsx`
34. **Production Readiness**: Console.log statement found - `src/App.tsx`
35. **Production Readiness**: Console.log statement found - `src/App.tsx`
36. **Production Readiness**: Console.log statement found - `src/App.tsx`
37. **Production Readiness**: Console.log statement found - `src/App.tsx`
38. **Production Readiness**: Console.log statement found - `src/App.tsx`
39. **Production Readiness**: Console.log statement found - `src/App.tsx`
40. **Production Readiness**: Console.log statement found - `src/App.tsx`
41. **Production Readiness**: Console.log statement found - `src/App.tsx`
42. **Production Readiness**: Console.log statement found - `src/App.tsx`
43. **Production Readiness**: Console.log statement found - `src/App.tsx`
44. **Production Readiness**: Console.log statement found - `src/App.tsx`
45. **Production Readiness**: Console.log statement found - `src/App.tsx`
46. **Production Readiness**: Console.log statement found - `src/App.tsx`
47. **Production Readiness**: Console.log statement found - `src/App.tsx`
48. **Production Readiness**: Console.log statement found - `src/App.tsx`
49. **Production Readiness**: Console.log statement found - `src/App.tsx`
50. **Production Readiness**: Console.log statement found - `src/App.tsx`
51. **Production Readiness**: Console.log statement found - `src/App.tsx`
52. **Production Readiness**: Console.log statement found - `src/App.tsx`
53. **Production Readiness**: Console.log statement found - `src/App_backup.tsx`
54. **Production Readiness**: Console.log statement found - `src/App_backup.tsx`
55. **Production Readiness**: Console.log statement found - `src/App_backup.tsx`
56. **Production Readiness**: Console.log statement found - `src/App_backup.tsx`
57. **Production Readiness**: Console.log statement found - `src/App_backup.tsx`
58. **Production Readiness**: Console.log statement found - `src/App_backup.tsx`
59. **Production Readiness**: Console.log statement found - `src/App_backup.tsx`
60. **Production Readiness**: Console.log statement found - `src/cache/FeedCache.ts`
61. **Production Readiness**: Console.log statement found - `src/cache/FeedCache.ts`
62. **Production Readiness**: Console.log statement found - `src/cache/FeedCache.ts`
63. **Production Readiness**: Console.log statement found - `src/cache/FeedCache.ts`
64. **Production Readiness**: Console.log statement found - `src/cache/FeedCache.ts`
65. **Production Readiness**: Console.log statement found - `src/cache/FeedCache.ts`
66. **Production Readiness**: Console.log statement found - `src/cache/FeedCache.ts`
67. **Production Readiness**: Console.log statement found - `src/cache/FeedCache.ts`
68. **Production Readiness**: Console.log statement found - `src/cache/FeedCache.ts`
69. **Production Readiness**: Console.log statement found - `src/cache/FeedCache.ts`
70. **Production Readiness**: Console.log statement found - `src/cache/ProfileCache.ts`
71. **Production Readiness**: Console.log statement found - `src/cache/ProfileCache.ts`
72. **Production Readiness**: Console.log statement found - `src/cache/ProfileCache.ts`
73. **Production Readiness**: Console.log statement found - `src/components/activity/WorkoutSummaryModal.tsx`
74. **Production Readiness**: Console.log statement found - `src/components/activity/WorkoutSummaryModal.tsx`
75. **Production Readiness**: Console.log statement found - `src/components/activity/WorkoutSummaryModal.tsx`
76. **Production Readiness**: Console.log statement found - `src/components/activity/WorkoutSummaryModal.tsx`
77. **Production Readiness**: Console.log statement found - `src/components/auth/AppleSignInButton.tsx`
78. **Production Readiness**: Console.log statement found - `src/components/auth/GoogleSignInButton.tsx`
79. **Production Readiness**: Console.log statement found - `src/components/captain/EventJoinRequestsSection.tsx`
80. **Production Readiness**: Console.log statement found - `src/components/captain/EventJoinRequestsSection.tsx`
81. **Production Readiness**: Console.log statement found - `src/components/captain/EventJoinRequestsSection.tsx`
82. **Production Readiness**: Console.log statement found - `src/components/captain/EventJoinRequestsSection.tsx`
83. **Production Readiness**: Console.log statement found - `src/components/captain/EventParticipantManagementSection.tsx`
84. **Production Readiness**: Console.log statement found - `src/components/captain/EventParticipantManagementSection.tsx`
85. **Production Readiness**: Console.log statement found - `src/components/challenge/ChallengePaymentModal.tsx`
86. **Production Readiness**: Console.log statement found - `src/components/challenge/ChallengePaymentModal.tsx`
87. **Production Readiness**: Console.log statement found - `src/components/challenge/ChallengeRequestModal.tsx`
88. **Production Readiness**: Console.log statement found - `src/components/challenge/ChallengeRequestModal.tsx`
89. **Production Readiness**: Console.log statement found - `src/components/challenge/QRChallengePreviewModal.tsx`
90. **Production Readiness**: Console.log statement found - `src/components/challenge/QRChallengePreviewModal.tsx`
91. **Production Readiness**: Console.log statement found - `src/components/competition/AutoEntryPrompt.tsx`
92. **Production Readiness**: Console.log statement found - `src/components/competition/AutoEntryPrompt.tsx`
93. **Production Readiness**: Console.log statement found - `src/components/competition/AutoEntryPrompt.tsx`
94. **Production Readiness**: Console.log statement found - `src/components/competition/AutoEntryPrompt.tsx`
95. **Production Readiness**: Console.log statement found - `src/components/competition/CompetitionDistributionPanel.tsx`
96. **Production Readiness**: Console.log statement found - `src/components/competition/EventCreationModal.tsx`
97. **Production Readiness**: Console.log statement found - `src/components/competition/LeagueCreationModal.tsx`
98. **Production Readiness**: Console.log statement found - `src/components/competition/LiveLeaderboard.tsx`
99. **Production Readiness**: Console.log statement found - `src/components/competition/LiveLeaderboard.tsx`
100. **Production Readiness**: Console.log statement found - `src/components/fitness/HealthKitPermissionCard.tsx`
101. **Production Readiness**: Console.log statement found - `src/components/fitness/HealthKitPermissionCard.tsx`
102. **Production Readiness**: Console.log statement found - `src/components/fitness/HealthKitPermissionCard.tsx`
103. **Production Readiness**: Console.log statement found - `src/components/nutzap/EnhancedZapModal.tsx`
104. **Production Readiness**: Console.log statement found - `src/components/nutzap/EnhancedZapModal.tsx`
105. **Production Readiness**: Console.log statement found - `src/components/nutzap/EnhancedZapModal.tsx`
106. **Production Readiness**: Console.log statement found - `src/components/nutzap/EnhancedZapModal.tsx`
107. **Production Readiness**: Console.log statement found - `src/components/nutzap/EnhancedZapModal.tsx`
108. **Production Readiness**: Console.log statement found - `src/components/nutzap/EnhancedZapModal.tsx`
109. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
110. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
111. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
112. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
113. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
114. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
115. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
116. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
117. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
118. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
119. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
120. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
121. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
122. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
123. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
124. **Production Readiness**: Console.log statement found - `src/components/nutzap/NutzapLightningButton.tsx`
125. **Production Readiness**: Console.log statement found - `src/components/onboarding/PermissionRequestStep.tsx`
126. **Production Readiness**: Console.log statement found - `src/components/profile/ChallengeNotificationsBox.tsx`
127. **Production Readiness**: Console.log statement found - `src/components/profile/ChallengeNotificationsBox.tsx`
128. **Production Readiness**: Console.log statement found - `src/components/profile/CompactTeamCard.tsx`
129. **Production Readiness**: Console.log statement found - `src/components/profile/CompactTeamCard.tsx`
130. **Production Readiness**: Console.log statement found - `src/components/profile/CompactTeamCard.tsx`
131. **Production Readiness**: Console.log statement found - `src/components/profile/CompactWallet.tsx`
132. **Production Readiness**: Console.log statement found - `src/components/profile/CompactWallet.tsx`
133. **Production Readiness**: Console.log statement found - `src/components/profile/NotificationModal.tsx`
134. **Production Readiness**: Console.log statement found - `src/components/profile/NotificationModal.tsx`
135. **Production Readiness**: Console.log statement found - `src/components/profile/NotificationModal.tsx`
136. **Production Readiness**: Console.log statement found - `src/components/profile/ProfileHeader.tsx`
137. **Production Readiness**: Console.log statement found - `src/components/profile/TeamManagementSection.tsx`
138. **Production Readiness**: Console.log statement found - `src/components/profile/shared/SyncDropdown.tsx`
139. **Production Readiness**: Console.log statement found - `src/components/profile/shared/SyncDropdown.tsx`
140. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/AllWorkoutsTab.tsx`
141. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/AllWorkoutsTab.tsx`
142. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/AllWorkoutsTab.tsx`
143. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/AllWorkoutsTab.tsx`
144. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/AllWorkoutsTab.tsx`
145. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/AppleHealthTab.tsx`
146. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/AppleHealthTab.tsx`
147. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/AppleHealthTab.tsx`
148. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/AppleHealthTab.tsx`
149. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/AppleHealthTab.tsx`
150. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/AppleHealthTab.tsx`
151. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/AppleHealthTab.tsx`
152. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/AppleHealthTab.tsx`
153. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/NostrWorkoutsTab.tsx`
154. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/NostrWorkoutsTab.tsx`
155. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/NostrWorkoutsTab.tsx`
156. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/PrivateWorkoutsTab.tsx`
157. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/PrivateWorkoutsTab.tsx`
158. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/PrivateWorkoutsTab.tsx`
159. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/PublicWorkoutsTab.tsx`
160. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/PublicWorkoutsTab.tsx`
161. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/PublicWorkoutsTab.tsx`
162. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/PublicWorkoutsTab.tsx`
163. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/PublicWorkoutsTab.tsx`
164. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/PublicWorkoutsTab.tsx`
165. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/PublicWorkoutsTab.tsx`
166. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/PublicWorkoutsTab.tsx`
167. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/PublicWorkoutsTab.tsx`
168. **Production Readiness**: Console.log statement found - `src/components/profile/tabs/PublicWorkoutsTab.tsx`
169. **Production Readiness**: Console.log statement found - `src/components/team/AboutPrizeSection.tsx`
170. **Production Readiness**: Console.log statement found - `src/components/team/AboutPrizeSection.tsx`
171. **Production Readiness**: Console.log statement found - `src/components/team/AboutPrizeSection.tsx`
172. **Production Readiness**: Console.log statement found - `src/components/team/AboutPrizeSection.tsx`
173. **Production Readiness**: Console.log statement found - `src/components/team/AboutPrizeSection.tsx`
174. **Production Readiness**: Console.log statement found - `src/components/team/EventsCard.tsx`
175. **Production Readiness**: Console.log statement found - `src/components/team/EventsCard.tsx`
176. **Production Readiness**: Console.log statement found - `src/components/team/EventsCard.tsx`
177. **Production Readiness**: Console.log statement found - `src/components/team/JoinRequestCard.tsx`
178. **Production Readiness**: Console.log statement found - `src/components/team/JoinRequestCard.tsx`
179. **Production Readiness**: Console.log statement found - `src/components/team/JoinRequestsSection.tsx`
180. **Production Readiness**: Console.log statement found - `src/components/team/JoinRequestsSection.tsx`
181. **Production Readiness**: Console.log statement found - `src/components/team/JoinRequestsSection.tsx`
182. **Production Readiness**: Console.log statement found - `src/components/team/JoinRequestsSection.tsx`
183. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
184. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
185. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
186. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
187. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
188. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
189. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
190. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
191. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
192. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
193. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
194. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
195. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
196. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
197. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
198. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
199. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
200. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
201. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
202. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
203. **Production Readiness**: Console.log statement found - `src/components/team/LeagueRankingsSection.tsx`
204. **Production Readiness**: Console.log statement found - `src/components/team/NostrMemberManager.tsx`
205. **Production Readiness**: Console.log statement found - `src/components/team/NostrMemberManager.tsx`
206. **Production Readiness**: Console.log statement found - `src/components/team/NostrMemberManager.tsx`
207. **Production Readiness**: Console.log statement found - `src/components/team/TeamCard.tsx`
208. **Production Readiness**: Console.log statement found - `src/components/team/TeamCard.tsx`
209. **Production Readiness**: Console.log statement found - `src/components/team/TeamCard.tsx`
210. **Production Readiness**: Console.log statement found - `src/components/team/TeamCard.tsx`
211. **Production Readiness**: Console.log statement found - `src/components/team/TeamCard.tsx`
212. **Production Readiness**: Console.log statement found - `src/components/team/TeamChatSection.tsx`
213. **Production Readiness**: Console.log statement found - `src/components/team/TeamChatSection.tsx`
214. **Production Readiness**: Console.log statement found - `src/components/team/TeamChatSection.tsx`
215. **Production Readiness**: Console.log statement found - `src/components/team/TeamChatSection.tsx`
216. **Production Readiness**: Console.log statement found - `src/components/team/TeamHeader.tsx`
217. **Production Readiness**: Console.log statement found - `src/components/team/TeamHeader.tsx`
218. **Production Readiness**: Console.log statement found - `src/components/team/TeamHeader.tsx`
219. **Production Readiness**: Console.log statement found - `src/components/team/TeamHeader.tsx`
220. **Production Readiness**: Console.log statement found - `src/components/team/TeamMembersSection.tsx`
221. **Production Readiness**: Console.log statement found - `src/components/team/TeamMembersSection.tsx`
222. **Production Readiness**: Console.log statement found - `src/components/team/TeamMembersSection.tsx`
223. **Production Readiness**: Console.log statement found - `src/components/testing/AuthFlowTestScreen.tsx`
224. **Production Readiness**: Console.log statement found - `src/components/testing/AuthFlowTestScreen.tsx`
225. **Production Readiness**: Console.log statement found - `src/components/testing/AuthFlowTestScreen.tsx`
226. **Production Readiness**: Console.log statement found - `src/components/testing/AuthFlowTestScreen.tsx`
227. **Production Readiness**: Console.log statement found - `src/components/testing/AuthFlowTestScreen.tsx`
228. **Production Readiness**: Console.log statement found - `src/components/testing/AuthFlowTestScreen.tsx`
229. **Production Readiness**: Console.log statement found - `src/components/testing/AuthFlowTestScreen.tsx`
230. **Production Readiness**: Console.log statement found - `src/components/testing/AuthFlowTestScreen.tsx`
231. **Production Readiness**: Console.log statement found - `src/components/testing/AuthFlowTestScreen.tsx`
232. **Production Readiness**: Console.log statement found - `src/components/testing/AuthFlowTestScreen.tsx`
233. **Production Readiness**: Console.log statement found - `src/components/ui/SplashScreen.tsx`
234. **Production Readiness**: Console.log statement found - `src/components/ui/SplashScreen.tsx`
235. **Production Readiness**: Console.log statement found - `src/components/ui/SplashScreen.tsx`
236. **Production Readiness**: Console.log statement found - `src/components/ui/SplashScreen.tsx`
237. **Production Readiness**: Console.log statement found - `src/components/ui/SplashScreen.tsx`
238. **Production Readiness**: Console.log statement found - `src/components/wizards/EventCreationWizard.tsx`
239. **Production Readiness**: Console.log statement found - `src/components/wizards/EventCreationWizard.tsx`
240. **Production Readiness**: Console.log statement found - `src/components/wizards/EventCreationWizard.tsx`
241. **Production Readiness**: Console.log statement found - `src/components/wizards/EventCreationWizard.tsx`
242. **Production Readiness**: Console.log statement found - `src/components/wizards/EventCreationWizard.tsx`
243. **Production Readiness**: Console.log statement found - `src/components/wizards/EventCreationWizard.tsx`
244. **Production Readiness**: Console.log statement found - `src/components/wizards/EventCreationWizard.tsx`
245. **Production Readiness**: Console.log statement found - `src/components/wizards/EventCreationWizard.tsx`
246. **Production Readiness**: Console.log statement found - `src/components/wizards/EventCreationWizard.tsx`
247. **Production Readiness**: Console.log statement found - `src/components/wizards/GlobalChallengeWizard.tsx`
248. **Production Readiness**: Console.log statement found - `src/components/wizards/LeagueCreationWizard.tsx`
249. **Production Readiness**: Console.log statement found - `src/components/wizards/LeagueCreationWizard.tsx`
250. **Production Readiness**: Console.log statement found - `src/components/wizards/LeagueCreationWizard.tsx`
251. **Production Readiness**: Console.log statement found - `src/components/wizards/LeagueCreationWizard.tsx`
252. **Production Readiness**: Console.log statement found - `src/components/wizards/OpenChallengeWizard.tsx`
253. **Production Readiness**: Console.log statement found - `src/components/wizards/QuickChallengeWizard.tsx`
254. **Production Readiness**: Console.log statement found - `src/components/wizards/QuickChallengeWizard.tsx`
255. **Production Readiness**: Console.log statement found - `src/components/wizards/QuickChallengeWizard.tsx`
256. **Production Readiness**: Console.log statement found - `src/components/wizards/steps/ReviewLaunchStep.tsx`
257. **Production Readiness**: Console.log statement found - `src/components/wizards/steps/ReviewLaunchStep.tsx`
258. **Production Readiness**: Console.log statement found - `src/components/wizards/steps/ReviewLaunchStep.tsx`
259. **Production Readiness**: Console.log statement found - `src/components/wizards/steps/ReviewLaunchStep.tsx`
260. **Production Readiness**: Console.log statement found - `src/components/wizards/steps/ReviewLaunchStep.tsx`
261. **Production Readiness**: Console.log statement found - `src/components/wizards/steps/ReviewLaunchStep.tsx`
262. **Production Readiness**: Console.log statement found - `src/components/wizards/steps/ReviewLaunchStep.tsx`
263. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
264. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
265. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
266. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
267. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
268. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
269. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
270. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
271. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
272. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
273. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
274. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
275. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
276. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
277. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
278. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
279. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
280. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
281. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
282. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
283. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
284. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
285. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
286. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
287. **Production Readiness**: Console.log statement found - `src/contexts/AuthContext.tsx`
288. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
289. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
290. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
291. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
292. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
293. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
294. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
295. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
296. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
297. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
298. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
299. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
300. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
301. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
302. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
303. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
304. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
305. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
306. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
307. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
308. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
309. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
310. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
311. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
312. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
313. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
314. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
315. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
316. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
317. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
318. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
319. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
320. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
321. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
322. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
323. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
324. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
325. **Production Readiness**: Console.log statement found - `src/contexts/NavigationDataContext.tsx`
326. **Production Readiness**: Console.log statement found - `src/hooks/useAutoEventEntry.ts`
327. **Production Readiness**: Console.log statement found - `src/hooks/useAutoEventEntry.ts`
328. **Production Readiness**: Console.log statement found - `src/hooks/useAutoEventEntry.ts`
329. **Production Readiness**: Console.log statement found - `src/hooks/useAutoEventEntry.ts`
330. **Production Readiness**: Console.log statement found - `src/hooks/useAutoEventEntry.ts`
331. **Production Readiness**: Console.log statement found - `src/hooks/useAutoEventEntry.ts`
332. **Production Readiness**: Console.log statement found - `src/hooks/useAutoEventEntry.ts`
333. **Production Readiness**: Console.log statement found - `src/hooks/useAutoEventEntry.ts`
334. **Production Readiness**: Console.log statement found - `src/hooks/useAutoEventEntry.ts`
335. **Production Readiness**: Console.log statement found - `src/hooks/useAutoEventEntry.ts`
336. **Production Readiness**: Console.log statement found - `src/hooks/useAutoEventEntry.ts`
337. **Production Readiness**: Console.log statement found - `src/hooks/useAutoEventEntry.ts`
338. **Production Readiness**: Console.log statement found - `src/hooks/useAutoEventEntry.ts`
339. **Production Readiness**: Console.log statement found - `src/hooks/useCaptainDetection.ts`
340. **Production Readiness**: Console.log statement found - `src/hooks/useCaptainDetection.ts`
341. **Production Readiness**: Console.log statement found - `src/hooks/useCaptainDetection.ts`
342. **Production Readiness**: Console.log statement found - `src/hooks/useCaptainDetection.ts`
343. **Production Readiness**: Console.log statement found - `src/hooks/useCaptainDetection.ts`
344. **Production Readiness**: Console.log statement found - `src/hooks/useCaptainDetection.ts`
345. **Production Readiness**: Console.log statement found - `src/hooks/useCaptainDetection.ts`
346. **Production Readiness**: Console.log statement found - `src/hooks/useChallengeCreation.ts`
347. **Production Readiness**: Console.log statement found - `src/hooks/useChallengeCreation.ts`
348. **Production Readiness**: Console.log statement found - `src/hooks/useChallengeCreation.ts`
349. **Production Readiness**: Console.log statement found - `src/hooks/useLeagueRankings.ts`
350. **Production Readiness**: Console.log statement found - `src/hooks/useLeagueRankings.ts`
351. **Production Readiness**: Console.log statement found - `src/hooks/useLeagueRankings.ts`
352. **Production Readiness**: Console.log statement found - `src/hooks/useLeagueRankings.ts`
353. **Production Readiness**: Console.log statement found - `src/hooks/useLeagueRankings.ts`
354. **Production Readiness**: Console.log statement found - `src/hooks/useLeagueRankings.ts`
355. **Production Readiness**: Console.log statement found - `src/hooks/useLeagueRankings.ts`
356. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
357. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
358. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
359. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
360. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
361. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
362. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
363. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
364. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
365. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
366. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
367. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
368. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
369. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
370. **Production Readiness**: Console.log statement found - `src/hooks/useNavigationData.ts`
371. **Production Readiness**: Console.log statement found - `src/hooks/useNutzap.ts`
372. **Production Readiness**: Console.log statement found - `src/hooks/useNutzap.ts`
373. **Production Readiness**: Console.log statement found - `src/hooks/useNutzap.ts`
374. **Production Readiness**: Console.log statement found - `src/hooks/useTeamWallet.ts`
375. **Production Readiness**: Console.log statement found - `src/hooks/useTeamWallet.ts`
376. **Production Readiness**: Console.log statement found - `src/hooks/useTeamWallet.ts`
377. **Production Readiness**: Console.log statement found - `src/hooks/useTeamWallet.ts`
378. **Production Readiness**: Console.log statement found - `src/hooks/useWalletBalance.ts`
379. **Production Readiness**: Console.log statement found - `src/hooks/useWorkoutFeed.ts`
380. **Production Readiness**: Console.log statement found - `src/hooks/useWorkoutFeed.ts`
381. **Production Readiness**: Console.log statement found - `src/hooks/useWorkoutFeed.ts`
382. **Production Readiness**: Console.log statement found - `src/hooks/useWorkoutFeed.ts`
383. **Production Readiness**: Console.log statement found - `src/hooks/useWorkoutFeed.ts`
384. **Production Readiness**: Console.log statement found - `src/hooks/useWorkoutFeed.ts`
385. **Production Readiness**: Console.log statement found - `src/hooks/useWorkoutFeed.ts`
386. **Production Readiness**: Console.log statement found - `src/hooks/useWorkoutFeed.ts`
387. **Production Readiness**: Console.log statement found - `src/navigation/AppNavigator.tsx`
388. **Production Readiness**: Console.log statement found - `src/navigation/AppNavigator.tsx`
389. **Production Readiness**: Console.log statement found - `src/navigation/AppNavigator.tsx`
390. **Production Readiness**: Console.log statement found - `src/navigation/AppNavigator.tsx`
391. **Production Readiness**: Console.log statement found - `src/navigation/AppNavigator.tsx`
392. **Production Readiness**: Console.log statement found - `src/navigation/AppNavigator.tsx`
393. **Production Readiness**: Console.log statement found - `src/navigation/AppNavigator.tsx`
394. **Production Readiness**: Console.log statement found - `src/navigation/BottomTabNavigator.tsx`
395. **Production Readiness**: Console.log statement found - `src/navigation/BottomTabNavigator.tsx`
396. **Production Readiness**: Console.log statement found - `src/navigation/BottomTabNavigator.tsx`
397. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
398. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
399. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
400. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
401. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
402. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
403. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
404. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
405. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
406. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
407. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
408. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
409. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
410. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
411. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
412. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
413. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
414. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
415. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
416. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
417. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
418. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
419. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
420. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
421. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
422. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
423. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
424. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
425. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
426. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
427. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
428. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
429. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
430. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
431. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
432. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
433. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
434. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
435. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
436. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
437. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
438. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
439. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
440. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
441. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
442. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
443. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
444. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
445. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
446. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
447. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
448. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
449. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
450. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
451. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
452. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
453. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
454. **Production Readiness**: Console.log statement found - `src/navigation/navigationHandlers.ts`
455. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
456. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
457. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
458. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
459. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
460. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
461. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
462. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
463. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
464. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
465. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
466. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
467. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
468. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
469. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
470. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
471. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
472. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
473. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
474. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
475. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
476. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
477. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
478. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
479. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
480. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
481. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
482. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
483. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
484. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
485. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
486. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
487. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
488. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
489. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
490. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
491. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
492. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
493. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
494. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
495. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
496. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
497. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
498. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
499. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
500. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
501. **Production Readiness**: Console.log statement found - `src/screens/CaptainDashboardScreen.tsx`
502. **Production Readiness**: Console.log statement found - `src/screens/CompetitionsListScreen.tsx`
503. **Production Readiness**: Console.log statement found - `src/screens/EnhancedWorkoutHistoryScreen.tsx`
504. **Production Readiness**: Console.log statement found - `src/screens/EnhancedWorkoutHistoryScreen.tsx`
505. **Production Readiness**: Console.log statement found - `src/screens/EnhancedWorkoutHistoryScreen.tsx`
506. **Production Readiness**: Console.log statement found - `src/screens/EnhancedWorkoutHistoryScreen.tsx`
507. **Production Readiness**: Console.log statement found - `src/screens/EnhancedWorkoutHistoryScreen.tsx`
508. **Production Readiness**: Console.log statement found - `src/screens/EnhancedWorkoutHistoryScreen.tsx`
509. **Production Readiness**: Console.log statement found - `src/screens/EnhancedWorkoutHistoryScreen.tsx`
510. **Production Readiness**: Console.log statement found - `src/screens/EnhancedWorkoutHistoryScreen.tsx`
511. **Production Readiness**: Console.log statement found - `src/screens/EventCaptainDashboardScreen.tsx`
512. **Production Readiness**: Console.log statement found - `src/screens/EventCaptainDashboardScreen.tsx`
513. **Production Readiness**: Console.log statement found - `src/screens/EventDetailScreen.tsx`
514. **Production Readiness**: Console.log statement found - `src/screens/EventDetailScreen.tsx`
515. **Production Readiness**: Console.log statement found - `src/screens/EventDetailScreen.tsx`
516. **Production Readiness**: Console.log statement found - `src/screens/EventDetailScreen.tsx`
517. **Production Readiness**: Console.log statement found - `src/screens/EventDetailScreen.tsx`
518. **Production Readiness**: Console.log statement found - `src/screens/EventDetailScreen.tsx`
519. **Production Readiness**: Console.log statement found - `src/screens/EventDetailScreen.tsx`
520. **Production Readiness**: Console.log statement found - `src/screens/EventDetailScreen.tsx`
521. **Production Readiness**: Console.log statement found - `src/screens/EventDetailScreen.tsx`
522. **Production Readiness**: Console.log statement found - `src/screens/EventDetailScreen.tsx`
523. **Production Readiness**: Console.log statement found - `src/screens/EventDetailScreen.tsx`
524. **Production Readiness**: Console.log statement found - `src/screens/EventDetailScreen.tsx`
525. **Production Readiness**: Console.log statement found - `src/screens/EventDetailScreen.tsx`
526. **Production Readiness**: Console.log statement found - `src/screens/LeagueDetailScreen.tsx`
527. **Production Readiness**: Console.log statement found - `src/screens/LeagueDetailScreen.tsx`
528. **Production Readiness**: Console.log statement found - `src/screens/LeagueDetailScreen.tsx`
529. **Production Readiness**: Console.log statement found - `src/screens/LeagueDetailScreen.tsx`
530. **Production Readiness**: Console.log statement found - `src/screens/LoginScreen.tsx`
531. **Production Readiness**: Console.log statement found - `src/screens/LoginScreen.tsx`
532. **Production Readiness**: Console.log statement found - `src/screens/LoginScreen.tsx`
533. **Production Readiness**: Console.log statement found - `src/screens/LoginScreen.tsx`
534. **Production Readiness**: Console.log statement found - `src/screens/LoginScreen.tsx`
535. **Production Readiness**: Console.log statement found - `src/screens/LoginScreen.tsx`
536. **Production Readiness**: Console.log statement found - `src/screens/MyTeamsScreen.tsx`
537. **Production Readiness**: Console.log statement found - `src/screens/MyTeamsScreen.tsx`
538. **Production Readiness**: Console.log statement found - `src/screens/MyTeamsScreen.tsx`
539. **Production Readiness**: Console.log statement found - `src/screens/MyTeamsScreen.tsx`
540. **Production Readiness**: Console.log statement found - `src/screens/MyTeamsScreen.tsx`
541. **Production Readiness**: Console.log statement found - `src/screens/MyTeamsScreen.tsx`
542. **Production Readiness**: Console.log statement found - `src/screens/MyTeamsScreen.tsx`
543. **Production Readiness**: Console.log statement found - `src/screens/MyTeamsScreen.tsx`
544. **Production Readiness**: Console.log statement found - `src/screens/MyTeamsScreen.tsx`
545. **Production Readiness**: Console.log statement found - `src/screens/MyTeamsScreen.tsx`
546. **Production Readiness**: Console.log statement found - `src/screens/MyTeamsScreen.tsx`
547. **Production Readiness**: Console.log statement found - `src/screens/MyTeamsScreen.tsx`
548. **Production Readiness**: Console.log statement found - `src/screens/MyTeamsScreen.tsx`
549. **Production Readiness**: Console.log statement found - `src/screens/OnboardingScreen.tsx`
550. **Production Readiness**: Console.log statement found - `src/screens/OnboardingScreen.tsx`
551. **Production Readiness**: Console.log statement found - `src/screens/OnboardingScreen.tsx`
552. **Production Readiness**: Console.log statement found - `src/screens/OnboardingScreen.tsx`
553. **Production Readiness**: Console.log statement found - `src/screens/OnboardingScreen.tsx`
554. **Production Readiness**: Console.log statement found - `src/screens/OnboardingScreen.tsx`
555. **Production Readiness**: Console.log statement found - `src/screens/OnboardingScreen.tsx`
556. **Production Readiness**: Console.log statement found - `src/screens/OnboardingScreen.tsx`
557. **Production Readiness**: Console.log statement found - `src/screens/OnboardingScreen.tsx`
558. **Production Readiness**: Console.log statement found - `src/screens/ProfileImportScreen.tsx`
559. **Production Readiness**: Console.log statement found - `src/screens/ProfileImportScreen.tsx`
560. **Production Readiness**: Console.log statement found - `src/screens/ProfileImportScreen.tsx`
561. **Production Readiness**: Console.log statement found - `src/screens/ProfileScreen.tsx`
562. **Production Readiness**: Console.log statement found - `src/screens/ProfileScreen.tsx`
563. **Production Readiness**: Console.log statement found - `src/screens/ProfileScreen.tsx`
564. **Production Readiness**: Console.log statement found - `src/screens/ProfileScreen.tsx`
565. **Production Readiness**: Console.log statement found - `src/screens/ProfileScreen.tsx`
566. **Production Readiness**: Console.log statement found - `src/screens/ProfileScreen.tsx`
567. **Production Readiness**: Console.log statement found - `src/screens/ProfileScreen.tsx`
568. **Production Readiness**: Console.log statement found - `src/screens/ProfileScreen.tsx`
569. **Production Readiness**: Console.log statement found - `src/screens/ProfileScreen.tsx`
570. **Production Readiness**: Console.log statement found - `src/screens/ProfileScreen.tsx`
571. **Production Readiness**: Console.log statement found - `src/screens/SettingsScreen.tsx`
572. **Production Readiness**: Console.log statement found - `src/screens/SettingsScreen.tsx`
573. **Production Readiness**: Console.log statement found - `src/screens/SimpleTeamScreen.tsx`
574. **Production Readiness**: Console.log statement found - `src/screens/SimpleTeamScreen.tsx`
575. **Production Readiness**: Console.log statement found - `src/screens/SimpleTeamScreen.tsx`
576. **Production Readiness**: Console.log statement found - `src/screens/SimpleTeamScreen.tsx`
577. **Production Readiness**: Console.log statement found - `src/screens/SimpleTeamScreen.tsx`
578. **Production Readiness**: Console.log statement found - `src/screens/SimpleTeamScreen.tsx`
579. **Production Readiness**: Console.log statement found - `src/screens/SimpleTeamScreen.tsx`
580. **Production Readiness**: Console.log statement found - `src/screens/SplashInitScreen.tsx`
581. **Production Readiness**: Console.log statement found - `src/screens/SplashInitScreen.tsx`
582. **Production Readiness**: Console.log statement found - `src/screens/SplashInitScreen.tsx`
583. **Production Readiness**: Console.log statement found - `src/screens/SplashInitScreen.tsx`
584. **Production Readiness**: Console.log statement found - `src/screens/SplashInitScreen.tsx`
585. **Production Readiness**: Console.log statement found - `src/screens/SplashInitScreen.tsx`
586. **Production Readiness**: Console.log statement found - `src/screens/SplashInitScreen.tsx`
587. **Production Readiness**: Console.log statement found - `src/screens/SplashInitScreen.tsx`
588. **Production Readiness**: Console.log statement found - `src/screens/SplashInitScreen.tsx`
589. **Production Readiness**: Console.log statement found - `src/screens/SplashInitScreen.tsx`
590. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
591. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
592. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
593. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
594. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
595. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
596. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
597. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
598. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
599. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
600. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
601. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
602. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
603. **Production Readiness**: Console.log statement found - `src/screens/TeamDiscoveryScreen.tsx`
604. **Production Readiness**: Console.log statement found - `src/screens/TestMinimalTeamScreen.tsx`
605. **Production Readiness**: Console.log statement found - `src/screens/TestMinimalTeamScreen.tsx`
606. **Production Readiness**: Console.log statement found - `src/screens/TestMinimalTeamScreen.tsx`
607. **Production Readiness**: Console.log statement found - `src/screens/WorkoutHistoryScreen.tsx`
608. **Production Readiness**: Console.log statement found - `src/screens/WorkoutHistoryScreen.tsx`
609. **Production Readiness**: Console.log statement found - `src/screens/WorkoutHistoryScreen.tsx`
610. **Production Readiness**: Console.log statement found - `src/screens/WorkoutHistoryScreen.tsx`
611. **Production Readiness**: Console.log statement found - `src/screens/WorkoutHistoryScreen.tsx`
612. **Production Readiness**: Console.log statement found - `src/screens/WorkoutHistoryScreen.tsx`
613. **Production Readiness**: Console.log statement found - `src/screens/WorkoutHistoryScreen.tsx`
614. **Production Readiness**: Console.log statement found - `src/screens/WorkoutHistoryScreen.tsx`
615. **Production Readiness**: Console.log statement found - `src/screens/WorkoutHistoryScreen.tsx`
616. **Production Readiness**: Console.log statement found - `src/screens/WorkoutHistoryScreen.tsx`
617. **Production Readiness**: Console.log statement found - `src/screens/WorkoutHistoryScreen.tsx`
618. **Production Readiness**: Console.log statement found - `src/screens/WorkoutHistoryScreen.tsx`
619. **Production Readiness**: Console.log statement found - `src/screens/WorkoutHistoryScreen.tsx`
620. **Production Readiness**: Console.log statement found - `src/screens/activity/CyclingTrackerScreen.tsx`
621. **Production Readiness**: Console.log statement found - `src/screens/activity/CyclingTrackerScreen.tsx`
622. **Production Readiness**: Console.log statement found - `src/screens/activity/ManualWorkoutScreen.tsx`
623. **Production Readiness**: Console.log statement found - `src/screens/activity/RunningTrackerScreen.tsx`
624. **Production Readiness**: Console.log statement found - `src/screens/activity/RunningTrackerScreen.tsx`
625. **Production Readiness**: Console.log statement found - `src/screens/activity/WalkingTrackerScreen.tsx`
626. **Production Readiness**: Console.log statement found - `src/screens/activity/WalkingTrackerScreen.tsx`
627. **Production Readiness**: Console.log statement found - `src/scripts/testNotifications.ts`
628. **Production Readiness**: Console.log statement found - `src/scripts/testNotifications.ts`
629. **Production Readiness**: Console.log statement found - `src/scripts/testNotifications.ts`
630. **Production Readiness**: Console.log statement found - `src/scripts/testNotifications.ts`
631. **Production Readiness**: Console.log statement found - `src/scripts/testNotifications.ts`
632. **Production Readiness**: Console.log statement found - `src/scripts/testNotifications.ts`
633. **Production Readiness**: Console.log statement found - `src/scripts/testNotifications.ts`
634. **Production Readiness**: Console.log statement found - `src/scripts/testNotifications.ts`
635. **Production Readiness**: Console.log statement found - `src/scripts/testNotifications.ts`
636. **Production Readiness**: Console.log statement found - `src/scripts/testNotifications.ts`
637. **Production Readiness**: Console.log statement found - `src/scripts/testNotifications.ts`
638. **Production Readiness**: Console.log statement found - `src/services/activity/ActivityStateMachine.ts`
639. **Production Readiness**: Console.log statement found - `src/services/activity/ActivityStateMachine.ts`
640. **Production Readiness**: Console.log statement found - `src/services/activity/ActivityStateMachine.ts`
641. **Production Readiness**: Console.log statement found - `src/services/activity/BackgroundLocationTask.ts`
642. **Production Readiness**: Console.log statement found - `src/services/activity/BackgroundLocationTask.ts`
643. **Production Readiness**: Console.log statement found - `src/services/activity/BackgroundLocationTask.ts`
644. **Production Readiness**: Console.log statement found - `src/services/activity/BackgroundLocationTask.ts`
645. **Production Readiness**: Console.log statement found - `src/services/activity/BackgroundLocationTask.ts`
646. **Production Readiness**: Console.log statement found - `src/services/activity/BackgroundLocationTask.ts`
647. **Production Readiness**: Console.log statement found - `src/services/activity/BatteryOptimizationService.ts`
648. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
649. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
650. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
651. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
652. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
653. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
654. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
655. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
656. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
657. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
658. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
659. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
660. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
661. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
662. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
663. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
664. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
665. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
666. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
667. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
668. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
669. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
670. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
671. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
672. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
673. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
674. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
675. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
676. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
677. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
678. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
679. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
680. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
681. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
682. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
683. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
684. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
685. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
686. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
687. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
688. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
689. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
690. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
691. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
692. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
693. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
694. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
695. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
696. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
697. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
698. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
699. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
700. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
701. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
702. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
703. **Production Readiness**: Console.log statement found - `src/services/activity/EnhancedLocationTrackingService.ts`
704. **Production Readiness**: Console.log statement found - `src/services/activity/KalmanDistanceFilter.ts`
705. **Production Readiness**: Console.log statement found - `src/services/activity/KalmanDistanceFilter.ts`
706. **Production Readiness**: Console.log statement found - `src/services/activity/LocationPermissionService.ts`
707. **Production Readiness**: Console.log statement found - `src/services/activity/LocationPermissionService.ts`
708. **Production Readiness**: Console.log statement found - `src/services/activity/LocationPermissionService.ts`
709. **Production Readiness**: Console.log statement found - `src/services/activity/LocationPermissionService.ts`
710. **Production Readiness**: Console.log statement found - `src/services/activity/LocationPermissionService.ts`
711. **Production Readiness**: Console.log statement found - `src/services/activity/LocationPermissionService.ts`
712. **Production Readiness**: Console.log statement found - `src/services/activity/LocationPermissionService.ts`
713. **Production Readiness**: Console.log statement found - `src/services/activity/LocationPermissionService.ts`
714. **Production Readiness**: Console.log statement found - `src/services/activity/LocationPermissionService.ts`
715. **Production Readiness**: Console.log statement found - `src/services/activity/LocationTrackingService.ts`
716. **Production Readiness**: Console.log statement found - `src/services/activity/LocationTrackingService.ts`
717. **Production Readiness**: Console.log statement found - `src/services/activity/LocationTrackingService.ts`
718. **Production Readiness**: Console.log statement found - `src/services/activity/LocationTrackingService.ts`
719. **Production Readiness**: Console.log statement found - `src/services/activity/LocationTrackingService.ts`
720. **Production Readiness**: Console.log statement found - `src/services/activity/LocationTrackingService.ts`
721. **Production Readiness**: Console.log statement found - `src/services/activity/LocationValidator.ts`
722. **Production Readiness**: Console.log statement found - `src/services/activity/LocationValidator.ts`
723. **Production Readiness**: Console.log statement found - `src/services/activity/LocationValidator.ts`
724. **Production Readiness**: Console.log statement found - `src/services/activity/LocationValidator.ts`
725. **Production Readiness**: Console.log statement found - `src/services/activity/LocationValidator.ts`
726. **Production Readiness**: Console.log statement found - `src/services/activity/LocationValidator.ts`
727. **Production Readiness**: Console.log statement found - `src/services/activity/LocationValidator.ts`
728. **Production Readiness**: Console.log statement found - `src/services/activity/LocationValidator.ts`
729. **Production Readiness**: Console.log statement found - `src/services/activity/LocationValidator.ts`
730. **Production Readiness**: Console.log statement found - `src/services/activity/LocationValidator.ts`
731. **Production Readiness**: Console.log statement found - `src/services/activity/LocationValidator.ts`
732. **Production Readiness**: Console.log statement found - `src/services/activity/LocationValidator.ts`
733. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
734. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
735. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
736. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
737. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
738. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
739. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
740. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
741. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
742. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
743. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
744. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
745. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
746. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
747. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
748. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
749. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
750. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
751. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
752. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
753. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
754. **Production Readiness**: Console.log statement found - `src/services/activity/SimpleLocationTrackingService.ts`
755. **Production Readiness**: Console.log statement found - `src/services/activity/SplitTrackingService.ts`
756. **Production Readiness**: Console.log statement found - `src/services/activity/TTSAnnouncementService.ts`
757. **Production Readiness**: Console.log statement found - `src/services/activity/TTSAnnouncementService.ts`
758. **Production Readiness**: Console.log statement found - `src/services/activity/TTSAnnouncementService.ts`
759. **Production Readiness**: Console.log statement found - `src/services/activity/TTSAnnouncementService.ts`
760. **Production Readiness**: Console.log statement found - `src/services/activity/TTSAnnouncementService.ts`
761. **Production Readiness**: Console.log statement found - `src/services/activity/TTSAnnouncementService.ts`
762. **Production Readiness**: Console.log statement found - `src/services/activity/TTSAnnouncementService.ts`
763. **Production Readiness**: Console.log statement found - `src/services/activity/TTSAnnouncementService.ts`
764. **Production Readiness**: Console.log statement found - `src/services/activity/TTSAnnouncementService.ts`
765. **Production Readiness**: Console.log statement found - `src/services/activity/TTSAnnouncementService.ts`
766. **Production Readiness**: Console.log statement found - `src/services/activity/TTSPreferencesService.ts`
767. **Production Readiness**: Console.log statement found - `src/services/activity/TTSPreferencesService.ts`
768. **Production Readiness**: Console.log statement found - `src/services/analytics/workoutAnalyticsService.ts`
769. **Production Readiness**: Console.log statement found - `src/services/analytics/workoutAnalyticsService.ts`
770. **Production Readiness**: Console.log statement found - `src/services/auth/DeleteAccountService.ts`
771. **Production Readiness**: Console.log statement found - `src/services/auth/DeleteAccountService.ts`
772. **Production Readiness**: Console.log statement found - `src/services/auth/DeleteAccountService.ts`
773. **Production Readiness**: Console.log statement found - `src/services/auth/DeleteAccountService.ts`
774. **Production Readiness**: Console.log statement found - `src/services/auth/DeleteAccountService.ts`
775. **Production Readiness**: Console.log statement found - `src/services/auth/DeleteAccountService.ts`
776. **Production Readiness**: Console.log statement found - `src/services/auth/DeleteAccountService.ts`
777. **Production Readiness**: Console.log statement found - `src/services/auth/DeleteAccountService.ts`
778. **Production Readiness**: Console.log statement found - `src/services/auth/DeleteAccountService.ts`
779. **Production Readiness**: Console.log statement found - `src/services/auth/DeleteAccountService.ts`
780. **Production Readiness**: Console.log statement found - `src/services/auth/DeleteAccountService.ts`
781. **Production Readiness**: Console.log statement found - `src/services/auth/DeleteAccountService.ts`
782. **Production Readiness**: Console.log statement found - `src/services/auth/DeleteAccountService.ts`
783. **Production Readiness**: Console.log statement found - `src/services/auth/UnifiedSigningService.ts`
784. **Production Readiness**: Console.log statement found - `src/services/auth/UnifiedSigningService.ts`
785. **Production Readiness**: Console.log statement found - `src/services/auth/UnifiedSigningService.ts`
786. **Production Readiness**: Console.log statement found - `src/services/auth/UnifiedSigningService.ts`
787. **Production Readiness**: Console.log statement found - `src/services/auth/UnifiedSigningService.ts`
788. **Production Readiness**: Console.log statement found - `src/services/auth/UnifiedSigningService.ts`
789. **Production Readiness**: Console.log statement found - `src/services/auth/UnifiedSigningService.ts`
790. **Production Readiness**: Console.log statement found - `src/services/auth/UnifiedSigningService.ts`
791. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
792. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
793. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
794. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
795. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
796. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
797. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
798. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
799. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
800. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
801. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
802. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
803. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
804. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
805. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
806. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
807. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
808. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
809. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
810. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
811. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
812. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
813. **Production Readiness**: Console.log statement found - `src/services/auth/amber/AmberNDKSigner.ts`
814. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
815. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
816. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
817. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
818. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
819. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
820. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
821. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
822. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
823. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
824. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
825. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
826. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
827. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
828. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
829. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
830. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
831. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
832. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
833. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
834. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
835. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
836. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
837. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
838. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
839. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
840. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
841. **Production Readiness**: Console.log statement found - `src/services/auth/authService.ts`
842. **Production Readiness**: Console.log statement found - `src/services/auth/providers/amberAuthProvider.ts`
843. **Production Readiness**: Console.log statement found - `src/services/auth/providers/amberAuthProvider.ts`
844. **Production Readiness**: Console.log statement found - `src/services/auth/providers/amberAuthProvider.ts`
845. **Production Readiness**: Console.log statement found - `src/services/auth/providers/amberAuthProvider.ts`
846. **Production Readiness**: Console.log statement found - `src/services/auth/providers/amberAuthProvider.ts`
847. **Production Readiness**: Console.log statement found - `src/services/auth/providers/amberAuthProvider.ts`
848. **Production Readiness**: Console.log statement found - `src/services/auth/providers/amberAuthProvider.ts`
849. **Production Readiness**: Console.log statement found - `src/services/auth/providers/amberAuthProvider.ts`
850. **Production Readiness**: Console.log statement found - `src/services/auth/providers/amberAuthProvider.ts`
851. **Production Readiness**: Console.log statement found - `src/services/auth/providers/appleAuthProvider.ts`
852. **Production Readiness**: Console.log statement found - `src/services/auth/providers/appleAuthProvider.ts`
853. **Production Readiness**: Console.log statement found - `src/services/auth/providers/appleAuthProvider.ts`
854. **Production Readiness**: Console.log statement found - `src/services/auth/providers/appleAuthProvider.ts`
855. **Production Readiness**: Console.log statement found - `src/services/auth/providers/appleAuthProvider.ts`
856. **Production Readiness**: Console.log statement found - `src/services/auth/providers/googleAuthProvider.ts`
857. **Production Readiness**: Console.log statement found - `src/services/auth/providers/googleAuthProvider.ts`
858. **Production Readiness**: Console.log statement found - `src/services/auth/providers/googleAuthProvider.ts`
859. **Production Readiness**: Console.log statement found - `src/services/auth/providers/googleAuthProvider.ts`
860. **Production Readiness**: Console.log statement found - `src/services/auth/providers/googleAuthProvider.ts`
861. **Production Readiness**: Console.log statement found - `src/services/auth/providers/googleAuthProvider.ts`
862. **Production Readiness**: Console.log statement found - `src/services/auth/providers/googleAuthProvider.ts`
863. **Production Readiness**: Console.log statement found - `src/services/auth/providers/googleAuthProvider.ts`
864. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
865. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
866. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
867. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
868. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
869. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
870. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
871. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
872. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
873. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
874. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
875. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
876. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
877. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
878. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
879. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
880. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
881. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
882. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
883. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
884. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
885. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
886. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
887. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
888. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
889. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
890. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
891. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
892. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
893. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
894. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
895. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
896. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
897. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
898. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
899. **Production Readiness**: Console.log statement found - `src/services/auth/providers/nostrAuthProvider.ts`
900. **Production Readiness**: Console.log statement found - `src/services/auth/teamWalletPermissions.ts`
901. **Production Readiness**: Console.log statement found - `src/services/auth/teamWalletPermissions.ts`
902. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
903. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
904. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
905. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
906. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
907. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
908. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
909. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
910. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
911. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
912. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
913. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
914. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
915. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
916. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
917. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidationService.ts`
918. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
919. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
920. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
921. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
922. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
923. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
924. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
925. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
926. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
927. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
928. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
929. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
930. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
931. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
932. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
933. **Production Readiness**: Console.log statement found - `src/services/cache/CacheInvalidator.ts`
934. **Production Readiness**: Console.log statement found - `src/services/cache/CompetitionCacheService.ts`
935. **Production Readiness**: Console.log statement found - `src/services/cache/CompetitionCacheService.ts`
936. **Production Readiness**: Console.log statement found - `src/services/cache/CompetitionCacheService.ts`
937. **Production Readiness**: Console.log statement found - `src/services/cache/CompetitionCacheService.ts`
938. **Production Readiness**: Console.log statement found - `src/services/cache/CompetitionCacheService.ts`
939. **Production Readiness**: Console.log statement found - `src/services/cache/CompetitionCacheService.ts`
940. **Production Readiness**: Console.log statement found - `src/services/cache/CompetitionCacheService.ts`
941. **Production Readiness**: Console.log statement found - `src/services/cache/CompetitionCacheService.ts`
942. **Production Readiness**: Console.log statement found - `src/services/cache/CompetitionCacheService.ts`
943. **Production Readiness**: Console.log statement found - `src/services/cache/CompetitionCacheService.ts`
944. **Production Readiness**: Console.log statement found - `src/services/cache/CompetitionCacheService.ts`
945. **Production Readiness**: Console.log statement found - `src/services/cache/CompetitionCacheService.ts`
946. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
947. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
948. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
949. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
950. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
951. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
952. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
953. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
954. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
955. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
956. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
957. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
958. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
959. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
960. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
961. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
962. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
963. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
964. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
965. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
966. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
967. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
968. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
969. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
970. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
971. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
972. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
973. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
974. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
975. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
976. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
977. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
978. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
979. **Production Readiness**: Console.log statement found - `src/services/cache/NostrCacheService.ts`
980. **Production Readiness**: Console.log statement found - `src/services/cache/OnboardingCacheService.ts`
981. **Production Readiness**: Console.log statement found - `src/services/cache/OnboardingCacheService.ts`
982. **Production Readiness**: Console.log statement found - `src/services/cache/OnboardingCacheService.ts`
983. **Production Readiness**: Console.log statement found - `src/services/cache/OnboardingCacheService.ts`
984. **Production Readiness**: Console.log statement found - `src/services/cache/OnboardingCacheService.ts`
985. **Production Readiness**: Console.log statement found - `src/services/cache/OnboardingCacheService.ts`
986. **Production Readiness**: Console.log statement found - `src/services/cache/OnboardingCacheService.ts`
987. **Production Readiness**: Console.log statement found - `src/services/cache/OnboardingCacheService.ts`
988. **Production Readiness**: Console.log statement found - `src/services/cache/OnboardingCacheService.ts`
989. **Production Readiness**: Console.log statement found - `src/services/cache/OnboardingCacheService.ts`
990. **Production Readiness**: Console.log statement found - `src/services/cache/TeamCacheService.ts`
991. **Production Readiness**: Console.log statement found - `src/services/cache/TeamCacheService.ts`
992. **Production Readiness**: Console.log statement found - `src/services/cache/TeamCacheService.ts`
993. **Production Readiness**: Console.log statement found - `src/services/cache/TeamCacheService.ts`
994. **Production Readiness**: Console.log statement found - `src/services/cache/TeamCacheService.ts`
995. **Production Readiness**: Console.log statement found - `src/services/cache/TeamCacheService.ts`
996. **Production Readiness**: Console.log statement found - `src/services/cache/TeamCacheService.ts`
997. **Production Readiness**: Console.log statement found - `src/services/cache/TeamCacheService.ts`
998. **Production Readiness**: Console.log statement found - `src/services/cache/TeamCacheService.ts`
999. **Production Readiness**: Console.log statement found - `src/services/cache/TeamCacheService.ts`
1000. **Production Readiness**: Console.log statement found - `src/services/cache/TeamCacheService.ts`
1001. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1002. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1003. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1004. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1005. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1006. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1007. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1008. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1009. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1010. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1011. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1012. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1013. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1014. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1015. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1016. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1017. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1018. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1019. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1020. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1021. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1022. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1023. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedCacheService.ts`
1024. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1025. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1026. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1027. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1028. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1029. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1030. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1031. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1032. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1033. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1034. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1035. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1036. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1037. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1038. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1039. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1040. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1041. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1042. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1043. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1044. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1045. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1046. **Production Readiness**: Console.log statement found - `src/services/cache/UnifiedNostrCache.ts`
1047. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1048. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1049. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1050. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1051. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1052. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1053. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1054. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1055. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1056. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1057. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1058. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1059. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1060. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1061. **Production Readiness**: Console.log statement found - `src/services/cache/WorkoutCacheService.ts`
1062. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1063. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1064. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1065. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1066. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1067. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1068. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1069. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1070. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1071. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1072. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1073. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1074. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1075. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1076. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1077. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1078. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeCompletionService.ts`
1079. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeEscrowService.ts`
1080. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeEscrowService.ts`
1081. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeEscrowService.ts`
1082. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeEscrowService.ts`
1083. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeEscrowService.ts`
1084. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeEscrowService.ts`
1085. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeEscrowService.ts`
1086. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeEscrowService.ts`
1087. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeEscrowService.ts`
1088. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeEscrowService.ts`
1089. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeEscrowService.ts`
1090. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeEscrowService.ts`
1091. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeEscrowService.ts`
1092. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1093. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1094. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1095. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1096. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1097. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1098. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1099. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1100. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1101. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1102. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1103. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1104. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1105. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1106. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1107. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1108. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1109. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1110. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1111. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1112. **Production Readiness**: Console.log statement found - `src/services/challenge/ChallengeRequestService.ts`
1113. **Production Readiness**: Console.log statement found - `src/services/challenge/QRChallengeParser.ts`
1114. **Production Readiness**: Console.log statement found - `src/services/challenge/QRChallengeParser.ts`
1115. **Production Readiness**: Console.log statement found - `src/services/challenge/QRChallengeParser.ts`
1116. **Production Readiness**: Console.log statement found - `src/services/challenge/QRChallengeParser.ts`
1117. **Production Readiness**: Console.log statement found - `src/services/challenge/QRChallengeParser.ts`
1118. **Production Readiness**: Console.log statement found - `src/services/challenge/QRChallengeParser.ts`
1119. **Production Readiness**: Console.log statement found - `src/services/challenge/QRChallengeParser.ts`
1120. **Production Readiness**: Console.log statement found - `src/services/challenge/QRChallengeParser.ts`
1121. **Production Readiness**: Console.log statement found - `src/services/challenge/QRChallengeParser.ts`
1122. **Production Readiness**: Console.log statement found - `src/services/challenge/QRChallengeParser.ts`
1123. **Production Readiness**: Console.log statement found - `src/services/challenge/QRChallengeService.ts`
1124. **Production Readiness**: Console.log statement found - `src/services/challenge/QRChallengeService.ts`
1125. **Production Readiness**: Console.log statement found - `src/services/challenge/QRChallengeService.ts`
1126. **Production Readiness**: Console.log statement found - `src/services/charity/CharityZapService.ts`
1127. **Production Readiness**: Console.log statement found - `src/services/charity/CharityZapService.ts`
1128. **Production Readiness**: Console.log statement found - `src/services/charity/CharityZapService.ts`
1129. **Production Readiness**: Console.log statement found - `src/services/charity/CharityZapService.ts`
1130. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1131. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1132. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1133. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1134. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1135. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1136. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1137. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1138. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1139. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1140. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1141. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1142. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1143. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1144. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1145. **Production Readiness**: Console.log statement found - `src/services/chat/ChatService.ts`
1146. **Production Readiness**: Console.log statement found - `src/services/competition/ChallengeService.ts`
1147. **Production Readiness**: Console.log statement found - `src/services/competition/ChallengeService.ts`
1148. **Production Readiness**: Console.log statement found - `src/services/competition/ChallengeService.ts`
1149. **Production Readiness**: Console.log statement found - `src/services/competition/ChallengeService.ts`
1150. **Production Readiness**: Console.log statement found - `src/services/competition/Competition1301QueryService.ts`
1151. **Production Readiness**: Console.log statement found - `src/services/competition/Competition1301QueryService.ts`
1152. **Production Readiness**: Console.log statement found - `src/services/competition/Competition1301QueryService.ts`
1153. **Production Readiness**: Console.log statement found - `src/services/competition/Competition1301QueryService.ts`
1154. **Production Readiness**: Console.log statement found - `src/services/competition/Competition1301QueryService.ts`
1155. **Production Readiness**: Console.log statement found - `src/services/competition/Competition1301QueryService.ts`
1156. **Production Readiness**: Console.log statement found - `src/services/competition/Competition1301QueryService.ts`
1157. **Production Readiness**: Console.log statement found - `src/services/competition/Competition1301QueryService.ts`
1158. **Production Readiness**: Console.log statement found - `src/services/competition/JoinRequestService.ts`
1159. **Production Readiness**: Console.log statement found - `src/services/competition/JoinRequestService.ts`
1160. **Production Readiness**: Console.log statement found - `src/services/competition/JoinRequestService.ts`
1161. **Production Readiness**: Console.log statement found - `src/services/competition/JoinRequestService.ts`
1162. **Production Readiness**: Console.log statement found - `src/services/competition/JoinRequestService.ts`
1163. **Production Readiness**: Console.log statement found - `src/services/competition/JoinRequestService.ts`
1164. **Production Readiness**: Console.log statement found - `src/services/competition/JoinRequestService.ts`
1165. **Production Readiness**: Console.log statement found - `src/services/competition/JoinRequestService.ts`
1166. **Production Readiness**: Console.log statement found - `src/services/competition/NostrCompetitionDiscoveryService.ts`
1167. **Production Readiness**: Console.log statement found - `src/services/competition/NostrCompetitionDiscoveryService.ts`
1168. **Production Readiness**: Console.log statement found - `src/services/competition/NostrCompetitionDiscoveryService.ts`
1169. **Production Readiness**: Console.log statement found - `src/services/competition/NostrCompetitionDiscoveryService.ts`
1170. **Production Readiness**: Console.log statement found - `src/services/competition/NostrCompetitionDiscoveryService.ts`
1171. **Production Readiness**: Console.log statement found - `src/services/competition/NostrCompetitionDiscoveryService.ts`
1172. **Production Readiness**: Console.log statement found - `src/services/competition/NostrCompetitionDiscoveryService.ts`
1173. **Production Readiness**: Console.log statement found - `src/services/competition/NostrCompetitionDiscoveryService.ts`
1174. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1175. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1176. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1177. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1178. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1179. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1180. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1181. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1182. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1183. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1184. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1185. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1186. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1187. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1188. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1189. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1190. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1191. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1192. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionEngine.ts`
1193. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1194. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1195. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1196. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1197. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1198. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1199. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1200. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1201. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1202. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1203. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1204. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1205. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1206. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1207. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1208. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleCompetitionService.ts`
1209. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleLeaderboardService.ts`
1210. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleLeaderboardService.ts`
1211. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleLeaderboardService.ts`
1212. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleLeaderboardService.ts`
1213. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleLeaderboardService.ts`
1214. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleLeaderboardService.ts`
1215. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleLeaderboardService.ts`
1216. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleLeaderboardService.ts`
1217. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleLeaderboardService.ts`
1218. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleLeaderboardService.ts`
1219. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleLeaderboardService.ts`
1220. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleLeaderboardService.ts`
1221. **Production Readiness**: Console.log statement found - `src/services/competition/SimpleLeaderboardService.ts`
1222. **Production Readiness**: Console.log statement found - `src/services/competition/competitionScoring.ts`
1223. **Production Readiness**: Console.log statement found - `src/services/competition/competitionService.ts`
1224. **Production Readiness**: Console.log statement found - `src/services/competition/competitionService.ts`
1225. **Production Readiness**: Console.log statement found - `src/services/competition/competitionService.ts`
1226. **Production Readiness**: Console.log statement found - `src/services/competition/competitionService.ts`
1227. **Production Readiness**: Console.log statement found - `src/services/competition/competitionService.ts`
1228. **Production Readiness**: Console.log statement found - `src/services/competition/competitionService.ts`
1229. **Production Readiness**: Console.log statement found - `src/services/competition/competitionService.ts`
1230. **Production Readiness**: Console.log statement found - `src/services/competition/competitionService.ts`
1231. **Production Readiness**: Console.log statement found - `src/services/competition/competitionService.ts`
1232. **Production Readiness**: Console.log statement found - `src/services/competition/competitionService.ts`
1233. **Production Readiness**: Console.log statement found - `src/services/competition/competitionService.ts`
1234. **Production Readiness**: Console.log statement found - `src/services/competition/competitionService.ts`
1235. **Production Readiness**: Console.log statement found - `src/services/competition/competitionService.ts`
1236. **Production Readiness**: Console.log statement found - `src/services/competition/eventEligibilityService.ts`
1237. **Production Readiness**: Console.log statement found - `src/services/competition/eventEligibilityService.ts`
1238. **Production Readiness**: Console.log statement found - `src/services/competition/eventEligibilityService.ts`
1239. **Production Readiness**: Console.log statement found - `src/services/competition/eventEligibilityService.ts`
1240. **Production Readiness**: Console.log statement found - `src/services/competition/eventEligibilityService.ts`
1241. **Production Readiness**: Console.log statement found - `src/services/competition/eventEligibilityService.ts`
1242. **Production Readiness**: Console.log statement found - `src/services/competition/eventEligibilityService.ts`
1243. **Production Readiness**: Console.log statement found - `src/services/competition/leaderboardService.ts`
1244. **Production Readiness**: Console.log statement found - `src/services/competition/leaderboardService.ts`
1245. **Production Readiness**: Console.log statement found - `src/services/competition/leaderboardService.ts`
1246. **Production Readiness**: Console.log statement found - `src/services/competition/leaderboardService.ts`
1247. **Production Readiness**: Console.log statement found - `src/services/competition/leaderboardService.ts`
1248. **Production Readiness**: Console.log statement found - `src/services/competition/leaderboardService.ts`
1249. **Production Readiness**: Console.log statement found - `src/services/competition/leaderboardService.ts`
1250. **Production Readiness**: Console.log statement found - `src/services/competition/leaderboardService.ts`
1251. **Production Readiness**: Console.log statement found - `src/services/competition/leaderboardService.ts`
1252. **Production Readiness**: Console.log statement found - `src/services/competition/leaderboardService.ts`
1253. **Production Readiness**: Console.log statement found - `src/services/competition/leaderboardService.ts`
1254. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1255. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1256. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1257. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1258. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1259. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1260. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1261. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1262. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1263. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1264. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1265. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1266. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1267. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1268. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1269. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1270. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1271. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1272. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1273. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1274. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1275. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1276. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1277. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1278. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1279. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1280. **Production Readiness**: Console.log statement found - `src/services/competition/leagueDataBridge.ts`
1281. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1282. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1283. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1284. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1285. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1286. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1287. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1288. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1289. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1290. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1291. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1292. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1293. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1294. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1295. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1296. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1297. **Production Readiness**: Console.log statement found - `src/services/competition/leagueRankingService.ts`
1298. **Production Readiness**: Console.log statement found - `src/services/competition/nostrCompetitionLeaderboardService.ts`
1299. **Production Readiness**: Console.log statement found - `src/services/competition/nostrCompetitionLeaderboardService.ts`
1300. **Production Readiness**: Console.log statement found - `src/services/competition/nostrCompetitionLeaderboardService.ts`
1301. **Production Readiness**: Console.log statement found - `src/services/competition/nostrCompetitionLeaderboardService.ts`
1302. **Production Readiness**: Console.log statement found - `src/services/competition/nostrCompetitionLeaderboardService.ts`
1303. **Production Readiness**: Console.log statement found - `src/services/competition/nostrCompetitionLeaderboardService.ts`
1304. **Production Readiness**: Console.log statement found - `src/services/competitions/competitionWinnersService.ts`
1305. **Production Readiness**: Console.log statement found - `src/services/competitions/competitionWinnersService.ts`
1306. **Production Readiness**: Console.log statement found - `src/services/competitions/competitionWinnersService.ts`
1307. **Production Readiness**: Console.log statement found - `src/services/competitions/competitionWinnersService.ts`
1308. **Production Readiness**: Console.log statement found - `src/services/competitions/competitionWinnersService.ts`
1309. **Production Readiness**: Console.log statement found - `src/services/database/workoutDatabase.ts`
1310. **Production Readiness**: Console.log statement found - `src/services/database/workoutDatabase.ts`
1311. **Production Readiness**: Console.log statement found - `src/services/database/workoutDatabase.ts`
1312. **Production Readiness**: Console.log statement found - `src/services/database/workoutDatabase.ts`
1313. **Production Readiness**: Console.log statement found - `src/services/database/workoutDatabase.ts`
1314. **Production Readiness**: Console.log statement found - `src/services/database/workoutDatabase.ts`
1315. **Production Readiness**: Console.log statement found - `src/services/event/EventJoinService.ts`
1316. **Production Readiness**: Console.log statement found - `src/services/event/EventJoinService.ts`
1317. **Production Readiness**: Console.log statement found - `src/services/event/EventJoinService.ts`
1318. **Production Readiness**: Console.log statement found - `src/services/event/EventJoinService.ts`
1319. **Production Readiness**: Console.log statement found - `src/services/event/EventJoinService.ts`
1320. **Production Readiness**: Console.log statement found - `src/services/event/EventJoinService.ts`
1321. **Production Readiness**: Console.log statement found - `src/services/event/EventJoinService.ts`
1322. **Production Readiness**: Console.log statement found - `src/services/event/EventParticipationStore.ts`
1323. **Production Readiness**: Console.log statement found - `src/services/event/EventParticipationStore.ts`
1324. **Production Readiness**: Console.log statement found - `src/services/event/EventParticipationStore.ts`
1325. **Production Readiness**: Console.log statement found - `src/services/event/EventParticipationStore.ts`
1326. **Production Readiness**: Console.log statement found - `src/services/event/QREventParser.ts`
1327. **Production Readiness**: Console.log statement found - `src/services/event/QREventParser.ts`
1328. **Production Readiness**: Console.log statement found - `src/services/event/QREventParser.ts`
1329. **Production Readiness**: Console.log statement found - `src/services/event/QREventParser.ts`
1330. **Production Readiness**: Console.log statement found - `src/services/event/QREventParser.ts`
1331. **Production Readiness**: Console.log statement found - `src/services/event/QREventParser.ts`
1332. **Production Readiness**: Console.log statement found - `src/services/event/QREventParser.ts`
1333. **Production Readiness**: Console.log statement found - `src/services/event/QREventParser.ts`
1334. **Production Readiness**: Console.log statement found - `src/services/event/QREventParser.ts`
1335. **Production Readiness**: Console.log statement found - `src/services/event/QREventParser.ts`
1336. **Production Readiness**: Console.log statement found - `src/services/event/QREventService.ts`
1337. **Production Readiness**: Console.log statement found - `src/services/event/QREventService.ts`
1338. **Production Readiness**: Console.log statement found - `src/services/event/QREventService.ts`
1339. **Production Readiness**: Console.log statement found - `src/services/events/EventJoinRequestService.ts`
1340. **Production Readiness**: Console.log statement found - `src/services/events/EventJoinRequestService.ts`
1341. **Production Readiness**: Console.log statement found - `src/services/events/EventJoinRequestService.ts`
1342. **Production Readiness**: Console.log statement found - `src/services/events/EventJoinRequestService.ts`
1343. **Production Readiness**: Console.log statement found - `src/services/events/EventJoinRequestService.ts`
1344. **Production Readiness**: Console.log statement found - `src/services/events/EventJoinRequestService.ts`
1345. **Production Readiness**: Console.log statement found - `src/services/events/EventJoinRequestService.ts`
1346. **Production Readiness**: Console.log statement found - `src/services/events/EventJoinRequestService.ts`
1347. **Production Readiness**: Console.log statement found - `src/services/events/EventJoinRequestService.ts`
1348. **Production Readiness**: Console.log statement found - `src/services/events/EventJoinRequestService.ts`
1349. **Production Readiness**: Console.log statement found - `src/services/fitness/LocalWorkoutStorageService.ts`
1350. **Production Readiness**: Console.log statement found - `src/services/fitness/LocalWorkoutStorageService.ts`
1351. **Production Readiness**: Console.log statement found - `src/services/fitness/LocalWorkoutStorageService.ts`
1352. **Production Readiness**: Console.log statement found - `src/services/fitness/LocalWorkoutStorageService.ts`
1353. **Production Readiness**: Console.log statement found - `src/services/fitness/LocalWorkoutStorageService.ts`
1354. **Production Readiness**: Console.log statement found - `src/services/fitness/LocalWorkoutStorageService.ts`
1355. **Production Readiness**: Console.log statement found - `src/services/fitness/LocalWorkoutStorageService.ts`
1356. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1357. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1358. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1359. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1360. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1361. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1362. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1363. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1364. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1365. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1366. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1367. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1368. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1369. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1370. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1371. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1372. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1373. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1374. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1375. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1376. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1377. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1378. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1379. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1380. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1381. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1382. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1383. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1384. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1385. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1386. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1387. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1388. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1389. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1390. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1391. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1392. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1393. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1394. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1395. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1396. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1397. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1398. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1399. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1400. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1401. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1402. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1403. **Production Readiness**: Console.log statement found - `src/services/fitness/NdkWorkoutService.ts`
1404. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1405. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1406. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1407. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1408. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1409. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1410. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1411. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1412. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1413. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1414. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1415. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1416. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1417. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1418. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1419. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1420. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1421. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1422. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1423. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1424. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1425. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1426. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1427. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1428. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1429. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1430. **Production Readiness**: Console.log statement found - `src/services/fitness/Nuclear1301Service.ts`
1431. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1432. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1433. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1434. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1435. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1436. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1437. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1438. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1439. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1440. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1441. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1442. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1443. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1444. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1445. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1446. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1447. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1448. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1449. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1450. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1451. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1452. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1453. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1454. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1455. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1456. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1457. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1458. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1459. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1460. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1461. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1462. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1463. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1464. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1465. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1466. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1467. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1468. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1469. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1470. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1471. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1472. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1473. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1474. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1475. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1476. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1477. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1478. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1479. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1480. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1481. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1482. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1483. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1484. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1485. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1486. **Production Readiness**: Console.log statement found - `src/services/fitness/SimpleWorkoutService.ts`
1487. **Production Readiness**: Console.log statement found - `src/services/fitness/WorkoutLevelService.ts`
1488. **Production Readiness**: Console.log statement found - `src/services/fitness/WorkoutLevelService.ts`
1489. **Production Readiness**: Console.log statement found - `src/services/fitness/WorkoutLevelService.ts`
1490. **Production Readiness**: Console.log statement found - `src/services/fitness/WorkoutLevelService.ts`
1491. **Production Readiness**: Console.log statement found - `src/services/fitness/WorkoutLevelService.ts`
1492. **Production Readiness**: Console.log statement found - `src/services/fitness/WorkoutStatusTracker.ts`
1493. **Production Readiness**: Console.log statement found - `src/services/fitness/WorkoutStatusTracker.ts`
1494. **Production Readiness**: Console.log statement found - `src/services/fitness/WorkoutStatusTracker.ts`
1495. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1496. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1497. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1498. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1499. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1500. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1501. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1502. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1503. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1504. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1505. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1506. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1507. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1508. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1509. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1510. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1511. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1512. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1513. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1514. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1515. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1516. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1517. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1518. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1519. **Production Readiness**: Console.log statement found - `src/services/fitness/backgroundSyncService.ts`
1520. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1521. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1522. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1523. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1524. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1525. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1526. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1527. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1528. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1529. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1530. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1531. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1532. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1533. **Production Readiness**: Console.log statement found - `src/services/fitness/fitnessService.ts`
1534. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1535. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1536. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1537. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1538. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1539. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1540. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1541. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1542. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1543. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1544. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1545. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1546. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1547. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1548. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1549. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1550. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1551. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1552. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1553. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1554. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1555. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1556. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1557. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1558. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1559. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1560. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1561. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1562. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1563. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1564. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1565. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1566. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1567. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1568. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1569. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1570. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1571. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1572. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1573. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1574. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1575. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1576. **Production Readiness**: Console.log statement found - `src/services/fitness/healthKitService.ts`
1577. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutService.ts`
1578. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutService.ts`
1579. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutService.ts`
1580. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutService.ts`
1581. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutService.ts`
1582. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutService.ts`
1583. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutService.ts`
1584. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutService.ts`
1585. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutService.ts`
1586. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutService.ts`
1587. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1588. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1589. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1590. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1591. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1592. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1593. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1594. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1595. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1596. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1597. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1598. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1599. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1600. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1601. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1602. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1603. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1604. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1605. **Production Readiness**: Console.log statement found - `src/services/fitness/nostrWorkoutSyncService.ts`
1606. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedNostrWorkoutService.ts`
1607. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedNostrWorkoutService.ts`
1608. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedNostrWorkoutService.ts`
1609. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedNostrWorkoutService.ts`
1610. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedNostrWorkoutService.ts`
1611. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedNostrWorkoutService.ts`
1612. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedNostrWorkoutService.ts`
1613. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedNostrWorkoutService.ts`
1614. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedNostrWorkoutService.ts`
1615. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedNostrWorkoutService.ts`
1616. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedNostrWorkoutService.ts`
1617. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedNostrWorkoutService.ts`
1618. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedNostrWorkoutService.ts`
1619. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedWorkoutMergeService.ts`
1620. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedWorkoutMergeService.ts`
1621. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedWorkoutMergeService.ts`
1622. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedWorkoutMergeService.ts`
1623. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedWorkoutMergeService.ts`
1624. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedWorkoutMergeService.ts`
1625. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedWorkoutMergeService.ts`
1626. **Production Readiness**: Console.log statement found - `src/services/fitness/optimizedWorkoutMergeService.ts`
1627. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1628. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1629. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1630. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1631. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1632. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1633. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1634. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1635. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1636. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1637. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1638. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1639. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1640. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1641. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1642. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1643. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1644. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1645. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1646. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1647. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1648. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1649. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1650. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1651. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1652. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1653. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1654. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1655. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1656. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1657. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1658. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1659. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1660. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1661. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1662. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1663. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1664. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1665. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1666. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1667. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1668. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1669. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1670. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1671. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1672. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1673. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1674. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1675. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1676. **Production Readiness**: Console.log statement found - `src/services/fitness/workoutMergeService.ts`
1677. **Production Readiness**: Console.log statement found - `src/services/initialization/AppInitializationService.ts`
1678. **Production Readiness**: Console.log statement found - `src/services/initialization/AppInitializationService.ts`
1679. **Production Readiness**: Console.log statement found - `src/services/initialization/AppInitializationService.ts`
1680. **Production Readiness**: Console.log statement found - `src/services/initialization/AppInitializationService.ts`
1681. **Production Readiness**: Console.log statement found - `src/services/initialization/AppInitializationService.ts`
1682. **Production Readiness**: Console.log statement found - `src/services/initialization/AppInitializationService.ts`
1683. **Production Readiness**: Console.log statement found - `src/services/initialization/AppInitializationService.ts`
1684. **Production Readiness**: Console.log statement found - `src/services/initialization/AppInitializationService.ts`
1685. **Production Readiness**: Console.log statement found - `src/services/initialization/AppInitializationService.ts`
1686. **Production Readiness**: Console.log statement found - `src/services/initialization/AppInitializationService.ts`
1687. **Production Readiness**: Console.log statement found - `src/services/initialization/AppInitializationService.ts`
1688. **Production Readiness**: Console.log statement found - `src/services/initialization/AppInitializationService.ts`
1689. **Production Readiness**: Console.log statement found - `src/services/initialization/AppInitializationService.ts`
1690. **Production Readiness**: Console.log statement found - `src/services/integrations/NostrCompetitionContextService.ts`
1691. **Production Readiness**: Console.log statement found - `src/services/integrations/NostrCompetitionContextService.ts`
1692. **Production Readiness**: Console.log statement found - `src/services/integrations/NostrCompetitionContextService.ts`
1693. **Production Readiness**: Console.log statement found - `src/services/integrations/NostrCompetitionContextService.ts`
1694. **Production Readiness**: Console.log statement found - `src/services/integrations/NostrCompetitionContextService.ts`
1695. **Production Readiness**: Console.log statement found - `src/services/integrations/NostrCompetitionContextService.ts`
1696. **Production Readiness**: Console.log statement found - `src/services/integrations/NostrCompetitionContextService.ts`
1697. **Production Readiness**: Console.log statement found - `src/services/integrations/NostrCompetitionContextService.ts`
1698. **Production Readiness**: Console.log statement found - `src/services/integrations/NostrCompetitionContextService.ts`
1699. **Production Readiness**: Console.log statement found - `src/services/integrations/NostrCompetitionContextService.ts`
1700. **Production Readiness**: Console.log statement found - `src/services/integrations/NostrCompetitionContextService.ts`
1701. **Production Readiness**: Console.log statement found - `src/services/integrations/NostrCompetitionContextService.ts`
1702. **Production Readiness**: Console.log statement found - `src/services/integrations/NostrCompetitionContextService.ts`
1703. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrCompetitionBridge.ts`
1704. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrCompetitionBridge.ts`
1705. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrCompetitionBridge.ts`
1706. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrCompetitionBridge.ts`
1707. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrCompetitionBridge.ts`
1708. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrCompetitionBridge.ts`
1709. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrCompetitionBridge.ts`
1710. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrCompetitionBridge.ts`
1711. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrRealtimeCompetitionSync.ts`
1712. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrRealtimeCompetitionSync.ts`
1713. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrRealtimeCompetitionSync.ts`
1714. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrRealtimeCompetitionSync.ts`
1715. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrRealtimeCompetitionSync.ts`
1716. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrRealtimeCompetitionSync.ts`
1717. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrRealtimeCompetitionSync.ts`
1718. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrRealtimeCompetitionSync.ts`
1719. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrRealtimeCompetitionSync.ts`
1720. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrRealtimeCompetitionSync.ts`
1721. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrRealtimeCompetitionSync.ts`
1722. **Production Readiness**: Console.log statement found - `src/services/integrations/nostrRealtimeCompetitionSync.ts`
1723. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1724. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1725. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1726. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1727. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1728. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1729. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1730. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1731. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1732. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1733. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1734. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1735. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1736. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1737. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1738. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1739. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1740. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1741. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1742. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1743. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1744. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1745. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1746. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1747. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1748. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1749. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1750. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1751. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1752. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1753. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1754. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1755. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1756. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1757. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1758. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1759. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1760. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1761. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1762. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1763. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1764. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1765. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1766. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1767. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1768. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1769. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1770. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1771. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1772. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1773. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1774. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1775. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1776. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1777. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1778. **Production Readiness**: Console.log statement found - `src/services/nostr/GlobalNDKService.ts`
1779. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1780. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1781. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1782. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1783. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1784. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1785. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1786. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1787. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1788. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1789. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1790. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1791. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1792. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1793. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1794. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1795. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1796. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1797. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1798. **Production Readiness**: Console.log statement found - `src/services/nostr/HttpNostrQueryService.ts`
1799. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1800. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1801. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1802. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1803. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1804. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1805. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1806. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1807. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1808. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1809. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1810. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1811. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1812. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1813. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1814. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1815. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1816. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1817. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1818. **Production Readiness**: Console.log statement found - `src/services/nostr/HybridNostrQueryService.ts`
1819. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrCompetitionParticipantService.ts`
1820. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrCompetitionService.ts`
1821. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrCompetitionService.ts`
1822. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrCompetitionService.ts`
1823. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrCompetitionService.ts`
1824. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrCompetitionService.ts`
1825. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrCompetitionService.ts`
1826. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrCompetitionService.ts`
1827. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrCompetitionService.ts`
1828. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1829. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1830. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1831. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1832. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1833. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1834. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1835. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1836. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1837. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1838. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1839. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1840. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1841. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrErrorRecoveryService.ts`
1842. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1843. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1844. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1845. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1846. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1847. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1848. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1849. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1850. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1851. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1852. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1853. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1854. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1855. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1856. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1857. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1858. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1859. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1860. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1861. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1862. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1863. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1864. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1865. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1866. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1867. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1868. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1869. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1870. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1871. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1872. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1873. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1874. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1875. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1876. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1877. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1878. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1879. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1880. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1881. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1882. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1883. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1884. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1885. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrInitializationService.ts`
1886. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1887. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1888. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1889. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1890. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1891. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1892. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1893. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1894. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1895. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1896. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1897. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1898. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1899. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1900. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1901. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1902. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1903. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1904. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1905. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1906. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1907. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1908. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1909. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1910. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1911. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1912. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1913. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrListService.ts`
1914. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1915. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1916. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1917. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1918. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1919. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1920. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1921. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1922. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1923. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1924. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1925. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1926. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1927. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1928. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1929. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1930. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1931. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1932. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1933. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1934. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1935. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1936. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1937. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrMobileConnectionManager.ts`
1938. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1939. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1940. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1941. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1942. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1943. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1944. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1945. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1946. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1947. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1948. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1949. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1950. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1951. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1952. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1953. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1954. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1955. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1956. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1957. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1958. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1959. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1960. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1961. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1962. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1963. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrPrefetchService.ts`
1964. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfilePublisher.ts`
1965. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfilePublisher.ts`
1966. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfilePublisher.ts`
1967. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfilePublisher.ts`
1968. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfilePublisher.ts`
1969. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1970. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1971. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1972. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1973. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1974. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1975. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1976. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1977. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1978. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1979. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1980. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1981. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1982. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1983. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1984. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProfileService.ts`
1985. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProtocolHandler.ts`
1986. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProtocolHandler.ts`
1987. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProtocolHandler.ts`
1988. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProtocolHandler.ts`
1989. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProtocolHandler.ts`
1990. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProtocolHandler.ts`
1991. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProtocolHandler.ts`
1992. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProtocolHandler.ts`
1993. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProtocolHandler.ts`
1994. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProtocolHandler.ts`
1995. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProtocolHandler.ts`
1996. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrProtocolHandler.ts`
1997. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
1998. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
1999. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2000. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2001. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2002. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2003. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2004. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2005. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2006. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2007. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2008. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2009. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2010. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2011. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2012. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2013. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2014. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2015. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2016. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2017. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2018. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrRelayManager.ts`
2019. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamCreationService.ts`
2020. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamCreationService.ts`
2021. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamCreationService.ts`
2022. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamCreationService.ts`
2023. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamCreationService.ts`
2024. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamCreationService.ts`
2025. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamCreationService.ts`
2026. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamCreationService.ts`
2027. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamCreationService.ts`
2028. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2029. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2030. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2031. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2032. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2033. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2034. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2035. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2036. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2037. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2038. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2039. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2040. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2041. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2042. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2043. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2044. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2045. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2046. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2047. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2048. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2049. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2050. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2051. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2052. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2053. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2054. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2055. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2056. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2057. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2058. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2059. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2060. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2061. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2062. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2063. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2064. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2065. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2066. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2067. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2068. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2069. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2070. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2071. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2072. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2073. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2074. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2075. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2076. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2077. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2078. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2079. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2080. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2081. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2082. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2083. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2084. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2085. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2086. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2087. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2088. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2089. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2090. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2091. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2092. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2093. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2094. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2095. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.backup.ts`
2096. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.ts`
2097. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.ts`
2098. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.ts`
2099. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.ts`
2100. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrTeamService.ts`
2101. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2102. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2103. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2104. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2105. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2106. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2107. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2108. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2109. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2110. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2111. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2112. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2113. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2114. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2115. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2116. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2117. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2118. **Production Readiness**: Console.log statement found - `src/services/nostr/NostrWebSocketConnection.ts`
2119. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2120. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2121. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2122. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2123. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2124. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2125. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2126. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2127. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2128. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2129. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2130. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2131. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2132. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2133. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2134. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2135. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2136. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2137. **Production Readiness**: Console.log statement found - `src/services/nostr/OptimizedWebSocketManager.ts`
2138. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2139. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2140. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2141. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2142. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2143. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2144. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2145. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2146. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2147. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2148. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2149. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2150. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2151. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2152. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2153. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2154. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2155. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2156. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2157. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2158. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2159. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2160. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2161. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2162. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2163. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2164. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2165. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2166. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2167. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2168. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2169. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2170. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2171. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2172. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2173. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2174. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2175. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2176. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2177. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2178. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2179. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2180. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2181. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2182. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2183. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2184. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2185. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2186. **Production Readiness**: Console.log statement found - `src/services/nostr/SimpleNostrService.ts`
2187. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2188. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2189. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2190. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2191. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2192. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2193. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2194. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2195. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2196. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2197. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2198. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2199. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2200. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2201. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2202. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2203. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2204. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2205. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2206. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2207. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2208. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2209. **Production Readiness**: Console.log statement found - `src/services/nostr/directNostrQueryService.ts`
2210. **Production Readiness**: Console.log statement found - `src/services/nostr/workoutCardGenerator.ts`
2211. **Production Readiness**: Console.log statement found - `src/services/nostr/workoutPublishingService.ts`
2212. **Production Readiness**: Console.log statement found - `src/services/nostr/workoutPublishingService.ts`
2213. **Production Readiness**: Console.log statement found - `src/services/nostr/workoutPublishingService.ts`
2214. **Production Readiness**: Console.log statement found - `src/services/nostr/workoutPublishingService.ts`
2215. **Production Readiness**: Console.log statement found - `src/services/nostr/workoutPublishingService.ts`
2216. **Production Readiness**: Console.log statement found - `src/services/nostr/workoutPublishingService.ts`
2217. **Production Readiness**: Console.log statement found - `src/services/nostr/workoutPublishingService.ts`
2218. **Production Readiness**: Console.log statement found - `src/services/nostr/workoutPublishingService.ts`
2219. **Production Readiness**: Console.log statement found - `src/services/nostr/workoutPublishingService.ts`
2220. **Production Readiness**: Console.log statement found - `src/services/notificationDemoService.ts`
2221. **Production Readiness**: Console.log statement found - `src/services/notificationDemoService.ts`
2222. **Production Readiness**: Console.log statement found - `src/services/notificationDemoService.ts`
2223. **Production Readiness**: Console.log statement found - `src/services/notifications/ChallengeNotificationHandler.ts`
2224. **Production Readiness**: Console.log statement found - `src/services/notifications/ChallengeNotificationHandler.ts`
2225. **Production Readiness**: Console.log statement found - `src/services/notifications/ChallengeNotificationHandler.ts`
2226. **Production Readiness**: Console.log statement found - `src/services/notifications/ChallengeNotificationHandler.ts`
2227. **Production Readiness**: Console.log statement found - `src/services/notifications/ChallengeNotificationHandler.ts`
2228. **Production Readiness**: Console.log statement found - `src/services/notifications/ChallengeNotificationHandler.ts`
2229. **Production Readiness**: Console.log statement found - `src/services/notifications/ChallengeNotificationHandler.ts`
2230. **Production Readiness**: Console.log statement found - `src/services/notifications/ChallengeNotificationHandler.ts`
2231. **Production Readiness**: Console.log statement found - `src/services/notifications/ChallengeNotificationHandler.ts`
2232. **Production Readiness**: Console.log statement found - `src/services/notifications/ChallengeNotificationHandler.ts`
2233. **Production Readiness**: Console.log statement found - `src/services/notifications/ChallengeNotificationHandler.ts`
2234. **Production Readiness**: Console.log statement found - `src/services/notifications/ChallengeNotificationHandler.ts`
2235. **Production Readiness**: Console.log statement found - `src/services/notifications/ChallengeNotificationHandler.ts`
2236. **Production Readiness**: Console.log statement found - `src/services/notifications/EventJoinNotificationHandler.ts`
2237. **Production Readiness**: Console.log statement found - `src/services/notifications/EventJoinNotificationHandler.ts`
2238. **Production Readiness**: Console.log statement found - `src/services/notifications/EventJoinNotificationHandler.ts`
2239. **Production Readiness**: Console.log statement found - `src/services/notifications/EventJoinNotificationHandler.ts`
2240. **Production Readiness**: Console.log statement found - `src/services/notifications/EventJoinNotificationHandler.ts`
2241. **Production Readiness**: Console.log statement found - `src/services/notifications/EventJoinNotificationHandler.ts`
2242. **Production Readiness**: Console.log statement found - `src/services/notifications/EventJoinNotificationHandler.ts`
2243. **Production Readiness**: Console.log statement found - `src/services/notifications/EventJoinNotificationHandler.ts`
2244. **Production Readiness**: Console.log statement found - `src/services/notifications/EventJoinNotificationHandler.ts`
2245. **Production Readiness**: Console.log statement found - `src/services/notifications/EventJoinNotificationHandler.ts`
2246. **Production Readiness**: Console.log statement found - `src/services/notifications/EventJoinNotificationHandler.ts`
2247. **Production Readiness**: Console.log statement found - `src/services/notifications/EventJoinNotificationHandler.ts`
2248. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2249. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2250. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2251. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2252. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2253. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2254. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2255. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2256. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2257. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2258. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2259. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2260. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2261. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2262. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2263. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2264. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2265. **Production Readiness**: Console.log statement found - `src/services/notifications/ExpoNotificationProvider.ts`
2266. **Production Readiness**: Console.log statement found - `src/services/notifications/LocalNotificationTrigger.ts`
2267. **Production Readiness**: Console.log statement found - `src/services/notifications/LocalNotificationTrigger.ts`
2268. **Production Readiness**: Console.log statement found - `src/services/notifications/LocalNotificationTrigger.ts`
2269. **Production Readiness**: Console.log statement found - `src/services/notifications/LocalNotificationTrigger.ts`
2270. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2271. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2272. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2273. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2274. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2275. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2276. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2277. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2278. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2279. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2280. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2281. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2282. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2283. **Production Readiness**: Console.log statement found - `src/services/notifications/NostrNotificationEventHandler.ts`
2284. **Production Readiness**: Console.log statement found - `src/services/notifications/NotificationPreferencesService.ts`
2285. **Production Readiness**: Console.log statement found - `src/services/notifications/NotificationService.ts`
2286. **Production Readiness**: Console.log statement found - `src/services/notifications/NotificationService.ts`
2287. **Production Readiness**: Console.log statement found - `src/services/notifications/NotificationService.ts`
2288. **Production Readiness**: Console.log statement found - `src/services/notifications/NotificationService.ts`
2289. **Production Readiness**: Console.log statement found - `src/services/notifications/NotificationService.ts`
2290. **Production Readiness**: Console.log statement found - `src/services/notifications/NotificationService.ts`
2291. **Production Readiness**: Console.log statement found - `src/services/notifications/NotificationService.ts`
2292. **Production Readiness**: Console.log statement found - `src/services/notifications/NotificationService.ts`
2293. **Production Readiness**: Console.log statement found - `src/services/notifications/NotificationService.ts`
2294. **Production Readiness**: Console.log statement found - `src/services/notifications/TeamContextService.ts`
2295. **Production Readiness**: Console.log statement found - `src/services/notifications/TeamContextService.ts`
2296. **Production Readiness**: Console.log statement found - `src/services/notifications/TeamContextService.ts`
2297. **Production Readiness**: Console.log statement found - `src/services/notifications/TeamContextService.ts`
2298. **Production Readiness**: Console.log statement found - `src/services/notifications/TeamNotificationFormatter.ts`
2299. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2300. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2301. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2302. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2303. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2304. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2305. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2306. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2307. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2308. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2309. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2310. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2311. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2312. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2313. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2314. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2315. **Production Readiness**: Console.log statement found - `src/services/notifications/UnifiedNotificationStore.ts`
2316. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2317. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2318. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2319. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2320. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2321. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2322. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2323. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2324. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2325. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2326. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2327. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2328. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2329. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2330. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2331. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2332. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2333. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2334. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2335. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2336. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2337. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2338. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2339. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2340. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2341. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2342. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2343. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2344. **Production Readiness**: Console.log statement found - `src/services/nutzap/LightningZapService.ts`
2345. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2346. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2347. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2348. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2349. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2350. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2351. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2352. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2353. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2354. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2355. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2356. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2357. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2358. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2359. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2360. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2361. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2362. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2363. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2364. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2365. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2366. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2367. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2368. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2369. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2370. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2371. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2372. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2373. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2374. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2375. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2376. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2377. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2378. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2379. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2380. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2381. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2382. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2383. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2384. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2385. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2386. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2387. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2388. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2389. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2390. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2391. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2392. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2393. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2394. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2395. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2396. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2397. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2398. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2399. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletCore.ts`
2400. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2401. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2402. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2403. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2404. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2405. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2406. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2407. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2408. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2409. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2410. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2411. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2412. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2413. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2414. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2415. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2416. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2417. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2418. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2419. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2420. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2421. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2422. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletDetectionService.ts`
2423. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2424. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2425. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2426. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2427. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2428. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2429. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2430. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2431. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2432. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2433. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2434. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2435. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2436. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2437. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2438. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2439. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2440. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2441. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2442. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2443. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2444. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2445. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2446. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2447. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2448. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2449. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2450. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2451. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2452. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2453. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2454. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2455. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2456. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2457. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2458. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2459. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2460. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2461. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2462. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2463. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2464. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2465. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2466. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2467. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2468. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2469. **Production Readiness**: Console.log statement found - `src/services/nutzap/WalletSync.ts`
2470. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2471. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2472. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2473. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2474. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2475. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2476. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2477. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2478. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2479. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2480. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2481. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2482. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2483. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2484. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2485. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2486. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2487. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2488. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2489. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2490. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2491. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2492. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2493. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2494. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2495. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2496. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2497. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2498. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2499. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2500. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2501. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2502. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2503. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2504. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2505. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2506. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2507. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2508. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2509. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2510. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2511. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2512. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2513. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2514. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2515. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2516. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2517. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2518. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2519. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2520. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2521. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2522. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2523. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2524. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2525. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2526. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2527. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2528. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2529. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2530. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2531. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2532. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2533. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2534. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2535. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2536. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2537. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2538. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2539. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2540. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2541. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2542. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2543. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2544. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2545. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2546. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2547. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2548. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2549. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2550. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2551. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2552. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2553. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2554. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2555. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2556. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2557. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2558. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2559. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2560. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2561. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2562. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2563. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2564. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2565. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2566. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2567. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2568. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2569. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2570. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2571. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2572. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2573. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2574. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2575. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2576. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2577. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2578. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2579. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2580. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2581. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2582. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2583. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2584. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2585. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2586. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2587. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2588. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2589. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2590. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2591. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2592. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2593. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2594. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2595. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2596. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2597. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2598. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2599. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2600. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2601. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.old.ts`
2602. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2603. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2604. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2605. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2606. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2607. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2608. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2609. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2610. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2611. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2612. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2613. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2614. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2615. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2616. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2617. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2618. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2619. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2620. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2621. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2622. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2623. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2624. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2625. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2626. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2627. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2628. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2629. **Production Readiness**: Console.log statement found - `src/services/nutzap/nutzapService.ts`
2630. **Production Readiness**: Console.log statement found - `src/services/nutzap/rewardService.ts`
2631. **Production Readiness**: Console.log statement found - `src/services/nutzap/rewardService.ts`
2632. **Production Readiness**: Console.log statement found - `src/services/nutzap/rewardService.ts`
2633. **Production Readiness**: Console.log statement found - `src/services/nutzap/rewardService.ts`
2634. **Production Readiness**: Console.log statement found - `src/services/nutzap/testPhase1.ts`
2635. **Production Readiness**: Console.log statement found - `src/services/nutzap/testPhase2.ts`
2636. **Production Readiness**: Console.log statement found - `src/services/nutzap/testPhase2.ts`
2637. **Production Readiness**: Console.log statement found - `src/services/nutzap/testPhase3.ts`
2638. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2639. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2640. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2641. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2642. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2643. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2644. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2645. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2646. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2647. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2648. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2649. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2650. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2651. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2652. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2653. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2654. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2655. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2656. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2657. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2658. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2659. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2660. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2661. **Production Readiness**: Console.log statement found - `src/services/preload/NostrPreloadService.ts`
2662. **Production Readiness**: Console.log statement found - `src/services/rewards/DailyRewardService.ts`
2663. **Production Readiness**: Console.log statement found - `src/services/rewards/DailyRewardService.ts`
2664. **Production Readiness**: Console.log statement found - `src/services/rewards/DailyRewardService.ts`
2665. **Production Readiness**: Console.log statement found - `src/services/rewards/DailyRewardService.ts`
2666. **Production Readiness**: Console.log statement found - `src/services/rewards/DailyRewardService.ts`
2667. **Production Readiness**: Console.log statement found - `src/services/rewards/DailyRewardService.ts`
2668. **Production Readiness**: Console.log statement found - `src/services/rewards/DailyRewardService.ts`
2669. **Production Readiness**: Console.log statement found - `src/services/rewards/DailyRewardService.ts`
2670. **Production Readiness**: Console.log statement found - `src/services/rewards/DailyRewardService.ts`
2671. **Production Readiness**: Console.log statement found - `src/services/rewards/DailyRewardService.ts`
2672. **Production Readiness**: Console.log statement found - `src/services/rewards/RewardSenderWallet.ts`
2673. **Production Readiness**: Console.log statement found - `src/services/rewards/RewardSenderWallet.ts`
2674. **Production Readiness**: Console.log statement found - `src/services/rewards/RewardSenderWallet.ts`
2675. **Production Readiness**: Console.log statement found - `src/services/rewards/RewardSenderWallet.ts`
2676. **Production Readiness**: Console.log statement found - `src/services/rewards/RewardSenderWallet.ts`
2677. **Production Readiness**: Console.log statement found - `src/services/rewards/RewardSenderWallet.ts`
2678. **Production Readiness**: Console.log statement found - `src/services/rewards/RewardSenderWallet.ts`
2679. **Production Readiness**: Console.log statement found - `src/services/season/Season1Service.ts`
2680. **Production Readiness**: Console.log statement found - `src/services/season/Season1Service.ts`
2681. **Production Readiness**: Console.log statement found - `src/services/season/Season1Service.ts`
2682. **Production Readiness**: Console.log statement found - `src/services/season/Season1Service.ts`
2683. **Production Readiness**: Console.log statement found - `src/services/season/Season1Service.ts`
2684. **Production Readiness**: Console.log statement found - `src/services/season/Season1Service.ts`
2685. **Production Readiness**: Console.log statement found - `src/services/season/Season1Service.ts`
2686. **Production Readiness**: Console.log statement found - `src/services/season/Season1Service.ts`
2687. **Production Readiness**: Console.log statement found - `src/services/season/Season1Service.ts`
2688. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2689. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2690. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2691. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2692. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2693. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2694. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2695. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2696. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2697. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2698. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2699. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2700. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2701. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2702. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2703. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2704. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2705. **Production Readiness**: Console.log statement found - `src/services/team/NdkTeamService.ts`
2706. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2707. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2708. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2709. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2710. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2711. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2712. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2713. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2714. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2715. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2716. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2717. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2718. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2719. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2720. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2721. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2722. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2723. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2724. **Production Readiness**: Console.log statement found - `src/services/team/TeamJoinRequestService.ts`
2725. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2726. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2727. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2728. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2729. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2730. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2731. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2732. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2733. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2734. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2735. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2736. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2737. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2738. **Production Readiness**: Console.log statement found - `src/services/team/TeamMemberCache.ts`
2739. **Production Readiness**: Console.log statement found - `src/services/team/captainDetectionService.ts`
2740. **Production Readiness**: Console.log statement found - `src/services/team/captainDetectionService.ts`
2741. **Production Readiness**: Console.log statement found - `src/services/team/captainDetectionService.ts`
2742. **Production Readiness**: Console.log statement found - `src/services/team/captainDetectionService.ts`
2743. **Production Readiness**: Console.log statement found - `src/services/team/captainDetectionService.ts`
2744. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2745. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2746. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2747. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2748. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2749. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2750. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2751. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2752. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2753. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2754. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2755. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2756. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2757. **Production Readiness**: Console.log statement found - `src/services/team/teamMembershipService.ts`
2758. **Production Readiness**: Console.log statement found - `src/services/user/UserDiscoveryService.ts`
2759. **Production Readiness**: Console.log statement found - `src/services/user/UserDiscoveryService.ts`
2760. **Production Readiness**: Console.log statement found - `src/services/user/UserDiscoveryService.ts`
2761. **Production Readiness**: Console.log statement found - `src/services/user/UserDiscoveryService.ts`
2762. **Production Readiness**: Console.log statement found - `src/services/user/UserDiscoveryService.ts`
2763. **Production Readiness**: Console.log statement found - `src/services/user/UserDiscoveryService.ts`
2764. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2765. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2766. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2767. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2768. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2769. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2770. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2771. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2772. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2773. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2774. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2775. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2776. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2777. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2778. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2779. **Production Readiness**: Console.log statement found - `src/services/user/directNostrProfileService.ts`
2780. **Production Readiness**: Console.log statement found - `src/services/user/profileService.ts`
2781. **Production Readiness**: Console.log statement found - `src/services/user/profileService.ts`
2782. **Production Readiness**: Console.log statement found - `src/services/user/profileService.ts`
2783. **Production Readiness**: Console.log statement found - `src/services/user/profileService.ts`
2784. **Production Readiness**: Console.log statement found - `src/services/wallet/NWCStorageService.ts`
2785. **Production Readiness**: Console.log statement found - `src/services/wallet/NWCStorageService.ts`
2786. **Production Readiness**: Console.log statement found - `src/services/wallet/NWCStorageService.ts`
2787. **Production Readiness**: Console.log statement found - `src/services/wallet/NWCStorageService.ts`
2788. **Production Readiness**: Console.log statement found - `src/services/wallet/NWCStorageService.ts`
2789. **Production Readiness**: Console.log statement found - `src/services/wallet/NWCWalletService.ts`
2790. **Production Readiness**: Console.log statement found - `src/services/wallet/NWCWalletService.ts`
2791. **Production Readiness**: Console.log statement found - `src/services/wallet/NWCWalletService.ts`
2792. **Production Readiness**: Console.log statement found - `src/services/wallet/NWCWalletService.ts`
2793. **Production Readiness**: Console.log statement found - `src/store/teamStore.ts`
2794. **Production Readiness**: Console.log statement found - `src/store/teamStore.ts`
2795. **Production Readiness**: Console.log statement found - `src/store/teamStore.ts`
2796. **Production Readiness**: Console.log statement found - `src/store/teamStore.ts`
2797. **Production Readiness**: Console.log statement found - `src/store/teamStore.ts`
2798. **Production Readiness**: Console.log statement found - `src/store/userStore.ts`
2799. **Production Readiness**: Console.log statement found - `src/store/userStore.ts`
2800. **Production Readiness**: Console.log statement found - `src/store/userStore.ts`
2801. **Production Readiness**: Console.log statement found - `src/store/userStore.ts`
2802. **Production Readiness**: Console.log statement found - `src/store/userStore.ts`
2803. **Production Readiness**: Console.log statement found - `src/store/walletStore.ts`
2804. **Production Readiness**: Console.log statement found - `src/store/walletStore.ts`
2805. **Production Readiness**: Console.log statement found - `src/store/walletStore.ts`
2806. **Production Readiness**: Console.log statement found - `src/store/walletStore.ts`
2807. **Production Readiness**: Console.log statement found - `src/store/walletStore.ts`
2808. **Production Readiness**: Console.log statement found - `src/store/walletStore.ts`
2809. **Production Readiness**: Console.log statement found - `src/store/walletStore.ts`
2810. **Production Readiness**: Console.log statement found - `src/store/walletStore.ts`
2811. **Production Readiness**: Console.log statement found - `src/utils/KalmanFilter.ts`
2812. **Production Readiness**: Console.log statement found - `src/utils/analytics.ts`
2813. **Production Readiness**: Console.log statement found - `src/utils/analytics.ts`
2814. **Production Readiness**: Console.log statement found - `src/utils/authDebug.ts`
2815. **Production Readiness**: Console.log statement found - `src/utils/authDebug.ts`
2816. **Production Readiness**: Console.log statement found - `src/utils/authDebug.ts`
2817. **Production Readiness**: Console.log statement found - `src/utils/authDebug.ts`
2818. **Production Readiness**: Console.log statement found - `src/utils/authDebug.ts`
2819. **Production Readiness**: Console.log statement found - `src/utils/authDebug.ts`
2820. **Production Readiness**: Console.log statement found - `src/utils/authDebug.ts`
2821. **Production Readiness**: Console.log statement found - `src/utils/authDebug.ts`
2822. **Production Readiness**: Console.log statement found - `src/utils/authDebug.ts`
2823. **Production Readiness**: Console.log statement found - `src/utils/authDebug.ts`
2824. **Production Readiness**: Console.log statement found - `src/utils/authDebug.ts`
2825. **Production Readiness**: Console.log statement found - `src/utils/authDebug.ts`
2826. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2827. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2828. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2829. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2830. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2831. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2832. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2833. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2834. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2835. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2836. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2837. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2838. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2839. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2840. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2841. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2842. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2843. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2844. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2845. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2846. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2847. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2848. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2849. **Production Readiness**: Console.log statement found - `src/utils/authDebugHelper.ts`
2850. **Production Readiness**: Console.log statement found - `src/utils/captainCache.ts`
2851. **Production Readiness**: Console.log statement found - `src/utils/captainCache.ts`
2852. **Production Readiness**: Console.log statement found - `src/utils/captainCache.ts`
2853. **Production Readiness**: Console.log statement found - `src/utils/captainCache.ts`
2854. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2855. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2856. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2857. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2858. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2859. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2860. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2861. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2862. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2863. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2864. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2865. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2866. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2867. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2868. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2869. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2870. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2871. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2872. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2873. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2874. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2875. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2876. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2877. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2878. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2879. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2880. **Production Readiness**: Console.log statement found - `src/utils/competitionIntegrationTests.ts`
2881. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2882. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2883. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2884. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2885. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2886. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2887. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2888. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2889. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2890. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2891. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2892. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2893. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2894. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2895. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2896. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2897. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2898. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2899. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2900. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2901. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2902. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2903. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2904. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2905. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2906. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2907. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2908. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2909. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2910. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2911. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2912. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2913. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2914. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2915. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2916. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2917. **Production Readiness**: Console.log statement found - `src/utils/competitionSimulator.ts`
2918. **Production Readiness**: Console.log statement found - `src/utils/fetchDedup.ts`
2919. **Production Readiness**: Console.log statement found - `src/utils/fetchDedup.ts`
2920. **Production Readiness**: Console.log statement found - `src/utils/fetchDedup.ts`
2921. **Production Readiness**: Console.log statement found - `src/utils/fetchDedup.ts`
2922. **Production Readiness**: Console.log statement found - `src/utils/fetchDedup.ts`
2923. **Production Readiness**: Console.log statement found - `src/utils/gpsValidation.ts`
2924. **Production Readiness**: Console.log statement found - `src/utils/gpsValidation.ts`
2925. **Production Readiness**: Console.log statement found - `src/utils/gpsValidation.ts`
2926. **Production Readiness**: Console.log statement found - `src/utils/gpsValidation.ts`
2927. **Production Readiness**: Console.log statement found - `src/utils/gpsValidation.ts`
2928. **Production Readiness**: Console.log statement found - `src/utils/gpsValidation.ts`
2929. **Production Readiness**: Console.log statement found - `src/utils/gpsValidation.ts`
2930. **Production Readiness**: Console.log statement found - `src/utils/joinRequestPublisher.ts`
2931. **Production Readiness**: Console.log statement found - `src/utils/joinRequestPublisher.ts`
2932. **Production Readiness**: Console.log statement found - `src/utils/joinRequestPublisher.ts`
2933. **Production Readiness**: Console.log statement found - `src/utils/joinRequestPublisher.ts`
2934. **Production Readiness**: Console.log statement found - `src/utils/joinRequestPublisher.ts`
2935. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2936. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2937. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2938. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2939. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2940. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2941. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2942. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2943. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2944. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2945. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2946. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2947. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2948. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2949. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2950. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2951. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2952. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2953. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2954. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2955. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2956. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2957. **Production Readiness**: Console.log statement found - `src/utils/leaderboardTestScripts.ts`
2958. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2959. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2960. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2961. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2962. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2963. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2964. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2965. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2966. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2967. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2968. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2969. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2970. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2971. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2972. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2973. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2974. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2975. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2976. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2977. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2978. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2979. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2980. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2981. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2982. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2983. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2984. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2985. **Production Readiness**: Console.log statement found - `src/utils/memberManagementTests.ts`
2986. **Production Readiness**: Console.log statement found - `src/utils/ndkConversion.ts`
2987. **Production Readiness**: Console.log statement found - `src/utils/ndkConversion.ts`
2988. **Production Readiness**: Console.log statement found - `src/utils/ndkConversion.ts`
2989. **Production Readiness**: Console.log statement found - `src/utils/ndkConversion.ts`
2990. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
2991. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
2992. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
2993. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
2994. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
2995. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
2996. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
2997. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
2998. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
2999. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
3000. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
3001. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
3002. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
3003. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
3004. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
3005. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
3006. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
3007. **Production Readiness**: Console.log statement found - `src/utils/nostr.ts`
3008. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3009. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3010. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3011. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3012. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3013. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3014. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3015. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3016. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3017. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3018. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3019. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3020. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3021. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3022. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3023. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3024. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3025. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3026. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3027. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3028. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3029. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3030. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3031. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3032. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3033. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3034. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3035. **Production Readiness**: Console.log statement found - `src/utils/nostrAuth.ts`
3036. **Production Readiness**: Console.log statement found - `src/utils/nostrEncoding.ts`
3037. **Production Readiness**: Console.log statement found - `src/utils/nostrEncoding.ts`
3038. **Production Readiness**: Console.log statement found - `src/utils/nostrWorkoutParser.ts`
3039. **Production Readiness**: Console.log statement found - `src/utils/nostrWorkoutParser.ts`
3040. **Production Readiness**: Console.log statement found - `src/utils/nostrWorkoutParser.ts`
3041. **Production Readiness**: Console.log statement found - `src/utils/nostrWorkoutParser.ts`
3042. **Production Readiness**: Console.log statement found - `src/utils/nostrWorkoutParser.ts`
3043. **Production Readiness**: Console.log statement found - `src/utils/nostrWorkoutParser.ts`
3044. **Production Readiness**: Console.log statement found - `src/utils/nostrWorkoutParser.ts`
3045. **Production Readiness**: Console.log statement found - `src/utils/nostrWorkoutParser.ts`
3046. **Production Readiness**: Console.log statement found - `src/utils/nostrWorkoutParser.ts`
3047. **Production Readiness**: Console.log statement found - `src/utils/notificationCache.ts`
3048. **Production Readiness**: Console.log statement found - `src/utils/notificationCache.ts`
3049. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3050. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3051. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3052. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3053. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3054. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3055. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3056. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3057. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3058. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3059. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3060. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3061. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3062. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3063. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3064. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3065. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3066. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3067. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3068. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3069. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3070. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3071. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3072. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3073. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3074. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3075. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3076. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3077. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3078. **Production Readiness**: Console.log statement found - `src/utils/notificationTestUtils.ts`
3079. **Production Readiness**: Console.log statement found - `src/utils/progressiveLoader.ts`
3080. **Production Readiness**: Console.log statement found - `src/utils/progressiveLoader.ts`
3081. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3082. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3083. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3084. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3085. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3086. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3087. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3088. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3089. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3090. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3091. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3092. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3093. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3094. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3095. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3096. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3097. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3098. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3099. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3100. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3101. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3102. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3103. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3104. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3105. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3106. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3107. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3108. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3109. **Production Readiness**: Console.log statement found - `src/utils/runAllTests.ts`
3110. **Production Readiness**: Console.log statement found - `src/utils/storage.ts`
3111. **Production Readiness**: Console.log statement found - `src/utils/storage.ts`
3112. **Production Readiness**: Console.log statement found - `src/utils/storage.ts`
3113. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3114. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3115. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3116. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3117. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3118. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3119. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3120. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3121. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3122. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3123. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3124. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3125. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3126. **Production Readiness**: Console.log statement found - `src/utils/testAuthFlow.ts`
3127. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3128. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3129. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3130. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3131. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3132. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3133. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3134. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3135. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3136. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3137. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3138. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3139. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3140. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3141. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3142. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3143. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3144. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3145. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3146. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3147. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3148. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3149. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3150. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3151. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3152. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3153. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3154. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3155. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3156. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3157. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3158. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3159. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3160. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3161. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3162. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3163. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3164. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3165. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3166. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3167. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3168. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3169. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3170. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3171. **Production Readiness**: Console.log statement found - `src/utils/testCaptainFlow.ts`
3172. **Production Readiness**: Console.log statement found - `src/utils/testCompetitions.ts`
3173. **Production Readiness**: Console.log statement found - `src/utils/testCompetitions.ts`
3174. **Production Readiness**: Console.log statement found - `src/utils/testCompetitions.ts`
3175. **Production Readiness**: Console.log statement found - `src/utils/testCompetitions.ts`
3176. **Production Readiness**: Console.log statement found - `src/utils/testCompetitions.ts`
3177. **Production Readiness**: Console.log statement found - `src/utils/testCompetitions.ts`
3178. **Production Readiness**: Console.log statement found - `src/utils/testCompetitions.ts`
3179. **Production Readiness**: Console.log statement found - `src/utils/testCompetitions.ts`
3180. **Production Readiness**: Console.log statement found - `src/utils/testCompetitions.ts`
3181. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3182. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3183. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3184. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3185. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3186. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3187. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3188. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3189. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3190. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3191. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3192. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3193. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3194. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3195. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3196. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3197. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3198. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3199. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3200. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3201. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3202. **Production Readiness**: Console.log statement found - `src/utils/testIntegration.ts`
3203. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3204. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3205. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3206. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3207. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3208. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3209. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3210. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3211. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3212. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3213. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3214. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3215. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3216. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3217. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3218. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3219. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3220. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3221. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3222. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3223. **Production Readiness**: Console.log statement found - `src/utils/testKind1Post.ts`
3224. **Production Readiness**: Console.log statement found - `src/utils/walletRecovery.ts`
3225. **Production Readiness**: Console.log statement found - `src/utils/walletRecovery.ts`
3226. **Production Readiness**: Console.log statement found - `src/utils/walletRecovery.ts`
3227. **Production Readiness**: Console.log statement found - `src/utils/walletRecovery.ts`
3228. **Production Readiness**: Console.log statement found - `src/utils/walletRecovery.ts`
3229. **Production Readiness**: Console.log statement found - `src/utils/webSocketPolyfill.ts`
3230. **Production Readiness**: Console.log statement found - `src/utils/webSocketPolyfill.ts`
3231. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3232. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3233. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3234. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3235. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3236. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3237. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3238. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3239. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3240. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3241. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3242. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3243. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3244. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3245. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3246. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3247. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3248. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3249. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3250. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3251. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3252. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3253. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3254. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3255. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3256. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3257. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3258. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3259. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3260. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3261. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3262. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3263. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3264. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3265. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3266. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3267. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3268. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3269. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3270. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3271. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3272. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3273. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3274. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`
3275. **Production Readiness**: Console.log statement found - `src/utils/workoutQueryPerformanceTests.ts`

</details>

