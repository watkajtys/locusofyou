import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingStepHeader from '@/components/OnboardingStepHeader';
import AIMessage from '@/components/AIMessage'; // Using the new AIMessage component
import { useOnboarding } from '@/context/OnboardingContext';

const { height } = Dimensions.get('window');

export default function InitialScreen() {
  const [showContent, setShowContent] = useState(false);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const backgroundScale = useSharedValue(1);
  const { onboardingData } = useOnboarding();

  useEffect(() => {
    backgroundScale.value = withSequence(
      withTiming(1.02, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) })
    );

    const timer = setTimeout(() => {
      setShowContent(true);
      contentOpacity.value = withTiming(1, { duration: 800 });
      contentTranslateY.value = withTiming(0, { duration: 800 });
    }, 500);
    return () => clearTimeout(timer);
  }, [backgroundScale, contentOpacity, contentTranslateY]);

  const navigateToNext = () => {
    contentOpacity.value = withTiming(0, { duration: 400 });
    contentTranslateY.value = withTiming(-20, { duration: 400 });
    setTimeout(() => {
      router.push('/onboarding/conscientiousness');
    }, 400);
  };

  // Determine aura state - for this initial screen, it's mostly 'processing' or 'responding'
  const getAuraState = (): 'idle' | 'listening' | 'processing' | 'responding' => {
    // This screen is primarily the AI "speaking", so 'responding' is appropriate
    // once messages start appearing. Could be 'processing' during delays.
    return showContent ? 'responding' : 'processing';
  };

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backgroundContainer, backgroundAnimatedStyle]}>
        <LinearGradient
          colors={['#e0f2fe', '#dbeafe', '#f0f9ff']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <OnboardingStepHeader
          onBackPress={() => router.canGoBack() ? router.back() : router.replace('/')} // Go to home if no back history
          auraState={getAuraState()}
        />
        <View style={styles.contentArea}>
          {showContent && (
            <Animated.View style={[styles.content, contentAnimatedStyle]}>
              <View style={styles.messagesSection}>
                <AIMessage text="Welcome." />
                <AIMessage text="I'm here to be a supportive partner, at your pace. No pressure." delay={1200} />
                <AIMessage
                  text="To get started, I have one quick question to understand your style."
                  delay={3000}
                  onComplete={() => setTimeout(navigateToNext, 1000)}
                />
              </View>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

// Styles adapted from the original app/onboarding.tsx for consistency
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    width: '400%',
    height: '400%',
    top: '-150%',
    left: '-150%',
    zIndex: -1,
  },
  backgroundGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentArea: { // Replaces ScrollView for this simpler screen
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center', // Center messages vertically
  },
  content: {
    flex: 1,
    justifyContent: 'center', // Center messages vertically within the animated view
  },
  messagesSection: {
    paddingBottom: 20, // Or adjust as needed
    maxHeight: height * 0.5, // Ensure messages don't take too much space
    justifyContent: 'center',
  },
});
