/**
 * TeamsScreen - Hardcoded teams + charities selection
 * Users can select ONE team and ONE charity at a time
 * Selections are stored in AsyncStorage and added to kind 1301/kind 1 posts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../styles/theme';
import { HARDCODED_TEAMS } from '../constants/hardcodedTeams';
import { CHARITIES, Charity } from '../constants/charities';
import { ToggleButtons } from '../components/ui/ToggleButtons';

// Storage keys
const SELECTED_TEAM_KEY = '@runstr:selected_team_id';
const SELECTED_CHARITY_KEY = '@runstr:selected_charity_id';

interface TeamCardProps {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isSelected: boolean;
  onSelect: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  id,
  name,
  description,
  image,
  isSelected,
  onSelect,
}) => {
  // Extract image URL from rawEvent tags if available
  const getTeamImage = () => {
    const team = HARDCODED_TEAMS.find((t) => t.id === id);
    if (!team?.rawEvent?.tags) return null;

    const bannerTag = team.rawEvent.tags.find(
      (tag: string[]) => tag[0] === 'banner'
    );
    const imageTag = team.rawEvent.tags.find(
      (tag: string[]) => tag[0] === 'image'
    );
    return bannerTag?.[1] || imageTag?.[1] || null;
  };

  const imageUrl = image || getTeamImage();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Ionicons name="people" size={24} color={theme.colors.textMuted} />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {name}
        </Text>
        {description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      {isSelected && (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={theme.colors.success}
        />
      )}
    </TouchableOpacity>
  );
};

interface CharityCardProps {
  charity: Charity;
  isSelected: boolean;
  onSelect: () => void;
}

const CharityCard: React.FC<CharityCardProps> = ({
  charity,
  isSelected,
  onSelect,
}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onSelect}
    activeOpacity={0.7}
  >
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {charity.name}
      </Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {charity.description}
      </Text>
    </View>
    {isSelected && (
      <Ionicons
        name="checkmark-circle"
        size={24}
        color={theme.colors.success}
      />
    )}
  </TouchableOpacity>
);

export const TeamsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'teams' | 'charities'>('teams');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load saved selections on mount
  useEffect(() => {
    const loadSelections = async () => {
      try {
        const [teamId, charityId] = await Promise.all([
          AsyncStorage.getItem(SELECTED_TEAM_KEY),
          AsyncStorage.getItem(SELECTED_CHARITY_KEY),
        ]);
        if (teamId) setSelectedTeamId(teamId);
        if (charityId) setSelectedCharityId(charityId);
      } catch (error) {
        console.error('[TeamsScreen] Error loading selections:', error);
      }
    };
    loadSelections();
  }, []);

  const handleSelectTeam = useCallback(async (teamId: string) => {
    try {
      // Toggle selection - if already selected, deselect
      const newValue = selectedTeamId === teamId ? null : teamId;
      if (newValue) {
        await AsyncStorage.setItem(SELECTED_TEAM_KEY, newValue);
      } else {
        await AsyncStorage.removeItem(SELECTED_TEAM_KEY);
      }
      setSelectedTeamId(newValue);
      console.log('[TeamsScreen] Selected team:', newValue);
    } catch (error) {
      console.error('[TeamsScreen] Error saving team selection:', error);
    }
  }, [selectedTeamId]);

  const handleSelectCharity = useCallback(async (charityId: string) => {
    try {
      // Toggle selection - if already selected, deselect
      const newValue = selectedCharityId === charityId ? null : charityId;
      if (newValue) {
        await AsyncStorage.setItem(SELECTED_CHARITY_KEY, newValue);
      } else {
        await AsyncStorage.removeItem(SELECTED_CHARITY_KEY);
      }
      setSelectedCharityId(newValue);
      console.log('[TeamsScreen] Selected charity:', newValue);
    } catch (error) {
      console.error('[TeamsScreen] Error saving charity selection:', error);
    }
  }, [selectedCharityId]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Re-load selections from storage
    try {
      const [teamId, charityId] = await Promise.all([
        AsyncStorage.getItem(SELECTED_TEAM_KEY),
        AsyncStorage.getItem(SELECTED_CHARITY_KEY),
      ]);
      if (teamId) setSelectedTeamId(teamId);
      if (charityId) setSelectedCharityId(charityId);
    } catch (error) {
      console.error('[TeamsScreen] Error refreshing:', error);
    }
    setIsRefreshing(false);
  }, []);

  // Find selected team and charity objects
  const selectedTeam = selectedTeamId
    ? HARDCODED_TEAMS.find((t) => t.id === selectedTeamId)
    : null;
  const selectedCharity = selectedCharityId
    ? CHARITIES.find((c) => c.id === selectedCharityId)
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header - back button only */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      {/* Toggle between Teams and Charities */}
      <View style={styles.toggleContainer}>
        <ToggleButtons
          options={[
            { key: 'teams', label: 'Teams' },
            { key: 'charities', label: 'Charities' },
          ]}
          activeKey={activeTab}
          onSelect={(key) => setActiveTab(key as 'teams' | 'charities')}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.orangeBright}
          />
        }
      >
        {/* Teams Tab Content */}
        {activeTab === 'teams' && (
          <>
            {/* Your Selected Team */}
            {selectedTeam && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>YOUR TEAM</Text>
                <TeamCard
                  id={selectedTeam.id}
                  name={selectedTeam.name}
                  description={selectedTeam.description}
                  isSelected={true}
                  onSelect={() => handleSelectTeam(selectedTeam.id)}
                />
              </View>
            )}

            {/* All Teams */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ALL TEAMS</Text>
              <Text style={styles.sectionSubtitle}>
                Select a team to add to your workout posts
              </Text>
              {HARDCODED_TEAMS.map((team) => (
                <TeamCard
                  key={team.id}
                  id={team.id}
                  name={team.name}
                  description={team.description}
                  isSelected={selectedTeamId === team.id}
                  onSelect={() => handleSelectTeam(team.id)}
                />
              ))}
            </View>
          </>
        )}

        {/* Charities Tab Content */}
        {activeTab === 'charities' && (
          <>
            {/* Your Selected Charity */}
            {selectedCharity && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>YOUR CHARITY</Text>
                <CharityCard
                  charity={selectedCharity}
                  isSelected={true}
                  onSelect={() => handleSelectCharity(selectedCharity.id)}
                />
              </View>
            )}

            {/* All Charities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ALL CHARITIES</Text>
              <Text style={styles.sectionSubtitle}>
                Select a charity to receive a portion of your rewards
              </Text>
              {CHARITIES.map((charity) => (
                <CharityCard
                  key={charity.id}
                  charity={charity}
                  isSelected={selectedCharityId === charity.id}
                  onSelect={() => handleSelectCharity(charity.id)}
                />
              ))}
            </View>
          </>
        )}

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  toggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: theme.typography.weights.semiBold,
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  cardImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    marginBottom: 2,
  },
  cardDescription: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default TeamsScreen;
