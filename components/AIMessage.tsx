import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import TypingIndicator from '@/components/TypingIndicator';

interface AIMessageProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
  showBubble?: boolean; // Added to control bubble visibility for typing indicator
}

export default function AIMessage({
  text,
  delay = 0,
  onComplete,
  showBubble = true, // Default to true
}: AIMessageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
      opacity.value = withTiming(1, { duration: 600 });
      translateY.value = withTiming(0, { duration: 600 });

      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
        onComplete?.();
      }, 1200); // Duration of typing animation

      return () => clearTimeout(loadingTimer);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, onComplete, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!showMessage) return null;

  return (
    <Animated.View style={[styles.aiMessageContainer, animatedStyle]}>
      {showBubble ? (
        <View style={styles.aiMessageBubble}>
          {isLoading ? (
            <TypingIndicator isVisible={true} showBubble={false} />
          ) : (
            <Text style={styles.aiMessageText}>{text}</Text>
          )}
        </View>
      ) : isLoading ? ( // If showBubble is false, only show typing indicator
        <TypingIndicator isVisible={true} showBubble={false} />
      ) : (
        <Text style={styles.aiMessageText}>{text}</Text> // Or text directly if not loading
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  aiMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
    width: '100%',
  },
  aiMessageBubble: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 44, // Ensure bubble has a minimum height
    justifyContent: 'center', // Center typing indicator vertically
  },
  aiMessageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
  },
});
