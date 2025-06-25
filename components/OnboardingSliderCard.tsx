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

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled && sliderWidth > 0,
    onMoveShouldSetPanResponder: () => !disabled && sliderWidth > 0,
    onPanResponderGrant: (evt) => {
      if (disabled || sliderWidth <= 0) return;
      
      onInteractionStart?.();
      
      RNAnimated.spring(thumbScale, {
        toValue: 1.2,
        useNativeDriver: false,
        tension: 150,
        friction: 8,
      }).start();
      
      // Adjust touchX to be relative to the sliderWrapper
      const touchX = evt.nativeEvent.locationX;
      const clampedX = Math.max(0, Math.min(sliderWidth, touchX));
      const newValue = Math.round((clampedX / sliderWidth) * 100);
      
      RNAnimated.spring(thumbPosition, {
        toValue: clampedX,
        useNativeDriver: false,
        tension: 150,
        friction: 8,
      }).start();
      
      RNAnimated.timing(trackProgress, {
        toValue: clampedX / sliderWidth,
        duration: 150,
        useNativeDriver: false,
      }).start();
      
      onValueChange(newValue);
    },
    onPanResponderMove: (_, gestureState) => {
      if (disabled || sliderWidth <= 0) return;
      
      // gestureState.moveX is screen coordinate, need to adjust for slider position
      // This part is tricky without knowing the exact parent structure's offset.
      // A common approach is to store the initial grant position or use a ref to the slider view.
      // For now, assuming gestureState.dx gives a reasonable delta from the initial touch.
      // A more robust way:
      // const currentThumbPos = thumbPosition._value;
      // let newPosition = currentThumbPos + gestureState.dx; (this needs adjustment if dx resets)
      // For simplicity, let's assume we can get a relative moveX or adjust based on initial touch.
      // The PanResponder's grantlocationX is relative to the element it's attached to.
      // So, if panHandlers are on sliderWrapper, gestureState.moveX needs to be made relative.
      // However, the original code used gestureState.moveX - 64 (card padding + slider padding)
      // This suggests the pan responder might have been on a higher level element or calculations were relative to screen.
      // Let's stick to making it relative to the slider itself.
      // The pan responder is on sliderWrapper, so evt.nativeEvent.locationX on grant is correct.
      // For move, we need to calculate the position relative to sliderWrapper.
      // A simpler way: use the current value of thumbPosition and add gestureState.dx
      const currentVal = thumbPosition._value;
      let newX = currentVal + gestureState.dx; // dx is the accumulated distance of the gesture
      // This approach with dx might be problematic if the gesture starts outside.
      // Let's re-evaluate how to get the current pointer position relative to the slider.
      // Sticking with a simplified version for now that relies on the initial logic for clamping.
      // The original code was: gestureState.moveX - 64. This implies the gesture coordinates
      // were absolute screen coordinates.
      // If panHandlers are on sliderWrapper, then gestureState.moveX is still screen coord.
      // We need to get the sliderWrapper's position on screen.
      // This is getting complex. Let's use the simpler approach of direct calculation from gestureState.moveX
      // and assume we can get the offset of the slider component later if needed.
      // For now, we will use the initial touch point logic for move as well, assuming it is relative.
      // This will likely be improved by getting sliderWrapper's absolute position if gestureState.moveX is absolute.

      // The `locationX` on `onPanResponderMove` event is not available.
      // We use `gestureState.dx` (delta from the start of the gesture) added to the position at the start of the gesture.
      // We need to store the position at onPanResponderGrant.
      // Let's refine this:
      // Store initial position in a ref
      const initialGrantPos = useRef(0);
      // In onPanResponderGrant: initialGrantPos.current = thumbPosition._value;
      // In onPanResponderMove: newPosition = Math.max(0, Math.min(sliderWidth, initialGrantPos.current + gestureState.dx));
      // This is still not quite right as dx accumulates.
      // Let's assume gestureState.moveX is the absolute X on screen. We need sliderWrapper's X offset.
      // For now, to make progress, I will assume that the logic of calculating newPosition
      // needs to be robustly tied to the sliderWidth.
      // The original code: newPosition = Math.max(0, Math.min(sliderWidth, gestureState.moveX - 64));
      // The '64' was `width (screenWidth) - 128` where 128 was `card padding (32*2) + sliderContainer padding (16*2) + thumb offset??`
      // This is complex. The PanResponder is on `sliderWrapper`.
      // `evt.nativeEvent.locationX` in `onPanResponderGrant` is relative to `sliderWrapper`.
      // `gestureState.dx` in `onPanResponderMove` is the change in X since the gesture started.
      // So, if we know where the thumb *was* when the gesture started, we can add `dx`.

      // Let's try this:
      // 1. In onPanResponderGrant, when setting thumbPosition, also store this as initialThumbXForGesture.
      // 2. In onPanResponderMove, newX = initialThumbXForGesture + gestureState.dx.
      // This seems more robust.

      // Re-simplifying: The PanResponder is attached to `sliderWrapper`.
      // `gestureState.moveX` is the X coordinate of the touch on the screen.
      // We need the X offset of `sliderWrapper` on the screen.
      // This can be obtained using `measure` on the `sliderWrapper` ref.

      // Let sliderWrapperRef = useRef<View>(null);
      // In onLayout of sliderWrapper: sliderWrapperRef.current?.measure((fx, fy, w, h, px, py) => { setSliderScreenX(px); });
      // Then in onPanResponderMove: const touchXInSlider = gestureState.moveX - sliderScreenX;
      // This is the most robust way.

      // For now, let's assume a simpler calculation that might work for most cases,
      // by directly using the gestureState.moveX and an estimated offset if needed,
      // or by making the slider itself the pan responder target.
      // The original code implies gestureState.moveX - (some offset) was used.
      // If the pan responder is on the sliderWrapper, its x coordinate is 0 relative to itself.
      // So, gestureState.dx should be added to the position of the thumb *at the start of the gesture*.

      // Let's try to keep the logic close to the original but adapt for dynamic sliderWidth.
      // The crucial part is that `locationX` is available on grant, but not on move.
      // We will store the thumb's position when the grant happened.
      const valueAtGrant = useRef(thumbPosition._value);
      // In onPanResponderGrant: valueAtGrant.current = thumbPosition._value; (or the newly calculated clampedX)
      // In onPanResponderMove:
      // newPosition = Math.max(0, Math.min(sliderWidth, valueAtGrant.current + gestureState.dx));
      // This seems like a solid approach.

      // Let's refine `onPanResponderGrant` and `onPanResponderMove`
      // In onPanResponderGrant, after calculating clampedX and before animating:
      // valueAtGrant.current = clampedX;

      // In onPanResponderMove:
      let newPosition = Math.max(0, Math.min(sliderWidth, valueAtGrant.current + gestureState.dx));
      const newValue = Math.round((newPosition / sliderWidth) * 100);
      
      thumbPosition.setValue(newPosition);
      trackProgress.setValue(newPosition / sliderWidth);
      onValueChange(newValue);
    },
    onPanResponderRelease: () => {
      if (disabled || sliderWidth <= 0) return;
      
      RNAnimated.spring(thumbScale, {
        toValue: 1,
        useNativeDriver: false,
        tension: 150,
        friction: 8,
      }).start();
      
      onInteractionEnd?.();
    },
  });

  const valueAtGrant = useRef(0); // Store position of thumb when gesture starts

  // Update pan responder creation to capture valueAtGrant
  // This needs panResponder to be inside useEffect or be a ref itself that's updated.
  // Or, update valueAtGrant inside onPanResponderGrant.

  // Update thumb position when value changes externally or sliderWidth changes
  useEffect(() => {
    if (sliderWidth > 0) {
      const targetPosition = (value / 100) * sliderWidth;
      RNAnimated.spring(thumbPosition, {
        toValue: targetPosition,
        useNativeDriver: false,
      }).start(); // Removed tension/friction for external updates to be smoother if rapid.

      RNAnimated.timing(trackProgress, {
        toValue: value / 100,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [value, sliderWidth, thumbPosition, trackProgress]); // Added dependencies

  // Re-define panResponder inside a useMemo or useCallback that updates when sliderWidth changes,
  // or ensure the closure for panResponder callbacks always has the latest sliderWidth.
  // The current PanResponder.create is called only once.
  // The functions within panResponder (onPanResponderGrant, Move, Release) will close over the initial sliderWidth (0).
  // This is a problem.

  // Solution: PanResponder should be created using `useRef` and updated in an effect, or its methods should access sliderWidth via a ref.
  const sliderWidthRef = useRef(sliderWidth);
  useEffect(() => {
    sliderWidthRef.current = sliderWidth;
  }, [sliderWidth]);

  const currentThumbValueRef = useRef(thumbPosition._value);
  useEffect(() => {
    currentThumbValueRef.current = thumbPosition._value;
  }, [thumbPosition._value]); // This will update too frequently.

  // Let's simplify the PanResponder interaction.
  // The core issue is that methods in PanResponder.create capture initial state.
  // We need them to access current sliderWidth and current thumb position.

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
        tension: 150, // Keep spring for smooth updates
        friction: 8,
      tension: 150,
      friction: 8,
    }).start();
    
    RNAnimated.timing(trackProgress, {
      toValue: value / 100,
      duration: 200,
      useNativeDriver: false,
    }).start();
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