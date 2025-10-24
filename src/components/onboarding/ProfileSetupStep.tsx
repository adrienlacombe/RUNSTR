/**
 * ProfileSetupStep Component
 * Profile setup during onboarding with optional photo upload
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActionSheetIOS,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Device from 'expo-device';
import { theme } from '../../styles/theme';
import {
  validateName,
  validateBio,
  validateLightningAddress,
  validateUrl,
} from '../../utils/profileValidation';
import { EditableProfile } from '../../services/nostr/NostrProfilePublisher';

interface ProfileSetupStepProps {
  onContinue: (profile: Partial<EditableProfile>) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export const ProfileSetupStep: React.FC<ProfileSetupStepProps> = ({
  onContinue,
  onSkip,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [banner, setBanner] = useState('');
  const [lightningAddress, setLightningAddress] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    bio?: string;
    lud16?: string;
    banner?: string;
  }>({});

  const handleNameChange = (text: string) => {
    setName(text);
    // Clear error when user starts typing
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleBioChange = (text: string) => {
    setBio(text);
    // Clear error when user starts typing
    if (errors.bio) {
      setErrors((prev) => ({ ...prev, bio: undefined }));
    }
  };

  const handleLightningAddressChange = (text: string) => {
    setLightningAddress(text);
    // Clear error when user starts typing
    if (errors.lud16) {
      setErrors((prev) => ({ ...prev, lud16: undefined }));
    }
  };

  const handleBannerChange = (text: string) => {
    setBanner(text);
    // Clear error when user starts typing
    if (errors.banner) {
      setErrors((prev) => ({ ...prev, banner: undefined }));
    }
  };

  const handlePickImage = async () => {
    console.log('[ProfileSetup] handlePickImage called');
    try {
      // Request permissions
      console.log('[ProfileSetup] Requesting photo library permissions...');
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('[ProfileSetup] Photo library permission status:', status);

      if (status !== 'granted') {
        console.warn('[ProfileSetup] Photo library permission denied');
        Alert.alert(
          'Permission Required',
          'Please grant photo library access in Settings to select a profile picture.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  // On iOS, we can't directly open settings, but user can navigate manually
                  Alert.alert(
                    'Open Settings',
                    'Please go to Settings > RUNSTR > Photos and enable access.'
                  );
                }
              },
            },
          ]
        );
        return;
      }

      // Launch image picker
      console.log('[ProfileSetup] Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('[ProfileSetup] Image picker result:', {
        canceled: result.canceled,
        assetsCount: result.assets?.length,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('[ProfileSetup] Image selected:', result.assets[0].uri);
        setProfilePicture(result.assets[0].uri);
      } else {
        console.log('[ProfileSetup] Image selection canceled by user');
      }
    } catch (error) {
      console.error('[ProfileSetup] Error picking image:', error);
      Alert.alert(
        'Error',
        'Failed to pick image. Please try again or contact support if the issue persists.'
      );
    }
  };

  const handleTakePhoto = async () => {
    console.log('[ProfileSetup] handleTakePhoto called');
    try {
      // Check if device has camera
      const hasCamera = await ImagePicker.getCameraPermissionsAsync();
      console.log('[ProfileSetup] Camera permissions check:', hasCamera);

      // Request permissions
      console.log('[ProfileSetup] Requesting camera permissions...');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('[ProfileSetup] Camera permission status:', status);

      if (status !== 'granted') {
        console.warn('[ProfileSetup] Camera permission denied');
        Alert.alert(
          'Permission Required',
          'Please grant camera access in Settings to take a profile picture.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Alert.alert(
                    'Open Settings',
                    'Please go to Settings > RUNSTR > Camera and enable access.'
                  );
                }
              },
            },
          ]
        );
        return;
      }

      // Launch camera
      console.log('[ProfileSetup] Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('[ProfileSetup] Camera result:', {
        canceled: result.canceled,
        assetsCount: result.assets?.length,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('[ProfileSetup] Photo captured:', result.assets[0].uri);
        setProfilePicture(result.assets[0].uri);
      } else {
        console.log('[ProfileSetup] Photo capture canceled by user');
      }
    } catch (error) {
      console.error('[ProfileSetup] Error taking photo:', error);
      Alert.alert(
        'Error',
        'Failed to take photo. Please try again or use the photo library instead.'
      );
    }
  };

  const handlePhotoOptions = async () => {
    console.log('[ProfileSetup] handlePhotoOptions called');
    console.log('[ProfileSetup] Device info:', {
      deviceType: Device.deviceType,
      platform: Platform.OS,
      isPad: Platform.OS === 'ios' && Platform.isPad,
    });

    // Check if camera is available
    const cameraPermissions = await ImagePicker.getCameraPermissionsAsync();
    const cameraAvailable =
      cameraPermissions.canAskAgain || cameraPermissions.granted;
    console.log(
      '[ProfileSetup] Camera available:',
      cameraAvailable,
      cameraPermissions
    );

    // Use ActionSheetIOS on iOS for better iPad support
    if (Platform.OS === 'ios') {
      const options = cameraAvailable
        ? ['Take Photo', 'Choose from Library', 'Cancel']
        : ['Choose from Library', 'Cancel'];
      const cancelButtonIndex = cameraAvailable ? 2 : 1;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: 'Profile Picture',
          message: 'Choose a photo source',
        },
        async (buttonIndex) => {
          console.log(
            '[ProfileSetup] ActionSheet button pressed:',
            buttonIndex
          );
          if (cameraAvailable) {
            if (buttonIndex === 0) {
              await handleTakePhoto();
            } else if (buttonIndex === 1) {
              await handlePickImage();
            }
          } else {
            if (buttonIndex === 0) {
              await handlePickImage();
            }
          }
        }
      );
    } else {
      // Android - use Alert
      const buttons = cameraAvailable
        ? [
            { text: 'Take Photo', onPress: handleTakePhoto },
            { text: 'Choose from Library', onPress: handlePickImage },
            { text: 'Cancel', style: 'cancel' as const },
          ]
        : [
            { text: 'Choose from Library', onPress: handlePickImage },
            { text: 'Cancel', style: 'cancel' as const },
          ];

      Alert.alert('Profile Picture', 'Choose a photo source', buttons);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePicture('');
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      bio?: string;
      lud16?: string;
      banner?: string;
    } = {};

    // Only validate if fields have content
    if (name) {
      const nameError = validateName(name);
      if (nameError) {
        newErrors.name = nameError;
      }
    }

    if (bio) {
      const bioError = validateBio(bio);
      if (bioError) {
        newErrors.bio = bioError;
      }
    }

    if (lightningAddress) {
      const lud16Error = validateLightningAddress(lightningAddress);
      if (lud16Error) {
        newErrors.lud16 = lud16Error;
      }
    }

    if (banner) {
      const bannerError = validateUrl(banner);
      if (bannerError) {
        newErrors.banner = bannerError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    console.log('[ProfileSetup] handleContinue called');
    if (!validateForm()) {
      console.warn('[ProfileSetup] Form validation failed');
      return;
    }

    // Build profile object - all fields are optional
    const profile: Partial<EditableProfile> = {};

    if (name.trim()) {
      profile.name = name.trim();
    }

    if (bio.trim()) {
      profile.about = bio.trim();
    }

    if (profilePicture) {
      profile.picture = profilePicture;
    }

    if (banner.trim()) {
      profile.banner = banner.trim();
    }

    if (lightningAddress.trim()) {
      profile.lud16 = lightningAddress.trim();
    }

    console.log('[ProfileSetup] Profile data prepared:', Object.keys(profile));
    onContinue(profile);
  };

  const handleSkipPress = () => {
    console.log('[ProfileSetup] Skip button pressed');
    console.log('[ProfileSetup] isLoading state:', isLoading);
    onSkip();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Set Up Your Profile</Text>
          <Text style={styles.subtitle}>
            Tell the RUNSTR community about yourself
          </Text>
        </View>

        {/* Profile Picture */}
        <View style={styles.photoSection}>
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={handlePhotoOptions}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID="profile-photo-button"
          >
            {profilePicture ? (
              <>
                <Image source={{ uri: profilePicture }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={handleRemovePhoto}
                  activeOpacity={0.8}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  testID="remove-photo-button"
                >
                  <Ionicons
                    name="close-circle"
                    size={28}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons
                  name="camera"
                  size={40}
                  color={theme.colors.textMuted}
                />
                <Text style={styles.photoPlaceholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Display Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={handleNameChange}
            placeholder="Your name"
            placeholderTextColor={theme.colors.textMuted}
            maxLength={50}
            autoCapitalize="words"
            returnKeyType="next"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          <Text style={styles.helperText}>{name.length}/50 characters</Text>
        </View>

        {/* Bio */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.textArea, errors.bio && styles.inputError]}
            value={bio}
            onChangeText={handleBioChange}
            placeholder="Tell us about yourself and your fitness goals..."
            placeholderTextColor={theme.colors.textMuted}
            maxLength={500}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
          <Text style={styles.helperText}>{bio.length}/500 characters</Text>
        </View>

        {/* Lightning Address */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Lightning Address
            <Text style={styles.optionalLabel}> (optional)</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.lud16 && styles.inputError]}
            value={lightningAddress}
            onChangeText={handleLightningAddressChange}
            placeholder="yourname@getalby.com"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          {errors.lud16 && <Text style={styles.errorText}>{errors.lud16}</Text>}
          <Text style={styles.helperText}>
            <Ionicons
              name="information-circle"
              size={12}
              color={theme.colors.textMuted}
            />{' '}
            Receive Bitcoin tips and rewards
          </Text>
        </View>

        {/* Banner URL */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Banner Image URL
            <Text style={styles.optionalLabel}> (optional)</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.banner && styles.inputError]}
            value={banner}
            onChangeText={handleBannerChange}
            placeholder="https://example.com/banner.jpg"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          {errors.banner && (
            <Text style={styles.errorText}>{errors.banner}</Text>
          )}
          <Text style={styles.helperText}>Banner image for your profile</Text>
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <Ionicons
            name="information-circle"
            size={20}
            color={theme.colors.text}
          />
          <Text style={styles.noteText}>
            You can always update your profile later in Settings
          </Text>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipPress}
          disabled={isLoading}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          testID="profile-skip-button"
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={isLoading}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          testID="profile-continue-button"
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Saving...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.background,
    borderRadius: 14,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  optionalLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textMuted,
  },
  input: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 120,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginTop: 6,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 6,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  noteText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  continueButton: {
    backgroundColor: theme.colors.orangeBright,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
});
