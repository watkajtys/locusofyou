import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
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
import { Map, Wand } from 'lucide-react-native';
import OnboardingStepHeader from '@/components/OnboardingStepHeader';
import OnboardingQuestion from '@/components/OnboardingQuestion';
import OnboardingTransitionMessage from '@/components/OnboardingTransitionMessage';
import { useOnboarding } from '@/context/OnboardingContext';

const { width, height } = Dimensions.get('window');

type InteractionState = 'none' | 'touching' | 'selected' | 'transitioning';

export default function ConscientiousnessScreen() {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [interactionState, setInteractionState] = useState<InteractionState>('none');
  const [showContent, setShowContent] = useState(false);
  const [showTransition, setShowTransition] = useState(true); // Start with transition message

  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const backgroundScale = useSharedValue(1);

  useEffect(() => {
    backgroundScale.value = withSequence(
      withTiming(1.02, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) })
    );
    // No automatic content show, will be triggered by transition message
  }, []);

  const animateToShowContent = () => {
    setShowTransition(false); // Hide transition
    setShowContent(true); // Show main content
    contentOpacity.value = withTiming(1, { duration: 600 });
    contentTranslateY.value = withTiming(0, { duration: 600 });
  };

  const animateToNextStep = () => {
    setInteractionState('transitioning');
    contentOpacity.value = withTiming(0, { duration: 400 });
    contentTranslateY.value = withTiming(-20, { duration: 400 });

    setTimeout(() => {
      router.push('/onboarding/regulatory-focus');
    }, 400);
  };

  const handleCardChoice = (choice: 'planner' | 'adapter') => {
    updateOnboardingData({ conscientiousness: choice });
    setInteractionState('selected');

    setTimeout(() => {
      animateToNextStep();
    }, 300);
  };

  const handleInteractionStart = () => setInteractionState('touching');
  const handleInteractionEnd = () => setInteractionState('none');

  const getAuraState = (): 'idle' | 'listening' | 'processing' | 'responding' => {
    switch (interactionState) {
      case 'touching': return 'processing';
      case 'selected': return 'responding';
      case 'transitioning': return 'processing';
      case 'none':
      default:
        return showTransition ? 'responding' : 'listening'; // Responding during transition, listening for question
    }
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
          colors={['#e0f2fe', '#dbeafe', '#f0f9ff']} // Example gradient
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <OnboardingStepHeader
          onBackPress={() => router.back()}
          auraState={getAuraState()}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {showTransition && (
            <View style={styles.stepContainer}>
              <View style={styles.messagesSection}>
                {/* This is where the initial message from the previous step would appear if we carry it over */}
                {/* For now, let's assume the flow starts directly with the question or a brief transition */}
                <OnboardingTransitionMessage
                  message="Great! Let's dive into that first question."
                  onComplete={() => setTimeout(animateToShowContent, 500)} // Short delay before showing question
                />
              </View>
            </View>
          )}

          {showContent && (
            <Animated.View style={[styles.content, contentAnimatedStyle]}>
              <View style={styles.stepContainer}>
                <View style={styles.interactionSection}>
                  <OnboardingQuestion
                    questionText="When you're at your best, are you more of a meticulous planner who loves a detailed roadmap, or a flexible adapter who thrives on creative problem-solving?"
                  />
                  <View style={styles.cardsContainer}>
                    <TouchableOpacity
                      style={styles.card}
                      onPress={() => handleCardChoice('planner')}
                      onPressIn={handleInteractionStart}
                      onPressOut={handleInteractionEnd}
                      activeOpacity={0.8}
                      disabled={interactionState === 'selected' || interactionState === 'transitioning'}
                    >
                      <View style={styles.cardContentContainer}>
                        <Map size={24} color="#3b82f6" style={styles.cardIcon} />
                        <Text style={styles.cardText}>Meticulous Planner</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.card}
                      onPress={() => handleCardChoice('adapter')}
                      onPressIn={handleInteractionStart}
                      onPressOut={handleInteractionEnd}
                      activeOpacity={0.8}
                      disabled={interactionState === 'selected' || interactionState === 'transitioning'}
                    >
                      <View style={styles.cardContentContainer}>
                        <Wand size={24} color="#3b82f6" style={styles.cardIcon} />
                        <Text style={styles.cardText}>Flexible Adapter</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Adapted styles from app/onboarding.tsx
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    flexGrow: 1, // Ensure content can fill screen
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    minHeight: height * 0.8, // Adjust to ensure content fits
    justifyContent: 'center', // Vertically center content in the scroll view
    paddingVertical: 20,
  },
  messagesSection: { // For transition messages
    minHeight: 120,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  interactionSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  cardsContainer: {
    gap: 16,
    width: '100%',
    marginTop: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  cardIcon: {},
  cardText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 22,
  },
});
