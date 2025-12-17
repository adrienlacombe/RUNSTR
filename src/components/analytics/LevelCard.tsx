/**
 * LevelCard - 3-column display of Level, Total XP, and XP to Next Level
 * Also displays RUNSTR Rank (Web of Trust score from Brainstorm)
 * Matches HealthSnapshotCard styling exactly
 * Uses distance-based XP calculation from WorkoutLevelService
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { nip19 } from 'nostr-tools';
import { theme } from '../../styles/theme';
import { WorkoutLevelService } from '../../services/fitness/WorkoutLevelService';
import { WoTService } from '../../services/wot/WoTService';
import { useAuth } from '../../contexts/AuthContext';
import type { LevelStats } from '../../types/workoutLevel';

/**
 * Format a timestamp as relative time (e.g., "2 hours ago")
 */
function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

interface LocalWorkout {
  id: string;
  type: string;
  distance?: number;
  duration?: number;
  startTime: string;
}

interface LevelCardProps {
  workouts: LocalWorkout[];
}

export const LevelCard: React.FC<LevelCardProps> = ({ workouts }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<LevelStats | null>(null);
  const [showModal, setShowModal] = useState(false);

  // RUNSTR Rank (WoT) state
  const [wotScore, setWotScore] = useState<number | null>(null);
  const [wotLoading, setWotLoading] = useState(false);
  const [wotError, setWotError] = useState<string | null>(null);
  const [wotFetchedAt, setWotFetchedAt] = useState<number | null>(null);

  useEffect(() => {
    const levelService = WorkoutLevelService.getInstance();
    const calculated = levelService.calculateLevelStats(workouts);
    setStats(calculated);
  }, [workouts]);

  // Fetch RUNSTR Rank on mount (check cache first)
  useEffect(() => {
    const loadWoTScore = async () => {
      if (!currentUser?.npub) return;

      try {
        // Convert npub to hex
        const decoded = nip19.decode(currentUser.npub);
        if (decoded.type !== 'npub' || typeof decoded.data !== 'string') {
          console.log('[LevelCard] Invalid npub format');
          return;
        }
        const hexPubkey = decoded.data;

        const wotService = WoTService.getInstance();

        // Check if we have a cached score
        const cached = await wotService.getCachedScoreWithMeta(hexPubkey);
        if (cached) {
          setWotScore(cached.score);
          setWotFetchedAt(cached.fetchedAt);
          console.log('[LevelCard] Loaded cached RUNSTR Rank:', cached.score);
        } else {
          // No cache - fetch from network on first view
          console.log('[LevelCard] No cached score, fetching from network...');
          setWotLoading(true);
          const score = await wotService.fetchAndCacheScore(hexPubkey);
          setWotScore(score);
          setWotFetchedAt(Date.now());
          setWotLoading(false);
        }
      } catch (error) {
        console.error('[LevelCard] Error loading WoT score:', error);
        setWotError('Failed to load RUNSTR Rank');
        setWotLoading(false);
      }
    };

    loadWoTScore();
  }, [currentUser?.npub]);

  // Refresh RUNSTR Rank manually
  const handleRefreshWoT = useCallback(async () => {
    if (!currentUser?.npub) return;

    try {
      setWotLoading(true);
      setWotError(null);

      const decoded = nip19.decode(currentUser.npub);
      if (decoded.type !== 'npub' || typeof decoded.data !== 'string') {
        throw new Error('Invalid npub format');
      }
      const hexPubkey = decoded.data;

      const wotService = WoTService.getInstance();
      const score = await wotService.refreshScore(hexPubkey);
      setWotScore(score);
      setWotFetchedAt(Date.now());
    } catch (error) {
      console.error('[LevelCard] Error refreshing WoT score:', error);
      setWotError('Failed to refresh');
    } finally {
      setWotLoading(false);
    }
  }, [currentUser?.npub]);

  if (!stats) {
    return (
      <View style={styles.container}>
        <View style={styles.columnsContainer}>
          <View style={styles.column}>
            <Text style={styles.label}>Level</Text>
            <Text style={styles.value}>-</Text>
            <Text style={styles.category}>-</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.column}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>-</Text>
            <Text style={styles.category}>XP</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.column}>
            <Text style={styles.label}>Next At</Text>
            <Text style={styles.value}>-</Text>
            <Text style={styles.category}>XP</Text>
          </View>
        </View>
      </View>
    );
  }

  const { level } = stats;
  const levelService = WorkoutLevelService.getInstance();
  const progressPercent = Math.round(level.progress * 100);

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        {/* Header with title and chevron */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="trophy" size={16} color="#FF9D42" />
            <Text style={styles.title}>Level</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.textMuted}
          />
        </View>

        {/* 3-column layout matching HealthSnapshotCard */}
        <View style={styles.columnsContainer}>
          {/* Level Column */}
          <View style={styles.column}>
            <Text style={styles.label}>Level</Text>
            <Text style={styles.value}>{level.level}</Text>
            <Text style={styles.category}>{level.title}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Total XP Column */}
          <View style={styles.column}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>
              {levelService.formatXP(level.totalXP)}
            </Text>
            <Text style={styles.category}>XP</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Next Level XP Column */}
          <View style={styles.column}>
            <Text style={styles.label}>Next At</Text>
            <Text style={styles.value}>
              {levelService.formatXP(level.xpForNextLevel)}
            </Text>
            <Text style={styles.category}>XP</Text>
          </View>
        </View>

        {/* Progress bar section */}
        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>
              {levelService.formatXP(level.currentXP)} /{' '}
              {levelService.formatXP(level.xpForNextLevel)} XP
            </Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
        </View>

        {/* RUNSTR Rank (Web of Trust) Section */}
        <View style={styles.wotSection}>
          <View style={styles.wotHeader}>
            <View style={styles.wotTitleRow}>
              <Ionicons name="shield-checkmark" size={14} color="#FF9D42" />
              <Text style={styles.wotTitle}>RUNSTR Rank</Text>
            </View>
            <TouchableOpacity
              onPress={handleRefreshWoT}
              disabled={wotLoading}
              style={styles.refreshButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {wotLoading ? (
                <ActivityIndicator size="small" color="#FF9D42" />
              ) : (
                <Ionicons name="refresh" size={16} color="#FF9D42" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.wotContent}>
            {wotLoading && wotScore === null ? (
              <Text style={styles.wotLoadingText}>Calculating rank...</Text>
            ) : wotError ? (
              <Text style={styles.wotErrorText}>{wotError}</Text>
            ) : (
              <>
                <Text style={styles.wotScoreValue}>
                  {WoTService.getInstance().formatScore(wotScore)}
                </Text>
                <Text style={styles.wotTierLabel}>
                  {WoTService.getInstance().getRankTier(wotScore)}
                </Text>
              </>
            )}
          </View>

          {wotFetchedAt && !wotLoading && (
            <Text style={styles.wotLastUpdated}>
              Updated {formatTimeAgo(wotFetchedAt)}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* XP Explanation Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How XP Works</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* XP Earning */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Earn XP by Working Out</Text>
                <View style={styles.xpRow}>
                  <Ionicons name="flash" size={18} color="#FF9D42" />
                  <Text style={styles.xpText}>10 XP per kilometer</Text>
                </View>
              </View>

              {/* Distance Thresholds */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Minimum Distance Requirements
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Workouts must meet these thresholds to earn XP:
                </Text>
                <View style={styles.thresholdList}>
                  <View style={styles.thresholdRow}>
                    <Ionicons name="walk" size={18} color="#FF9D42" />
                    <Text style={styles.thresholdText}>Walking: 1+ km</Text>
                  </View>
                  <View style={styles.thresholdRow}>
                    <Ionicons name="fitness" size={18} color="#FF9D42" />
                    <Text style={styles.thresholdText}>Running: 2+ km</Text>
                  </View>
                  <View style={styles.thresholdRow}>
                    <Ionicons name="bicycle" size={18} color="#FF9D42" />
                    <Text style={styles.thresholdText}>Cycling: 3+ km</Text>
                  </View>
                </View>
              </View>

              {/* Level Progression */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Level Progression</Text>
                <Text style={styles.sectionSubtitle}>
                  Each level requires 15% more XP than the previous. Base XP for
                  Level 1: 100 XP
                </Text>
              </View>

              {/* Milestones */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Level Milestones</Text>
                <View style={styles.milestoneList}>
                  {[
                    { level: 1, title: 'Beginner' },
                    { level: 5, title: 'Rookie' },
                    { level: 10, title: 'Athlete' },
                    { level: 20, title: 'Veteran' },
                    { level: 30, title: 'Champion' },
                    { level: 50, title: 'Legend' },
                    { level: 75, title: 'Master' },
                    { level: 100, title: 'Elite' },
                    { level: 150, title: 'Grandmaster' },
                    { level: 200, title: 'Mythic' },
                  ].map((milestone) => (
                    <View key={milestone.level} style={styles.milestoneRow}>
                      <Text style={styles.milestoneLevel}>
                        Level {milestone.level}
                      </Text>
                      <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 10,
    marginBottom: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  title: {
    fontSize: 13,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },

  columnsContainer: {
    flexDirection: 'row',
  },

  column: {
    flex: 1,
    alignItems: 'center',
  },

  divider: {
    width: 1,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 8,
  },

  label: {
    fontSize: 10,
    fontWeight: theme.typography.weights.semiBold,
    color: '#CC7A33',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  value: {
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
    color: '#FF9D42',
    marginBottom: 2,
  },

  category: {
    fontSize: 10,
    fontWeight: theme.typography.weights.medium,
    color: '#FFB366',
  },

  progressSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },

  progressTrack: {
    height: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FF7B1C',
    borderRadius: 2,
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  progressText: {
    fontSize: 10,
    color: '#CC7A33',
  },

  progressPercent: {
    fontSize: 10,
    fontWeight: theme.typography.weights.semiBold,
    color: '#CC7A33',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    maxHeight: '80%',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },

  modalBody: {
    padding: 16,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
    color: '#FF9D42',
    marginBottom: 8,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 10,
    lineHeight: 18,
  },

  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
  },

  xpText: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },

  thresholdList: {
    gap: 8,
  },

  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 8,
  },

  thresholdText: {
    fontSize: 14,
    color: theme.colors.text,
  },

  milestoneList: {
    gap: 6,
  },

  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 8,
  },

  milestoneLevel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },

  milestoneTitle: {
    fontSize: 13,
    fontWeight: theme.typography.weights.semiBold,
    color: '#FF9D42',
  },

  // RUNSTR Rank (WoT) styles
  wotSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },

  wotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  wotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  wotTitle: {
    fontSize: 12,
    fontWeight: theme.typography.weights.semiBold,
    color: '#FF9D42',
  },

  refreshButton: {
    padding: 4,
  },

  wotContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },

  wotScoreValue: {
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
    color: '#FF9D42',
  },

  wotTierLabel: {
    fontSize: 12,
    fontWeight: theme.typography.weights.medium,
    color: '#FFB366',
  },

  wotLoadingText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },

  wotErrorText: {
    fontSize: 12,
    color: '#FF6B6B',
  },

  wotLastUpdated: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});
