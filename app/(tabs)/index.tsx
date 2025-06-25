import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Microscope, Heart, Shield } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Animation values
  const avatarOpacity = useSharedValue(0);
  const avatarScale = useSharedValue(0.8);
  const firstBubbleOpacity = useSharedValue(0);
  const firstBubbleTranslateY = useSharedValue(20);
  const secondBubbleOpacity = useSharedValue(0);
  const secondBubbleTranslateY = useSharedValue(20);
  const thirdBubbleOpacity = useSharedValue(0);
  const thirdBubbleTranslateY = useSharedValue(20);
  const pillarsOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);
  const cardsTranslateY = useSharedValue(30);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Start the animation sequence
    setTimeout(() => {
      // Avatar animation (500ms delay)
      avatarOpacity.value = withTiming(1, { duration: 800 });
      avatarScale.value = withTiming(1, { duration: 800 });
      
      // Start glow animation
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500 }),
          withTiming(0.3, { duration: 1500 })
        ),
        -1,
        true
      );

      // First bubble (after avatar)
      setTimeout(() => {
        firstBubbleOpacity.value = withTiming(1, { duration: 600 });
        firstBubbleTranslateY.value = withTiming(0, { duration: 600 });

        // Second bubble (1.5s after first)
        setTimeout(() => {
          secondBubbleOpacity.value = withTiming(1, { duration: 600 });
          secondBubbleTranslateY.value = withTiming(0, { duration: 600 });

          // Trust pillars (same time as second bubble)
          pillarsOpacity.value = withTiming(1, { duration: 800 });

          // Third bubble and cards (after second bubble)
          setTimeout(() => {
            thirdBubbleOpacity.value = withTiming(1, { duration: 600 });
            thirdBubbleTranslateY.value = withTiming(0, { duration: 600 });

            setTimeout(() => {
              cardsOpacity.value = withTiming(1, { duration: 600 });
              cardsTranslateY.value = withTiming(0, { duration: 600 });
            }, 300);
          }, 1000);
        }, 1500);
      }, 800);
    }, 500);
  }, []);

  // Animated styles
  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: avatarOpacity.value,
    transform: [{ scale: avatarScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const firstBubbleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: firstBubbleOpacity.value,
    transform: [{ translateY: firstBubbleTranslateY.value }],
  }));

  const secondBubbleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: secondBubbleOpacity.value,
    transform: [{ translateY: secondBubbleTranslateY.value }],
  }));

  const thirdBubbleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: thirdBubbleOpacity.value,
    transform: [{ translateY: thirdBubbleTranslateY.value }],
  }));

  const pillarsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pillarsOpacity.value,
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
    transform: [{ translateY: cardsTranslateY.value }],
  }));

  const handleCardPress = (cardType: string) => {
    setSelectedCard(cardType);
    // Navigate to chat interface after a brief delay
    setTimeout(() => {
      router.push({
        pathname: '/chat',
        params: { coachingStyle: cardType }
      });
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.headline}>
              The first AI coach that understands why you're stuck.
            </Text>
            <Text style={styles.subHeadline}>
              I'm a new type of AI coach that uses proven psychology to diagnose the root of inaction and help you build lasting motivation.
            </Text>
          </View>

          {/* AI Avatar Section */}
          <View style={styles.avatarSection}>
            <Animated.View style={[styles.avatarContainer, avatarAnimatedStyle]}>
              <Animated.View style={[styles.avatarGlow, glowAnimatedStyle]} />
              <LinearGradient
                colors={['#8B5CF6', '#A855F7', '#C084FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Brain size={32} color="white" strokeWidth={2} />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Chat Section */}
          <View style={styles.chatSection}>
            <View style={styles.chatContainer}>
              <Animated.View style={[styles.chatBubbleContainer, firstBubbleAnimatedStyle]}>
                <Animated.View style={[styles.bubbleGlow, glowAnimatedStyle]} />
                <View style={styles.chatBubble}>
                  <Text style={styles.chatText}>Welcome.</Text>
                </View>
              </Animated.View>

              <Animated.View style={[styles.chatBubbleContainer, secondBubbleAnimatedStyle]}>
                <Animated.View style={[styles.bubbleGlow, glowAnimatedStyle]} />
                <View style={styles.chatBubble}>
                  <Text style={styles.chatText}>I'm here to be a supportive partner, at your pace.</Text>
                </View>
              </Animated.View>

              <Animated.View style={[styles.chatBubbleContainer, thirdBubbleAnimatedStyle]}>
                <Animated.View style={[styles.bubbleGlow, glowAnimatedStyle]} />
                <View style={styles.chatBubble}>
                  <Text style={styles.chatText}>To get started, I have one quick question to understand your style.</Text>
                </View>
              </Animated.View>
            </View>

            {/* Trust Pillars */}
            <Animated.View style={[styles.trustPillarsContainer, pillarsAnimatedStyle]}>
              <View style={styles.pillar}>
                <Microscope size={18} color="#0284C7" strokeWidth={2} />
                <Text style={styles.pillarText}>Powered by Science</Text>
              </View>
              <View style={styles.pillar}>
                <Heart size={18} color="#0284C7" strokeWidth={2} />
                <Text style={styles.pillarText}>Guided by Empathy</Text>
              </View>
              <View style={styles.pillar}>
                <Shield size={18} color="#0284C7" strokeWidth={2} />
                <Text style={styles.pillarText}>Designed for Trust & Safety</Text>
              </View>
            </Animated.View>

            {/* Interactive Cards */}
            <Animated.View style={[styles.cardsContainer, cardsAnimatedStyle]}>
              <TouchableOpacity
                style={[
                  styles.card,
                  selectedCard === 'planner' && styles.selectedCard
                ]}
                onPress={() => handleCardPress('planner')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.cardText,
                  selectedCard === 'planner' && styles.selectedCardText
                ]}>
                  Meticulous Planner
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.card,
                  selectedCard === 'adapter' && styles.selectedCard
                ]}
                onPress={() => handleCardPress('adapter')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.cardText,
                  selectedCard === 'adapter' && styles.selectedCardText
                ]}>
                  Flexible Adapter
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  headerContainer: {
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headline: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#0C4A6E',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  subHeadline: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0C4A6E',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGlow: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#0284C7',
    top: -6,
    left: -6,
    opacity: 0.3,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  chatSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 40,
    width: '100%',
  },
  chatContainer: {
    width: '100%',
    marginBottom: 32,
  },
  chatBubbleContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  bubbleGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0284C7',
    top: 0,
    left: 0,
  },
  chatBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chatText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#0C4A6E',
    lineHeight: 24,
  },
  trustPillarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 32,
    width: '100%',
  },
  pillar: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  pillarText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#0C4A6E',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 12,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  card: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  selectedCard: {
    borderColor: '#0284C7',
    backgroundColor: 'white',
    transform: [{ scale: 0.98 }],
  },
  cardText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#0C4A6E',
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedCardText: {
    fontFamily: 'Inter-Bold',
    color: '#0284C7',
  },
});