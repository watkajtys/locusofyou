import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  withSequence,
  withDelay,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [isInteracting, setIsInteracting] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);

  // Enhanced shared values for animations
  const sliderWidth = useSharedValue(0);
  const thumbPosition = useSharedValue(0);
  const thumbScale = useSharedValue(1);
  const trackProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const trackGlowOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const cardElevation = useSharedValue(10);
  const valueIndicatorOpacity = useSharedValue(0);
  const valueIndicatorScale = useSharedValue(0.8);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  // Enhanced entrance animation
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(30);
  const cardScale = useSharedValue(0.95);
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.8);
  const questionOpacity = useSharedValue(0);
  const sliderOpacity = useSharedValue(0);
  const labelsOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animation
    setTimeout(() => {
      cardOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      cardTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
      cardScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });

      // Icon animation
      setTimeout(() => {
        iconOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        iconScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 200);

      // Question animation
      setTimeout(() => {
        questionOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 400);

      // Slider animation
      setTimeout(() => {
        sliderOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 600);

      // Labels animation
      setTimeout(() => {
        labelsOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 800);
    }, 100);
  }, []);

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
      trackProgress.value = withTiming(value / 100, { duration: 300 });
    }
  }, [value]);

  // Trigger haptic feedback (when available)
  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      // Would use Haptics.impactAsync() on native platforms
      // For web, we could use a visual feedback alternative
    }
  };

  // Enhanced gesture handler
  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onStart((event) => {
      setIsInteracting(true);
      setHasBeenTouched(true);
      runOnJS(onInteractionStart || (() => {}))();
      runOnJS(triggerHapticFeedback)();
      
      // Enhanced interaction animations
      thumbScale.value = withSpring(1.5, {
        damping: 15,
        stiffness: 300,
      });
      glowOpacity.value = withTiming(1, { duration: 200 });
      glowScale.value = withSpring(1.3, {
        damping: 15,
        stiffness: 300,
      });
      trackGlowOpacity.value = withTiming(0.6, { duration: 200 });
      cardElevation.value = withTiming(20, { duration: 200 });
      valueIndicatorOpacity.value = withTiming(1, { duration: 200 });
      valueIndicatorScale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });

      // Ripple effect at tap location
      const tapX = event.x;
      rippleScale.value = 0;
      rippleOpacity.value = 0.6;
      rippleScale.value = withTiming(1.5, { duration: 600, easing: Easing.out(Easing.cubic) });
      rippleOpacity.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });

      // Pulse effect
      pulseScale.value = withSequence(
        withTiming(1.02, { duration: 150 }),
        withTiming(1, { duration: 200 })
      );

      // If user taps directly on track, jump to that position
      const clampedX = Math.max(0, Math.min(sliderWidth.value, tapX));
      const newValue = Math.round((clampedX / sliderWidth.value) * 100);
      
      thumbPosition.value = withSpring(clampedX, {
        damping: 20,
        stiffness: 200,
      });
      trackProgress.value = withTiming(clampedX / sliderWidth.value, { duration: 200 });
      
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
      setIsInteracting(false);
      
      // Enhanced end animations
      thumbScale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
      glowOpacity.value = withTiming(0, { duration: 400 });
      glowScale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
      trackGlowOpacity.value = withTiming(0, { duration: 400 });
      cardElevation.value = withTiming(10, { duration: 300 });
      valueIndicatorOpacity.value = withTiming(0, { duration: 300 });
      valueIndicatorScale.value = withSpring(0.8, {
        damping: 15,
        stiffness: 300,
      });
      
      runOnJS(onInteractionEnd || (() => {}))();
    });

  // Enhanced animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardOpacity.value,
      transform: [
        { translateY: cardTranslateY.value },
        { scale: cardScale.value * pulseScale.value }
      ],
      shadowOpacity: interpolate(cardElevation.value, [10, 20], [0.15, 0.25]),
      shadowRadius: interpolate(cardElevation.value, [10, 20], [20, 30]),
      elevation: cardElevation.value,
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const questionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: questionOpacity.value,
  }));

  const sliderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sliderOpacity.value,
  }));

  const labelsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: labelsOpacity.value,
  }));

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: thumbPosition.value - 18 }, // Center the thumb (36px width / 2)
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
        { translateX: thumbPosition.value - 30 }, // Center the glow (60px width / 2)
        { scale: glowScale.value },
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
      opacity: trackGlowOpacity.value,
    };
  });

  const valueIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: valueIndicatorOpacity.value,
      transform: [
        { translateX: thumbPosition.value - 20 }, // Center above thumb
        { scale: valueIndicatorScale.value }
      ],
    };
  });

  return (
    <Animated.View style={[styles.card, cardAnimatedStyle]}>
      {/* Optional Icon */}
      {icon && (
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <View style={styles.iconBackground}>
            {icon}
          </View>
        </Animated.View>
      )}
      
      {/* Question Text */}
      <Animated.View style={questionAnimatedStyle}>
        <Text style={styles.questionText}>{questionText}</Text>
      </Animated.View>
      
      {/* Enhanced Slider Container */}
      <Animated.View style={[styles.sliderContainer, sliderAnimatedStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.sliderWrapper} onLayout={handleLayout}>
            {/* Track Background with Gradient */}
            <View style={styles.trackBackground}>
              <LinearGradient
                colors={['#f1f5f9', '#e2e8f0']}
                style={styles.trackGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>
            
            {/* Enhanced Track Glow */}
            <Animated.View style={[styles.trackGlow, trackGlowStyle]} />
            
            {/* Track Progress with Gradient */}
            <Animated.View style={[styles.trackProgress, trackProgressAnimatedStyle]}>
              <LinearGradient
                colors={['#60a5fa', '#3b82f6']}
                style={styles.progressGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
            
            {/* Value Indicator */}
            <Animated.View style={[styles.valueIndicator, valueIndicatorStyle]}>
              <View style={styles.valueIndicatorBubble}>
                <Text style={styles.valueIndicatorText}>{Math.round(value)}</Text>
              </View>
              <View style={styles.valueIndicatorArrow} />
            </Animated.View>
            
            {/* Enhanced Thumb Glow */}
            <Animated.View style={[styles.thumbGlow, thumbGlowStyle]}>
              <LinearGradient
                colors={['rgba(147, 197, 253, 0.8)', 'rgba(59, 130, 246, 0.4)']}
                style={styles.glowGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
            
            {/* Enhanced Thumb */}
            <Animated.View style={[styles.thumb, thumbAnimatedStyle]}>
              <View style={styles.thumbOuter}>
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.thumbGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </View>
              <View style={styles.thumbInner}>
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  style={styles.thumbCoreGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </View>
              {/* Thumb highlight */}
              <View style={styles.thumbHighlight} />
            </Animated.View>
          </View>
        </GestureDetector>
      </Animated.View>
      
      {/* Enhanced Labels */}
      <Animated.View style={[styles.labelsContainer, labelsAnimatedStyle]}>
        <Text style={[styles.leftLabel, value < 25 && styles.labelActive]}>{leftLabel}</Text>
        <Text style={[styles.rightLabel, value > 75 && styles.labelActive]}>{rightLabel}</Text>
      </Animated.View>
      
      {/* Progress Indicators */}
      <View style={styles.progressIndicators}>
        {[0, 25, 50, 75, 100].map((tick, index) => (
          <View
            key={tick}
            style={[
              styles.progressTick,
              Math.abs(value - tick) < 12.5 && styles.progressTickActive,
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 40,
    borderRadius: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 10 },
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: -0.2,
    fontWeight: '500',
  },
  sliderContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sliderWrapper: {
    height: 90,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  trackGradient: {
    flex: 1,
  },
  trackGlow: {
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    left: 0,
    top: -3,
    backgroundColor: 'rgba(147, 197, 253, 0.4)',
  },
  trackProgress: {
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    left: 0,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  valueIndicator: {
    position: 'absolute',
    top: -45,
    alignItems: 'center',
  },
  valueIndicatorBubble: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  valueIndicatorText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '600',
  },
  valueIndicatorArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#3b82f6',
    marginTop: -1,
  },
  thumbGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -25,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 30,
  },
  thumb: {
    position: 'absolute',
    width: 36,
    height: 36,
    top: -13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    overflow: 'hidden',
    position: 'absolute',
  },
  thumbGradient: {
    flex: 1,
  },
  thumbInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbCoreGradient: {
    flex: 1,
  },
  thumbHighlight: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  leftLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'left',
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  rightLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'right',
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  labelActive: {
    color: '#3b82f6',
    fontFamily: 'Inter-Bold',
    fontWeight: '600',
  },
  progressIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  progressTick: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  progressTickActive: {
    backgroundColor: '#3b82f6',
    transform: [{ scale: 1.2 }],
  },
});