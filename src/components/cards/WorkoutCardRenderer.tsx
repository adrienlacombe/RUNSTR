/**
 * WorkoutCardRenderer - React component wrapper for SVG workout cards
 * Enables capturing SVG as PNG using react-native-view-shot
 */

import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface WorkoutCardRendererProps {
  svgContent: string;
  width: number;
  height: number;
}

/**
 * WorkoutCardRenderer component
 * Renders SVG content as a React component that can be captured as an image
 *
 * Usage:
 * ```
 * const cardRef = useRef(null);
 *
 * <WorkoutCardRenderer
 *   ref={cardRef}
 *   svgContent={svgString}
 *   width={800}
 *   height={600}
 * />
 *
 * // Capture as image
 * const uri = await captureRef(cardRef, { format: 'png', quality: 0.9 });
 * ```
 */
export const WorkoutCardRenderer = forwardRef<View, WorkoutCardRendererProps>(
  ({ svgContent, width, height }, ref) => {
    return (
      <View
        ref={ref}
        style={[
          styles.container,
          {
            width,
            height,
          },
        ]}
      >
        <SvgXml xml={svgContent} width={width} height={height} />
      </View>
    );
  }
);

WorkoutCardRenderer.displayName = 'WorkoutCardRenderer';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
});
