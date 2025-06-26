import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

interface OnboardingSliderCardProps {
  questionText: string;
  leftLabel: string;
  rightLabel: string;
  value: number; // 0-100
  onValueChange: (value: number) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function OnboardingSliderCard({
  questionText,
  leftLabel,
  rightLabel,
  value,
  onValueChange,
  onInteractionStart,
  onInteractionEnd,
  disabled = false,
  icon
}: OnboardingSliderCardProps) {
  // Shared values for animations
  const sliderWidth = useSharedValue(0);
  const thumbPosition = useSharedValue(0);
  const thumbScale = useSharedValue(1);
  const trackProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: newWidth } = event.nativeEvent.layout;
    sliderWidth.value = newWidth;
    
    // Set initial position based on current value
    const initialPosition = (value / 100) * newWidth;
    thumbPosition.value = initialPosition;
    trackProgress.value = value / 100;
  };

  // Update thumb position when value changes externally
  useEffect(() => {
    if (sliderWidth.value > 0) {
      const targetPosition = (value / 100) * sliderWidth.value;
      thumbPosition.value = withSpring(targetPosition, {
        damping: 20,
        stiffness: 200,
      });
      trackProgress.value = withTiming(value / 100, { duration: 200 });
    }
  }, [value]);

  // Gesture handler
  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onStart((event) => {
      runOnJS(onInteractionStart || (() => {}))();
      
      // Scale up thumb and show glow
      thumbScale.value = withSpring(1.3, {
        damping: 15,
        stiffness: 300,
      });
      glowOpacity.value = withTiming(0.6, { duration: 150 });

      // If user taps directly on track, jump to that position
      const tapX = event.x;
      const clampedX = Math.max(0, Math.min(sliderWidth.value, tapX));
      const newValue = Math.round((clampedX / sliderWidth.value) * 100);
      
      thumbPosition.value = withSpring(clampedX, {
        damping: 20,
        stiffness: 200,
      });
      trackProgress.value = withTiming(clampedX / sliderWidth.value, { duration: 150 });
      
      runOnJS(onValueChange)(newValue);
    })
    .onUpdate((event) => {
      if (sliderWidth.value <= 0) return;
      
      const newX = event.x;
      const clampedX = Math.max(0, Math.min(sliderWidth.value, newX));
      const newValue = Math.round((clampedX / sliderWidth.value) * 100);
      
      thumbPosition.value = clampedX;
      trackProgress.value = clampedX / sliderWidth.value;
      
      runOnJS(onValueChange)(newValue);
    })
    .onEnd(() => {
      // Scale down thumb and hide glow
      thumbScale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
      glowOpacity.value = withTiming(0, { duration: 200 });
      
      runOnJS(onInteractionEnd || (() => {}))();
    });

  // Animated styles
  const thumbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: thumbPosition.value - 16 }, // Center the thumb (32px width / 2)
        { scale: thumbScale.value },
      ],
    };
  });

  const trackProgressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${trackProgress.value * 100}%`,
    };
  });

  const thumbGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      transform: [
        { translateX: thumbPosition.value - 20 }, // Center the glow (40px width / 2)
        { scale: thumbScale.value * 0.8 },
      ],
    };
  });

  const trackGlowStyle = useAnimatedStyle(() => {
    const glowWidth = interpolate(
      trackProgress.value,
      [0, 1],
      [0, 100],
      Extrapolation.CLAMP
    );
    
    return {
      width: `${glowWidth}%`,
      opacity: glowOpacity.value * 0.3,
    };
  });

  return (
    <View style={styles.card}>
      {/* Optional Icon */}
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      
      {/* Question Text */}
      <Text style={styles.questionText}>{questionText}</Text>
      
      {/* Slider Container */}
      <View style={styles.sliderContainer}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.sliderWrapper} onLayout={handleLayout}>
            {/* Track Background */}
            <View style={styles.trackBackground} />
            
            {/* Track Glow (subtle background glow) */}
            <Animated.View style={[styles.trackGlow, trackGlowStyle]} />
            
            {/* Track Progress */}
            <Animated.View style={[styles.trackProgress, trackProgressAnimatedStyle]} />
            
            {/* Thumb Glow (appears on interaction) */}
            <Animated.View style={[styles.thumbGlow, thumbGlowStyle]} />
            
            {/* Thumb */}
            <Animated.View style={[styles.thumb, thumbAnimatedStyle]}>
              <View style={styles.thumbInner} />
              <View style={styles.thumbCore} />
            </Animated.View>
          </View>
        </GestureDetector>
      </View>
      
      {/* Labels */}
      <View style={styles.labelsContainer}>
        <Text style={styles.leftLabel}>{leftLabel}</Text>
        <Text style={styles.rightLabel}>{rightLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 40,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Inter-Regular',
    color: '#1e293b', // slate-800
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: -0.2,
  },
  sliderContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sliderWrapper: {
    height: 80, // Increased height for easier interaction
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    height: 8, // Slightly thicker track
    backgroundColor: '#e2e8f0', // slate-200
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  trackGlow: {
    height: 8,
    backgroundColor: '#bfdbfe', // blue-200
    borderRadius: 4,
    position: 'absolute',
    left: 0,
  },
  trackProgress: {
    height: 8,
    backgroundColor: '#3b82f6', // blue-500
    borderRadius: 4,
    position: 'absolute',
    left: 0,
  },
  thumbGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#93c5fd', // blue-300
    top: -16,
  },
  thumb: {
    position: 'absolute',
    width: 32,
    height: 32,
    top: -12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'absolute',
  },
  thumbCore: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b82f6', // blue-500
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  leftLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b', // slate-500
    textAlign: 'left',
    flex: 1,
    lineHeight: 20,
  },
  rightLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b', // slate-500
    textAlign: 'right',
    flex: 1,
    lineHeight: 20,
  },
});