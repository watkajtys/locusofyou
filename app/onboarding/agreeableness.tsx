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
import { Target } from 'lucide-react-native'; // Changed icon
import OnboardingStepHeader from '@/components/OnboardingStepHeader';
import OnboardingSliderCard from '@/components/OnboardingSliderCard';
import OnboardingTransitionMessage from '@/components/OnboardingTransitionMessage';
import { useOnboarding } from '@/context/OnboardingContext';

const { width, height } = Dimensions.get('window');

type InteractionState = 'none' | 'touching' | 'selected' | 'transitioning';

export default function AgreeablenessScreen() {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [interactionState, setInteractionState] = useState<InteractionState>('none');
  const [showContent, setShowContent] = useState(false);
  const [showTransition, setShowTransition] = useState(true);

  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const backgroundScale = useSharedValue(1);

  useEffect(() => {
    backgroundScale.value = withSequence(
      withTiming(1.02, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) })
    );
  }, []);

  const animateToShowContent = () => {
    setShowTransition(false);
    setShowContent(true);
    contentOpacity.value = withTiming(1, { duration: 600 });
    contentTranslateY.value = withTiming(0, { duration: 600 });
  };

  const animateToNextStep = () => {
    setInteractionState('transitioning');
    contentOpacity.value = withTiming(0, { duration: 400 });
    contentTranslateY.value = withTiming(-20, { duration: 400 });

    setTimeout(() => {
      router.push('/onboarding/final'); // Next is the final screen
    }, 400);
  };

  const handleSliderComplete = () => {
    setInteractionState('selected');
    setTimeout(() => {
      animateToNextStep();
    }, 500);
  };

  const handleInteractionStart = () => setInteractionState('touching');
  const handleInteractionEnd = () => {
    if (interactionState !== 'selected' && interactionState !== 'transitioning') {
      setInteractionState('none');
    }
  };

  const getAuraState = (): 'idle' | 'listening' | 'processing' | 'responding' => {
    switch (interactionState) {
      case 'touching': return 'processing';
      case 'selected': return 'responding';
      case 'transitioning': return 'processing';
      case 'none':
      default:
        return showTransition ? 'responding' : 'listening';
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
        <LinearGradient colors={['#e0f2fe', '#dbeafe', '#f0f9ff']} style={styles.backgroundGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <OnboardingStepHeader
          onBackPress={() => router.back()}
          auraState={getAuraState()}
        />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {showTransition && (
            <View style={styles.stepContainerMessages}>
              <View style={styles.messagesSection}>
                <OnboardingTransitionMessage
                  message="Got it. One more like that..."
                  delay={0} // No delay if coming from previous slider
                  onComplete={() => setTimeout(animateToShowContent, 800)}
                />
              </View>
            </View>
          )}

          {showContent && (
            <Animated.View style={[styles.content, contentAnimatedStyle]}>
              <View style={styles.stepContainerSlider}>
                <View style={styles.interactionSection}>
                  <OnboardingSliderCard
                    questionText="When someone gives you critical feedback on your work, what's your initial instinct?"
                    leftLabel="Challenge the feedback and defend my position"
                    rightLabel="Find common ground and seek to understand their view"
                    value={onboardingData.agreeableness}
                    onValueChange={(value) => updateOnboardingData({ agreeableness: value })}
                    onInteractionStart={handleInteractionStart}
                    onInteractionEnd={handleInteractionEnd}
                    icon={<Target size={24} color="#94a3b8" strokeWidth={2} />}
                  />
                </View>
                <View style={styles.actionSection}>
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleSliderComplete}
                    onPressIn={handleInteractionStart}
                    onPressOut={handleInteractionEnd}
                    activeOpacity={0.8}
                    disabled={interactionState === 'selected' || interactionState === 'transitioning'}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  backgroundContainer: { position: 'absolute', width: '400%', height: '400%', top: '-150%', left: '-150%', zIndex: -1 },
  backgroundGradient: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, flexGrow: 1 },
  content: { flex: 1 },
  // Specific container for transition message to center it if it's the only thing on screen initially
  stepContainerMessages: {
    minHeight: height * 0.8,
    justifyContent: 'center', // Center message when it's alone
    paddingVertical: 20
  },
  stepContainerSlider: { // Container for when slider and button are visible
    minHeight: height * 0.8,
    justifyContent: 'space-between', // Pushes slider up and button down
    paddingVertical: 20
  },
  messagesSection: {
    flexGrow: 0, // Don't let it grow too much if other content appears
    justifyContent: 'center',
    paddingBottom: 20
  },
  interactionSection: {
    flexGrow: 2, // Allow slider to take more space
    justifyContent: 'center',
    paddingVertical: 20
  },
  actionSection: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    alignItems: 'center'
  },
  continueButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignSelf: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 120,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
});
