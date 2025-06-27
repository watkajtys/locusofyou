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
import { Lightbulb } from 'lucide-react-native';
import OnboardingStepHeader from '@/components/OnboardingStepHeader';
import OnboardingSliderCard from '@/components/OnboardingSliderCard';
import OnboardingTransitionMessage from '@/components/OnboardingTransitionMessage';
import { useOnboarding } from '@/context/OnboardingContext';

const { width, height } = Dimensions.get('window');

type InteractionState = 'none' | 'touching' | 'selected' | 'transitioning';

export default function ExtraversionScreen() {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [interactionState, setInteractionState] = useState<InteractionState>('none');
  const [showContent, setShowContent] = useState(false);
  const [showTransition, setShowTransition] = useState(true); // Start with transition message

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
      router.push('/onboarding/agreeableness');
    }, 400);
  };

  const handleSliderComplete = () => {
    setInteractionState('selected');
    // Value is already updated in context by OnboardingSliderCard's onValueChange
    setTimeout(() => {
      animateToNextStep();
    }, 500); // Short delay for visual feedback
  };

  const handleInteractionStart = () => setInteractionState('touching');
  const handleInteractionEnd = () => {
    // If not selected, return to listening. If selected, it will transition.
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
            <View style={styles.stepContainer}>
              <View style={styles.messagesSection}>
                <OnboardingTransitionMessage
                  message="Thanks for that. Now for a couple of questions on a different note. For these, just slide to the point on the scale that feels most like you."
                  onComplete={() => setTimeout(animateToShowContent, 1200)}
                />
              </View>
            </View>
          )}

          {showContent && (
            <Animated.View style={[styles.content, contentAnimatedStyle]}>
              <View style={styles.stepContainer}>
                <View style={styles.interactionSection}>
                  <OnboardingSliderCard
                    questionText="When it comes to tackling a big project, where do you draw your energy from?"
                    leftLabel="Working quietly on my own"
                    rightLabel="Bouncing ideas off of a group"
                    value={onboardingData.extraversion}
                    onValueChange={(value) => updateOnboardingData({ extraversion: value })}
                    onInteractionStart={handleInteractionStart}
                    onInteractionEnd={handleInteractionEnd}
                    icon={<Lightbulb size={24} color="#94a3b8" strokeWidth={2} />}
                  />
                </View>
                <View style={styles.actionSection}>
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleSliderComplete}
                    onPressIn={handleInteractionStart} // Consider if this is needed for button too
                    onPressOut={handleInteractionEnd}  // Consider if this is needed for button too
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
  stepContainer: { minHeight: height * 0.8, justifyContent: 'space-between', paddingVertical: 20 }, // Use space-between
  messagesSection: { flex: 1, justifyContent: 'center', paddingBottom: 20 }, // Allow message to take space
  interactionSection: { flex: 2, justifyContent: 'center', paddingVertical: 20 }, // Slider takes more space
  actionSection: { flex: 1, justifyContent: 'flex-end', paddingBottom: 20, alignItems: 'center' }, // Align button center
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
