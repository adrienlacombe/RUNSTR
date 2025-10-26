/**
 * Distance Formatting Utility
 *
 * Single source of truth for distance formatting across the app.
 * All distances are stored in meters and displayed in kilometers.
 */

/**
 * Formats distance in meters to kilometers with 2 decimal places
 * @param meters - Distance in meters
 * @returns Formatted string like "4.59 km" or "--" if no distance
 */
export const formatDistance = (meters?: number): string => {
  if (!meters || meters <= 0) {
    return '--';
  }

  const kilometers = meters / 1000;
  return `${kilometers.toFixed(2)} km`;
};

/**
 * Formats distance for workout card generator (returns value without unit)
 * @param meters - Distance in meters
 * @returns Formatted string like "4.59" or null if no distance
 */
export const formatDistanceValue = (meters?: number): string | null => {
  if (!meters || meters <= 0) {
    return null;
  }

  const kilometers = meters / 1000;
  return kilometers.toFixed(2);
};
