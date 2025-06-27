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
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Compass, Target, Brain, Lightbulb, Star, Shield, Map, Wand, Gift, Leaf, Lock, Zap, Microscope, Heart } from 'lucide-react-native';
import TypingIndicator from '@/components/TypingIndicator';
import OnboardingStepHeader from '@/components/OnboardingStepHeader';
import OnboardingQuestion from '@/components/OnboardingQuestion';
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

interface OnboardingStep {
  id: string;
  type: 'messages' | 'cardChoice' | 'transitionMessage' | 'slider' | 'finalInput';
  question?: string;
  message?: string;
  messages?: Array<{ text: string; delay: number }>;
  choices?: Array<{
    id: string;
    text: string;
    icon: string;
    value: string;
  }>;
  leftLabel?: string;
  rightLabel?: string;
  field?: keyof OnboardingData;
  icon?: string;
  inputPlaceholder?: string;
  submitButtonText?: string;
  nextStep?: string;
  previousStep?: string;
}

interface OnboardingApiResponse {
  framing: {
    headline: string;
    subHeadline: string;
    trustPillars: Array<{ icon: string; text: string }>;
    buttonText: string;
  };
  steps: OnboardingStep[];
}

type InteractionState = 'none' | 'touching' | 'selected' | 'transitioning';

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'map': return Map;
    case 'wand': return Wand;
    case 'star': return Star;
    case 'shield': return Shield;
    case 'brain': return Brain;
    case 'gift': return Gift;
    case 'lock': return Lock;
    case 'leaf': return Leaf;
    case 'lightbulb': return Lightbulb;
    case 'target': return Target;
    case 'microscope': return Microscope;
    case 'heart': return Heart;
    default: return Compass;
  }
};

