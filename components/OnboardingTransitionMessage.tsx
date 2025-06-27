import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import TypingIndicator from './TypingIndicator';

interface OnboardingTransitionMessageProps {
  message: string;
  delay?: number;
  onComplete?: () => void;
}

export default function OnboardingTransitionMessage({ 
  message, 
  delay = 0,
  onComplete
}: OnboardingTransitionMessageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [showMessage, setShowMessage] = React.useState(false);
  
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.95);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      setShowMessage(true);
      
      // Enhanced animate container in
      opacity.value = withTiming(1, { 
        duration: 600, 
        easing: Easing.out(Easing.cubic) 
      });
      translateY.value = withTiming(0, { 
        duration: 600, 
        easing: Easing.out(Easing.cubic) 
      });
      scale.value = withTiming(1, { 
        duration: 600, 
        easing: Easing.out(Easing.cubic) 
      });

      // Subtle glow effect
      glowOpacity.value = withSequence(
        withTiming(0.3, { duration: 800, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 1000, easing: Easing.out(Easing.quad) })
      );

      // Show typing indicator for a moment, then reveal message
      setTimeout(() => {
        setIsLoading(false);
        onComplete?.();
      }, 1500);
    }, delay);
  }, [delay, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!showMessage) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Subtle glow overlay */}
      <Animated.View style={[styles.glowOverlay, glowStyle]} />
      
      <View style={styles.bubble}>
        {isLoading ? (
          <TypingIndicator isVisible={true} showBubble={false} />
        ) : (
          <Text style={styles.messageText}>{message}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginBottom: 24,
    width: '100%',
    position: 'relative',
  },
  glowOverlay: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: '#bfdbfe',
    borderRadius: 22,
    zIndex: -1,
  },
  bubble: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 52,
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
    color: '#1e293b', // slate-800
    letterSpacing: -0.1,
  },
});