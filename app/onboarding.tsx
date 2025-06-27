import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowRight, 
  Compass, 
  Target, 
  Brain, 
  Lightbulb, 
  Star, 
  Shield, 
  Map, 
  Wand, 
  Gift, 
  Leaf, 
  Lock 
} from 'lucide-react-native';
import TypingIndicator from '@/components/TypingIndicator';
import OnboardingStepHeader from '@/components/OnboardingStepHeader';
import OnboardingQuestion from '@/components/OnboardingQuestion';
import OnboardingSliderCard from '@/components/OnboardingSliderCard';
import OnboardingTransitionMessage from '@/components/OnboardingTransitionMessage';
import { OnboardingStep, OnboardingConfig } from './api/onboarding_questions+api';

const { width, height } = Dimensions.get('window');

interface OnboardingData {
  coachingStyle: string;
  conscientiousness: string | null;
  regulatoryFocus: string | null;
  locusOfControl: string | null;
  mindset: string | null;
  extraversion: number;
  agreeableness: number;
  currentFocus: string;
}

type InteractionState = 'none' | 'touching' | 'selected' | 'transitioning';

// Icon mapping for dynamic icon rendering
const iconMap = {
  compass: Compass,
  target: Target,
  brain: Brain,
  lightbulb: Lightbulb,
  star: Star,
  shield: Shield,
  map: Map,
  wand: Wand,
  gift: Gift,
  leaf: Leaf,
  lock: Lock,
};

