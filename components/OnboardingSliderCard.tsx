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
  const isInteracting = useSharedValue(false);
  const trackProgress = useSharedValue(0);

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
      isInteracting.value = true;

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
      isInteracting.value = false;
      runOnJS(onInteractionEnd || (() => {}))();
    });

  // Animated styles
  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const scale = isInteracting.value ? 1.2 : 1;
    return {
      transform: [
        { translateX: thumbPosition.value - 18 }, // Center the thumb (36px width / 2)
        { scale: withSpring(scale, { damping: 15, stiffness: 300 }) },
      ],
    };
  });

  const trackProgressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${trackProgress.value * 100}%`,
    };
  });

  const thumbShadowStyle = useAnimatedStyle(() => {
    const shadowOpacity = isInteracting.value ? 0.3 : 0.15;
    const shadowRadius = isInteracting.value ? 12 : 8;
    return {
      shadowOpacity: withTiming(shadowOpacity, { duration: 200 }),
      shadowRadius: withTiming(shadowRadius, { duration: 200 }),
    };
  });

  return (
    <View style={styles.card}>
      {/* Icon */}
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
            
            {/* Track Progress */}
            <Animated.View style={[styles.trackProgress, trackProgressAnimatedStyle]} />
            
            {/* Progress Markers */}
            <View style={styles.markersContainer}>
              {[0, 25, 50, 75, 100].map((mark) => (
                <View 
                  key={mark} 
                  style={[
                    styles.marker,
                    { left: `${mark}%` }
                  ]} 
                />
              ))}
            </View>
            
            {/* Thumb */}
            <Animated.View style={[styles.thumb, thumbAnimatedStyle, thumbShadowStyle]}>
              <View style={styles.thumbOuter}>
                <View style={styles.thumbInner} />
              </View>
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
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: -0.2,
  },
  sliderContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sliderWrapper: {
    height: 80,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  trackProgress: {
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
  },
  markersContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    top: '50%',
    marginTop: -4,
  },
  marker: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 1,
    marginLeft: -1,
  },
  thumb: {
    position: 'absolute',
    width: 36,
    height: 36,
    top: -14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  thumbOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  leftLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'left',
    flex: 1,
    lineHeight: 20,
  },
  rightLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'right',
    flex: 1,
    lineHeight: 20,
  },
});