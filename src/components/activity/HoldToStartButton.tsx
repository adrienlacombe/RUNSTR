/**
 * HoldToStartButton - Hold-down button with SVG circular progress indicator
 * User must hold for 2 seconds to trigger start action
 * Uses SVG for consistent rendering on both iOS and Android
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { theme } from '../../styles/theme';

// Create animated Circle component for SVG progress animation
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HoldToStartButtonProps {
  label: string;
  onHoldComplete: () => void;
  disabled?: boolean;
  holdDuration?: number; // milliseconds (default 2000)
}

export const HoldToStartButton: React.FC<HoldToStartButtonProps> = ({
  label,
  onHoldComplete,
  disabled = false,
  holdDuration = 2000,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // SVG Circle parameters - matches original 180px circle with 3px border
  const size = 180;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animated strokeDashoffset: full circumference (empty) -> 0 (full)
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        // User started pressing
        startHoldAnimation();
      },
      onPanResponderRelease: () => {
        // User released before completing
        cancelHoldAnimation();
      },
      onPanResponderTerminate: () => {
        // Touch was interrupted
        cancelHoldAnimation();
      },
    })
  ).current;

  const startHoldAnimation = () => {
    // Start circular progress animation
    // useNativeDriver: false is required for SVG strokeDashoffset animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: holdDuration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        // Hold completed successfully
        handleHoldComplete();
      }
    });
  };

  const cancelHoldAnimation = () => {
    // Stop and reset animation
    progressAnim.stopAnimation();
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();

    // Clear any pending timers
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleHoldComplete = () => {
    // Haptic feedback when hold completes
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    // Reset animation
    progressAnim.setValue(0);

    // Trigger callback
    onHoldComplete();
  };

  return (
    <View
      style={[styles.container, disabled && styles.containerDisabled]}
      {...panResponder.panHandlers}
    >
      {/* SVG Progress Ring */}
      <View style={styles.svgContainer}>
        <Svg width={size} height={size}>
          {/* Background circle (gray track with dark fill) */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.colors.border}
            strokeWidth={strokeWidth}
            fill={theme.colors.card}
          />

          {/* Progress circle (accent colored fill, starts from 12 o'clock) */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.colors.accent}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${center}, ${center}`}
          />
        </Svg>
      </View>

      {/* Label text */}
      <View style={styles.labelContainer}>
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
        <Text style={[styles.hint, disabled && styles.hintDisabled]}>
          Hold to start
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  svgContainer: {
    position: 'absolute',
    // Center the 180px SVG in the 200px container
    top: 10,
    left: 10,
  },
  labelContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  labelDisabled: {
    color: theme.colors.textMuted,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  hintDisabled: {
    color: theme.colors.border,
  },
});
