import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useOnboarding } from '@/context/OnboardingContext';

export default function OnboardingIndexScreen() {
  const { updateOnboardingData, resetOnboardingData } = useOnboarding();
  const { coachingStyle } = useLocalSearchParams<{ coachingStyle?: string }>();

  useEffect(() => {
    // Reset any previous onboarding data when starting fresh
    resetOnboardingData();
    if (coachingStyle) {
      updateOnboardingData({ coachingStyle });
    }
    // Redirect to the first actual step of the onboarding flow
    router.replace('/onboarding/initial');
  }, [coachingStyle]);

  return null; // This screen doesn't render anything, it just redirects
}
