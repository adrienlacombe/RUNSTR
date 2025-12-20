import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Charity } from '../../types/charity';
import { theme } from '../../styles/theme';

interface CharitySelectionModalProps {
  visible: boolean;
  charities: Charity[];
  selectedCharityId?: string | null;
  onSelect: (charity: Charity) => void;
  onCancel: () => void;
}

export const CharitySelectionModal: React.FC<CharitySelectionModalProps> = ({
  visible,
  charities,
  selectedCharityId,
  onSelect,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Your Charity</Text>
            <Text style={styles.subtitle}>
              Choose which charity will receive your competition winnings
            </Text>
          </View>

          {/* Charity Options */}
          <ScrollView
            style={styles.charityList}
            showsVerticalScrollIndicator={false}
          >
            {charities.map((charity) => {
              const isSelected = selectedCharityId === charity.id;
              return (
                <TouchableOpacity
                  key={charity.id}
                  style={[
                    styles.charityButton,
                    isSelected && styles.charityButtonActive,
                  ]}
                  onPress={() => onSelect(charity)}
                  activeOpacity={0.8}
                >
                  <View style={styles.charityContent}>
                    <View style={styles.charityInfo}>
                      <Text style={styles.charityName}>{charity.name}</Text>
                      <Text style={styles.charityDescription}>
                        {charity.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={theme.colors.accent}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.orangeDeep,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.orangeBright,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  charityList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  charityButton: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  charityButtonActive: {
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  charityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  charityInfo: {
    flex: 1,
    marginRight: 12,
  },
  charityName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  charityDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});
