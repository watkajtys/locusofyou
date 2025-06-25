import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Star, Shield } from 'lucide-react-native';

interface OnboardingChoiceButtonsProps {
  onChoice: (choice: 'promotion' | 'prevention') => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

export default function OnboardingChoiceButtons({ 
  onChoice, 
  onInteractionStart,
  onInteractionEnd 
}: OnboardingChoiceButtonsProps) {
  const [selectedChoice, setSelectedChoice] = useState<'promotion' | 'prevention' | null>(null);
  
  // Animation values for button press feedback
  const promotionScale = useSharedValue(1);
  const preventionScale = useSharedValue(1);
  const promotionBorderOpacity = useSharedValue(0);
  const preventionBorderOpacity = useSharedValue(0);

  const handlePromotionPress = () => {
    if (selectedChoice !== null) return;
    
    setSelectedChoice('promotion');
    onInteractionStart?.(); // Notify parent of interaction start
    
    // Animate button feedback
    promotionScale.value = withSpring(0.98, {}, () => {
      promotionScale.value = withSpring(1);
    });
    promotionBorderOpacity.value = withTiming(1, { duration: 200 });
    
    // Call parent callback after animation
    setTimeout(() => {
      onChoice('promotion');
      onInteractionEnd?.(); // Notify parent of interaction end
    }, 200);
  };

  const handlePreventionPress = () => {
    if (selectedChoice !== null) return;
    
    setSelectedChoice('prevention');
    onInteractionStart?.(); // Notify parent of interaction start
    
    // Animate button feedback
    preventionScale.value = withSpring(0.98, {}, () => {
      preventionScale.value = withSpring(1);
    });
    preventionBorderOpacity.value = withTiming(1, { duration: 200 });
    
    // Call parent callback after animation
    setTimeout(() => {
      onChoice('prevention');
      onInteractionEnd?.(); // Notify parent of interaction end
    }, 200);
  };

  // Handle touch feedback for aura state
  const handleTouchStart = (buttonType: 'promotion' | 'prevention') => {
    if (selectedChoice !== null) return;
    onInteractionStart?.();
  };

  const handleTouchEnd = () => {
    if (selectedChoice !== null) return;
    onInteractionEnd?.();
  };

  // Animated styles
  const promotionAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: promotionScale.value }],
  }));

  const preventionAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: preventionScale.value }],
  }));

  const promotionBorderStyle = useAnimatedStyle(() => ({
    opacity: promotionBorderOpacity.value,
  }));

  const preventionBorderStyle = useAnimatedStyle(() => ({
    opacity: preventionBorderOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Promotion Focus Button */}
      <Animated.View style={[promotionAnimatedStyle]}>
        <TouchableOpacity
          style={[
            styles.button,
            selectedChoice === 'promotion' && styles.selectedButton
          ]}
          onPress={handlePromotionPress}
          onPressIn={() => handleTouchStart('promotion')}
          onPressOut={handleTouchEnd}
          activeOpacity={0.9}
          disabled={selectedChoice !== null}
        >
          {/* Animated border overlay */}
          <Animated.View style={[styles.borderOverlay, promotionBorderStyle]} />
          
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <Star 
                size={24} 
                color="#f59e0b" // amber-400
                strokeWidth={2}
                fill={selectedChoice === 'promotion' ? '#f59e0b' : 'transparent'}
              />
            </View>
            <Text style={[
              styles.buttonText,
              selectedChoice === 'promotion' && styles.selectedButtonText
            ]}>
              Striving to achieve a positive outcome
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Prevention Focus Button */}
      <Animated.View style={[preventionAnimatedStyle]}>
        <TouchableOpacity
          style={[
            styles.button,
            selectedChoice === 'prevention' && styles.selectedButton
          ]}
          onPress={handlePreventionPress}
          onPressIn={() => handleTouchStart('prevention')}
          onPressOut={handleTouchEnd}
          activeOpacity={0.9}
          disabled={selectedChoice !== null}
        >
          {/* Animated border overlay */}
          <Animated.View style={[styles.borderOverlay, preventionBorderStyle]} />
          
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <Shield 
                size={24} 
                color="#0ea5e9" // sky-400
                strokeWidth={2}
                fill={selectedChoice === 'prevention' ? '#0ea5e9' : 'transparent'}
              />
            </View>
            <Text style={[
              styles.buttonText,
              selectedChoice === 'prevention' && styles.selectedButtonText
            ]}>
              Working hard to prevent a negative one
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 50, // fully rounded (rounded-full)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10, // shadow-lg equivalent for Android
    position: 'relative',
    overflow: 'hidden',
    minHeight: 80,
  },
  selectedButton: {
    backgroundColor: '#fefefe',
  },
  borderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3b82f6', // blue-500
    opacity: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
    color: '#374151', // slate-700
    flex: 1,
    textAlign: 'left',
  },
  selectedButtonText: {
    fontFamily: 'Inter-Bold',
    color: '#1e293b', // slate-800 for selected state
  },
});