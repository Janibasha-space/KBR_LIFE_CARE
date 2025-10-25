import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import AppHeader from '../../components/AppHeader';
import { FirebaseAdminService } from '../../services/firebaseHospitalServices';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const AdminProfileScreen = ({ navigation }) => {
  const [adminData, setAdminData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load admin profile from backend on component mount
  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      console.log('📱 Loading admin profile from backend...');
      
      const result = await FirebaseAdminService.getAdminProfile();
      
      if (result.success) {
        setAdminData(result.data);
        setEditData(result.data);
        console.log('✅ Admin profile loaded:', result.data.name);
      } else {
        throw new Error('Failed to load admin profile');
      }
    } catch (error) {
      console.error('❌ Error loading admin profile:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to load admin profile. Please try again.',
        [
          { text: 'Retry', onPress: loadAdminProfile },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving admin profile changes...');
      
      // Include profile image in the save data if one was selected
      const saveData = {
        ...editData,
        ...(profileImage && { profileImage })
      };
      
      const result = await FirebaseAdminService.updateAdminProfile(saveData);
      
      if (result.success) {
        setAdminData(saveData);
        setIsEditing(false);
        setProfileImage(null); // Clear the selected image after successful save
        Alert.alert('Success', 'Profile updated successfully');
        console.log('✅ Admin profile saved successfully');
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      console.error('❌ Error saving admin profile:', error);
      Alert.alert('Error', error.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(adminData || {});
    setIsEditing(false);
  };

  // Request camera permissions
  const requestCameraPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'KBR Life Care needs access to your camera to take profile photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS permissions are handled by expo-image-picker
  };

  // Handle camera button press
  const handleCameraPress = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose how you would like to update your profile picture',
      [
        {
          text: 'Take Photo',
          onPress: () => takePhoto(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickImage(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }

      // Request camera permissions from expo-image-picker
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }

      setUploadingImage(true);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await handleImageSelected(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Media library permission is required to choose photos.');
        return;
      }

      setUploadingImage(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await handleImageSelected(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle selected image
  const handleImageSelected = async (imageAsset) => {
    try {
      console.log('📸 Processing selected image:', imageAsset.uri);

      // Validate image
      if (!imageAsset.uri) {
        throw new Error('Invalid image selected');
      }

      // Check file size (limit to 5MB)
      const fileInfo = await FileSystem.getInfoAsync(imageAsset.uri);
      if (fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select an image smaller than 5MB.');
        return;
      }

      // Update local state immediately for UI feedback
      setProfileImage(imageAsset.uri);

      // Update edit data if in editing mode
      if (isEditing) {
        setEditData(prev => ({
          ...prev,
          profileImage: imageAsset.uri
        }));
      }

      // You can implement upload to Firebase Storage here if needed
      // For now, we'll just store the local URI
      console.log('✅ Profile image updated locally');
      
      Alert.alert(
        'Profile Picture Updated',
        'Your profile picture has been updated. Remember to save your changes.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error handling selected image:', error);
      Alert.alert('Error', 'Failed to process the selected image. Please try again.');
    }
  };

  // Show loading screen while fetching data
  if (loading) {
    return (
      <View style={styles.outerContainer}>
        <StatusBar 
          backgroundColor="transparent" 
          barStyle="light-content" 
          translucent={true} 
        />
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
          <AppHeader 
            title="Admin Profile"
            subtitle="Loading admin account settings..."
            navigation={navigation}
            showBackButton={true}
            useSimpleAdminHeader={true}
          />
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={Colors.kbrBlue} />
            <Text style={styles.loadingText}>Loading admin profile...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Show error state if no admin data
  if (!adminData) {
    return (
      <View style={styles.outerContainer}>
        <StatusBar 
          backgroundColor="transparent" 
          barStyle="light-content" 
          translucent={true} 
        />
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
          <AppHeader 
            title="Admin Profile"
            subtitle="Error loading admin account"
            navigation={navigation}
            showBackButton={true}
            useSimpleAdminHeader={true}
          />
          <View style={styles.errorContent}>
            <Ionicons name="alert-circle" size={64} color={Colors.kbrRed} />
            <Text style={styles.errorText}>Failed to load admin profile</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadAdminProfile}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar 
        backgroundColor="transparent" 
        barStyle="light-content" 
        translucent={true} 
      />
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        {/* App Header */}
        <AppHeader 
          title="Admin Profile"
          subtitle="Manage admin account settings and permissions"
          navigation={navigation}
          showBackButton={true}
          useSimpleAdminHeader={true}
        />
        
        {/* Edit Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.editButton, saving && styles.disabledButton]}
            onPress={() => setIsEditing(!isEditing)}
            disabled={saving}
          >
            <Ionicons 
              name={isEditing ? "close" : "create"} 
              size={20} 
              color={Colors.white} 
            />
            <Text style={styles.editButtonText}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Picture Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={
                  profileImage || editData.profileImage
                    ? { uri: profileImage || editData.profileImage }
                    : adminData?.profileImage
                    ? { uri: adminData.profileImage }
                    : require('../../../assets/hospital-logo.jpeg')
                }
                style={styles.profileImage}
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={[styles.cameraButton, uploadingImage && styles.cameraButtonDisabled]}
                onPress={handleCameraPress}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons name="camera" size={16} color={Colors.white} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>{adminData.name || 'Admin User'}</Text>
            <Text style={styles.profileRole}>{adminData.role || 'Administrator'}</Text>
          </View>

          {/* Profile Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editData.name || ''}
                    onChangeText={(text) => setEditData({...editData, name: text})}
                    editable={!saving}
                  />
                ) : (
                  <Text style={styles.infoValue}>{adminData.name || 'N/A'}</Text>
                )}
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email Address</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editData.email || ''}
                    onChangeText={(text) => setEditData({...editData, email: text})}
                    keyboardType="email-address"
                    editable={!saving}
                  />
                ) : (
                  <Text style={styles.infoValue}>{adminData.email || 'N/A'}</Text>
                )}
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editData.phone || ''}
                    onChangeText={(text) => setEditData({...editData, phone: text})}
                    keyboardType="phone-pad"
                    editable={!saving}
                  />
                ) : (
                  <Text style={styles.infoValue}>{adminData.phone || 'N/A'}</Text>
                )}
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Department</Text>
                <Text style={styles.infoValue}>{adminData.department || 'N/A'}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Join Date</Text>
                <Text style={styles.infoValue}>{adminData.joinDate || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Permissions Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Permissions</Text>
            <View style={styles.infoCard}>
              {(adminData.permissions || []).map((permission, index) => (
                <View key={index} style={styles.permissionItem}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.kbrGreen} />
                  <Text style={styles.permissionText}>{permission}</Text>
                </View>
              ))}
              {(!adminData.permissions || adminData.permissions.length === 0) && (
                <Text style={styles.infoValue}>No permissions assigned</Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, saving && styles.disabledButton]}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.kbrBlue,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Sizes.md,
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Sizes.screenPadding,
  },
  errorText: {
    marginTop: Sizes.md,
    fontSize: Sizes.large,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Sizes.xl,
  },
  retryButton: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '600',
  },
  header: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  actionSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Sizes.xl,
    backgroundColor: Colors.white,
    marginBottom: Sizes.md,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: Sizes.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.kbrBlue,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.kbrRed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  cameraButtonDisabled: {
    backgroundColor: Colors.gray,
    opacity: 0.7,
  },
  profileName: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  profileRole: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  infoSection: {
    paddingHorizontal: Sizes.screenPadding,
    marginBottom: Sizes.md,
  },
  sectionTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    marginBottom: Sizes.md,
  },
  infoLabel: {
    fontSize: Sizes.medium,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  infoValue: {
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
  },
  infoInput: {
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  permissionText: {
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xl,
    gap: Sizes.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.kbrRed,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: Sizes.medium,
    color: Colors.white,
    fontWeight: '500',
  },
});

export default AdminProfileScreen;