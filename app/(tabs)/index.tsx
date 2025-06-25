import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Microscope, Heart, Shield, Compass, Target } from 'lucide-react-native';
import TypingIndicator from '@/components/TypingIndicator';
import AuraProfileIcon from '@/components/AuraProfileIcon';

type InteractionState = 'none' | 'touching' | 'selected' | 'transitioning';

export default function WelcomeScreen() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [interactionState, setInteractionState] = useState<InteractionState>('none');
  const [isFirstBubbleLoading, setIsFirstBubbleLoading] = useState(true);
  const [isSecondBubbleLoading, setIsSecondBubbleLoading] = useState(true);
  const [isThirdBubbleLoading, setIsThirdBubbleLoading] = useState(true);

  // Animation values
  const backgroundScale = useSharedValue(1);
  const backgroundRotation = useSharedValue(0);
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

  useEffect(() => {
    // Start breathing background animation
    backgroundScale.value = withSequence(
      withTiming(1.02, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) })
    );

    backgroundRotation.value = withTiming(360, { 
      duration: 60000, 
      easing: Easing.linear 
    });

    // Start the animation sequence
    setTimeout(() => {
      // Avatar animation
      avatarOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      avatarScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });

      // First bubble
      setTimeout(() => {
        firstBubbleOpacity.value = withTiming(1, { duration: 400 });
        firstBubbleTranslateY.value = withTiming(0, { duration: 400 });
        setTimeout(() => {
          setIsFirstBubbleLoading(false);
        }, 600);

        // Second bubble
        setTimeout(() => {
          secondBubbleOpacity.value = withTiming(1, { duration: 400 });
          secondBubbleTranslateY.value = withTiming(0, { duration: 400 });
          setTimeout(() => {
            setIsSecondBubbleLoading(false);
          }, 700);

          // Trust pillars
          pillarsOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });

          // Third bubble and cards
          setTimeout(() => {
            thirdBubbleOpacity.value = withTiming(1, { duration: 400 });
            thirdBubbleTranslateY.value = withTiming(0, { duration: 400 });
            setTimeout(() => {
              setIsThirdBubbleLoading(false);
            }, 600);

            setTimeout(() => {
              cardsOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
              cardsTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
            }, 300);
          }, 800 + 700);
        }, 800 + 600);
      }, 400);
    }, 200);
  }, []);

  const handleCardPress = (cardType: string) => {
    if (selectedCard !== null) return;
    
    setSelectedCard(cardType);
    setInteractionState('selected');
    
    setTimeout(() => {
      router.push({
        pathname: '/onboarding',
        params: { coachingStyle: cardType }
      });
    }, 300);
  };

  const handleInteractionStart = () => {
    if (selectedCard === null) {
      setInteractionState('touching');
    }
  };

  const handleInteractionEnd = () => {
    if (selectedCard === null) {
      setInteractionState('none');
    }
  };

  const getAuraState = (): 'idle' | 'listening' | 'processing' | 'responding' => {
    if (isFirstBubbleLoading || isSecondBubbleLoading || isThirdBubbleLoading) {
      return 'processing';
    }
    
    switch (interactionState) {
      case 'touching':
        return 'processing';
      case 'selected':
        return 'responding';
      default:
        return 'listening';
    }
  };

  // Animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: backgroundScale.value },
      { rotate: `${backgroundRotation.value}deg` }
    ],
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: avatarOpacity.value,
    transform: [{ scale: avatarScale.value }],
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
                <AuraProfileIcon state={getAuraState()} />
              </Animated.View>
            </View>

            {/* Chat Section */}
            <View style={styles.chatSection}>
              <View style={styles.chatContainer}>
                <Animated.View style={[styles.chatBubbleContainer, firstBubbleAnimatedStyle]}>
                  <View style={styles.chatBubble}>
                    {isFirstBubbleLoading ? (
                      <TypingIndicator isVisible={true} showBubble={false} />
                    ) : (
                      <Text style={styles.chatText}>Welcome.</Text>
                    )}
                  </View>
                </Animated.View>

                <Animated.View style={[styles.chatBubbleContainer, secondBubbleAnimatedStyle]}>
                  <View style={styles.chatBubble}>
                    {isSecondBubbleLoading ? (
                      <TypingIndicator isVisible={true} showBubble={false} />
                    ) : (
                      <Text style={styles.chatText}>I'm here to be a supportive partner, at your pace. No pressure.</Text>
                    )}
                  </View>
                </Animated.View>

                <Animated.View style={[styles.chatBubbleContainer, thirdBubbleAnimatedStyle]}>
                  <View style={styles.chatBubble}>
                    {isThirdBubbleLoading ? (
                      <TypingIndicator isVisible={true} showBubble={false} />
                    ) : (
                      <Text style={styles.chatText}>To start, I have one quick question to understand your style.</Text>
                    )}
                  </View>
                </Animated.View>
              </View>

              {/* Trust Pillars */}
              <Animated.View style={[styles.trustPillarsContainer, pillarsAnimatedStyle]}>
                <View style={styles.pillar}>
                  <View style={styles.pillarIconContainer}>
                    <Microscope size={20} color="#3b82f6" strokeWidth={2} />
                  </View>
                  <Text style={styles.pillarText}>Powered by Science</Text>
                </View>
                <View style={styles.pillar}>
                  <View style={styles.pillarIconContainer}>
                    <Heart size={20} color="#3b82f6" strokeWidth={2} />
                  </View>
                  <Text style={styles.pillarText}>Guided by Empathy</Text>
                </View>
                <View style={styles.pillar}>
                  <View style={styles.pillarIconContainer}>
                    <Shield size={20} color="#3b82f6" strokeWidth={2} />
                  </View>
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
                  onPressIn={handleInteractionStart}
                  onPressOut={handleInteractionEnd}
                  activeOpacity={0.8}
                  disabled={selectedCard !== null}
                >
                  {/* Animated border overlay */}
                  {selectedCard === 'planner' && (
                    <View style={styles.cardBorderOverlay} />
                  )}
                  
                  <View style={styles.cardContent}>
                    <View style={styles.cardIconContainer}>
                      <Compass 
                        size={24} 
                        color={selectedCard === 'planner' ? '#3b82f6' : '#64748b'} 
                        strokeWidth={2}
                      />
                    </View>
                    <Text style={[
                      styles.cardText,
                      selectedCard === 'planner' && styles.selectedCardText
                    ]}>
                      Meticulous Planner
                    </Text>
                    <Text style={[
                      styles.cardSubtext,
                      selectedCard === 'planner' && styles.selectedCardSubtext
                    ]}>
                      I like structure and detailed planning
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.card,
                    selectedCard === 'adapter' && styles.selectedCard
                  ]}
                  onPress={() => handleCardPress('adapter')}
                  onPressIn={handleInteractionStart}
                  onPressOut={handleInteractionEnd}
                  activeOpacity={0.8}
                  disabled={selectedCard !== null}
                >
                  {/* Animated border overlay */}
                  {selectedCard === 'adapter' && (
                    <View style={styles.cardBorderOverlay} />
                  )}
                  
                  <View style={styles.cardContent}>
                    <View style={styles.cardIconContainer}>
                      <Target 
                        size={24} 
                        color={selectedCard === 'adapter' ? '#3b82f6' : '#64748b'} 
                        strokeWidth={2}
                      />
                    </View>
                    <Text style={[
                      styles.cardText,
                      selectedCard === 'adapter' && styles.selectedCardText
                    ]}>
                      Flexible Adapter
                    </Text>
                    <Text style={[
                      styles.cardSubtext,
                      selectedCard === 'adapter' && styles.selectedCardSubtext
                    ]}>
                      I prefer to adapt and go with the flow
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
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
    // AuraProfileIcon handles its own styling
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
    alignItems: 'flex-start',
  },
  chatBubbleContainer: {
    marginBottom: 16,
    maxWidth: '80%',
    alignItems: 'flex-start',
  },
  chatBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
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
    marginBottom: 40,
    width: '100%',
  },
  pillar: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  pillarIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pillarText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#0C4A6E',
    textAlign: 'center',
    lineHeight: 14,
    opacity: 0.8,
  },
  cardsContainer: {
    gap: 20,
    width: '100%',
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: '#fefefe',
    borderColor: '#3b82f6',
    transform: [{ scale: 0.98 }],
  },
  cardBorderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 6,
  },
  selectedCardText: {
    color: '#3b82f6',
  },
  cardSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  selectedCardSubtext: {
    color: '#3b82f6',
    opacity: 0.9,
  },
});