import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

interface TypingIndicatorProps {
  isVisible: boolean;
}

export default function TypingIndicator({ isVisible }: TypingIndicatorProps) {
  // Animation values for each dot
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);
  const containerOpacity = useSharedValue(0);
  const containerScale = useSharedValue(0.8);

  useEffect(() => {
    if (isVisible) {
      // Animate container in
      containerOpacity.value = withTiming(1, { duration: 300 });
      containerScale.value = withTiming(1, { duration: 300 });

      // Start dot animations after container is visible
      const startDotAnimations = () => {
        // Create a continuous pulsing animation for each dot with staggered timing
        dot1Opacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 600 }),
            withTiming(0.3, { duration: 600 })
          ),
          -1,
          false
        );

        dot2Opacity.value = withDelay(
          200,
          withRepeat(
            withSequence(
              withTiming(1, { duration: 600 }),
              withTiming(0.3, { duration: 600 })
            ),
            -1,
            false
          )
        );

        dot3Opacity.value = withDelay(
          400,
          withRepeat(
            withSequence(
              withTiming(1, { duration: 600 }),
              withTiming(0.3, { duration: 600 })
            ),
            -1,
            false
          )
        );
      };

      // Start dot animations after container animation completes
      setTimeout(startDotAnimations, 300);
    } else {
      // Stop all animations
      cancelAnimation(dot1Opacity);
      cancelAnimation(dot2Opacity);
      cancelAnimation(dot3Opacity);
      
      // Animate container out
      containerOpacity.value = withTiming(0, { duration: 200 });
      containerScale.value = withTiming(0.8, { duration: 200 });
      
      // Reset dot opacities after container fades out
      setTimeout(() => {
        dot1Opacity.value = 0.3;
        dot2Opacity.value = 0.3;
        dot3Opacity.value = 0.3;
      }, 200);
    }
  }, [isVisible]);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const dot1AnimatedStyle = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
  }));

  const dot2AnimatedStyle = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
  }));

  const dot3AnimatedStyle = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
  }));

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <View style={styles.bubble}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, dot1AnimatedStyle]} />
          <Animated.View style={[styles.dot, dot2AnimatedStyle]} />
          <Animated.View style={[styles.dot, dot3AnimatedStyle]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginBottom: 8,
    width: '100%',
  },
  bubble: {
    backgroundColor: 'white',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 70,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
    marginHorizontal: 3,
  },
});