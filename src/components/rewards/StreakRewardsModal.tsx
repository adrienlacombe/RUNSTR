/**
 * StreakRewardsModal - Simple Premium CTA modal
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { theme } from '../../styles/theme';

interface StreakRewardsModalProps {
  visible: boolean;
  onClose: () => void;
  currentStreak: number;
}

const { width } = Dimensions.get('window');

// RUNSTR Premium signup page
const UNLOCK_PREMIUM_URL = 'https://www.runstr.club/pages/season2.html';

export const StreakRewardsModal: React.FC<StreakRewardsModalProps> = ({
  visible,
  onClose,
}) => {
  const handleUnlockPremium = () => {
    Linking.openURL(UNLOCK_PREMIUM_URL);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="lock-closed" size={48} color="#FF9D42" />
              <Text style={styles.title}>Unlock RUNSTR Premium</Text>
            </View>

            {/* Unlock Button */}
            <TouchableOpacity
              style={styles.unlockButton}
              onPress={handleUnlockPremium}
            >
              <Ionicons name="flash" size={20} color="#000" />
              <Text style={styles.unlockButtonText}>Unlock RUNSTR Premium</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modal: {
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: '#FF9D42',
    borderRadius: 20,
    width: width - 40,
    maxWidth: 320,
    shadowColor: '#FF9D42',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },

  content: {
    padding: 24,
    alignItems: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: theme.typography.weights.bold,
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },

  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9D42',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    marginBottom: 12,
  },

  unlockButtonText: {
    fontSize: 16,
    fontWeight: theme.typography.weights.bold,
    color: '#000',
  },

  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },

  closeButtonText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
});
