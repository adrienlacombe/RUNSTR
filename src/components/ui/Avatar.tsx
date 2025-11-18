/**
 * Avatar Component - Exact match to HTML mockup avatar styling
 * Used for: leaderboard-avatar, profile-avatar, etc.
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

// Orange ostrich fallback avatar (app icon)
const FALLBACK_AVATAR = require('../../../assets/images/icon.png');

interface AvatarProps {
  name: string;
  size?: number;
  imageUrl?: string;
  style?: any;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = theme.layout.avatarSize, // Default to 36px (leaderboard size)
  imageUrl,
  style,
}) => {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  // Simple approach - just render the image if URL is provided
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.avatar, avatarStyle, style]}
        resizeMode="cover"
      />
    );
  }

  // Fallback to orange ostrich (RUNSTR app icon)
  return (
    <Image
      source={FALLBACK_AVATAR}
      style={[styles.avatar, avatarStyle, style]}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  // CSS: border-radius: 18px;
  avatar: {
    // No background color needed - images fill the entire circle
  },
});
