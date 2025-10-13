/**
 * CompactWallet - Streamlined wallet display for Profile screen
 * Shows NWC connection status and Bitcoin features
 * App works without wallet - connect wallet for Bitcoin features
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { NWCStorageService } from '../../services/wallet/NWCStorageService';
import { NWCWalletService } from '../../services/wallet/NWCWalletService';
import { WalletConfigModal } from '../wallet/WalletConfigModal';
import { FEATURES } from '../../config/features';

// Keep legacy imports for Cashu support (feature flagged)
import { useWalletStore } from '../../store/walletStore';
import { useNutzap } from '../../hooks/useNutzap';

interface CompactWalletProps {
  onSendPress?: () => void;
  onReceivePress?: () => void;
  onHistoryPress?: () => void;
}

export const CompactWallet: React.FC<CompactWalletProps> = ({
  onSendPress,
  onReceivePress,
  onHistoryPress,
}) => {
  // NWC wallet state
  const [hasNWC, setHasNWC] = useState(false);
  const [nwcBalance, setNwcBalance] = useState(0);
  const [showWalletConfig, setShowWalletConfig] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Legacy Cashu wallet state (feature flagged)
  const { balance: cashuBalance, isInitialized, isInitializing, refreshBalance: refreshStoreBalance } = useWalletStore();
  const { claimNutzaps } = useNutzap(false);
  const [lastClaimTime, setLastClaimTime] = useState<Date | null>(null);

  // Initialize NWC wallet on mount
  useEffect(() => {
    const initNWC = async () => {
      setIsLoading(true);
      try {
        const nwcAvailable = await NWCStorageService.hasNWC();
        setHasNWC(nwcAvailable);

        if (nwcAvailable) {
          // Get balance
          const balanceResult = await NWCWalletService.getBalance();
          setNwcBalance(balanceResult.balance);
        }
      } catch (error) {
        console.error('[CompactWallet] NWC init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (FEATURES.ENABLE_NWC_WALLET) {
      initNWC();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Refresh NWC balance
  const handleRefreshNWC = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const balanceResult = await NWCWalletService.getBalance();
      setNwcBalance(balanceResult.balance);
      console.log('[CompactWallet] NWC balance refreshed:', balanceResult.balance);
    } catch (error) {
      console.error('[CompactWallet] NWC refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Handle wallet config success
  const handleWalletConfigSuccess = useCallback(async () => {
    const nwcAvailable = await NWCStorageService.hasNWC();
    setHasNWC(nwcAvailable);

    if (nwcAvailable) {
      // Get initial balance
      const balanceResult = await NWCWalletService.getBalance();
      setNwcBalance(balanceResult.balance);
    }
  }, []);

  // Legacy Cashu handlers (feature flagged)
  const handleClaim = useCallback(async (silent: boolean = true) => {
    if (!FEATURES.ENABLE_CASHU_WALLET) return;

    const result = await claimNutzaps();
    if (result.claimed > 0) {
      setLastClaimTime(new Date());
      if (!silent) {
        Alert.alert(
          'Payment Received!',
          `Received ${result.claimed} sats`,
          [{ text: 'OK' }]
        );
      }
    }
  }, [claimNutzaps]);

  const handleRefreshCashu = useCallback(async () => {
    if (!FEATURES.ENABLE_CASHU_WALLET) return;

    setIsRefreshing(true);
    try {
      await handleClaim(true);
      await refreshStoreBalance();
    } catch (err) {
      console.error('[CompactWallet] Cashu refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [handleClaim, refreshStoreBalance]);

  // Legacy Cashu initialization (feature flagged)
  useEffect(() => {
    if (FEATURES.ENABLE_CASHU_WALLET && isInitialized) {
      refreshStoreBalance().catch(err =>
        console.warn('[CompactWallet] Cashu balance sync failed:', err)
      );
    }
  }, [isInitialized, refreshStoreBalance]);

  useEffect(() => {
    if (FEATURES.ENABLE_CASHU_WALLET && isInitialized) {
      handleClaim(true);
      const interval = setInterval(() => {
        handleClaim(true);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isInitialized, handleClaim]);

  // Determine which wallet system to use
  const balance = FEATURES.ENABLE_NWC_WALLET ? nwcBalance : cashuBalance;
  const handleRefresh = FEATURES.ENABLE_NWC_WALLET ? handleRefreshNWC : handleRefreshCashu;

  const formatBalance = (sats: number): string => {
    if (sats >= 1000000) {
      return `${(sats / 1000000).toFixed(2)}M`;
    } else if (sats >= 1000) {
      return `${(sats / 1000).toFixed(1)}K`;
    }
    return sats.toString();
  };

  // Render wallet UI based on NWC availability
  return (
    <>
      <View style={styles.walletBox}>
        {!hasNWC && FEATURES.ENABLE_NWC_WALLET ? (
          // No wallet configured - show connect prompt
          <View style={styles.noWalletContainer}>
            <View style={styles.noWalletIcon}>
              <Ionicons name="wallet-outline" size={32} color={theme.colors.textMuted} />
            </View>
            <Text style={styles.noWalletText}>
              Connect wallet for Bitcoin features
            </Text>
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => setShowWalletConfig(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={18} color="#000000" />
              <Text style={styles.connectButtonText}>Connect Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Wallet configured - show balance and actions
          <>
            {/* Centered balance with sync indicator and refresh button */}
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceAmount}>
                {formatBalance(balance)}
              </Text>
              <Text style={styles.balanceUnit}>sats</Text>
              {(isLoading || isRefreshing) ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.textMuted}
                  style={styles.syncIndicator}
                />
              ) : (
                <TouchableOpacity
                  onPress={handleRefresh}
                  style={styles.refreshButton}
                  activeOpacity={0.6}
                >
                  <Ionicons name="refresh" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Compact action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onSendPress}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-up" size={16} color={theme.colors.text} />
                <Text style={styles.actionText}>Send</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={onReceivePress}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-down" size={16} color={theme.colors.text} />
                <Text style={styles.actionText}>Receive</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Wallet Configuration Modal */}
      <WalletConfigModal
        visible={showWalletConfig}
        onClose={() => setShowWalletConfig(false)}
        onSuccess={handleWalletConfigSuccess}
        allowSkip={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  walletBox: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 12,
    padding: 10,
    minHeight: 80,
    position: 'relative',
  },

  // No wallet state
  noWalletContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },

  noWalletIcon: {
    marginBottom: 8,
  },

  noWalletText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 12,
    textAlign: 'center',
  },

  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF9D42',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  connectButtonText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
    color: '#000000',
  },

  // Centered balance
  balanceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: -32,
  },

  balanceAmount: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },

  balanceUnit: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
  },

  syncIndicator: {
    marginLeft: 8,
  },

  refreshButton: {
    marginLeft: 8,
    padding: 4,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },

  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.small,
    paddingVertical: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },

  actionText: {
    fontSize: 11,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
});