export default function OnboardingScreen() {
  const { coachingStyle } = useLocalSearchParams<{ coachingStyle: string }>();
  const [onboardingConfig, setOnboardingConfig] = useState<OnboardingApiResponse | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string>('initialMessages');
  const [showContent, setShowContent] = useState(false);
  const [interactionState, setInteractionState] = useState<InteractionState>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add transition control to prevent duplicate transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    coachingStyle: coachingStyle || 'adapter',
    conscientiousness: null,
    regulatoryFocus: null,
    locusOfControl: null,
    mindset: null,
    extraversion: 50,
    agreeableness: 50,
    currentFocus: '',
  });

  // Enhanced animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const contentScale = useSharedValue(0.95);
  const backgroundScale = useSharedValue(1);
  const backgroundRotation = useSharedValue(0);
  const questionOpacity = useSharedValue(0);
  const questionTranslateY = useSharedValue(20);
  const questionScale = useSharedValue(0.95);
  const continueButtonScale = useSharedValue(1);
  const submitButtonScale = useSharedValue(1);

  // Cleanup function for transitions
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Fetch onboarding configuration from API
  useEffect(() => {
    const fetchOnboardingConfig = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/onboarding');
        if (!response.ok) {
          throw new Error('Failed to fetch onboarding configuration');
        }
        const config = await response.json();
        setOnboardingConfig(config);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardingConfig();
  }, []);

  useEffect(() => {
    if (onboardingConfig && !isLoading) {
      // Enhanced background animation
      backgroundScale.value = withSequence(
        withTiming(1.02, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) })
      );

      backgroundRotation.value = withTiming(360, { 
        duration: 120000, 
        easing: Easing.linear 
      });

      // Show initial content with enhanced animation
      setTimeout(() => {
        setShowContent(true);
        contentOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        contentTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
        contentScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      }, 500);
    }
  }, [onboardingConfig, isLoading]);

  // Trigger question animation when step changes
  useEffect(() => {
    const currentStep = getCurrentStep();
    if (currentStep?.type === 'cardChoice' || currentStep?.type === 'slider') {
      // Reset and animate question
      questionOpacity.value = 0;
      questionTranslateY.value = 20;
      questionScale.value = 0.95;
      
      setTimeout(() => {
        questionOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        questionTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
        questionScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      }, 200);
    }
  }, [currentStepId]);

  const getCurrentStep = (): OnboardingStep | null => {
    if (!onboardingConfig) return null;
    return onboardingConfig.steps.find(step => step.id === currentStepId) || null;
  };

  // Improved transition function with better control
  const scheduleTransition = (nextStepId: string, delay: number = 0) => {
    // Clear any existing transition timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Prevent duplicate transitions
    if (isTransitioning) {
      console.log('Transition already in progress, ignoring duplicate call');
      return;
    }

    console.log(`Scheduling transition from ${currentStepId} to ${nextStepId} in ${delay}ms`);

    transitionTimeoutRef.current = setTimeout(() => {
      animateToNextStep(nextStepId);
    }, delay);
  };

  const animateToNextStep = (nextStepId: string) => {
    // Prevent duplicate transitions
    if (isTransitioning) {
      console.log('Already transitioning, ignoring call to animateToNextStep');
      return;
    }

    console.log(`Starting transition from ${currentStepId} to ${nextStepId}`);
    
    setIsTransitioning(true);
    setInteractionState('transitioning');
    
    contentOpacity.value = withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) });
    contentTranslateY.value = withTiming(-20, { duration: 400, easing: Easing.in(Easing.quad) });
    contentScale.value = withTiming(0.98, { duration: 400, easing: Easing.in(Easing.quad) });
    
    setTimeout(() => {
      setCurrentStepId(nextStepId);
      setInteractionState('none');
      setIsTransitioning(false);
      
      contentOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      contentTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      contentScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      
      console.log(`Transition complete. Now on step: ${nextStepId}`);
    }, 400);
  };

  const handleCardChoice = (choice: string, field: keyof OnboardingData) => {
    const currentStep = getCurrentStep();
    if (!currentStep || isTransitioning) return;

    console.log(`Card choice made: ${choice} for field: ${field}`);
    
    setOnboardingData(prev => ({ ...prev, [field]: choice }));
    setInteractionState('selected');
    
    setTimeout(() => {
      if (currentStep.nextStep) {
        scheduleTransition(currentStep.nextStep, 300);
      }
    }, 0);
  };

  const handleBackPress = () => {
    if (isTransitioning) return;
    
    const currentStep = getCurrentStep();
    if (!currentStep || !currentStep.previousStep) {
      // If no previous step, go back to the previous screen
      router.back();
      return;
    }

    // Navigate to the previous step
    animateToNextStep(currentStep.previousStep);
  };

  const handleInteractionStart = () => {
    if (!isTransitioning) {
      setInteractionState('touching');
    }
  };

  const handleInteractionEnd = () => {
    if (!isTransitioning) {
      setInteractionState('none');
    }
  };

  const handleSliderComplete = () => {
    const currentStep = getCurrentStep();
    if (!currentStep || isTransitioning) return;

    setInteractionState('selected');
    // Enhanced button press animation
    continueButtonScale.value = withSequence(
      withSpring(0.95, { damping: 15, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
    
    setTimeout(() => {
      if (currentStep.nextStep) {
        scheduleTransition(currentStep.nextStep, 500);
      }
    }, 0);
  };

  const handleFinalSubmit = () => {
    if (onboardingData.currentFocus.trim() && !isTransitioning) {
      setInteractionState('selected');
      // Enhanced button press animation
      submitButtonScale.value = withSequence(
        withSpring(0.95, { damping: 15, stiffness: 300 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
      
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

  // Enhanced button press handlers
  const handleContinueButtonPressIn = () => {
    if (!isTransitioning) {
      handleInteractionStart();
      continueButtonScale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handleContinueButtonPressOut = () => {
    if (!isTransitioning) {
      handleInteractionEnd();
      continueButtonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const handleSubmitButtonPressIn = () => {
    if (!isTransitioning) {
      handleInteractionStart();
      submitButtonScale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handleSubmitButtonPressOut = () => {
    if (!isTransitioning) {
      handleInteractionEnd();
      submitButtonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  // Get appropriate aura state based on current step and interaction
  const getAuraState = (): 'idle' | 'listening' | 'processing' | 'responding' => {
    switch (interactionState) {
      case 'touching':
        return 'processing';
      case 'selected':
        return 'responding';
      case 'transitioning':
        return 'processing';
      case 'none':
      default:
        const currentStep = getCurrentStep();
        if (!currentStep) return 'idle';
        
        switch (currentStep.type) {
          case 'messages':
          case 'transitionMessage':
          case 'finalInput':
            return 'processing';
          case 'cardChoice':
          case 'slider':
            return 'listening';
          default:
            return 'idle';
        }
    }
  };

  // Improved message completion handler
  const handleMessageSequenceComplete = (stepId: string) => {
    const currentStep = getCurrentStep();
    if (!currentStep || currentStep.id !== stepId || isTransitioning) {
      console.log('Message completion ignored - step mismatch or transitioning');
      return;
    }

    console.log(`Message sequence complete for step: ${stepId}`);
    
    if (currentStep.nextStep) {
      scheduleTransition(currentStep.nextStep, 1000);
    }
  };

  // Improved transition message completion handler  
  const handleTransitionMessageComplete = (stepId: string) => {
    const currentStep = getCurrentStep();
    if (!currentStep || currentStep.id !== stepId || isTransitioning) {
      console.log('Transition message completion ignored - step mismatch or transitioning');
      return;
    }

    console.log(`Transition message complete for step: ${stepId}`);
    
    if (currentStep.nextStep) {
      scheduleTransition(currentStep.nextStep, 800);
    }
  };

  const renderStepContent = () => {
    const currentStep = getCurrentStep();
    if (!currentStep) return null;

    switch (currentStep.type) {
      case 'messages':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              {currentStep.messages?.map((msg, index) => (
                <AIMessage 
                  key={`${currentStep.id}-msg-${index}`}
                  text={msg.text} 
                  delay={msg.delay}
                  onComplete={index === currentStep.messages!.length - 1 ? 
                    () => handleMessageSequenceComplete(currentStep.id) : 
                    undefined
                  }
                />
              ))}
            </View>
          </View>
        );

      case 'cardChoice':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.interactionSection}>
              <Animated.View style={[
                styles.questionWrapper,
                {
                  opacity: questionOpacity,
                  transform: [
                    { translateY: questionTranslateY },
                    { scale: questionScale }
                  ]
                }
              ]}>
                <OnboardingQuestion questionText={currentStep.question || ''} />
              </Animated.View>
              <View style={styles.cardsContainer}>
                {currentStep.choices?.map((choice) => {
                  const IconComponent = getIconComponent(choice.icon);
                  return (
                    <TouchableOpacity
                      key={choice.id}
                      style={styles.card}
                      onPress={() => handleCardChoice(choice.value, currentStep.field!)}
                      onPressIn={handleInteractionStart}
                      onPressOut={handleInteractionEnd}
                      activeOpacity={0.8}
                      disabled={isTransitioning}
                    >
                      <View style={styles.cardContentContainer}>
                        <IconComponent size={24} color="#3b82f6" style={styles.cardIcon} />
                        <Text style={styles.cardText}>{choice.text}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        );

      case 'transitionMessage':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <OnboardingTransitionMessage
                key={currentStep.id} // Force re-render with step id
                message={currentStep.message || ''}
                onComplete={() => handleTransitionMessageComplete(currentStep.id)}
              />
            </View>
          </View>
        );

      case 'slider':
        const IconComponent = currentStep.icon ? getIconComponent(currentStep.icon) : undefined;
        return (
          <View style={styles.stepContainer}>
            <View style={styles.interactionSection}>
              <Animated.View style={[
                styles.questionWrapper,
                {
                  opacity: questionOpacity,
                  transform: [
                    { translateY: questionTranslateY },
                    { scale: questionScale }
                  ]
                }
              ]}>
                <OnboardingSliderCard
                  questionText={currentStep.question || ''}
                  leftLabel={currentStep.leftLabel || ''}
                  rightLabel={currentStep.rightLabel || ''}
                  value={onboardingData[currentStep.field as keyof OnboardingData] as number}
                  onValueChange={(value) => setOnboardingData(prev => ({ 
                    ...prev, 
                    [currentStep.field!]: value 
                  }))}
                  onInteractionStart={handleInteractionStart}
                  onInteractionEnd={handleInteractionEnd}
                  disabled={isTransitioning}
                  icon={IconComponent ? <IconComponent size={24} color="#94a3b8" strokeWidth={2} /> : undefined}
                />
              </Animated.View>
            </View>
            <View style={styles.actionSection}>
              <Animated.View style={[
                styles.buttonWrapper,
                { transform: [{ scale: continueButtonScale }] }
              ]}>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleSliderComplete}
                  onPressIn={handleContinueButtonPressIn}
                  onPressOut={handleContinueButtonPressOut}
                  activeOpacity={0.9}
                  disabled={isTransitioning}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        );

      case 'finalInput':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              {currentStep.messages?.map((msg, index) => (
                <AIMessage 
                  key={`${currentStep.id}-msg-${index}`}
                  text={msg.text} 
                  delay={msg.delay}
                />
              ))}
            </View>
            <View style={styles.interactionSection}>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={onboardingData.currentFocus}
                  onChangeText={(text) => setOnboardingData(prev => ({ ...prev, currentFocus: text }))}
                  onFocus={handleInteractionStart}
                  onBlur={handleInteractionEnd}
                  placeholder={currentStep.inputPlaceholder || "Share what's most important to you right now..."}
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  editable={!isTransitioning}
                />
              </View>
            </View>
            <View style={styles.actionSection}>
              <Animated.View style={[
                styles.buttonWrapper,
                { transform: [{ scale: submitButtonScale }] }
              ]}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    onboardingData.currentFocus.trim() ? styles.submitButtonActive : styles.submitButtonInactive
                  ]}
                  onPress={handleFinalSubmit}
                  onPressIn={handleSubmitButtonPressIn}
                  onPressOut={handleSubmitButtonPressOut}
                  disabled={!onboardingData.currentFocus.trim() || isTransitioning}
                  activeOpacity={0.9}
                >
                  <Text style={[
                    styles.submitButtonText,
                    onboardingData.currentFocus.trim() ? styles.submitButtonTextActive : styles.submitButtonTextInactive
                  ]}>
                    {currentStep.submitButtonText || 'Begin Coaching'}
                  </Text>
                  <ArrowRight size={20} color={onboardingData.currentFocus.trim() ? '#ffffff' : '#94a3b8'} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  // Enhanced animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: backgroundScale.value },
      { rotate: `${backgroundRotation.value}deg` }
    ],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      { translateY: contentTranslateY.value },
      { scale: contentScale.value }
    ],
  }));

  // Show loading state
  if (isLoading) {
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
          <View style={styles.loadingContainer}>
            <TypingIndicator isVisible={true} showBubble={true} />
            <Text style={styles.loadingText}>Loading your discovery journey...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Show error state
  if (error) {
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
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load onboarding</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => window.location.reload()}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Animated Background */}
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
          onBackPress={handleBackPress}
          auraState={getAuraState()}
        />

        {/* Content Area */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isTransitioning}
        >
          {showContent && (
            <Animated.View style={[styles.content, contentAnimatedStyle]}>
              {renderStepContent()}
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
  const [hasCompleted, setHasCompleted] = useState(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowMessage(true);
      opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });

      setTimeout(() => {
        setIsLoading(false);
        if (!hasCompleted && onComplete) {
          setHasCompleted(true);
          onComplete();
        }
      }, 1200);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, onComplete, hasCompleted]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
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
  questionWrapper: {
    width: '100%',
  },
  buttonWrapper: {
    alignSelf: 'center',
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
  cardIcon: {
    marginRight: 0,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
});