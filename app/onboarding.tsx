import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  PanResponder,
  Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Compass, Target, Brain, Lightbulb, Star, Shield, Map, Wand, Gift, Leaf, Lock, Zap } from 'lucide-react-native'; // Added Map, Wand, Gift, Leaf, Lock, Zap (for sparkle)
import TypingIndicator from '@/components/TypingIndicator';
import OnboardingStepHeader from '@/components/OnboardingStepHeader';
import OnboardingQuestion from '@/components/OnboardingQuestion';
import OnboardingChoiceButtons from '@/components/OnboardingChoiceButtons';
import OnboardingSliderCard from '@/components/OnboardingSliderCard';
import OnboardingTransitionMessage from '@/components/OnboardingTransitionMessage';

const { width, height } = Dimensions.get('window');

interface OnboardingData {
  coachingStyle: string;
  conscientiousness: 'planner' | 'adapter' | null;
  regulatoryFocus: 'promotion' | 'prevention' | null;
  locusOfControl: 'internal' | 'external' | null;
  mindset: 'fixed' | 'growth' | null;
  extraversion: number; // 0-100
  agreeableness: number; // 0-100
  currentFocus: string;
}

type InteractionStep =
  | 'initialMessages'
  | 'conscientiousnessQuestion'
  | 'transitionToRegulatory'
  | 'regulatoryFocusQuestion'
  | 'transitionToLocus'
  | 'locusOfControlQuestion'
  | 'transitionToMindset'
  | 'mindsetQuestion'
  | 'transitionToSliders'
  | 'extraversionSlider'
  | 'transitionToAgreeableness'
  | 'agreeablenessSlider'
  | 'finalMessagesAndInput'
  | 'complete';

type InteractionState = 'none' | 'touching' | 'selected' | 'transitioning';

