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
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Send, ArrowLeft } from 'lucide-react-native';
import TypingIndicator from '@/components/TypingIndicator';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string; // Will be empty or "..." during loading for AI messages
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  actualText?: string; // Stores the real text during AI message loading
}

export default function ChatScreen() {
  const { coachingStyle } = useLocalSearchParams<{ coachingStyle: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation values
  const avatarOpacity = useSharedValue(0);
  const avatarScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);
  const headerOpacity = useSharedValue(1); // Initialize to 1 (fully opaque)
  const inputOpacity = useSharedValue(1); // Initialize to 1 for immediate visibility

  useEffect(() => {
    // Initialize chat with welcome message based on coaching style
    const welcomeMessage = getWelcomeMessage(coachingStyle);
    
    setTimeout(() => {
      // Animate avatar
      avatarOpacity.value = withTiming(1, { duration: 800 });
      avatarScale.value = withTiming(1, { duration: 800 });
      
      // Start glow animation
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 2000 }),
          withTiming(0.2, { duration: 2000 })
        ),
        -1,
        true
      );

      // Add welcome message after animation
      setTimeout(() => {
        const welcomeMsgId = "initial-welcome";
        const actualWelcomeText = getWelcomeMessage(coachingStyle); // Get the final text
        addMessage({
          text: "", // Displayed while loading
          isUser: false,
          isLoading: true,
          actualText: actualWelcomeText // Store final text
        }, welcomeMsgId);

        setTimeout(() => { // Simulate loading delay
          updateMessage(welcomeMsgId, { text: actualWelcomeText, isLoading: false, actualText: undefined });

          // Add follow-up message
          setTimeout(() => {
            const followUpMsgId = "initial-followup";
            const actualFollowUpText = getFollowUpMessage(coachingStyle); // Get the final text
            addMessage({
              text: "", // Displayed while loading
              isUser: false,
              isLoading: true,
              actualText: actualFollowUpText // Store final text
            }, followUpMsgId);

            setTimeout(() => { // Simulate loading delay
              updateMessage(followUpMsgId, { text: actualFollowUpText, isLoading: false, actualText: undefined });
            }, 1200); // Loading time for follow-up
          }, 800); // Delay between welcome and follow-up message appearance
        }, 1000); // Loading time for welcome message
      }, 1000); // Delay after header/avatar animation
    }, 300);
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
    
    // Scroll to bottom after message is added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return newMessage.id; // Return the ID
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === id ? { ...msg, ...updates } : msg))
    );
    // Scroll to bottom after message is updated (e.g., text revealed)
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      addMessage({ text: inputText.trim(), isUser: true });
      const currentInput = inputText; // Capture before clearing
      setInputText('');
      
      // No longer use global isTyping for individual message loading
      // setIsTyping(true);
      
      const aiMessageId = Date.now().toString() + "-ai";
      const responseText = generateAIResponse(currentInput, coachingStyle); // Generate text first

      addMessage({
        text: "", // Displayed while loading
        isUser: false,
        isLoading: true,
        actualText: responseText // Store final text
      }, aiMessageId);

      // Simulate AI response delay (e.g. network, computation)
      setTimeout(() => {
        updateMessage(aiMessageId, {
          text: responseText,
          isLoading: false,
          actualText: undefined // Clear placeholder
        });
      }, 1500 + Math.random() * 1500);
    }
  };

  const generateAIResponse = (userMessage: string, style: string) => {
    // Simple response generation based on coaching style
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
  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: avatarOpacity.value,
    transform: [{ scale: avatarScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#0C4A6E" strokeWidth={2} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Animated.View style={[styles.headerAvatarContainer, avatarAnimatedStyle]}>
              <Animated.View style={[styles.headerAvatarGlow, glowAnimatedStyle]} />
              <LinearGradient
                colors={['#8B5CF6', '#A855F7', '#C084FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerAvatar}
              >
                <Brain size={20} color="white" strokeWidth={2} />
              </LinearGradient>
            </Animated.View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>AI Coach</Text>
              <Text style={styles.headerSubtitle}>
                {coachingStyle === 'planner' ? 'Structured Support' : 'Adaptive Guidance'}
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessageContainer : styles.aiMessageContainer
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.aiMessage
                ]}
              >
                {message.isLoading && !message.isUser ? (
                  <TypingIndicator isVisible={true} showBubble={false} />
                ) : (
                  <Text
                    style={[
                      styles.messageText,
                      message.isUser ? styles.userMessageText : styles.aiMessageText
                    ]}
                  >
                    {message.text}
                  </Text>
                )}
              </View>
            </View>
          ))}
          
          {/* Global Typing Indicator removed, handled by individual messages */}
          {/* <TypingIndicator isVisible={isTyping} /> */}
        </ScrollView>

        {/* Input */}
        <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Share what's on your mind..."
              placeholderTextColor="#0C4A6E"
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
              <Send 
                size={20} 
                color={inputText.trim() ? 'white' : '#BAE6FD'} 
                strokeWidth={2} 
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2FE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  headerAvatarGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0284C7',
    top: -2,
    left: -2,
    opacity: 0.2,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#0C4A6E',
    lineHeight: 20,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#0C4A6E',
    opacity: 0.6,
    lineHeight: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: '#0284C7',
    borderBottomRightRadius: 6,
  },
  aiMessage: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#0C4A6E',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0F2FE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F0F9FF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0C4A6E',
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: 12,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#0284C7',
  },
  sendButtonInactive: {
    backgroundColor: '#E0F2FE',
  },
});