import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, TextInput } from 'react-native';
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
import { ArrowRight } from 'lucide-react-native';
import OnboardingStepHeader from '@/components/OnboardingStepHeader';
import AIMessage from '@/components/AIMessage';
import { useOnboarding } from '@/context/OnboardingContext';

const { width, height } = Dimensions.get('window');

type InteractionState = 'none' | 'touchingInput' | 'submitting' | 'transitioningMessages';

export default function FinalScreen() {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [interactionState, setInteractionState] = useState<InteractionState>('transitioningMessages');
  const [showContent, setShowContent] = useState(false); // Controls visibility of input and button
  const [currentFocusInput, setCurrentFocusInput] = useState(onboardingData.currentFocus || '');


  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const backgroundScale = useSharedValue(1);
  const messagesDone = useSharedValue(0); // To control animation after messages

  useEffect(() => {
    backgroundScale.value = withSequence(
      withTiming(1.02, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) })
    );
    // Content (input/button) will show after messages complete
  }, []);

  const handleMessagesComplete = () => {
    setInteractionState('none'); // Ready for input
    setShowContent(true);
    messagesDone.value = 1; // Trigger animation for input/button
    contentOpacity.value = withTiming(1, { duration: 800 });
    contentTranslateY.value = withTiming(0, { duration: 800 });
  };

  const handleFinalSubmit = () => {
    if (currentFocusInput.trim()) {
      updateOnboardingData({ currentFocus: currentFocusInput.trim() });
      setInteractionState('submitting');
      contentOpacity.value = withTiming(0, { duration: 400 });
      contentTranslateY.value = withTiming(-20, { duration: 400 });

      setTimeout(() => {
        router.replace({ // Using replace to clear onboarding stack
          pathname: '/chat',
          params: {
            // coachingStyle is already in context, so we can retrieve it in chat if needed
            // or pass the whole onboardingData stringified
            onboardingData: JSON.stringify({...onboardingData, currentFocus: currentFocusInput.trim()})
          }
        });
      }, 400);
    }
  };

  const handleInputFocus = () => setInteractionState('touchingInput');
  const handleInputBlur = () => {
    // Persist to context on blur as well
    updateOnboardingData({ currentFocus: currentFocusInput });
    if (interactionState === 'touchingInput') setInteractionState('none');
  }

  const getAuraState = (): 'idle' | 'listening' | 'processing' | 'responding' => {
    switch (interactionState) {
      case 'touchingInput': return 'processing';
      case 'submitting': return 'responding';
      case 'transitioningMessages': return 'responding'; // Or processing depending on message state
      case 'none':
      default:
        return onboardingData.currentFocus.trim() ? 'listening' : 'idle'; // Idle if empty, listening if has text
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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.stepContainer}>
                <View style={styles.messagesSection}>
                    <AIMessage text="Perfect. That gives me a complete picture of your unique style." />
                    <AIMessage text="Now, let's bring the focus to you." delay={1200} />
                    <AIMessage
                        text="What's on your mind right now that feels most important?"
                        delay={2400}
                        onComplete={handleMessagesComplete}
                    />
                </View>

                {showContent && (
                    <Animated.View style={[styles.interactionContainer, contentAnimatedStyle]}>
                        <View style={styles.interactionSection}>
                            <View style={styles.textInputContainer}>
                                <TextInput
                                style={styles.textInput}
                                value={currentFocusInput}
                                onChangeText={setCurrentFocusInput}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
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
                                currentFocusInput.trim() ? styles.submitButtonActive : styles.submitButtonInactive
                            ]}
                            onPress={handleFinalSubmit}
                            disabled={!currentFocusInput.trim() || interactionState === 'submitting'}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.submitButtonText,
                                currentFocusInput.trim() ? styles.submitButtonTextActive : styles.submitButtonTextInactive
                            ]}>
                            Begin Coaching
                            </Text>
                            <ArrowRight size={20} color={currentFocusInput.trim() ? '#ffffff' : '#94a3b8'} />
                        </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}
            </View>
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
  stepContainer: {
    minHeight: height * 0.85, // Ensure enough height for all content
    justifyContent: 'space-between', // Pushes messages up, input/button down
    paddingVertical: 20,
  },
  messagesSection: {
    // flexGrow: 1, // Allow messages to take available space initially
    justifyContent: 'flex-start', // Align messages to the top
    paddingBottom: 20,
  },
  interactionContainer: { // New container for input and button
    flexGrow: 2, // Allow this section to take more space
    justifyContent: 'center',
  },
  interactionSection: {
    justifyContent: 'center',
    paddingVertical: 10, // Reduced padding
  },
  actionSection: {
    justifyContent: 'flex-end',
    paddingTop: 20, // Add some space above button
    paddingBottom: 10, // Reduced padding
    alignItems: 'center',
  },
  textInputContainer: {
    width: '100%',
    marginTop: 10, // Reduced margin
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
  submitButtonActive: { backgroundColor: '#3b82f6' },
  submitButtonInactive: { backgroundColor: '#e2e8f0' },
  submitButtonText: { fontSize: 16, fontFamily: 'Inter-Bold' },
  submitButtonTextActive: { color: '#ffffff' },
  submitButtonTextInactive: { color: '#94a3b8' },
});
