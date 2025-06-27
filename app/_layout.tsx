import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        {/* Remove old onboarding route, will be replaced by group */}
        {/* <Stack.Screen name="onboarding" /> */}
        <Stack.Screen name="chat" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </OnboardingProvider>
  );
}