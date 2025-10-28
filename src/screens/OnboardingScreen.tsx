/**
 * OnboardingScreen
 * Complete onboarding flow for new users
 * Combines slides, password notice, and background caching
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { PasswordNotice } from '../components/onboarding/PasswordNotice';
import { PermissionRequestStep } from '../components/onboarding/PermissionRequestStep';
import OnboardingCacheService from '../services/cache/OnboardingCacheService';
import { theme } from '../styles/theme';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@runstr:onboarding_completed',
  USER_NSEC: '@runstr:user_nsec',
} as const;

interface OnboardingScreenProps {
  route?: {
    params?: {
      nsec?: string; // The generated password (nsec)
    };
  };
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  route,
}) => {
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = useState<
    'slides' | 'password' | 'permissions'
  >('slides');
  const [isLoading, setIsLoading] = useState(false);
  const [userPassword, setUserPassword] = useState<string>('');

  useEffect(() => {
    // Get the nsec from route params or storage
    const loadPassword = async () => {
      // Try to get nsec from route params first
      let nsec: string | null | undefined = route?.params?.nsec;

      // If not in params, try AsyncStorage
      if (!nsec) {
        nsec = await AsyncStorage.getItem(STORAGE_KEYS.USER_NSEC);
      }

      if (nsec) {
        console.log(
          '[Onboarding] Password loaded successfully:',
          nsec.slice(0, 10) + '...'
        );
        setUserPassword(nsec || '');
      } else {
        console.error('[Onboarding] ⚠️ No nsec found in params or storage!');
        console.error(
          '[Onboarding] This screen should only be accessed after signup.'
        );
        console.error('[Onboarding] Redirecting to login screen...');

        // Safeguard: If no nsec is available, user shouldn't be in onboarding
        // This can happen if onboarding is incorrectly accessed (e.g., after sign out)
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }, 1000);
        return;
      }
    };

    loadPassword();

    // Start background caching when onboarding begins
    OnboardingCacheService.startBackgroundCaching();
  }, [route?.params?.nsec, navigation]);

  const handleSlidesComplete = () => {
    console.log('[Onboarding] Slides completed, showing password notice');
    setCurrentStep('password');
  };

  const handlePasswordContinue = () => {
    console.log('[Onboarding] Password acknowledged, moving to permissions');
    setCurrentStep('permissions');
  };

  const handlePermissionsContinue = async () => {
    console.log('[Onboarding] Permissions granted, completing onboarding');
    await completeOnboarding();
  };

  const handlePermissionsSkip = async () => {
    console.log('[Onboarding] Permissions skipped, completing onboarding');
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    setIsLoading(true);

    try {
      // Mark onboarding as completed
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');

      // Clear the new signup flag (onboarding complete)
      await AsyncStorage.removeItem('@runstr:is_new_signup');

      console.log(
        '[Onboarding] ✅ Onboarding flags set, App.tsx will auto-navigate to MainTabs'
      );

      // Don't navigate - App.tsx will detect the flag change and show MainTabs automatically
      // This prevents navigation errors since MainTabs isn't in this navigator's stack
    } catch (error) {
      console.error('[Onboarding] Failed to complete onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {currentStep === 'slides' ? (
        <OnboardingWizard
          onComplete={handleSlidesComplete}
          isLoading={isLoading}
        />
      ) : currentStep === 'password' ? (
        <PasswordNotice
          password={userPassword}
          onContinue={handlePasswordContinue}
        />
      ) : (
        <PermissionRequestStep
          onContinue={handlePermissionsContinue}
          onSkip={handlePermissionsSkip}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
