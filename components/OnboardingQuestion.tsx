import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Compass } from 'lucide-react-native';

interface OnboardingQuestionProps {
  questionText: string;
  icon?: React.ReactNode;
}

export default function OnboardingQuestion({ 
  questionText, 
  icon 
}: OnboardingQuestionProps) {
  // Default to compass icon if none provided
  const IconComponent = icon || <Compass size={24} color="#94a3b8" strokeWidth={2} />;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {IconComponent}
      </View>
      <Text style={styles.questionText}>
        {questionText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 24, // rounded-2xl equivalent
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10, // shadow-lg equivalent for Android
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 17,
    lineHeight: 26,
    fontFamily: 'Inter-Regular',
    color: '#1e293b', // slate-800
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});