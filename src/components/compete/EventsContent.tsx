/**
 * EventsContent - Embeddable events feed for Compete screen toggle
 * Shows custom events with sport filtering, used within Season2Screen
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { useSatlantisEvents } from '../../hooks/useSatlantisEvents';
import { SatlantisEventCard } from '../satlantis/SatlantisEventCard';
import { FilterChips } from '../ui/FilterChips';
import type { SatlantisEvent, SatlantisSportType } from '../../types/satlantis';

const SPORT_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'running', label: 'Running' },
  { key: 'cycling', label: 'Cycling' },
  { key: 'walking', label: 'Walking' },
];

interface EventsContentProps {
  onEventPress: (event: SatlantisEvent) => void;
  onCreateEvent?: () => void;
}

export const EventsContent: React.FC<EventsContentProps> = ({
  onEventPress,
  onCreateEvent,
}) => {
  const [selectedSport, setSelectedSport] = useState<SatlantisSportType | 'all'>('all');

  const filter =
    selectedSport === 'all' ? undefined : { sportTypes: [selectedSport] };

  const { events, isLoading, error, refresh } = useSatlantisEvents(filter);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="calendar-outline"
        size={48}
        color={theme.colors.textMuted}
      />
      <Text style={styles.emptyTitle}>No Events Found</Text>
      <Text style={styles.emptySubtitle}>
        {error || 'Check back later for upcoming race events'}
      </Text>
      <Text style={styles.emptyHint}>Pull down to refresh</Text>
    </View>
  );

  const renderItem = useCallback(
    ({ item }: { item: SatlantisEvent }) => (
      <SatlantisEventCard
        event={item}
        onPress={() => onEventPress(item)}
        participantCount={item.participantCount}
      />
    ),
    [onEventPress]
  );

  // Show loading indicator on initial load
  if (isLoading && events.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Create Event Banner */}
      {onCreateEvent && (
        <TouchableOpacity
          style={styles.createEventBanner}
          onPress={onCreateEvent}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={20} color={theme.colors.text} />
          <Text style={styles.createEventText}>Create Event</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}

      {/* Sport Filter Chips */}
      <FilterChips
        options={SPORT_FILTERS}
        activeKey={selectedSport}
        onSelect={(key) => setSelectedSport(key as SatlantisSportType | 'all')}
      />

      {/* Events List */}
      <FlatList
        data={events}
        keyExtractor={(item) => `${item.pubkey}_${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        scrollEnabled={false} // Parent ScrollView handles scrolling
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={theme.colors.accent}
            colors={[theme.colors.accent]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  createEventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    gap: 12,
  },
  createEventText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: theme.typography.weights.medium,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  listContent: {
    paddingTop: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default EventsContent;