export default function OnboardingScreen() {
  const { coachingStyle } = useLocalSearchParams<{ coachingStyle: string }>();
  const [currentStep, setCurrentStep] = useState<InteractionStep>('initialMessages');
  const [showContent, setShowContent] = useState(false);
  const [interactionState, setInteractionState] = useState<InteractionState>('none');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    coachingStyle: coachingStyle || 'adapter', // Default if not passed via params
    conscientiousness: null,
    regulatoryFocus: null,
    locusOfControl: null,
    mindset: null,
    extraversion: 50,
    agreeableness: 50,
    currentFocus: '',
  });

  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const backgroundScale = useSharedValue(1);

  useEffect(() => {
    // Start background animation
    backgroundScale.value = withSequence(
      withTiming(1.02, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) })
    );

    // Show initial content
    setTimeout(() => {
      setShowContent(true);
      contentOpacity.value = withTiming(1, { duration: 800 });
      contentTranslateY.value = withTiming(0, { duration: 800 });
    }, 500);
  }, []);

  const animateToNextStep = (nextStep: InteractionStep) => {
    setInteractionState('transitioning');
    contentOpacity.value = withTiming(0, { duration: 400 });
    contentTranslateY.value = withTiming(-20, { duration: 400 });
    
    setTimeout(() => {
      setCurrentStep(nextStep);
      setInteractionState('none');
      contentOpacity.value = withTiming(1, { duration: 600 });
      contentTranslateY.value = withTiming(0, { duration: 600 });
    }, 400);
  };

  const handleCardChoice = (choice: string, field: keyof OnboardingData) => {
    setOnboardingData(prev => ({ ...prev, [field]: choice }));
    setInteractionState('selected');
    
    setTimeout(() => {
      switch (currentStep) {
        case 'conscientiousnessQuestion':
          animateToNextStep('transitionToRegulatory');
          break;
        case 'regulatoryFocusQuestion':
          animateToNextStep('transitionToLocus');
          break;
        case 'locusOfControlQuestion':
          animateToNextStep('transitionToMindset');
          break;
        case 'mindsetQuestion':
          animateToNextStep('transitionToSliders');
          break;
        default:
          break;
      }
    }, 300);
  };

  // handleChoiceButtonPress is removed as it's no longer used.
  // The regulatoryFocusQuestion now directly calls handleCardChoice.

  const handleInteractionStart = () => {
    setInteractionState('touching');
  };

  const handleInteractionEnd = () => {
    setInteractionState('none');
  };

  const handleSliderComplete = (stepType: 'extraversionSlider' | 'agreeablenessSlider') => {
    setInteractionState('selected');
    setTimeout(() => {
      if (stepType === 'extraversionSlider') {
        animateToNextStep('transitionToAgreeableness');
      } else if (stepType === 'agreeablenessSlider') {
        animateToNextStep('finalMessagesAndInput');
      }
    }, 500);
  };

  const handleFinalSubmit = () => {
    if (onboardingData.currentFocus.trim()) {
      setInteractionState('selected');
      setTimeout(() => {
        router.push({
          pathname: '/chat',
          params: { 
            coachingStyle: onboardingData.coachingStyle,
            onboardingData: JSON.stringify(onboardingData)
          }
        });
      }, 300);
    }
  };

  // Get appropriate aura state based on current step and interaction
  const getAuraState = (): 'idle' | 'listening' | 'processing' | 'responding' => {
    // Override based on interaction state
    switch (interactionState) {
      case 'touching':
        return 'processing';
      case 'selected':
        return 'responding';
      case 'transitioning':
        return 'processing';
      case 'none':
      default:
        // Base state on current step
        switch (currentStep) {
          case 'initialMessages':
          case 'transitionToRegulatory':
          case 'transitionToLocus':
          case 'transitionToMindset':
          case 'transitionToSliders':
          case 'transitionToAgreeableness':
          case 'finalMessagesAndInput': // Part of this is messages
            return 'processing'; // Or 'responding' if AI is "speaking"
          case 'conscientiousnessQuestion':
          case 'regulatoryFocusQuestion':
          case 'locusOfControlQuestion':
          case 'mindsetQuestion':
          case 'extraversionSlider':
          case 'agreeablenessSlider':
            return 'listening';
          default:
            return 'idle';
        }
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'initialMessages':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <AIMessage text="Welcome." />
              <AIMessage text="I'm here to be a supportive partner, at your pace. No pressure." delay={1200} />
              <AIMessage
                text="To get started, I have one quick question to understand your style."
                delay={3000}
                onComplete={() => setTimeout(() => animateToNextStep('conscientiousnessQuestion'), 1000)}
              />
            </View>
          </View>
        );

      case 'conscientiousnessQuestion':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.interactionSection}>
              <OnboardingQuestion
                questionText="When you're at your best, are you more of a meticulous planner who loves a detailed roadmap, or a flexible adapter who thrives on creative problem-solving?"
                // Icon can be dynamic based on question, or a generic one. For now, no icon here.
              />
              <View style={styles.cardsContainer}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('planner', 'conscientiousness')}
                  onPressIn={handleInteractionStart}
                  onPressOut={handleInteractionEnd}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContentContainer}>
                    <Map size={24} color="#3b82f6" style={styles.cardIcon} />
                    <Text style={styles.cardText}>Meticulous Planner</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('adapter', 'conscientiousness')}
                  onPressIn={handleInteractionStart}
                  onPressOut={handleInteractionEnd}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContentContainer}>
                    <Wand size={24} color="#3b82f6" style={styles.cardIcon} />
                    <Text style={styles.cardText}>Flexible Adapter</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 'transitionToRegulatory':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <OnboardingTransitionMessage
                message="Got it. That's helpful. A few more quick questions to get a clearer picture of your style. Just choose the one that feels closer to your truth."
                onComplete={() => setTimeout(() => animateToNextStep('regulatoryFocusQuestion'), 1000)}
              />
            </View>
          </View>
        );

      case 'regulatoryFocusQuestion':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.interactionSection}>
              <OnboardingQuestion
                questionText="Thinking about what drives you towards a goal, does it feel more like you're striving to achieve a positive outcome, or more like you're working hard to prevent a negative one?"
              />
              <View style={styles.cardsContainer}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('promotion', 'regulatoryFocus')}
                  onPressIn={handleInteractionStart}
                  onPressOut={handleInteractionEnd}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContentContainer}>
                    <Star size={24} color="#3b82f6" style={styles.cardIcon} />
                    <Text style={styles.cardText}>Striving to achieve a positive outcome</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('prevention', 'regulatoryFocus')}
                  onPressIn={handleInteractionStart}
                  onPressOut={handleInteractionEnd}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContentContainer}>
                    <Shield size={24} color="#3b82f6" style={styles.cardIcon} />
                    <Text style={styles.cardText}>Working hard to prevent a negative one</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 'transitionToLocus':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <OnboardingTransitionMessage
                message="Okay, next..."
                onComplete={() => setTimeout(() => animateToNextStep('locusOfControlQuestion'), 800)}
              />
            </View>
          </View>
        );

      case 'locusOfControlQuestion':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.interactionSection}>
              <OnboardingQuestion
                questionText="When you achieve a major success, do you tend to credit it more to your disciplined preparation and hard work, or to being in the right place at the right time?"
              />
              <View style={styles.cardsContainer}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('internal', 'locusOfControl')}
                  onPressIn={handleInteractionStart}
                  onPressOut={handleInteractionEnd}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContentContainer}>
                    <Brain size={24} color="#3b82f6" style={styles.cardIcon} />
                    <Text style={styles.cardText}>Disciplined preparation and hard work</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('external', 'locusOfControl')}
                  onPressIn={handleInteractionStart}
                  onPressOut={handleInteractionEnd}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContentContainer}>
                    <Gift size={24} color="#3b82f6" style={styles.cardIcon} />
                    <Text style={styles.cardText}>Being in the right place at the right time</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 'transitionToMindset':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <OnboardingTransitionMessage
                message="Last one like this..."
                onComplete={() => setTimeout(() => animateToNextStep('mindsetQuestion'), 800)}
              />
            </View>
          </View>
        );

      case 'mindsetQuestion':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.interactionSection}>
              <OnboardingQuestion
                questionText="Do you feel that a person's ability to stay focused and organized is something they're mostly born with, or is it a skill that can be developed over time with the right strategies?"
              />
              <View style={styles.cardsContainer}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('fixed', 'mindset')}
                  onPressIn={handleInteractionStart}
                  onPressOut={handleInteractionEnd}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContentContainer}>
                    <Lock size={24} color="#3b82f6" style={styles.cardIcon} />
                    <Text style={styles.cardText}>Mostly born with it</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('growth', 'mindset')}
                  onPressIn={handleInteractionStart}
                  onPressOut={handleInteractionEnd}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContentContainer}>
                    <Leaf size={24} color="#3b82f6" style={styles.cardIcon} />
                    <Text style={styles.cardText}>A skill that can be developed</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 'transitionToSliders':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <OnboardingTransitionMessage
                message="Thanks for that. Now for a couple of questions on a different note. For these, just slide to the point on the scale that feels most like you."
                onComplete={() => setTimeout(() => animateToNextStep('extraversionSlider'), 1200)}
              />
            </View>
          </View>
        );

      case 'extraversionSlider':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.interactionSection}>
              <OnboardingSliderCard
                questionText="When it comes to tackling a big project, where do you draw your energy from?"
                leftLabel="Working quietly on my own"
                rightLabel="Bouncing ideas off of a group"
                value={onboardingData.extraversion}
                onValueChange={(value) => setOnboardingData(prev => ({ ...prev, extraversion: value }))}
                onInteractionStart={handleInteractionStart}
                onInteractionEnd={handleInteractionEnd}
                icon={<Lightbulb size={24} color="#94a3b8" strokeWidth={2} />}
              />
            </View>
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => handleSliderComplete('extraversionSlider')}
                onPressIn={handleInteractionStart}
                onPressOut={handleInteractionEnd}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'transitionToAgreeableness':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <OnboardingTransitionMessage
                message="Got it. One more like that..."
                delay={0}
                onComplete={() => setTimeout(() => animateToNextStep('agreeablenessSlider'), 800)}
              />
            </View>
          </View>
        );

      case 'agreeablenessSlider':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.interactionSection}>
              <OnboardingSliderCard
                questionText="When someone gives you critical feedback on your work, what's your initial instinct?"
                leftLabel="Challenge the feedback and defend my position"
                rightLabel="Find common ground and seek to understand their view"
                value={onboardingData.agreeableness}
                onValueChange={(value) => setOnboardingData(prev => ({ ...prev, agreeableness: value }))}
                onInteractionStart={handleInteractionStart}
                onInteractionEnd={handleInteractionEnd}
                icon={<Target size={24} color="#94a3b8" strokeWidth={2} />} // Consider changing icon
              />
            </View>
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => handleSliderComplete('agreeablenessSlider')}
                onPressIn={handleInteractionStart}
                onPressOut={handleInteractionEnd}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'finalMessagesAndInput':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <AIMessage text="Perfect. That gives me a complete picture of your unique style." />
              <AIMessage text="Now, let's bring the focus to you." delay={1200} />
              <AIMessage text="What's on your mind right now that feels most important?" delay={2400} />
            </View>
            <View style={styles.interactionSection}>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={onboardingData.currentFocus}
                  onChangeText={(text) => setOnboardingData(prev => ({ ...prev, currentFocus: text }))}
                  onFocus={handleInteractionStart}
                  onBlur={handleInteractionEnd}
                  placeholder="Share what's most important to you right now..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
              </View>
            </View>
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  onboardingData.currentFocus.trim() ? styles.submitButtonActive : styles.submitButtonInactive
                ]}
                onPress={handleFinalSubmit}
                onPressIn={handleInteractionStart}
                onPressOut={handleInteractionEnd}
                disabled={!onboardingData.currentFocus.trim()}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.submitButtonText,
                  onboardingData.currentFocus.trim() ? styles.submitButtonTextActive : styles.submitButtonTextInactive
                ]}>
                  Begin Coaching
                </Text>
                <ArrowRight size={20} color={onboardingData.currentFocus.trim() ? '#ffffff' : '#94a3b8'} />
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
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
      {/* Animated Background */}
      <Animated.View style={[styles.backgroundContainer, backgroundAnimatedStyle]}>
        <LinearGradient
          colors={['#e0f2fe', '#dbeafe', '#f0f9ff']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <OnboardingStepHeader 
          onBackPress={() => router.back()}
          auraState={getAuraState()}
        />

        {/* Content Area */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {showContent && (
            <Animated.View style={[styles.content, contentAnimatedStyle]}>
              {getStepContent()}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const AIMessage = ({ 
  text, 
  delay = 0,
  onComplete
}: { 
  text: string; 
  delay?: number;
  onComplete?: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    setTimeout(() => {
      setShowMessage(true);
      opacity.value = withTiming(1, { duration: 600 });
      translateY.value = withTiming(0, { duration: 600 });

      setTimeout(() => {
        setIsLoading(false);
        onComplete?.();
      }, 1200);
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!showMessage) return null;

  return (
    <Animated.View style={[styles.aiMessageContainer, animatedStyle]}>
      <View style={styles.aiMessageBubble}>
        {isLoading ? (
          <TypingIndicator isVisible={true} showBubble={false} />
        ) : (
          <Text style={styles.aiMessageText}>{text}</Text>
        )}
      </View>
    </Animated.View>
  );
};

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
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    minHeight: height - 150,
    paddingVertical: 20,
  },
  messagesSection: {
    minHeight: 120,
    paddingBottom: 20,
  },
  interactionSection: {
    flex: 1,
    minHeight: 200,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  actionSection: {
    minHeight: 80,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
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
    minHeight: 44,
  },
  aiMessageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
  },
  choiceButtonsContainer: {
    marginTop: 32,
    width: '100%',
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
    alignItems: 'center', // Center content for the new layout
    justifyContent: 'center', // Center content for the new layout
  },
  cardContentContainer: { // New style for icon + text
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10, // Space between icon and text
  },
  cardIcon: { // New style for icon in card
    marginRight: 0, // Reset if it was part of a global style elsewhere
  },
  cardText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 22,
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
  textInputContainer: {
    width: '100%',
    marginTop: 20,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    height: 140,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignSelf: 'center',
    minWidth: 180,
  },
  submitButtonActive: {
    backgroundColor: '#3b82f6',
  },
  submitButtonInactive: {
    backgroundColor: '#e2e8f0',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  submitButtonTextActive: {
    color: '#ffffff',
  },
  submitButtonTextInactive: {
    color: '#94a3b8',
  },
});