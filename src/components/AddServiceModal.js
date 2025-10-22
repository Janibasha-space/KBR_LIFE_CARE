import React, { useState } from 'react';
import {
  View,
  Text,  
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../constants/theme';

const AddServiceModal = ({ visible, onClose, onAddService, doctors }) => {
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [serviceTags, setServiceTags] = useState('');

  const categories = [
    { id: 'medical', name: 'Medical Specialties', color: '#4285F4' },
    { id: 'surgical', name: 'Surgical Specialties', color: '#EA4335' },
    { id: 'specialized', name: 'Specialized Care', color: '#34A853' },
  ];

  const resetForm = () => {
    setServiceName('');
    setServiceDescription('');
    setServiceDuration('');
    setSelectedCategory('');
    setSelectedDoctors([]);
    setServiceTags('');
  };

  const handleSubmit = () => {
    if (!serviceName.trim()) {
      Alert.alert('Error', 'Please enter service name');
      return;
    }
    if (!serviceDescription.trim()) {
      Alert.alert('Error', 'Please enter service description');
      return;
    }
    if (!serviceDuration.trim()) {
      Alert.alert('Error', 'Please enter service duration');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const serviceData = {
      name: serviceName.trim(),
      description: serviceDescription.trim(),
      duration: serviceDuration.trim(),
      category: selectedCategory,
      assignedDoctors: selectedDoctors, // Store as doctor IDs for Firebase
      tags: serviceTags.trim() ? serviceTags.split(',').map(tag => tag.trim()) : [],
    };

    onAddService(serviceData);
    resetForm();
  };

  const toggleDoctor = (doctorId) => {
    setSelectedDoctors(prev => 
      prev.includes(doctorId) 
        ? prev.filter(d => d !== doctorId)
        : [...prev, doctorId]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Service</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Service Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter service name"
              value={serviceName}
              onChangeText={setServiceName}
            />
          </View>

          {/* Service Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter service description"
              value={serviceDescription}
              onChangeText={setServiceDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Duration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 30 mins"
              value={serviceDuration}
              onChangeText={setServiceDuration}
            />
          </View>

          {/* Service Category */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Service Type *</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  selectedCategory === category.id && styles.selectedCategoryOption
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}>
                  {category.name}
                </Text>
                {selectedCategory === category.id && (
                  <Ionicons name="checkmark" size={20} color={Colors.kbrBlue} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Doctors */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assign Doctors *</Text>
            <Text style={styles.sectionSubtitle}>Select doctors who specialize in this service</Text>
            {doctors && doctors.length > 0 ? (
              doctors.map((doctor) => (
                <TouchableOpacity
                  key={doctor.id}
                  style={[
                    styles.doctorOption,
                    selectedDoctors.includes(doctor.id) && styles.selectedDoctorOption
                  ]}
                  onPress={() => toggleDoctor(doctor.id)}
                >
                  <View style={styles.doctorInfo}>
                    <View style={styles.doctorAvatar}>
                      {doctor.avatar && (doctor.avatar.startsWith('http') || doctor.avatar.startsWith('file://')) ? (
                        <Image 
                          source={{ uri: doctor.avatar }} 
                          style={styles.doctorAvatar}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.doctorInitials}>
                          {doctor.name?.charAt(0)?.toUpperCase() || 'D'}
                        </Text>
                      )}
                    </View>
                    <View style={styles.doctorDetails}>
                      <Text style={[
                        styles.doctorText,
                        selectedDoctors.includes(doctor.id) && styles.selectedDoctorText
                      ]}>
                        Dr. {doctor.name}
                      </Text>
                      <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                      <Text style={styles.doctorExperience}>{doctor.experience} years experience</Text>
                    </View>
                  </View>
                  {selectedDoctors.includes(doctor.id) && (
                    <Ionicons name="checkmark" size={20} color={Colors.kbrBlue} />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noDoctorsContainer}>
                <Ionicons name="person-outline" size={24} color={Colors.textSecondary} />
                <Text style={styles.noDoctorsText}>No doctors available. Please add doctors first.</Text>
              </View>
            )}
          </View>

          {/* Service Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Tags (Optional)</Text>
            <Text style={styles.sectionSubtitle}>Comma-separated tags (e.g., Health Check-ups, Emergency Medicine)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter tags separated by commas"
              value={serviceTags}
              onChangeText={setServiceTags}
              multiline
              numberOfLines={2}
            />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Add Service</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
    elevation: 2,
  },
  headerTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.screenPadding,
  },
  section: {
    marginVertical: Sizes.md,
  },
  sectionTitle: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  sectionSubtitle: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    marginBottom: Sizes.xs,
    backgroundColor: Colors.white,
  },
  selectedCategoryOption: {
    borderColor: Colors.kbrBlue,
    backgroundColor: Colors.kbrBlue + '10',
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: Sizes.sm,
  },
  categoryText: {
    flex: 1,
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
  },
  selectedCategoryText: {
    color: Colors.kbrBlue,
    fontWeight: '600',
  },
  doctorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    marginBottom: Sizes.xs,
    backgroundColor: Colors.white,
  },
  selectedDoctorOption: {
    borderColor: Colors.kbrBlue,
    backgroundColor: Colors.kbrBlue + '10',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.kbrBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Sizes.sm,
    overflow: 'hidden',
  },
  doctorInitials: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  selectedDoctorText: {
    color: Colors.kbrBlue,
    fontWeight: '600',
  },
  doctorSpecialty: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  doctorExperience: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  noDoctorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Sizes.lg,
    paddingHorizontal: Sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    borderStyle: 'dashed',
  },
  noDoctorsText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginLeft: Sizes.sm,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Sizes.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    backgroundColor: Colors.kbrBlue,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: Sizes.medium,
    color: Colors.white,
    fontWeight: '600',
  },
});

export default AddServiceModal;