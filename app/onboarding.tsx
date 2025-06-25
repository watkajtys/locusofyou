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
import { Brain, ChevronLeft, ArrowRight } from 'lucide-react-native';
import TypingIndicator from '@/components/TypingIndicator';

const { width, height } = Dimensions.get('window');

interface OnboardingData {
  coachingStyle: string;
  regulatoryFocus: 'promotion' | 'prevention' | null;
  locusOfControl: 'internal' | 'external' | null;
  mindset: 'fixed' | 'growth' | null;
  extraversion: number; // 0-100
  agreeableness: number; // 0-100
  currentFocus: string;
}

type InteractionStep = 
  | 'welcome'
  | 'question1' 
  | 'question2'
  | 'question3'
  | 'question4'
  | 'slider1'
  | 'slider2'
  | 'final-question'
  | 'complete';

const SliderComponent = ({ 
  leftLabel, 
  rightLabel, 
  value, 
  onValueChange,
  disabled = false 
}: {
  leftLabel: string;
  rightLabel: string;
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}) => {
  const sliderWidth = width - 96; // Account for container padding
  const thumbPosition = useRef(new RNAnimated.Value((value / 100) * sliderWidth)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderMove: (_, gestureState) => {
      if (disabled) return;
      
      const newPosition = Math.max(0, Math.min(sliderWidth, gestureState.moveX - 48));
      thumbPosition.setValue(newPosition);
      
      const newValue = Math.round((newPosition / sliderWidth) * 100);
      onValueChange(newValue);
    },
  });

  useEffect(() => {
    RNAnimated.timing(thumbPosition, {
      toValue: (value / 100) * sliderWidth,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, sliderWidth]);

  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.sliderLabel}>{leftLabel}</Text>
      <View style={styles.sliderTrack} {...panResponder.panHandlers}>
        <View style={styles.sliderLine} />
        <RNAnimated.View 
          style={[
            styles.sliderThumb,
            {
              left: thumbPosition,
            }
          ]} 
        />
      </View>
      <Text style={styles.sliderLabel}>{rightLabel}</Text>
    </View>
  );
};

