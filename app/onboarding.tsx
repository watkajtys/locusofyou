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

  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const backgroundScale = useSharedValue(1);

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
    }
  }, [onboardingConfig, isLoading]);

  const getCurrentStep = (): OnboardingStep | null => {
    if (!onboardingConfig) return null;
    return onboardingConfig.steps.find(step => step.id === currentStepId) || null;
  };

  const animateToNextStep = (nextStepId: string) => {
    setInteractionState('transitioning');
    contentOpacity.value = withTiming(0, { duration: 400 });
    contentTranslateY.value = withTiming(-20, { duration: 400 });
    
    setTimeout(() => {
      setCurrentStepId(nextStepId);
      setInteractionState('none');
      contentOpacity.value = withTiming(1, { duration: 600 });
      contentTranslateY.value = withTiming(0, { duration: 600 });
    }, 400);
  };

  const handleCardChoice = (choice: string, field: keyof OnboardingData) => {
    const currentStep = getCurrentStep();
    if (!currentStep) return;

    setOnboardingData(prev => ({ ...prev, [field]: choice }));
    setInteractionState('selected');
    
    setTimeout(() => {
      if (currentStep.nextStep) {
        animateToNextStep(currentStep.nextStep);
      }
    }, 300);
  };

  const handleBackPress = () => {
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
    setInteractionState('touching');
  };

  const handleInteractionEnd = () => {
    setInteractionState('none');
  };

  const handleSliderComplete = () => {
    const currentStep = getCurrentStep();
    if (!currentStep) return;

    setInteractionState('selected');
    setTimeout(() => {
      if (currentStep.nextStep) {
        animateToNextStep(currentStep.nextStep);
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
                  key={index}
                  text={msg.text} 
                  delay={msg.delay}
                  onComplete={index === currentStep.messages!.length - 1 && currentStep.nextStep ? 
                    () => setTimeout(() => animateToNextStep(currentStep.nextStep!), 1000) : 
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
              <OnboardingQuestion questionText={currentStep.question || ''} />
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
                message={currentStep.message || ''}
                onComplete={() => setTimeout(() => {
                  if (currentStep.nextStep) {
                    animateToNextStep(currentStep.nextStep);
                  }
                }, 1000)}
              />
            </View>
          </View>
        );

      case 'slider':
        const IconComponent = currentStep.icon ? getIconComponent(currentStep.icon) : undefined;
        return (
          <View style={styles.stepContainer}>
            <View style={styles.interactionSection}>
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
                icon={IconComponent ? <IconComponent size={24} color="#94a3b8" strokeWidth={2} /> : undefined}
              />
            </View>
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleSliderComplete}
                onPressIn={handleInteractionStart}
                onPressOut={handleInteractionEnd}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'finalInput':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              {currentStep.messages?.map((msg, index) => (
                <AIMessage 
                  key={index}
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
                  {currentStep.submitButtonText || 'Begin Coaching'}
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
          onBackPress={handleBackPress}
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