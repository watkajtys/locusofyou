import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import AuraProfileIcon from './AuraProfileIcon';

interface OnboardingStepHeaderProps {
  onBackPress: () => void;
  auraState?: 'idle' | 'listening' | 'processing' | 'responding';
}

export default function OnboardingStepHeader({ 
  onBackPress, 
  auraState = 'listening' 
}: OnboardingStepHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onBackPress}
        activeOpacity={0.7}
      >
        <ChevronLeft size={24} color="#475569" strokeWidth={2} />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Discovering Your Drive</Text>
      </View>
      
      <View style={styles.auraContainer}>
        <AuraProfileIcon state={auraState} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 72, // Fixed header height for consistency
  },
  backButton: {
    padding: 8,
    width: 40, // Fixed width to ensure consistent spacing
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#374151', // slate-700
    fontWeight: '600', // Semi-bold
    textAlign: 'center',
  },
  auraContainer: {
    width: 40, // Fixed width to match back button
    alignItems: 'center',
    justifyContent: 'center',
  },
});