export default function OnboardingScreen() {
  const { coachingStyle } = useLocalSearchParams<{ coachingStyle: string }>();
  
  // Server data state
  const [onboardingConfig, setOnboardingConfig] = useState<OnboardingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current state
  const [currentStepId, setCurrentStepId] = useState<string>('');
  const [stepHistory, setStepHistory] = useState<string[]>([]);
  const [showContent, setShowContent] = useState(false);
  const [interactionState, setInteractionState] = useState<InteractionState>('none');
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

  // Fetch onboarding configuration from server
  useEffect(() => {
    const fetchOnboardingConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/onboarding_questions');
        if (!response.ok) {
          throw new Error('Failed to fetch onboarding configuration');
        }
        const config: OnboardingConfig = await response.json();
        setOnboardingConfig(config);
        
        // Set initial step and update onboarding data with server defaults
        if (config.steps.length > 0) {
          setCurrentStepId(config.steps[0].id);
          setOnboardingData(prev => ({
            ...config.initialData,
            coachingStyle: prev.coachingStyle, // Preserve coaching style from params
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingConfig();
  }, []);

  // Initialize animations once config is loaded
  useEffect(() => {
    if (!onboardingConfig || loading) return;

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
  }, [onboardingConfig, loading]);

  // Get current step object
  const getCurrentStep = (): OnboardingStep | null => {
    if (!onboardingConfig) return null;
    return onboardingConfig.steps.find(step => step.id === currentStepId) || null;
  };

  // Navigate to next step
  const navigateToStep = (stepId: string, addToHistory: boolean = true) => {
    if (addToHistory) {
      setStepHistory(prev => [...prev, currentStepId]);
    }
    
    setInteractionState('transitioning');
    contentOpacity.value = withTiming(0, { duration: 400 });
    contentTranslateY.value = withTiming(-20, { duration: 400 });
    
    setTimeout(() => {
      setCurrentStepId(stepId);
      setInteractionState('none');
      contentOpacity.value = withTiming(1, { duration: 600 });
      contentTranslateY.value = withTiming(0, { duration: 600 });
    }, 400);
  };

  // Handle back navigation
  const handleBackPress = () => {
    if (stepHistory.length > 0) {
      // Go to previous step
      const previousStepId = stepHistory[stepHistory.length - 1];
      setStepHistory(prev => prev.slice(0, -1));
      navigateToStep(previousStepId, false);
    } else {
      // Exit onboarding
      router.back();
    }
  };

  // Handle choice selection
  const handleChoiceSelection = (choice: any, field?: string) => {
    if (field) {
      setOnboardingData(prev => ({ ...prev, [field]: choice }));
    }
    
    setInteractionState('selected');
    
    const currentStep = getCurrentStep();
    if (currentStep?.nextStep) {
      setTimeout(() => {
        navigateToStep(currentStep.nextStep!);
      }, 300);
    }
  };

  // Handle slider completion
  const handleSliderComplete = () => {
    setInteractionState('selected');
    
    const currentStep = getCurrentStep();
    if (currentStep?.nextStep) {
      setTimeout(() => {
        navigateToStep(currentStep.nextStep!);
      }, 500);
    }
  };

  // Handle slider value change
  const handleSliderValueChange = (value: number, field: string) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  // Handle final submission
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

  // Handle auto-progression for message and transition steps
  const handleAutoProgress = (nextStepId: string, delay: number = 0) => {
    setTimeout(() => {
      navigateToStep(nextStepId);
    }, delay);
  };

  // Handle interaction state changes
  const handleInteractionStart = () => {
    setInteractionState('touching');
  };

  const handleInteractionEnd = () => {
    setInteractionState('none');
  };

  // Get appropriate aura state
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
        if (currentStep?.type === 'messages' || currentStep?.type === 'transition') {
          return 'processing';
        }
        return 'listening';
    }
  };

  // Render step content based on server configuration
  const renderStepContent = () => {
    const currentStep = getCurrentStep();
    if (!currentStep) return null;

    switch (currentStep.type) {
      case 'messages':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              {currentStep.messages?.map((message, index) => (
                <AIMessage
                  key={index}
                  text={message.text}
                  delay={message.delay || 0}
                  onComplete={
                    index === currentStep.messages!.length - 1 && currentStep.autoProgress
                      ? () => handleAutoProgress(currentStep.nextStep!, currentStep.autoProgressDelay)
                      : undefined
                  }
                />
              ))}
            </View>
          </View>
        );

      case 'choice_question':
        const IconComponent = currentStep.question?.icon ? iconMap[currentStep.question.icon as keyof typeof iconMap] : Compass;
        return (
          <View style={styles.stepContainer}>
            <View style={styles.interactionSection}>
              <OnboardingQuestion
                questionText={currentStep.question?.text || ''}
                icon={<IconComponent size={24} color="#94a3b8" strokeWidth={2} />}
              />
              <View style={styles.cardsContainer}>
                {currentStep.choices?.map((choice) => {
                  const ChoiceIcon = iconMap[choice.icon as keyof typeof iconMap] || Compass;
                  return (
                    <TouchableOpacity
                      key={choice.id}
                      style={styles.card}
                      onPress={() => handleChoiceSelection(choice.value, currentStep.field)}
                      onPressIn={handleInteractionStart}
                      onPressOut={handleInteractionEnd}
                      activeOpacity={0.8}
                    >
                      <View style={styles.cardContentContainer}>
                        <ChoiceIcon size={24} color="#3b82f6" style={styles.cardIcon} />
                        <Text style={styles.cardText}>{choice.text}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        );

      case 'slider':
        const SliderIcon = currentStep.slider?.icon ? iconMap[currentStep.slider.icon as keyof typeof iconMap] : Lightbulb;
        return (
          <View style={styles.stepContainer}>
            <View style={styles.interactionSection}>
              <OnboardingSliderCard
                questionText={currentStep.slider?.questionText || ''}
                leftLabel={currentStep.slider?.leftLabel || ''}
                rightLabel={currentStep.slider?.rightLabel || ''}
                value={onboardingData[currentStep.field as keyof OnboardingData] as number}
                onValueChange={(value) => handleSliderValueChange(value, currentStep.field!)}
                onInteractionStart={handleInteractionStart}
                onInteractionEnd={handleInteractionEnd}
                icon={<SliderIcon size={24} color="#94a3b8" strokeWidth={2} />}
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

      case 'transition':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <OnboardingTransitionMessage
                message={currentStep.transition?.message || ''}
                delay={currentStep.transition?.delay || 0}
                onComplete={
                  currentStep.autoProgress
                    ? () => handleAutoProgress(currentStep.nextStep!, currentStep.autoProgressDelay)
                    : undefined
                }
              />
            </View>
          </View>
        );

      case 'text_input':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.interactionSection}>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={onboardingData.currentFocus}
                  onChangeText={(text) => setOnboardingData(prev => ({ ...prev, currentFocus: text }))}
                  onFocus={handleInteractionStart}
                  onBlur={handleInteractionEnd}
                  placeholder={currentStep.textInput?.placeholder || ''}
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
                  {currentStep.textInput?.submitButtonText || 'Continue'}
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

  // Animation styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  // Loading state
  if (loading) {
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
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading onboarding...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Error state
  if (error || !onboardingConfig) {
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
            <Text style={styles.errorText}>
              {error || 'Failed to load onboarding configuration'}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setLoading(true);
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
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

// AI Message Component for rendering messages with typing animation
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
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
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
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
});