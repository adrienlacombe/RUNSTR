/**
 * CaptainArbitrationDashboard - Shows captain's arbitration responsibilities
 * Displays active challenges, manual payout requirements, and earnings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import {
  challengeArbitrationService,
  type ArbitrationRecord,
  type ArbitrationStats,
} from '../../services/challenge/ChallengeArbitrationService';
import { NWCWalletService } from '../../services/wallet/NWCWalletService';
import { getUserNostrIdentifiers } from '../../utils/nostr';

interface CaptainArbitrationDashboardProps {
  captainPubkey: string;
}

export const CaptainArbitrationDashboard: React.FC<
  CaptainArbitrationDashboardProps
> = ({ captainPubkey }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ArbitrationStats | null>(null);
  const [arbitrations, setArbitrations] = useState<ArbitrationRecord[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    loadArbitrations();
  }, [captainPubkey]);

  const loadArbitrations = async () => {
    try {
      setLoading(true);

      // Load arbitration records
      const records = await challengeArbitrationService.getCaptainArbitrations(
        captainPubkey
      );
      setArbitrations(records);

      // Load stats
      const captainStats = await challengeArbitrationService.getCaptainStats(
        captainPubkey
      );
      setStats(captainStats);

      // Load wallet balance
      try {
        const nwcService = NWCWalletService.getInstance();
        const balance = await nwcService.getBalance();
        setWalletBalance(balance);
      } catch (error) {
        console.error('Failed to load wallet balance:', error);
      }
    } catch (error) {
      console.error('Failed to load arbitrations:', error);
      Alert.alert('Error', 'Failed to load arbitration data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadArbitrations();
    setRefreshing(false);
  };

  const handleManualPayout = async (record: ArbitrationRecord) => {
    if (!record.winnerPubkey || !record.payoutAmount) {
      Alert.alert('Error', 'Missing payout information');
      return;
    }

    Alert.alert(
      'Manual Payout Required',
      `Please pay ${record.payoutAmount.toLocaleString()} sats to the winner.\n\nWinner: ${record.winnerPubkey.slice(
        0,
        16
      )}...\n\nReason: ${
        record.payoutFailureReason || 'Automatic payout failed'
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Paid',
          onPress: async () => {
            try {
              await challengeArbitrationService.markManualPayoutComplete(
                record.challengeId
              );
              Alert.alert('Success', 'Payout marked as complete');
              await loadArbitrations();
            } catch (error) {
              Alert.alert('Error', 'Failed to mark payout as complete');
            }
          },
        },
      ]
    );
  };

  // Filter arbitrations by status
  const awaitingPayments = arbitrations.filter(
    (a) => a.status === 'awaiting_payments'
  );
  const fullyFunded = arbitrations.filter((a) => a.status === 'fully_funded');
  const manualRequired = arbitrations.filter(
    (a) => a.payoutStatus === 'manual_required'
  );
  const completed = arbitrations.filter((a) => a.status === 'completed');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading arbitrations...</Text>
      </View>
    );
  }

  if (arbitrations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="shield-checkmark-outline"
          size={64}
          color={theme.colors.textMuted}
        />
        <Text style={styles.emptyTitle}>No Arbitrations Yet</Text>
        <Text style={styles.emptyText}>
          When team members select you as arbitrator for challenges, they'll
          appear here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.accent}
        />
      }
    >
      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="flash" size={24} color={theme.colors.orangeBright} />
          <Text style={styles.statValue}>
            {stats?.totalEarned.toLocaleString() || 0}
          </Text>
          <Text style={styles.statLabel}>Total Earned (sats)</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color={theme.colors.accent} />
          <Text style={styles.statValue}>
            {stats?.completedChallenges || 0}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color={theme.colors.textSecondary} />
          <Text style={styles.statValue}>{stats?.activeChallenges || 0}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>

      {/* Wallet Balance */}
      {walletBalance !== null && (
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Ionicons name="wallet" size={20} color={theme.colors.accent} />
            <Text style={styles.balanceLabel}>NWC Wallet Balance</Text>
          </View>
          <Text style={styles.balanceValue}>
            {walletBalance.toLocaleString()} sats
          </Text>
        </View>
      )}

      {/* Manual Payout Required Section */}
      {manualRequired.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="alert-circle"
              size={20}
              color={theme.colors.error}
            />
            <Text style={styles.sectionTitle}>
              Manual Payout Required ({manualRequired.length})
            </Text>
          </View>

          {manualRequired.map((record) => (
            <ArbitrationCard
              key={record.challengeId}
              record={record}
              onManualPayout={() => handleManualPayout(record)}
            />
          ))}
        </View>
      )}

      {/* Awaiting Payments Section */}
      {awaitingPayments.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="hourglass"
              size={20}
              color={theme.colors.textMuted}
            />
            <Text style={styles.sectionTitle}>
              Awaiting Payments ({awaitingPayments.length})
            </Text>
          </View>

          {awaitingPayments.map((record) => (
            <ArbitrationCard key={record.challengeId} record={record} />
          ))}
        </View>
      )}

      {/* Fully Funded Section */}
      {fullyFunded.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={theme.colors.accent}
            />
            <Text style={styles.sectionTitle}>
              Fully Funded ({fullyFunded.length})
            </Text>
          </View>

          {fullyFunded.map((record) => (
            <ArbitrationCard key={record.challengeId} record={record} />
          ))}
        </View>
      )}

      {/* Recent Completions */}
      {completed.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="checkmark-done"
              size={20}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.sectionTitle}>
              Recent Completions ({Math.min(completed.length, 5)})
            </Text>
          </View>

          {completed.slice(0, 5).map((record) => (
            <ArbitrationCard key={record.challengeId} record={record} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

interface ArbitrationCardProps {
  record: ArbitrationRecord;
  onManualPayout?: () => void;
}

const ArbitrationCard: React.FC<ArbitrationCardProps> = ({
  record,
  onManualPayout,
}) => {
  const getStatusBadge = () => {
    if (record.payoutStatus === 'manual_required') {
      return (
        <View style={[styles.badge, styles.badgeError]}>
          <Text style={styles.badgeText}>Action Required</Text>
        </View>
      );
    }

    if (record.status === 'awaiting_payments') {
      const creatorPaid = record.creatorPayment.paid;
      const accepterPaid = record.accepterPayment.paid;

      if (!creatorPaid && !accepterPaid) {
        return (
          <View style={[styles.badge, styles.badgeMuted]}>
            <Text style={styles.badgeText}>Waiting for Both</Text>
          </View>
        );
      } else if (creatorPaid && !accepterPaid) {
        return (
          <View style={[styles.badge, styles.badgeWarning]}>
            <Text style={styles.badgeText}>Waiting for Accepter</Text>
          </View>
        );
      } else if (!creatorPaid && accepterPaid) {
        return (
          <View style={[styles.badge, styles.badgeWarning]}>
            <Text style={styles.badgeText}>Waiting for Creator</Text>
          </View>
        );
      }
    }

    if (record.status === 'fully_funded') {
      return (
        <View style={[styles.badge, styles.badgeSuccess]}>
          <Text style={styles.badgeText}>Fully Funded</Text>
        </View>
      );
    }

    if (
      record.status === 'completed' &&
      record.payoutStatus === 'auto_completed'
    ) {
      return (
        <View style={[styles.badge, styles.badgeSuccess]}>
          <Text style={styles.badgeText}>Auto-Paid</Text>
        </View>
      );
    }

    if (record.status === 'completed' && record.payoutStatus === 'completed') {
      return (
        <View style={[styles.badge, styles.badgeSuccess]}>
          <Text style={styles.badgeText}>Completed</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.arbitrationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.challengeId}>
          {record.challengeId.slice(0, 16)}...
        </Text>
        {getStatusBadge()}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Wager:</Text>
          <Text style={styles.cardValue}>
            {record.wagerAmount.toLocaleString()} sats × 2
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Your Fee:</Text>
          <Text style={styles.cardValue}>
            {record.arbitrationFee
              ? `${record.arbitrationFee.toLocaleString()} sats`
              : `${Math.floor(
                  record.wagerAmount * 2 * (record.arbitrationFeePercent / 100)
                ).toLocaleString()} sats (${record.arbitrationFeePercent}%)`}
          </Text>
        </View>

        {record.winnerPubkey && (
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Winner:</Text>
            <Text style={styles.cardValue}>
              {record.winnerPubkey.slice(0, 12)}...
            </Text>
          </View>
        )}

        {record.payoutFailureReason && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={16} color={theme.colors.error} />
            <Text style={styles.errorText}>{record.payoutFailureReason}</Text>
          </View>
        )}
      </View>

      {onManualPayout && record.payoutStatus === 'manual_required' && (
        <TouchableOpacity
          style={styles.manualPayoutButton}
          onPress={onManualPayout}
        >
          <Ionicons name="wallet" size={18} color={theme.colors.accentText} />
          <Text style={styles.manualPayoutButtonText}>
            Pay {record.payoutAmount?.toLocaleString() || 0} sats Manually
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  balanceCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.accent,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  arbitrationCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: theme.colors.textMuted,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  badgeError: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  badgeMuted: {
    backgroundColor: 'rgba(158, 158, 158, 0.2)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  cardBody: {
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.error,
    lineHeight: 18,
  },
  manualPayoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  manualPayoutButtonText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.accentText,
  },
});
