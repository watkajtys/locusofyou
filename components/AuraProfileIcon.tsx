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
import { Brain } from 'lucide-react-native';

interface AuraProfileIconProps {
  state: 'idle' | 'listening' | 'processing' | 'responding';
}

export default function AuraProfileIcon({ state }: AuraProfileIconProps) {
  // Animation values
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const swirl = useSharedValue(0);
  const flash = useSharedValue(0);
  const backgroundOpacity = useSharedValue(1);

  // Color values for smooth transitions
  const backgroundColorProgress = useSharedValue(0); // 0 = idle, 1 = listening, 2 = processing

  useEffect(() => {
    // Cancel all existing animations
    cancelAnimation(pulseScale);
    cancelAnimation(glowOpacity);
    cancelAnimation(swirl);
    cancelAnimation(flash);
    cancelAnimation(backgroundColorProgress);

    switch (state) {
      case 'idle':
        // Gentle pulsing animation (5-7 seconds per cycle)
        backgroundColorProgress.value = withTiming(0, { duration: 600 });
        glowOpacity.value = withTiming(0, { duration: 400 });
        
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.08, { 
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
        break;

      case 'listening':
        // Solid blue with constant outer glow
        backgroundColorProgress.value = withTiming(1, { duration: 600 });
        pulseScale.value = withTiming(1, { duration: 400 });
        
        glowOpacity.value = withTiming(0.6, { duration: 400 });
        break;

      case 'processing':
        // Swirling gradient animation
        backgroundColorProgress.value = withTiming(2, { duration: 600 });
        pulseScale.value = withTiming(1, { duration: 400 });
        glowOpacity.value = withTiming(0.3, { duration: 400 });
        
        swirl.value = withRepeat(
          withTiming(360, { 
            duration: 4000, 
            easing: Easing.linear 
          }),
          -1,
          false
        );
        break;

      case 'responding':
        // Brief amber flash then return to idle
        backgroundColorProgress.value = withTiming(0, { duration: 100 });
        pulseScale.value = withTiming(1, { duration: 100 });
        glowOpacity.value = withTiming(0, { duration: 100 });
        
        flash.value = withSequence(
          withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) })
        );

        // After flash, start idle animation
        setTimeout(() => {
          if (state === 'responding') {
            pulseScale.value = withRepeat(
              withSequence(
                withTiming(1.08, { 
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
          }
        }, 300);
        break;
    }
  }, [state]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const swirlStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swirl.value}deg` }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  // Get gradient colors based on state
  const getGradientColors = () => {
    switch (state) {
      case 'idle':
        return ['#e2e8f0', '#60a5fa']; // slate-200 to blue-400
      case 'listening':
        return ['#3b82f6', '#3b82f6']; // solid blue-500
      case 'processing':
        return ['#8b5cf6', '#6366f1']; // purple-500 to indigo-500
      case 'responding':
        return ['#e2e8f0', '#60a5fa']; // same as idle for base
      default:
        return ['#e2e8f0', '#60a5fa'];
    }
  };

  return (
    <View style={styles.container}>
      {/* Outer glow effect */}
      <Animated.View style={[styles.glow, glowStyle]} />
      
      {/* Main icon container */}
      <Animated.View style={[styles.iconContainer, containerStyle]}>
        {/* Processing swirl effect */}
        {state === 'processing' && (
          <Animated.View style={[styles.swirlContainer, swirlStyle]}>
            <LinearGradient
              colors={getGradientColors()}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
        )}
        
        {/* Main background gradient */}
        {state !== 'processing' && (
          <LinearGradient
            colors={getGradientColors()}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        
        {/* Flash overlay for responding state */}
        <Animated.View style={[styles.flashOverlay, flashStyle]} />
        
        {/* Brain icon */}
        <View style={styles.iconWrapper}>
          <Brain size={20} color="#ffffff" strokeWidth={2} />
        </View>
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
  glow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    opacity: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  swirlContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  flashOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#fcd34d', // amber-300
    opacity: 0,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});