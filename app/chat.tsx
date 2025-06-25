import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, ChevronLeft } from 'lucide-react-native';
import TypingIndicator from '@/components/TypingIndicator';
import AuraProfileIcon from '@/components/AuraProfileIcon';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  actualText?: string;
}

interface OnboardingData {
  coachingStyle: string;
  regulatoryFocus: 'promotion' | 'prevention' | null;
  locusOfControl: 'internal' | 'external' | null;
  mindset: 'fixed' | 'growth' | null;
  extraversion: number;
  agreeableness: number;
  currentFocus: string;
}

const AIMessageBubble = ({ 
  message, 
  isLoading = false, 
  delay = 0 
}: { 
  message: string; 
  isLoading?: boolean; 
  delay?: number;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.aiMessageContainer, animatedStyle]}>
      <View style={styles.aiMessageBubble}>
        {isLoading ? (
          <TypingIndicator isVisible={true} showBubble={false} />
        ) : (
          <Text style={styles.aiMessageText}>{message}</Text>
        )}
      </View>
    </Animated.View>
  );
};

export default function ChatScreen() {
  const params = useLocalSearchParams<{ 
    coachingStyle: string; 
    onboardingData?: string; 
  }>();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const initializedRef = useRef(false);

  // Parse onboarding data
  const onboardingData: OnboardingData | null = params.onboardingData 
    ? JSON.parse(params.onboardingData) 
    : null;

  // Animation values
  const backgroundScale = useSharedValue(1);
  const backgroundRotation = useSharedValue(0);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Start breathing animation for background
    backgroundScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { 
          duration: 9000, 
          easing: Easing.inOut(Easing.sin) 
        }),
        withTiming(1, { 
          duration: 9000, 
          easing: Easing.inOut(Easing.sin) 
        })
      ),
      -1,
      false
    );

    backgroundRotation.value = withRepeat(
      withTiming(360, { 
        duration: 60000, 
        easing: Easing.linear 
      }),
      -1,
      false
    );

    // Generate personalized welcome message
    const welcomeText = generatePersonalizedWelcome(onboardingData);
    const welcomeMessageId = "welcome-msg";
    
    addMessage({
      text: "",
      isUser: false,
      isLoading: true,
      actualText: welcomeText
    }, welcomeMessageId);

    setTimeout(() => {
      updateMessage(welcomeMessageId, {
        text: welcomeText,
        isLoading: false,
        actualText: undefined
      });

      // Add personalized follow-up based on their current focus
      if (onboardingData?.currentFocus) {
        setTimeout(() => {
          const followUpText = generatePersonalizedFollowUp(onboardingData);
          const followUpMessageId = "followup-msg";
          
          addMessage({
            text: "",
            isUser: false,
            isLoading: true,
            actualText: followUpText
          }, followUpMessageId);

          setTimeout(() => {
            updateMessage(followUpMessageId, {
              text: followUpText,
              isLoading: false,
              actualText: undefined
            });
          }, 1500);
        }, 1000);
      }
    }, 1200);
  }, [onboardingData]);

  const generatePersonalizedWelcome = (data: OnboardingData | null) => {
    if (!data) {
      return "Welcome! I'm here to support you on your journey.";
    }

    const { coachingStyle, regulatoryFocus, locusOfControl, mindset } = data;
    
    let message = "";
    
    if (coachingStyle === 'planner') {
      message = "Perfect! I can see you value structure and detailed planning. ";
      if (regulatoryFocus === 'promotion') {
        message += "Your focus on achieving positive outcomes combined with your organized approach is a powerful combination. ";
      } else if (regulatoryFocus === 'prevention') {
        message += "Your careful approach to preventing problems shows wisdom and foresight. ";
      }
    } else {
      message = "Excellent! I appreciate your flexible, adaptive approach. ";
      if (regulatoryFocus === 'promotion') {
        message += "Your openness to opportunity while striving for positive outcomes creates exciting possibilities. ";
      } else if (regulatoryFocus === 'prevention') {
        message += "Your balanced approach of staying flexible while being mindful of challenges shows great emotional intelligence. ";
      }
    }

    if (mindset === 'growth') {
      message += "I'm especially drawn to your belief in development and growth - that's the foundation of all meaningful change.";
    } else if (mindset === 'fixed') {
      message += "I respect your recognition of natural strengths, and I'm here to help you leverage them effectively.";
    }

    return message;
  };

  const generatePersonalizedFollowUp = (data: OnboardingData) => {
    const { currentFocus, extraversion, agreeableness } = data;
    
    let message = `I hear that ${currentFocus.toLowerCase()} is what feels most important to you right now. `;
    
    if (extraversion > 60) {
      message += "Given your collaborative nature, have you considered who else might be invested in this outcome? ";
    } else {
      message += "I sense you might benefit from some quiet reflection on this. ";
    }

    if (agreeableness > 60) {
      message += "Your thoughtful approach to others' perspectives will be valuable here. What would success look like not just for you, but for everyone involved?";
    } else {
      message += "Your direct approach and willingness to challenge assumptions could be exactly what's needed. What's your gut telling you about the best path forward?";
    }

    return message;
  };

  const addMessage = (messageData: Omit<Message, 'timestamp' | 'id'>, id?: string) => {
    const newMessage: Message = {
      id: id || Date.now().toString(),
      timestamp: new Date(),
      ...messageData,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return newMessage.id;
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === id ? { ...msg, ...updates } : msg))
    );
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      addMessage({ text: inputText.trim(), isUser: true });
      const currentInput = inputText;
      setInputText('');
      
      const aiMessageId = Date.now().toString() + "-ai";
      const responseText = generateAIResponse(currentInput, onboardingData);
      
      addMessage({
        text: "",
        isUser: false,
        isLoading: true,  
        actualText: responseText
      }, aiMessageId);

      setTimeout(() => {
        updateMessage(aiMessageId, {
          text: responseText,
          isLoading: false,
          actualText: undefined
        });
      }, 1500 + Math.random() * 1000);
    }
  };

  const generateAIResponse = (userMessage: string, data: OnboardingData | null) => {
    if (!data) {
      return "I appreciate you sharing that. Tell me more about what's driving this for you?";
    }

    const { coachingStyle, regulatoryFocus, locusOfControl, mindset, extraversion, agreeableness } = data;
    
    const responses = [];
    
    // Base responses based on coaching style
    if (coachingStyle === 'planner') {
      responses.push("Let me help you break this down into actionable steps.");
      responses.push("What specific outcome are you hoping to achieve here?");
      responses.push("This sounds like something we can create a structured approach for.");
    } else {
      responses.push("I'm curious about what this means to you personally.");
      responses.push("What feels like the right next step from where you are now?");
      responses.push("Let's explore this together and see what emerges.");
    }
    
    // Add personality-based responses
    if (regulatoryFocus === 'promotion') {
      responses.push("What opportunities do you see in this situation?");
      responses.push("How might this help you move toward your ideal outcome?");
    } else if (regulatoryFocus === 'prevention') {
      responses.push("What potential challenges should we be mindful of?");
      responses.push("How can we make sure you feel secure as you move forward?");
    }
    
    if (mindset === 'growth') {
      responses.push("What might you learn from this experience?");
      responses.push("How could this challenge help you develop new capabilities?");
    }
    
    if (extraversion > 60) {
      responses.push("Who else might have insights that could help with this?");
      responses.push("Have you had a chance to talk this through with someone you trust?");
    } else {
      responses.push("What does your inner wisdom tell you about this?");
      responses.push("When you sit quietly with this, what comes up for you?");
    }
    
    if (agreeableness > 60) {
      responses.push("How do you think others might be affected by this?");
      responses.push("What would feel like a win-win approach here?");
    } else {
      responses.push("What's your honest assessment of what needs to happen?");
      responses.push("Sometimes the direct path is the kindest - what would that look like?");
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: backgroundScale.value },
      { rotate: `${backgroundRotation.value}deg` }
    ],
  }));

  const getHeaderTitle = () => {
    if (!onboardingData) return 'AI Coach';
    
    const { coachingStyle, regulatoryFocus, extraversion } = onboardingData;
    
    if (coachingStyle === 'planner') {
      return extraversion > 60 ? 'Collaborative Strategist' : 'Thoughtful Planner';
    } else {
      return regulatoryFocus === 'promotion' ? 'Opportunity Guide' : 'Gentle Navigator';
    }
  };

  const getAuraState = (): 'idle' | 'listening' | 'processing' | 'responding' => {
    // Check if any message is currently loading
    const hasLoadingMessage = messages.some(msg => msg.isLoading);
    
    if (hasLoadingMessage) {
      return 'processing';
    }
    
    return 'listening';
  };

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
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="#475569" strokeWidth={2} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
              <View style={styles.avatarContainer}>
                <AuraProfileIcon state={getAuraState()} />
              </View>
            </View>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message, index) => (
              message.isUser ? (
                <View key={message.id} style={styles.userMessageContainer}>
                  <View style={styles.userMessageBubble}>
                    <Text style={styles.userMessageText}>{message.text}</Text>
                  </View>
                </View>
              ) : (
                <AIMessageBubble 
                  key={message.id} 
                  message={message.text} 
                  isLoading={message.isLoading}
                  delay={0}
                />
              )
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Share what's on your mind..."
                placeholderTextColor="#94a3b8"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
                ]}
                onPress={handleSendMessage}
                disabled={!inputText.trim()}
              >
                <ArrowRight 
                  size={18} 
                  color={inputText.trim() ? '#ffffff' : '#94a3b8'} 
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

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
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  messagesContainer: {
    flex: 1,
    paddingTop: 96,
    paddingBottom: 128,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  aiMessageBubble: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    maxWidth: '85%',
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
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userMessageBubble: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    maxWidth: '85%',
  },
  userMessageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonActive: {
    backgroundColor: '#3b82f6',
  },
  sendButtonInactive: {
    backgroundColor: '#e2e8f0',
  },
});