import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Compass } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface OnboardingQuestionProps {
  questionText: string;
  icon?: React.ReactNode;
}

export default function OnboardingQuestion({ 
  questionText, 
  icon 
}: OnboardingQuestionProps) {
  // Default to compass icon if none provided
  const IconComponent = icon || <Compass size={24} color="#94a3b8" strokeWidth={2} />;

  // Enhanced animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.9);
  const iconScale = useSharedValue(0.8);
  const iconOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animation
    setTimeout(() => {
      // Container animation
      opacity.value = withTiming(1, { 
        duration: 800, 
        easing: Easing.out(Easing.cubic) 
      });
      translateY.value = withTiming(0, { 
        duration: 800, 
        easing: Easing.out(Easing.cubic) 
      });
      scale.value = withTiming(1, { 
        duration: 800, 
        easing: Easing.out(Easing.cubic) 
      });

      // Subtle glow effect
      glowOpacity.value = withSequence(
        withTiming(0.2, { duration: 600, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) })
      );

      // Icon animation with delay
      setTimeout(() => {
        iconOpacity.value = withTiming(1, { 
          duration: 600, 
          easing: Easing.out(Easing.cubic) 
        });
        iconScale.value = withTiming(1, { 
          duration: 600, 
          easing: Easing.out(Easing.cubic) 
        });
      }, 200);
    }, 100);
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Subtle glow overlay */}
      <Animated.View style={[styles.glowOverlay, glowStyle]} />
      
      <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
        {IconComponent}
      </Animated.View>
      
      <Text style={styles.questionText}>
        {questionText}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 24, // rounded-2xl equivalent
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10, // shadow-lg equivalent for Android
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    position: 'relative',
  },
  glowOverlay: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: '#e0f2fe',
    borderRadius: 26,
    zIndex: -1,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(147, 197, 253, 0.1)',
  },
  questionText: {
    fontSize: 17,
    lineHeight: 26,
    fontFamily: 'Inter-Regular',
    color: '#1e293b', // slate-800
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});