export default function OnboardingScreen() {
  const { coachingStyle } = useLocalSearchParams<{ coachingStyle: string }>();
  const [currentStep, setCurrentStep] = useState<InteractionStep>('welcome');
  const [showContent, setShowContent] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    coachingStyle: coachingStyle || 'adapter',
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
    contentOpacity.value = withTiming(0, { duration: 400 });
    contentTranslateY.value = withTiming(-20, { duration: 400 });
    
    setTimeout(() => {
      setCurrentStep(nextStep);
      contentOpacity.value = withTiming(1, { duration: 600 });
      contentTranslateY.value = withTiming(0, { duration: 600 });
    }, 400);
  };

  const handleCardChoice = (choice: string, field: keyof OnboardingData) => {
    setOnboardingData(prev => ({ ...prev, [field]: choice }));
    
    setTimeout(() => {
      switch (currentStep) {
        case 'question1':
          animateToNextStep('question2');
          break;
        case 'question2':
          animateToNextStep('question3');
          break;
        case 'question3':
          animateToNextStep('question4');
          break;
        case 'question4':
          animateToNextStep('slider1');
          break;
        default:
          break;
      }
    }, 300);
  };

  const handleSliderComplete = () => {
    setTimeout(() => {
      if (currentStep === 'slider1') {
        animateToNextStep('slider2');
      } else if (currentStep === 'slider2') {
        animateToNextStep('final-question');
      }
    }, 500);
  };

  const handleFinalSubmit = () => {
    if (onboardingData.currentFocus.trim()) {
      router.push({
        pathname: '/chat',
        params: { 
          coachingStyle: onboardingData.coachingStyle,
          onboardingData: JSON.stringify(onboardingData)
        }
      });
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <AIMessage text="Got it. That's helpful." />
              <AIMessage 
                text="A few more quick questions to get a clearer picture of your style. Just choose the one that feels closer to your truth." 
                delay={1000}
                onComplete={() => setTimeout(() => animateToNextStep('question1'), 1000)}
              />
            </View>
            <View style={styles.interactionSection}>
              {/* Reserved space for future interactions */}
            </View>
            <View style={styles.actionSection}>
              {/* Reserved space for action buttons */}
            </View>
          </View>
        );

      case 'question1':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <AIMessage text="Thinking about what drives you towards a goal, does it feel more like you're striving to achieve a positive outcome, or more like you're working hard to prevent a negative one?" />
            </View>
            <View style={styles.interactionSection}>
              <View style={styles.cardsContainer}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('promotion', 'regulatoryFocus')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cardText}>Striving to achieve a positive outcome</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('prevention', 'regulatoryFocus')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cardText}>Working hard to prevent a negative one</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.actionSection}>
              {/* Reserved space for action buttons */}
            </View>
          </View>
        );

      case 'question2':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <AIMessage text="Okay, next..." />
              <AIMessage 
                text="When you achieve a major success, do you tend to credit it more to your disciplined preparation and hard work, or to being in the right place at the right time?"
                delay={800}
              />
            </View>
            <View style={styles.interactionSection}>
              <View style={styles.cardsContainer}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('internal', 'locusOfControl')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cardText}>Disciplined preparation and hard work</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('external', 'locusOfControl')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cardText}>Being in the right place at the right time</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.actionSection}>
              {/* Reserved space for action buttons */}
            </View>
          </View>
        );

      case 'question3':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <AIMessage text="Last one like this..." />
              <AIMessage 
                text="Do you feel that a person's ability to stay focused and organized is something they're mostly born with, or is it a skill that can be developed over time with the right strategies?"
                delay={800}
              />
            </View>
            <View style={styles.interactionSection}>
              <View style={styles.cardsContainer}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('fixed', 'mindset')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cardText}>Mostly born with it</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleCardChoice('growth', 'mindset')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cardText}>A skill that can be developed</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.actionSection}>
              {/* Reserved space for action buttons */}
            </View>
          </View>
        );

      case 'question4':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <AIMessage text="Thanks for that. Now for a couple of questions on a different note. For these, just slide to the point on the scale that feels most like you." />
              <AIMessage 
                text="When it comes to tackling a big project, where do you draw your energy from?"
                delay={1500}
                onComplete={() => setTimeout(() => animateToNextStep('slider1'), 1000)}
              />
            </View>
            <View style={styles.interactionSection}>
              {/* Reserved space for future slider */}
            </View>
            <View style={styles.actionSection}>
              {/* Reserved space for action buttons */}
            </View>
          </View>
        );

      case 'slider1':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <AIMessage text="When it comes to tackling a big project, where do you draw your energy from?" />
            </View>
            <View style={styles.interactionSection}>
              <SliderComponent
                leftLabel="Working quietly on my own"
                rightLabel="Bouncing ideas off of a group"
                value={onboardingData.extraversion}
                onValueChange={(value) => setOnboardingData(prev => ({ ...prev, extraversion: value }))}
              />
            </View>
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleSliderComplete}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'slider2':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <AIMessage text="Got it. One more like that..." />
              <AIMessage 
                text="When someone gives you critical feedback on your work, what's your initial instinct?"
                delay={800}
              />
            </View>
            <View style={styles.interactionSection}>
              <SliderComponent
                leftLabel="Challenge the feedback and defend my position"
                rightLabel="Find common ground and seek to understand their view"
                value={onboardingData.agreeableness}
                onValueChange={(value) => setOnboardingData(prev => ({ ...prev, agreeableness: value }))}
              />
            </View>
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleSliderComplete}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'final-question':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.messagesSection}>
              <AIMessage text="Perfect. That gives me a complete picture of your unique style." />
              <AIMessage text="Now, let's bring the focus to you." delay={1000} />
              <AIMessage text="What's on your mind right now that feels most important?" delay={2000} />
            </View>
            <View style={styles.interactionSection}>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={onboardingData.currentFocus}
                  onChangeText={(text) => setOnboardingData(prev => ({ ...prev, currentFocus: text }))}
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
        {/* Fixed Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#475569" strokeWidth={2} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Getting to know you</Text>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#a855f7', '#6366f1']}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Brain size={20} color="#fff" strokeWidth={2} />
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Fixed Content Area */}
        <View style={styles.contentArea}>
          {showContent && (
            <Animated.View style={[styles.content, contentAnimatedStyle]}>
              {getStepContent()}
            </Animated.View>
          )}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 72, // Fixed header height
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#334155',
  },
  avatarContainer: {},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    minHeight: height - 150, // Ensure consistent minimum height
  },
  messagesSection: {
    minHeight: 200, // Reserved space for messages
    paddingTop: 20,
    paddingBottom: 20,
  },
  interactionSection: {
    flex: 1,
    minHeight: 200, // Reserved space for interactions
    justifyContent: 'center',
    paddingVertical: 20,
  },
  actionSection: {
    minHeight: 80, // Reserved space for action buttons
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
    minHeight: 80, // Consistent card height
  },
  cardText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 22,
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  sliderLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 8,
    lineHeight: 18,
    minHeight: 36, // Consistent label height
  },
  sliderTrack: {
    height: 60,
    justifyContent: 'center',
    marginVertical: 16,
  },
  sliderLine: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    top: -10,
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
    minWidth: 120, // Consistent button width
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  textInputContainer: {
    width: '100%',
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
    height: 140, // Fixed height for consistency
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
    minWidth: 180, // Consistent button width
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