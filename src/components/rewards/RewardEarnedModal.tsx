/**
 * RewardEarnedModal - Display when user earns daily workout reward
 * Uses CustomAlert-style black/orange theme matching app style
 * Shows amount earned (21 sats for qualifying workouts >= 1km)
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface RewardEarnedModalProps {
  visible: boolean;
  amount: number;
  onClose: () => void;
}

export const RewardEarnedModal: React.FC<RewardEarnedModalProps> = ({
  visible,
  amount,
  onClose,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.alertBox, { opacity: fadeAnim }]}>
          {/* Lightning bolt icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="flash"
              size={48}
              color={theme.colors.orangeBright}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Reward Earned</Text>

          {/* Amount text */}
          <Text style={styles.message}>You earned {amount} sats!</Text>

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.button}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Nice!</Text>
          </TouchableOpacity>
        </Animated.View>
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
  alertBox: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.orangeDeep,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: theme.colors.orangeDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.orangeBright,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.orangeDeep,
    borderWidth: 1,
    borderColor: theme.colors.orangeBright,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.background,
  },
});
