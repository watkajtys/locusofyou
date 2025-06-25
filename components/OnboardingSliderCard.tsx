import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated as RNAnimated,
  LayoutChangeEvent,
} from 'react-native';

interface OnboardingSliderCardProps {
  questionText: string;
  leftLabel: string;
  rightLabel: string;
  value: number; // 0-100
  onValueChange: (value: number) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function OnboardingSliderCard({
  questionText,
  leftLabel,
  rightLabel,
  value,
  onValueChange,
  onInteractionStart,
  onInteractionEnd,
  disabled = false,
  icon
}: OnboardingSliderCardProps) {
  const [sliderWidth, setSliderWidth] = React.useState(0);
  const thumbPosition = useRef(new RNAnimated.Value(0)).current;
  const thumbScale = useRef(new RNAnimated.Value(1)).current;
  const trackProgress = useRef(new RNAnimated.Value(0)).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: newWidth } = event.nativeEvent.layout;
    setSliderWidth(newWidth);
  };

  useEffect(() => {
    if (sliderWidth > 0) {
      const initialPosition = (value / 100) * sliderWidth;
      thumbPosition.setValue(initialPosition);
      trackProgress.setValue(value / 100);
    }
  }, [sliderWidth, value]); // Initial position set when sliderWidth is known

  const valueAtGrant = useRef(0); // Store position of thumb when gesture starts

  // We need refs to access current values in PanResponder
  const sliderWidthRef = useRef(sliderWidth);
  useEffect(() => {
    sliderWidthRef.current = sliderWidth;
  }, [sliderWidth]);

  const panResponderRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && sliderWidthRef.current > 0,
      onMoveShouldSetPanResponder: () => !disabled && sliderWidthRef.current > 0,
      onPanResponderGrant: (evt) => {
        if (disabled || sliderWidthRef.current <= 0) return;
        onInteractionStart?.();
        RNAnimated.spring(thumbScale, { toValue: 1.2, useNativeDriver: false, tension: 150, friction: 8 }).start();

        const currentSliderWidth = sliderWidthRef.current;
        const touchX = evt.nativeEvent.locationX; // Relative to sliderWrapper
        const clampedX = Math.max(0, Math.min(currentSliderWidth, touchX));
        valueAtGrant.current = clampedX; // Store the grant position

        const newValue = Math.round((clampedX / currentSliderWidth) * 100);

        RNAnimated.spring(thumbPosition, { toValue: clampedX, useNativeDriver: false, tension: 150, friction: 8 }).start();
        RNAnimated.timing(trackProgress, { toValue: clampedX / currentSliderWidth, duration: 150, useNativeDriver: false }).start();
        onValueChange(newValue);
      },
      onPanResponderMove: (_, gestureState) => {
        if (disabled || sliderWidthRef.current <= 0) return;
        const currentSliderWidth = sliderWidthRef.current;
        let newPosition = Math.max(0, Math.min(currentSliderWidth, valueAtGrant.current + gestureState.dx));
        const newValue = Math.round((newPosition / currentSliderWidth) * 100);

        thumbPosition.setValue(newPosition);
        trackProgress.setValue(newPosition / currentSliderWidth);
        onValueChange(newValue);
      },
      onPanResponderRelease: () => {
        if (disabled || sliderWidthRef.current <= 0) return;
        RNAnimated.spring(thumbScale, { toValue: 1, useNativeDriver: false, tension: 150, friction: 8 }).start();
        onInteractionEnd?.();
      },
    })
  ).current;

  // Update thumb position when value changes externally
  useEffect(() => {
    if (sliderWidth > 0) { // Ensure sliderWidth is calculated before setting position
      const targetPosition = (value / 100) * sliderWidth;
      RNAnimated.spring(thumbPosition, {
        toValue: targetPosition,
        useNativeDriver: false,
        tension: 150,
        friction: 8,
      }).start();
      
      RNAnimated.timing(trackProgress, {
        toValue: value / 100,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [value, sliderWidth]);

  return (
    <View style={styles.card}>
      {/* Optional Icon */}
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      
      {/* Question Text */}
      <Text style={styles.questionText}>{questionText}</Text>
      
      {/* Slider Container */}
      <View style={styles.sliderContainer}>
        <View
          style={styles.sliderWrapper}
          onLayout={handleLayout} // Get width dynamically
          {...panResponderRef.panHandlers} // Use the ref for PanResponder
        >
          {/* Track Background */}
          <View style={styles.trackBackground} />
          
          {/* Track Progress */}
          <RNAnimated.View 
            style={[
              styles.trackProgress,
              {
                width: trackProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]} 
          />
          
          {/* Thumb */}
          <RNAnimated.View 
            style={[
              styles.thumb,
              {
                left: thumbPosition,
                transform: [{ scale: thumbScale }],
              }
            ]} 
          >
            <View style={styles.thumbInner} />
          </RNAnimated.View>
        </View>
      </View>
      
      {/* Labels */}
      <View style={styles.labelsContainer}>
        <Text style={styles.leftLabel}>{leftLabel}</Text>
        <Text style={styles.rightLabel}>{rightLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 40,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Inter-Regular',
    color: '#1e293b', // slate-800
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: -0.2,
  },
  sliderContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sliderWrapper: {
    height: 60,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    height: 6,
    backgroundColor: '#e2e8f0', // slate-200
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  trackProgress: {
    height: 6,
    backgroundColor: '#3b82f6', // blue-500
    borderRadius: 3,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6', // blue-500
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  leftLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b', // slate-500
    textAlign: 'left',
    flex: 1,
    lineHeight: 20,
  },
  rightLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b', // slate-500
    textAlign: 'right',
    flex: 1,
    lineHeight: 20,
  },
});