import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface AuraProfileIconProps {
  state: 'idle' | 'listening' | 'processing' | 'responding';
}

export default function AuraProfileIcon({ state }: AuraProfileIconProps) {
  // Animation values
  const pulseScale = useSharedValue(1);
  const innerPulse = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const swirl = useSharedValue(0);
  const flash = useSharedValue(0);
  const ringOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Cancel all existing animations
    cancelAnimation(pulseScale);
    cancelAnimation(innerPulse);
    cancelAnimation(glowOpacity);
    cancelAnimation(swirl);
    cancelAnimation(flash);
    cancelAnimation(ringOpacity);

    switch (state) {
      case 'idle':
        // Gentle pulsing animation - multiple rings
        glowOpacity.value = withTiming(0.2, { duration: 400 });
        ringOpacity.value = withTiming(0.4, { duration: 400 });
        
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.15, { 
              duration: 3000, 
              easing: Easing.inOut(Easing.sin) 
            }),
            withTiming(1, { 
              duration: 3000, 
              easing: Easing.inOut(Easing.sin) 
            })
          ),
          -1,
          false
        );

        innerPulse.value = withRepeat(
          withSequence(
            withTiming(1.3, { 
              duration: 2500, 
              easing: Easing.inOut(Easing.sin) 
            }),
            withTiming(1, { 
              duration: 2500, 
              easing: Easing.inOut(Easing.sin) 
            })
          ),
          -1,
          false
        );
        break;

      case 'listening':
        // Focused energy with steady glow
        pulseScale.value = withTiming(1.1, { duration: 400 });
        innerPulse.value = withTiming(1.2, { duration: 400 });
        glowOpacity.value = withTiming(0.7, { duration: 400 });
        ringOpacity.value = withTiming(0.8, { duration: 400 });
        break;

      case 'processing':
        // Dynamic swirling energy
        glowOpacity.value = withTiming(0.5, { duration: 400 });
        ringOpacity.value = withTiming(0.6, { duration: 400 });
        
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 1000 }),
            withTiming(1.05, { duration: 1000 })
          ),
          -1,
          true
        );

        innerPulse.value = withRepeat(
          withSequence(
            withTiming(1.4, { duration: 800 }),
            withTiming(1.1, { duration: 800 })
          ),
          -1,
          true
        );
        
        swirl.value = withRepeat(
          withTiming(360, { 
            duration: 3000, 
            easing: Easing.linear 
          }),
          -1,
          false
        );
        break;

      case 'responding':
        // Quick energy burst then gentle idle
        pulseScale.value = withTiming(1, { duration: 100 });
        innerPulse.value = withTiming(1, { duration: 100 });
        glowOpacity.value = withTiming(0.3, { duration: 100 });
        ringOpacity.value = withTiming(0.5, { duration: 100 });
        
        flash.value = withSequence(
          withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) })
        );

        // After flash, gentle idle animation
        setTimeout(() => {
          glowOpacity.value = withTiming(0.2, { duration: 600 });
          ringOpacity.value = withTiming(0.4, { duration: 600 });
          
          pulseScale.value = withRepeat(
            withSequence(
              withTiming(1.15, { 
                duration: 3000, 
                easing: Easing.inOut(Easing.sin) 
              }),
              withTiming(1, { 
                duration: 3000, 
                easing: Easing.inOut(Easing.sin) 
              })
            ),
            -1,
            false
          );
        }, 300);
        break;
    }
  }, [state]);

  // Animated styles
  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: glowOpacity.value,
  }));

  const middleRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value * 0.8 }],
    opacity: ringOpacity.value,
  }));

  const innerRingStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: innerPulse.value * 0.6 },
      { rotate: `${swirl.value}deg` }
    ],
    opacity: ringOpacity.value * 0.8,
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
    transform: [{ scale: pulseScale.value * 1.2 }],
  }));

  // Get colors based on state
  const getColors = () => {
    switch (state) {
      case 'idle':
        return {
          outer: ['rgba(226, 232, 240, 0.3)', 'rgba(96, 165, 250, 0.3)'], // slate-200 to blue-400
          middle: ['rgba(226, 232, 240, 0.5)', 'rgba(96, 165, 250, 0.5)'],
          inner: ['rgba(226, 232, 240, 0.7)', 'rgba(96, 165, 250, 0.7)'],
        };
      case 'listening':
        return {
          outer: ['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.2)'], // blue-500
          middle: ['rgba(59, 130, 246, 0.6)', 'rgba(59, 130, 246, 0.4)'],
          inner: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.6)'],
        };
      case 'processing':
        return {
          outer: ['rgba(139, 92, 246, 0.4)', 'rgba(99, 102, 241, 0.3)'], // purple-500 to indigo-500
          middle: ['rgba(139, 92, 246, 0.6)', 'rgba(99, 102, 241, 0.5)'],
          inner: ['rgba(139, 92, 246, 0.8)', 'rgba(99, 102, 241, 0.7)'],
        };
      case 'responding':
        return {
          outer: ['rgba(252, 211, 77, 0.4)', 'rgba(245, 158, 11, 0.3)'], // amber-300 to amber-500
          middle: ['rgba(252, 211, 77, 0.6)', 'rgba(245, 158, 11, 0.5)'],
          inner: ['rgba(252, 211, 77, 0.8)', 'rgba(245, 158, 11, 0.7)'],
        };
      default:
        return {
          outer: ['rgba(226, 232, 240, 0.3)', 'rgba(96, 165, 250, 0.3)'],
          middle: ['rgba(226, 232, 240, 0.5)', 'rgba(96, 165, 250, 0.5)'],
          inner: ['rgba(226, 232, 240, 0.7)', 'rgba(96, 165, 250, 0.7)'],
        };
    }
  };

  const colors = getColors();

  return (
    <View style={styles.container}>
      {/* Outer aura ring */}
      <Animated.View style={[styles.outerRing, outerRingStyle]}>
        <LinearGradient
          colors={colors.outer}
          style={styles.ring}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Middle aura ring */}
      <Animated.View style={[styles.middleRing, middleRingStyle]}>
        <LinearGradient
          colors={colors.middle}
          style={styles.ring}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Inner aura core */}
      <Animated.View style={[styles.innerRing, innerRingStyle]}>
        <LinearGradient
          colors={colors.inner}
          style={styles.ring}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Flash overlay for responding state */}
      <Animated.View style={[styles.flashOverlay, flashStyle]}>
        <LinearGradient
          colors={['rgba(252, 211, 77, 0.9)', 'rgba(245, 158, 11, 0.7)']}
          style={styles.ring}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  middleRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  innerRing: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  ring: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  flashOverlay: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});