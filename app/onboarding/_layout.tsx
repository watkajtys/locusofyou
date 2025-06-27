import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="initial" />
      <Stack.Screen name="conscientiousness" />
      <Stack.Screen name="regulatory-focus" />
      <Stack.Screen name="locus-of-control" />
      <Stack.Screen name="mindset" />
      <Stack.Screen name="extraversion" />
      <Stack.Screen name="agreeableness" />
      <Stack.Screen name="final" />
    </Stack>
  );
}
