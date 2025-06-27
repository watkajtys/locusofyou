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
  withRepeat,
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

  // Enhanced animation values
  const backgroundScale = useSharedValue(1);
  const backgroundRotation = useSharedValue(0);
  const gradientStartX = useSharedValue(0);
  const gradientStartY = useSharedValue(0);
  const gradientEndX = useSharedValue(1);
  const gradientEndY = useSharedValue(1);
  const avatarOpacity = useSharedValue(0);
  const avatarScale = useSharedValue(0.8);
  const firstBubbleOpacity = useSharedValue(0);
  const firstBubbleTranslateY = useSharedValue(20);
  const firstBubbleScale = useSharedValue(0.95);
  const secondBubbleOpacity = useSharedValue(0);
  const secondBubbleTranslateY = useSharedValue(20);
  const secondBubbleScale = useSharedValue(0.95);
  const thirdBubbleOpacity = useSharedValue(0);
  const thirdBubbleTranslateY = useSharedValue(20);
  const thirdBubbleScale = useSharedValue(0.95);
  const pillarsOpacity = useSharedValue(0);
  const pillarsTranslateY = useSharedValue(20);
  const cardsOpacity = useSharedValue(0);
  const cardsTranslateY = useSharedValue(30);
  const cardsScale = useSharedValue(0.95);

  useEffect(() => {
    // Enhanced breathing background animation
    backgroundScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) })
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

    // Enhanced gradient animation
    gradientStartX.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 15000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-0.1, { duration: 15000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 15000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    gradientStartY.value = withRepeat(
      withSequence(
        withTiming(-0.1, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.2, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 12000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    gradientEndX.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 18000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.9, { duration: 18000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    gradientEndY.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.2, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // Start the animation sequence
    setTimeout(() => {
      // Avatar animation
      avatarOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      avatarScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });

      // Enhanced first bubble animation
      setTimeout(() => {
        firstBubbleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        firstBubbleTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
        firstBubbleScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
        setTimeout(() => {
          setIsFirstBubbleLoading(false);
        }, 600);

        // Enhanced second bubble animation
        setTimeout(() => {
          secondBubbleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
          secondBubbleTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
          secondBubbleScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
          setTimeout(() => {
            setIsSecondBubbleLoading(false);
          }, 700);

          // Enhanced trust pillars animation
          pillarsOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
          pillarsTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });

          // Enhanced third bubble and cards
          setTimeout(() => {
            thirdBubbleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
            thirdBubbleTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
            thirdBubbleScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
            setTimeout(() => {
              setIsThirdBubbleLoading(false);
            }, 600);

            setTimeout(() => {
              cardsOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
              cardsTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
              cardsScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
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

  // Enhanced animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: backgroundScale.value },
      { rotate: `${backgroundRotation.value}deg` }
    ],
  }));

  const gradientAnimatedStyle = useAnimatedStyle(() => ({
    flex: 1,
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: avatarOpacity.value,
    transform: [{ scale: avatarScale.value }],
  }));

  const firstBubbleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: firstBubbleOpacity.value,
    transform: [
      { translateY: firstBubbleTranslateY.value },
      { scale: firstBubbleScale.value }
    ],
  }));

  const secondBubbleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: secondBubbleOpacity.value,
    transform: [
      { translateY: secondBubbleTranslateY.value },
      { scale: secondBubbleScale.value }
    ],
  }));

  const thirdBubbleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: thirdBubbleOpacity.value,
    transform: [
      { translateY: thirdBubbleTranslateY.value },
      { scale: thirdBubbleScale.value }
    ],
  }));

  const pillarsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pillarsOpacity.value,
    transform: [{ translateY: pillarsTranslateY.value }],
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
    transform: [
      { translateY: cardsTranslateY.value },
      { scale: cardsScale.value }
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Enhanced Animated Background */}
      <Animated.View style={[styles.backgroundContainer, backgroundAnimatedStyle]}>
        <Animated.View style={gradientAnimatedStyle}>
          <LinearGradient
            colors={['#e0f2fe', '#dbeafe', '#f0f9ff']}
            style={styles.backgroundGradient}
            start={{ 
              x: gradientStartX.value, 
              y: gradientStartY.value 
            }}
            end={{ 
              x: gradientEndX.value, 
              y: gradientEndY.value 
            }}
          />
        </Animated.View>
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
                The first AI coach that understands *why* you're stuck.
              </Text>
              <Text style={styles.subHeadline}>
                LocusOfYou is a new type of AI coach. We use proven psychology to diagnose the root of procrastination and inaction, helping you build lasting motivation and reclaim your personal agency.
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
                  <View style={[
                    styles.chatBubble,
                    selectedCard && styles.chatBubbleSelected
                  ]}>
                    {isFirstBubbleLoading ? (
                      <TypingIndicator isVisible={true} showBubble={false} />
                    ) : (
                      <Text style={styles.chatText}>Welcome.</Text>
                    )}
                  </View>
                </Animated.View>

                <Animated.View style={[styles.chatBubbleContainer, secondBubbleAnimatedStyle]}>
                  <View style={[
                    styles.chatBubble,
                    selectedCard && styles.chatBubbleSelected
                  ]}>
                    {isSecondBubbleLoading ? (
                      <TypingIndicator isVisible={true} showBubble={false} />
                    ) : (
                      <Text style={styles.chatText}>I'm here to be a supportive partner, at your pace. No pressure.</Text>
                    )}
                  </View>
                </Animated.View>

                <Animated.View style={[styles.chatBubbleContainer, thirdBubbleAnimatedStyle]}>
                  <View style={[
                    styles.chatBubble,
                    selectedCard && styles.chatBubbleSelected
                  ]}>
                    {isThirdBubbleLoading ? (
                      <TypingIndicator isVisible={true} showBubble={false} />
                    ) : (
                      <Text style={styles.chatText}>To get started, I have one quick question to understand your style.</Text>
                    )}
                  </View>
                </Animated.View>
              </View>

              {/* Enhanced Trust Pillars */}
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

              {/* Enhanced Interactive Cards */}
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
                  {/* Enhanced animated border overlay */}
                  {selectedCard === 'planner' && (
                    <Animated.View style={[
                      styles.cardBorderOverlay,
                      {
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                        elevation: 12,
                      }
                    ]} />
                  )}
                  
                  <View style={styles.cardContent}>
                    <View style={[
                      styles.cardIconContainer,
                      selectedCard === 'planner' && styles.selectedCardIconContainer
                    ]}>
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
                  {/* Enhanced animated border overlay */}
                  {selectedCard === 'adapter' && (
                    <Animated.View style={[
                      styles.cardBorderOverlay,
                      {
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                        elevation: 12,
                      }
                    ]} />
                  )}
                  
                  <View style={styles.cardContent}>
                    <View style={[
                      styles.cardIconContainer,
                      selectedCard === 'adapter' && styles.selectedCardIconContainer
                    ]}>
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
    transition: 'all 0.3s ease',
  },
  chatBubbleSelected: {
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
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
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
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
    shadowColor: '#3b82f6',
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
  selectedCardIconContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
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