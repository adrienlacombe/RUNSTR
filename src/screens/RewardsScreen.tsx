/**
 * RewardsScreen - Wallet and earnings dashboard
 * Extracted from SettingsScreen to make wallet features more accessible
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { CustomAlert } from '../components/ui/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NWCStorageService } from '../services/wallet/NWCStorageService';
import { NWCWalletService } from '../services/wallet/NWCWalletService';
import { WalletConfigModal } from '../components/wallet/WalletConfigModal';
import { SendModal } from '../components/wallet/SendModal';
import { ReceiveModal } from '../components/wallet/ReceiveModal';
import { HistoryModal } from '../components/wallet/HistoryModal';
import { QRScannerModal } from '../components/qr/QRScannerModal';
import { NWCQRConfirmationModal } from '../components/wallet/NWCQRConfirmationModal';
import type { QRData } from '../services/qr/QRCodeService';
import { getCharityById } from '../constants/charities';
import { Avatar } from '../components/ui/Avatar';
import { ExternalZapModal } from '../components/nutzap/ExternalZapModal';
import Toast from 'react-native-toast-message';
import { ImpactLevelCard } from '../components/rewards/ImpactLevelCard';
import { PersonalImpactSection } from '../components/rewards/PersonalImpactSection';
import { NWCGatewayService } from '../services/rewards/NWCGatewayService';
import { PledgeService } from '../services/pledge/PledgeService';
import { ActivePledgeCard } from '../components/pledge/ActivePledgeCard';
import type { Pledge } from '../types/pledge';

// Storage keys for donation settings
// Note: Teams are now charities (rebranded)
const SELECTED_TEAM_KEY = '@runstr:selected_team_id';

// ✅ PERFORMANCE: React.memo prevents re-renders when props haven't changed
const RewardsScreenComponent: React.FC = () => {
  const navigation = useNavigation<any>();

  // NWC Wallet state
  const [hasNWC, setHasNWC] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // App's rewards pool balance (from Supabase NWC)
  const [prizePoolBalance, setPrizePoolBalance] = useState(0);

  const [showWalletConfig, setShowWalletConfig] = useState(false);

  // Wallet modals state
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [userNpub, setUserNpub] = useState<string>('');

  // QR Scanner state
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showNWCConfirmation, setShowNWCConfirmation] = useState(false);
  const [scannedNWCString, setScannedNWCString] = useState<string>('');

  // User pubkey for Impact Level
  const [userHexPubkey, setUserHexPubkey] = useState<string>('');


  // Donation settings state (for zap modal)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>('als-foundation');

  // Active pledge state
  const [activePledge, setActivePledge] = useState<Pledge | null>(null);

  // Charity zap modal state (for Teams tab zap functionality)
  const [showZapModal, setShowZapModal] = useState(false);

  // Team accordion state (collapsed by default)
  const [isTeamExpanded, setIsTeamExpanded] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<
    Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>
  >([]);

  // Reload settings whenever screen gains focus (e.g., after selecting charity in TeamsScreen)
  useFocusEffect(
    useCallback(() => {
      loadSettings();
      loadPrizePoolBalance();
    }, [])
  );

  const loadSettings = async () => {
    try {
      // Load npub
      const npub = await AsyncStorage.getItem('@runstr:npub');
      if (npub) {
        setUserNpub(npub);
      }

      // Check NWC wallet status
      const nwcAvailable = await NWCStorageService.hasNWC();
      setHasNWC(nwcAvailable);

      // Load selected team for zap modal
      const teamId = await AsyncStorage.getItem(SELECTED_TEAM_KEY);
      if (teamId !== null) setSelectedTeamId(teamId || 'als-foundation');

      // Load user pubkey and active pledge
      const pubkey = await AsyncStorage.getItem('@runstr:hex_pubkey');
      if (pubkey) {
        setUserHexPubkey(pubkey);

        // Load active pledge
        const pledge = await PledgeService.getActivePledge(pubkey);
        setActivePledge(pledge);
      }
    } catch (error) {
      console.error('[RewardsScreen] Error loading settings:', error);
    }
  };

  /**
   * Load the app's rewards pool balance from Supabase NWC
   * This shows users how much is available in the rewards pool
   */
  const loadPrizePoolBalance = async () => {
    try {
      const result = await NWCGatewayService.getBalance();
      if (result.success && result.balance !== undefined) {
        // NWC returns millisats, convert to sats
        const balanceSats = Math.floor(result.balance / 1000);
        setPrizePoolBalance(balanceSats);
        console.log('[RewardsScreen] Prize pool balance:', balanceSats, 'sats');
      } else {
        console.error('[RewardsScreen] Failed to load prize pool balance:', result.error);
      }
    } catch (error) {
      console.error('[RewardsScreen] Error loading prize pool balance:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadSettings(),
        loadPrizePoolBalance(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Toggle team accordion
   */
  const toggleTeamAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsTeamExpanded(!isTeamExpanded);
  };

  const formatBalance = (sats: number): string => {
    if (sats >= 1000000) {
      return `${(sats / 1000000).toFixed(2)}M sats`;
    } else if (sats >= 1000) {
      return `${(sats / 1000).toFixed(1)}K sats`;
    }
    return `${sats.toLocaleString()} sats`;
  };

  const handleWalletConfigSuccess = async () => {
    // NWC was just saved - set state directly
    setHasNWC(true);
    // Fetch balance immediately (like v1.0.0)
    // Safe now that modal state conflict is fixed via setTimeout deferral
    const result = await NWCWalletService.getBalance();
    if (!result.error) {
      setWalletBalance(result.balance);
    }
  };

  const handleQRScanned = (qrData: QRData) => {
    try {
      if (qrData.type === 'nwc') {
        if (!qrData.connectionString || typeof qrData.connectionString !== 'string') {
          throw new Error('Invalid NWC connection string');
        }
        setScannedNWCString(qrData.connectionString);
        setShowNWCConfirmation(true);
      } else {
        Alert.alert(
          'Wrong QR Code Type',
          'Please scan an NWC wallet connection QR code.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[RewardsScreen] QR scan error:', error);
      Alert.alert('Error', 'Failed to process QR code. Please try again.', [{ text: 'OK' }]);
    }
  };

  const handleNWCConnected = async () => {
    // Just update NWC status - DON'T call loadSettings() which would try to fetch balance
    const nwcAvailable = await NWCStorageService.hasNWC();
    setHasNWC(nwcAvailable);
    setShowNWCConfirmation(false);
    // Balance will be 0 until user taps refresh - this is intentional
  };

  // Get selected team (charity) data for zap modal
  const selectedTeam = selectedTeamId
    ? getCharityById(selectedTeamId)
    : null;

  // Handle zap to charity - opens ExternalZapModal
  const handleZapCharity = () => {
    if (!selectedTeam) return;
    setShowZapModal(true);
  };

  // Handle successful zap
  const handleZapSuccess = () => {
    if (selectedTeam) {
      Toast.show({
        type: 'success',
        text1: 'Zapped!',
        text2: `Donation to ${selectedTeam.name} verified!`,
        position: 'top',
        visibilityTime: 3000,
      });
    }
    setShowZapModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.accent}
          />
        }
      >
        {/* Rewards Pool - Shows app's reward pool balance */}
        {prizePoolBalance > 0 && (
          <View style={styles.prizePoolCard}>
            <View style={styles.prizePoolHeader}>
              <Text style={styles.prizePoolLabel}>Rewards Pool</Text>
            </View>
            <Text style={styles.prizePoolAmount}>{formatBalance(prizePoolBalance)}</Text>
          </View>
        )}

        {/* Impact Level Card - Now first after rewards pool */}
        {userHexPubkey && (
          <ImpactLevelCard pubkey={userHexPubkey} />
        )}

        {/* Your Team Card - Collapsible accordion */}
        <View style={styles.teamCard}>
          <TouchableOpacity
            style={styles.teamCardHeader}
            onPress={toggleTeamAccordion}
            activeOpacity={0.7}
          >
            <Text style={styles.teamCardTitle}>YOUR TEAM</Text>
            <Ionicons
              name={isTeamExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#FF9D42"
            />
          </TouchableOpacity>
          {isTeamExpanded && (
            <View style={styles.teamCardContent}>
              <TouchableOpacity
                style={styles.teamInfoRow}
                onPress={() => navigation.navigate('Teams')}
                activeOpacity={0.7}
              >
                {selectedTeam ? (
                  <>
                    <Avatar
                      name={selectedTeam.name}
                      size={44}
                      imageSource={selectedTeam.image}
                    />
                    <View style={styles.teamTextSection}>
                      <Text style={styles.teamName}>{selectedTeam.name}</Text>
                      <Text style={styles.teamSupportText}>
                        All rewards support this team
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.emptyAvatarPlaceholder}>
                      <Ionicons name="add" size={24} color="#666" />
                    </View>
                    <View style={styles.teamTextSection}>
                      <Text style={styles.teamNameEmpty}>Select a team</Text>
                      <Text style={styles.teamSupportText}>Tap to choose</Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
              {selectedTeam && (
                <TouchableOpacity
                  style={styles.zapButton}
                  onPress={handleZapCharity}
                  activeOpacity={0.7}
                >
                  <Ionicons name="flash" size={22} color="#FF9D42" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Personal Impact Section (collapsed by default) */}
        {userHexPubkey && (
          <PersonalImpactSection pubkey={userHexPubkey} defaultExpanded={false} />
        )}

        {/* Active Pledge Section (only shown if user has active pledge) */}
        {activePledge && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACTIVE PLEDGE</Text>
            <ActivePledgeCard pledge={activePledge} />
          </View>
        )}

      </ScrollView>

      {/* Modals */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onClose={() => setAlertVisible(false)}
      />

      <WalletConfigModal
        visible={showWalletConfig}
        onClose={() => setShowWalletConfig(false)}
        onSuccess={handleWalletConfigSuccess}
        allowSkip={true}
      />

      <SendModal
        visible={showSendModal}
        onClose={() => setShowSendModal(false)}
        currentBalance={walletBalance}
      />

      <ReceiveModal
        visible={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        currentBalance={walletBalance}
        userNpub={userNpub}
      />

      <HistoryModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* External Zap Modal for charity donations */}
      {selectedTeam && (
        <ExternalZapModal
          visible={showZapModal}
          recipientNpub={selectedTeam.lightningAddress}
          recipientName={selectedTeam.name}
          memo={`Donation to ${selectedTeam.name}`}
          onClose={() => setShowZapModal(false)}
          onSuccess={handleZapSuccess}
          isCharityDonation={true}
          charityId={selectedTeam.id}
          charityLightningAddress={selectedTeam.lightningAddress}
        />
      )}

      {showQRScanner && (
        <QRScannerModal
          visible={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScanned={handleQRScanned}
        />
      )}

      {showNWCConfirmation && (
        <NWCQRConfirmationModal
          visible={showNWCConfirmation}
          onClose={() => setShowNWCConfirmation(false)}
          connectionString={scannedNWCString}
          onSuccess={handleNWCConnected}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    padding: 16,
  },
  walletCard: {
    padding: 16,
  },

  // Compact balance header
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  headerIconButton: {
    padding: 6,
  },
  refreshButton: {
    padding: 6,
  },

  // Wallet actions
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  walletActionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  walletActionText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },

  // Quick zap amount styles
  zapSettingContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  zapSettingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  zapSettingLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  zapAmountButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  zapAmountButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  zapAmountButtonActive: {
    backgroundColor: theme.colors.orangeBright,
    borderColor: theme.colors.orangeBright,
  },
  zapAmountButtonText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  zapAmountButtonTextActive: {
    color: '#000',
  },

  // Connect wallet styles
  connectWalletContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  connectWalletTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  connectWalletDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  connectWalletButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: 12,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  connectWalletButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 12,
  },
  connectWalletButtonText: {
    fontSize: 16,
    fontWeight: theme.typography.weights.bold,
    color: '#000',
  },
  connectWalletButtonTextSecondary: {
    color: theme.colors.text,
  },

  // Lightning address styles
  lightningAddressDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  lightningAddressInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lightningAddressInput: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text,
  },
  lightningAddressInputError: {
    borderColor: theme.colors.error || '#ff4444',
  },
  lightningAddressSaveButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  lightningAddressSaveButtonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  lightningAddressError: {
    color: theme.colors.error || '#ff4444',
    fontSize: 12,
    marginTop: 6,
  },

  // Donation settings styles - Option B design
  donationCard: {
    padding: 14,
  },
  teamHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  teamInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  teamTextSection: {
    flex: 1,
  },
  teamName: {
    fontSize: 15,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  teamNameEmpty: {
    fontSize: 15,
    fontWeight: theme.typography.weights.semiBold,
    color: '#666',
    marginBottom: 2,
  },
  teamSupportText: {
    fontSize: 12,
    color: '#888',
  },
  emptyAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  zapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Prize Pool card styles
  prizePoolCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  prizePoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  prizePoolLabel: {
    fontSize: 12,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  prizePoolAmount: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.orangeBright,
  },

  // Team card styles
  teamCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 14,
    marginBottom: 12,
  },
  teamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamCardTitle: {
    fontSize: 12,
    fontWeight: theme.typography.weights.bold,
    color: '#FF9D42',
    letterSpacing: 1,
  },
  teamCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  teamInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  // Accordion styles
  accordionContainer: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
    marginBottom: 12,
  },

  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },

  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  accordionTitle: {
    fontSize: 13,
    fontWeight: theme.typography.weights.bold,
    color: '#FF9D42',
    letterSpacing: 1,
  },

  accordionContent: {
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },

});

// ✅ PERFORMANCE: React.memo prevents re-renders when props haven't changed
export const RewardsScreen = React.memo(RewardsScreenComponent);
export default RewardsScreen;
