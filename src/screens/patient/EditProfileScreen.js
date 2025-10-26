import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { useAuth, usePatientData } from '../../contexts/AppContext';
import { Colors } from '../../constants/theme';

const EditProfileScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user, updateUser } = useUnifiedAuth();
  const { currentUser, currentPatient, fetchCurrentPatientData } = useAuth();
  const { patient } = usePatientData();
  
  // Determine the current profile data from multiple sources
  const getInitialProfileData = () => {
    const profileSources = currentPatient || patient || user?.userData || {};
    console.log('🔍 Getting initial profile data from:', {
      source: currentPatient ? 'currentPatient' : patient ? 'patient' : user?.userData ? 'user.userData' : 'none',
      name: profileSources?.name,
      email: profileSources?.email,
      profileImage: profileSources?.profileImage
    });
    
    return {
      name: profileSources?.name || '',
      email: profileSources?.email || '',
      phone: profileSources?.phone || '',
      dateOfBirth: profileSources?.dateOfBirth || '',
      bloodGroup: profileSources?.bloodGroup || '',
      address: profileSources?.address || '',
      emergencyContact: profileSources?.emergencyContact || '',
      profileImage: profileSources?.profileImage || null,
    };
  };
  
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Initialize with profile data
  const initialData = getInitialProfileData();
  const [profileImage, setProfileImage] = useState(initialData.profileImage);
  const [formData, setFormData] = useState(initialData);

  // Update form data when profile data changes
  useEffect(() => {
    const updatedData = getInitialProfileData();
    console.log('🔄 Profile data updated:', {
      newName: updatedData.name,
      newImage: updatedData.profileImage,
      currentFormName: formData.name,
      currentImage: profileImage
    });
    
    setFormData(updatedData);
    setProfileImage(updatedData.profileImage);
  }, [currentPatient, patient, user]);

  console.log('📋 EditProfileScreen initialized with data:', {
    hasCurrentPatient: !!currentPatient,
    hasPatient: !!patient,
    hasUser: !!user,
    formDataName: formData.name,
    profileImage: !!profileImage
  });

  const isValidBloodGroup = (bloodGroup) => {
    // Valid blood groups: A+, A-, B+, B-, AB+, AB-, O+, O-
    const normalizedInput = bloodGroup.trim().toUpperCase();
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return validBloodGroups.includes(normalizedInput);
  };

  const pickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access gallery is required!');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      console.log('📸 Image selected:', {
        uri: imageUri,
        size: result.assets[0].fileSize,
        width: result.assets[0].width,
        height: result.assets[0].height
      });
      
      setProfileImage(imageUri);
      
      // Also update form data to include the image
      setFormData(prev => ({
        ...prev,
        profileImage: imageUri
      }));
    } else {
      console.log('📸 Image selection cancelled or failed');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }));
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }
    // Validate blood group format if entered (optional field)
    if (formData.bloodGroup.trim() && !isValidBloodGroup(formData.bloodGroup)) {
      Alert.alert('Error', 'Please enter a valid blood group format (e.g., A+, B-, AB+, O-)');
      return;
    }

    setLoading(true);
    try {
      console.log('💾 Starting profile save...', {
        formData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          hasImage: !!profileImage
        },
        profileImageUri: profileImage,
        userId: currentUser?.uid || user?.id
      });

      // Prepare updated user data - make sure to include the profile image
      const updatedUserData = {
        ...formData,
        profileImage: profileImage, // Ensure image is included
        updatedAt: new Date().toISOString(),
      };

      console.log('🔄 About to save profile data:', {
        keys: Object.keys(updatedUserData),
        name: updatedUserData.name,
        hasProfileImage: !!updatedUserData.profileImage
      });

      // Update user profile through UnifiedAuth
      await updateUser(updatedUserData);
      
      console.log('✅ Profile updated successfully in UnifiedAuth');
      
      // Add a small delay to ensure Firebase update completes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force refresh AppContext to get updated Firebase data
      if (currentUser?.uid && fetchCurrentPatientData) {
        console.log('🔄 Refreshing AppContext patient data...');
        await fetchCurrentPatientData(currentUser.uid);
        console.log('✅ AppContext patient data refreshed');
      }
      
      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            console.log('📱 Navigating back to profile screen...');
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('❌ Profile save error:', error);
      Alert.alert('Error', `Failed to update profile: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="person" size={40} color={theme.primary} />
                </View>
              )}
              <View style={styles.imageOverlay}>
                <Ionicons name="camera" size={20} color={theme.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.imageText}>Tap to change profile picture</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={theme.textSecondary}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />

            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor={theme.textSecondary}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.inputText, !formData.dateOfBirth && { color: theme.textSecondary }]}>
                {formData.dateOfBirth || 'Select date of birth'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            
            <Text style={styles.inputLabel}>Blood Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your blood group (e.g., A+, B-, AB+, O-)"
              placeholderTextColor={theme.textSecondary}
              value={formData.bloodGroup}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bloodGroup: text.toUpperCase() }))}
              autoCapitalize="characters"
              maxLength={3}
            />
            <Text style={styles.helperText}>Valid formats: A+, A-, B+, B-, AB+, AB-, O+, O-</Text>

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your address"
              placeholderTextColor={theme.textSecondary}
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Emergency Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Emergency contact number"
              placeholderTextColor={theme.textSecondary}
              value={formData.emergencyContact}
              onChangeText={(text) => setFormData(prev => ({ ...prev, emergencyContact: text }))}
              keyboardType="phone-pad"
            />

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* DateTimePicker - Outside ScrollView to avoid VirtualizedList nesting warnings */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: theme.cardBackground,
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.textPrimary,
    marginBottom: 8,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: -10,
    marginBottom: 15,
    marginLeft: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: theme.cardBackground,
    color: theme.textPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 16,
    color: theme.textPrimary,
    flex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.cardBackground,
    marginBottom: 15,
    maxHeight: 200,
  },
  pickerItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  pickerItemText: {
    fontSize: 16,
    color: theme.textPrimary,
  },
  saveButton: {
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;