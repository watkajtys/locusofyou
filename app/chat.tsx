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
import { Brain, Send, ChevronLeft } from 'lucide-react-native';
import TypingIndicator from '@/components/TypingIndicator';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  actualText?: string;
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
  const { coachingStyle } = useLocalSearchParams<{ coachingStyle: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation values
  const backgroundScale = useSharedValue(1);
  const backgroundRotation = useSharedValue(0);

  useEffect(() => {
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

    // Show typing indicator immediately, no delay
    const welcomeMessageId = "welcome-msg";
    const welcomeText = getWelcomeMessage(coachingStyle);
    
    // Add loading message immediately
    addMessage({
      text: "",
      isUser: false,
      isLoading: true,
      actualText: welcomeText
    }, welcomeMessageId);

    // Show actual text after loading delay
    setTimeout(() => {
      updateMessage(welcomeMessageId, {
        text: welcomeText,
        isLoading: false,
        actualText: undefined
      });

      // Add follow-up message with typing indicator immediately after first message appears
      setTimeout(() => {
        const followUpMessageId = "followup-msg";
        const followUpText = getFollowUpMessage(coachingStyle);
        
        // Add loading message immediately
        addMessage({
          text: "",
          isUser: false,
          isLoading: true,
          actualText: followUpText
        }, followUpMessageId);

        // Show follow-up text after loading delay
        setTimeout(() => {
          updateMessage(followUpMessageId, {
            text: followUpText,
            isLoading: false,
            actualText: undefined
          });
        }, 1200);
      }, 800);
    }, 1000);
  }, [coachingStyle]);

  const getWelcomeMessage = (style: string) => {
    if (style === 'planner') {
      return "Perfect! I can see you value structure and detailed planning. I'll help you create clear, actionable steps toward your goals while respecting your need for organization.";
    } else {
      return "Excellent choice! I appreciate your flexible approach. I'll adapt my coaching style to meet you where you are, providing guidance that flows with your natural rhythm.";
    }
  };

  const getFollowUpMessage = (style: string) => {
    if (style === 'planner') {
      return "Let's start by identifying one specific goal you'd like to work on. What's something you've been wanting to accomplish but haven't quite gotten started on?";
    } else {
      return "I'm curious - what's one area of your life where you feel stuck or would like some gentle guidance? We can explore this together at whatever pace feels right.";
    }
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
      
      // Add AI response with typing indicator immediately
      const aiMessageId = Date.now().toString() + "-ai";
      const responseText = generateAIResponse(currentInput, coachingStyle);
      
      // Show typing indicator immediately, no delay
      addMessage({
        text: "",
        isUser: false,
        isLoading: true,  
        actualText: responseText
      }, aiMessageId);

      // Show actual response after loading delay
      setTimeout(() => {
        updateMessage(aiMessageId, {
          text: responseText,
          isLoading: false,
          actualText: undefined
        });
      }, 1500 + Math.random() * 1000);
    }
  };

  const generateAIResponse = (userMessage: string, style: string) => {
    const responses = {
      planner: [
        "That's a great insight. Let's break this down into smaller, manageable steps. What would be the very first action you could take?",
        "I hear you. It sounds like having a clear plan would help here. What specific outcome are you hoping to achieve?",
        "Thank you for sharing that. Let's create a structured approach. What resources or support do you think you'll need?",
        "That makes sense. When you think about this goal, what timeline feels realistic and achievable for you?",
        "I appreciate your thoughtfulness. Let's identify the key milestones that would mark progress toward this goal.",
      ],
      adapter: [
        "I appreciate you sharing that with me. What feels most important to you right now in this situation?",
        "That sounds challenging. How are you feeling about all of this? Sometimes our emotions can guide us toward the right path.",
        "I'm hearing that this matters to you. What would it look like if you took just one small step forward?",
        "Thank you for being so open. What do you think your intuition is telling you about this?",
        "That resonates with me. What would feel like a gentle first step that honors where you are right now?",
      ]
    };

    const styleResponses = responses[style as keyof typeof responses] || responses.adapter;
    return styleResponses[Math.floor(Math.random() * styleResponses.length)];
  };

  // Animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: backgroundScale.value },
      { rotate: `${backgroundRotation.value}deg` }
    ],
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
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header - No animations */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="#475569" strokeWidth={2} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                {coachingStyle === 'planner' ? 'Structured Support' : 'Adaptive Guidance'}
              </Text>
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

          {/* Chat Messages */}
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
                  delay={0} // No delay for individual message animations
                />
              )
            ))}
          </ScrollView>

          {/* Input Area - Fully transparent container */}
          <View style={styles.inputContainer}>
            {/* Input field container with white background and styling */}
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
              {/* Circular send button with vibrant blue background */}
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
                ]}
                onPress={handleSendMessage}
                disabled={!inputText.trim()}
              >
                <Send 
                  size={18} 
                  color={inputText.trim() ? '#ffffff' : '#94a3b8'} 
                  strokeWidth={2}
                  style={{ transform: [{ rotate: '5deg' }] }} // Slight rotation for dynamic feel
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
  avatarContainer: {
    // No animation styles
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    minHeight: 44, // Ensure consistent height for typing indicator
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
  // Fully transparent input container
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent', // Fully transparent
    // No shadows or background effects
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', // White background for input field
    borderRadius: 24, // Fully rounded corners
    borderWidth: 1,
    borderColor: '#e2e8f0', // Subtle border
    paddingHorizontal: 4,
    paddingVertical: 4,
    // Enhanced shadow for tangible, elevated feel
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    // Enhanced shadow for gentle elevation
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonActive: {
    backgroundColor: '#3b82f6', // Vibrant blue for clear call to action
  },
  sendButtonInactive: {
    backgroundColor: '#e2e8f0', // Subtle inactive state
  },
});