import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

const EditProfileModal = ({ visible, onClose, userProfile, onSave }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    dateOfBirth: userProfile?.dateOfBirth || '',
    bloodGroup: userProfile?.bloodGroup || '',
    address: userProfile?.address || '',
    emergencyContact: userProfile?.emergencyContact || '',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const [showBloodGroupPicker, setShowBloodGroupPicker] = useState(false);

  // Reset form when modal closes
  const handleClose = () => {
    setFormData({
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      dateOfBirth: userProfile?.dateOfBirth || '',
      bloodGroup: userProfile?.bloodGroup || '',
      address: userProfile?.address || '',
      emergencyContact: userProfile?.emergencyContact || '',
    });
    onClose();
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

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(formData);
      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: handleClose,
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Edit Profile</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Form Content */}
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
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.dateOfBirth}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, dateOfBirth: text }))}
                />

                <Text style={styles.inputLabel}>Blood Group</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowBloodGroupPicker(!showBloodGroupPicker)}
                >
                  <Text style={[styles.inputText, !formData.bloodGroup && { color: theme.textSecondary }]}>
                    {formData.bloodGroup || 'Select blood group'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                {showBloodGroupPicker && (
                  <View style={styles.pickerContainer}>
                    {bloodGroups.map((bloodGroup) => (
                      <TouchableOpacity
                        key={bloodGroup}
                        style={styles.pickerItem}
                        onPress={() => {
                          setFormData(prev => ({ ...prev, bloodGroup }));
                          setShowBloodGroupPicker(false);
                        }}
                      >
                        <Text style={styles.pickerItemText}>{bloodGroup}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

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
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: theme.cardBackground,
    borderRadius: 15,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.textPrimary,
    marginBottom: 8,
    fontWeight: '500',
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
    backgroundColor: Colors.kbrBlue,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileModal;