import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Sizes } from '../../constants/theme';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { FirebaseDoctorService, firebaseHospitalServices } from '../../services/firebaseHospitalServices';
import AppHeader from '../../components/AppHeader';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase.config';

const DoctorManagementScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useFirebaseAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);

  // Fetch doctors and services from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch doctors
        const doctorsResult = await FirebaseDoctorService.getDoctors();
        if (doctorsResult.success) {
          setDoctors(doctorsResult.data);
        }
        
        // Fetch services to populate department options
        const servicesResult = await firebaseHospitalServices.getServices();
        if (servicesResult.success) {
          setAvailableServices(servicesResult.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time listener for doctors
    const doctorsQuery = query(collection(db, 'doctors'));
    const unsubscribe = onSnapshot(doctorsQuery, (snapshot) => {
      const doctorsData = [];
      snapshot.forEach((doc) => {
        doctorsData.push({ id: doc.id, ...doc.data() });
      });
      setDoctors(doctorsData);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Form State
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    credentials: '',
    specialization: '',
    department: '',
    fellowship: '',
    experience: '',
    rating: 5,
    consultationFee: '',
    phone: '',
    email: '',
    availability: '6 days/week',
    schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    timeSlots: '9:00 AM - 6:00 PM',
    expertise: [''],
    avatar: null,
    qualifications: [''],
  });

  // Calculate doctor statistics from AppContext data
  const doctorStats = {
    totalDoctors: (doctors || []).length,
    activeDoctors: (doctors || []).filter(doc => doc.status === 'Active').length,
    onDuty: (doctors || []).filter(doc => doc.status === 'Active' && doc.todayAppointments > 0).length,
    onLeave: (doctors || []).filter(doc => doc.status === 'On Leave').length,
    consultations: (doctors || []).reduce((sum, doc) => sum + (doc.todayAppointments || 0), 0)
  };

  // Get departments from Firebase services, with fallback to default options
  const departments = ['All', ...availableServices.map(service => service.name)];

  // Helper Functions
  const resetForm = () => {
    setDoctorForm({
      name: '',
      credentials: '',
      specialization: '',
      department: '',
      fellowship: '',
      experience: '',
      rating: 5,
      consultationFee: '',
      phone: '',
      email: '',
      availability: '6 days/week',
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      timeSlots: '9:00 AM - 6:00 PM',
      expertise: [''],
      avatar: null,
      qualifications: [''],
    });
  };

  const handleImagePicker = async () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add a doctor image',
      [
        { text: 'Camera', onPress: () => pickImage('camera') },
        { text: 'Gallery', onPress: () => pickImage('gallery') },
        { text: 'Use Default', onPress: () => useDefaultImage() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const pickImage = async (source) => {
    try {
      // Request permissions
      if (source === 'camera') {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          Alert.alert('Permission Required', 'Please allow camera access to take photos');
          return;
        }
      } else {
        const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libraryPermission.granted) {
          Alert.alert('Permission Required', 'Please allow access to your photo library');
          return;
        }
      }

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDoctorForm(prev => ({ ...prev, avatar: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const useDefaultImage = () => {
    const defaultImages = [
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=80',
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80'
    ];
    const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
    setDoctorForm(prev => ({ ...prev, avatar: randomImage }));
  };

  const handleAddDoctor = async () => {
    if (!doctorForm.name || !doctorForm.credentials || !doctorForm.specialization) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Credentials, Specialization)');
      return;
    }

    setLoading(true);
    try {
      const newDoctorData = {
        name: doctorForm.name,
        credentials: doctorForm.credentials,
        specialization: doctorForm.specialization,
        department: doctorForm.department,
        fellowship: doctorForm.fellowship || '',
        experience: doctorForm.experience,
        rating: doctorForm.rating || 4.5,
        consultationFee: parseInt(doctorForm.consultationFee) || 500,
        phone: doctorForm.phone,
        email: doctorForm.email,
        availability: doctorForm.availability || '6 days/week',
        schedule: doctorForm.schedule || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        timeSlots: doctorForm.timeSlots || '9:00 AM - 6:00 PM',
        expertise: doctorForm.expertise || [],
        qualifications: doctorForm.qualifications || [],
        avatar: doctorForm.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorForm.name)}&background=4AA3DF&color=fff`,
        status: 'Active',
      };

      const result = await FirebaseDoctorService.createDoctor(newDoctorData);
      if (result.success) {
        setShowAddDoctorModal(false);
        resetForm();
        Alert.alert('Success', 'Doctor added successfully!');
      } else {
        throw new Error(result.message || 'Failed to add doctor');
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
      Alert.alert('Error', error.message || 'Failed to add doctor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorForm({
      name: doctor.name,
      credentials: doctor.credentials,
      specialization: doctor.specialization,
      department: doctor.department,
      fellowship: doctor.fellowship || '',
      experience: doctor.experience,
      rating: doctor.rating,
      consultationFee: doctor.consultationFee.toString(),
      phone: doctor.phone,
      email: doctor.email,
      availability: doctor.availability,
      schedule: doctor.schedule,
      timeSlots: doctor.timeSlots,
      expertise: doctor.expertise || [''],
      avatar: doctor.avatar,
      qualifications: doctor.qualifications || [''],
    });
    setShowEditModal(true);
  };

  const handleUpdateDoctor = async () => {
    setLoading(true);
    try {
      const updatedDoctorData = {
        name: doctorForm.name,
        credentials: doctorForm.credentials,
        specialization: doctorForm.specialization,
        department: doctorForm.department,
        fellowship: doctorForm.fellowship || '',
        experience: doctorForm.experience,
        rating: doctorForm.rating || 4.5,
        consultationFee: parseInt(doctorForm.consultationFee) || 500,
        phone: doctorForm.phone,
        email: doctorForm.email,
        availability: doctorForm.availability || '6 days/week',
        schedule: doctorForm.schedule || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        timeSlots: doctorForm.timeSlots || '9:00 AM - 6:00 PM',
        expertise: doctorForm.expertise || [],
        qualifications: doctorForm.qualifications || [],
        avatar: doctorForm.avatar || selectedDoctor.avatar,
      };

      const result = await FirebaseDoctorService.updateDoctor(selectedDoctor.id, updatedDoctorData);
      if (result.success) {
        setShowEditModal(false);
        resetForm();
        setSelectedDoctor(null);
        Alert.alert('Success', 'Doctor updated successfully!');
      } else {
        throw new Error(result.message || 'Failed to update doctor');
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      Alert.alert('Error', error.message || 'Failed to update doctor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = (doctorId, doctorName) => {
    Alert.alert(
      'Delete Doctor',
      `Are you sure you want to remove Dr. ${doctorName} from the system?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await FirebaseDoctorService.deleteDoctor(doctorId);
              if (result.success) {
                Alert.alert('Success', 'Doctor removed successfully');
              } else {
                throw new Error(result.message || 'Failed to delete doctor');
              }
            } catch (error) {
              console.error('Error deleting doctor:', error);
              Alert.alert('Error', error.message || 'Failed to delete doctor. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleViewProfile = (doctor) => {
    setSelectedDoctor(doctor);
    setShowViewModal(true);
  };

  const addExpertiseField = () => {
    setDoctorForm(prev => ({
      ...prev,
      expertise: [...(prev.expertise || []), '']
    }));
  };

  const updateExpertiseField = (index, value) => {
    setDoctorForm(prev => ({
      ...prev,
      expertise: (prev.expertise || []).map((item, i) => i === index ? value : item)
    }));
  };

  const removeExpertiseField = (index) => {
    if ((doctorForm.expertise || []).length > 1) {
      setDoctorForm(prev => ({
        ...prev,
        expertise: (prev.expertise || []).filter((_, i) => i !== index)
      }));
    }
  };

  const addQualificationField = () => {
    setDoctorForm(prev => ({
      ...prev,
      qualifications: [...(prev.qualifications || []), '']
    }));
  };

  const updateQualificationField = (index, value) => {
    setDoctorForm(prev => ({
      ...prev,
      qualifications: (prev.qualifications || []).map((item, i) => i === index ? value : item)
    }));
  };

  const removeQualificationField = (index) => {
    if ((doctorForm.qualifications || []).length > 1) {
      setDoctorForm(prev => ({
        ...prev,
        qualifications: (prev.qualifications || []).filter((_, i) => i !== index)
      }));
    }
  };

  const toggleScheduleDay = (day) => {
    setDoctorForm(prev => ({
      ...prev,
      schedule: (prev.schedule || []).includes(day)
        ? (prev.schedule || []).filter(d => d !== day)
        : [...(prev.schedule || []), day]
    }));
  };

  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setDoctorForm(prev => ({ ...prev, rating: star }))}
          >
            <Ionicons
              name={star <= doctorForm.rating ? 'star' : 'star-outline'}
              size={24}
              color={star <= doctorForm.rating ? '#FFD700' : '#D1D5DB'}
            />
          </TouchableOpacity>
        ))}
        <Text style={styles.ratingText}>({doctorForm.rating}/5)</Text>
      </View>
    );
  };

  const filteredDoctors = (doctors || []).filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || doctor.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const StatsCard = ({ title, value, subtitle, icon, color }) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statsContent}>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
        {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const DoctorCard = ({ doctor }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <View style={styles.doctorImageContainer}>
          <Image 
            source={{ uri: doctor.avatar }}
            style={styles.doctorImage}
            resizeMode="cover"
          />
          <View style={[styles.statusDot, { backgroundColor: doctor.statusColor }]} />
        </View>
        
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorCredentials}>{doctor.credentials}</Text>
          <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
          <Text style={styles.doctorDepartment}>{doctor.department}</Text>
        </View>
        
        <View style={styles.doctorMeta}>
          <View style={[styles.statusBadge, { backgroundColor: doctor.statusColor }]}>
            <Text style={styles.statusText}>{doctor.status}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{doctor.rating}</Text>
          </View>
        </View>
      </View>

      <View style={styles.doctorDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="school" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{doctor.experience}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>₹{doctor.consultationFee}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{doctor.availability}</Text>
          </View>
        </View>

        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleLabel}>Schedule:</Text>
          <View style={styles.scheduleItems}>
            {(doctor.schedule || []).map((day, index) => (
              <View key={index} style={styles.scheduleDay}>
                <Text style={styles.scheduleDayText}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.appointmentInfo}>
          <View style={styles.appointmentItem}>
            <Ionicons name="time" size={16} color={Colors.kbrBlue} />
            <Text style={styles.appointmentText}>{doctor.timeSlots}</Text>
          </View>
          <View style={styles.appointmentItem}>
            <Ionicons name="people" size={16} color={Colors.kbrGreen} />
            <Text style={styles.appointmentText}>{doctor.todayAppointments} appointments today</Text>
          </View>
        </View>

        <View style={styles.expertisePreview}>
          <Text style={styles.expertiseLabel}>Expertise:</Text>
          <Text style={styles.expertiseText} numberOfLines={2}>
            {(doctor.expertise || []).slice(0, 2).join(' • ') || 'No expertise listed'}
          </Text>
        </View>
      </View>

      <View style={styles.doctorActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewProfile(doctor)}
        >
          <Ionicons name="eye" size={16} color={Colors.kbrBlue} />
          <Text style={styles.actionText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditDoctor(doctor)}
        >
          <Ionicons name="create" size={16} color={Colors.kbrGreen} />
          <Text style={[styles.actionText, { color: Colors.kbrGreen }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteDoctor(doctor.id, doctor.name)}
        >
          <Ionicons name="trash" size={16} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* App Header */}
      <AppHeader 
        title="Doctor Management"
        subtitle="Manage doctors, schedules and availability"
        navigation={navigation}
        showBackButton={true}
        useSimpleAdminHeader={true}
      />

      {/* Sticky Search and Filter - Always visible below header */}
      <View style={styles.stickySearchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors, specializations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
          {departments.map((dept) => (
            <TouchableOpacity
              key={dept}
              style={[
                styles.filterTab,
                selectedDepartment === dept && styles.activeFilterTab
              ]}
              onPress={() => setSelectedDepartment(dept)}
            >
              <Text style={[
                styles.filterTabText,
                selectedDepartment === dept && styles.activeFilterTabText
              ]}>
                {dept}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Scrollable Content - Everything else scrolls together */}
      <ScrollView style={styles.mainScrollView} showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}>
        {/* Add Doctor Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.addDoctorButton}
            onPress={() => setShowAddDoctorModal(true)}
          >
            <Ionicons name="person-add" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Add New Doctor</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatsCard
              title="Total Doctors"
              value={doctorStats.totalDoctors}
              icon="people"
              color={Colors.kbrBlue}
            />
            <StatsCard
              title="Active"
              value={doctorStats.activeDoctors}
              subtitle="Available"
              icon="checkmark-circle"
              color={Colors.kbrGreen}
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard
              title="On Duty"
              value={doctorStats.onDuty}
              subtitle="Currently working"
              icon="time"
              color={Colors.kbrPurple}
            />
            <StatsCard
              title="Consultations"
              value={doctorStats.consultations}
              subtitle="Today"
              icon="medical"
              color={Colors.kbrRed}
            />
          </View>
        </View>

        {/* Doctors List */}
        <View style={styles.contentContainer}>
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </View>
      </ScrollView>

      {/* Add Doctor Modal */}
      <Modal
        visible={showAddDoctorModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddDoctorModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowAddDoctorModal(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Doctor</Text>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleAddDoctor}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                  <Text style={styles.saveButtonText}>Add Doctor</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Image Section */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Doctor Photo</Text>
              <TouchableOpacity style={styles.imageContainer} onPress={handleImagePicker}>
                {doctorForm.avatar ? (
                  <Image source={{ uri: doctorForm.avatar }} style={styles.doctorImageLarge} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="camera" size={40} color="#9CA3AF" />
                    <Text style={styles.placeholderText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Doctor Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Dr. John Doe"
                  value={doctorForm.name}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, name: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Credentials *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="M.B.B.S., M.D"
                  value={doctorForm.credentials}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, credentials: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Specialization *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="General Physician"
                  value={doctorForm.specialization}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, specialization: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department/Service *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.departmentSelector}>
                  {departments.filter(dept => dept !== 'All').map((dept) => (
                    <TouchableOpacity
                      key={dept}
                      style={[
                        styles.departmentOption,
                        doctorForm.department === dept && styles.selectedDepartment
                      ]}
                      onPress={() => setDoctorForm(prev => ({ ...prev, department: dept }))}
                    >
                      <Text style={[
                        styles.departmentText,
                        doctorForm.department === dept && styles.selectedDepartmentText
                      ]}>
                        {dept}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fellowship/Additional Certification</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Fellowship in Cardiology"
                  value={doctorForm.fellowship}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, fellowship: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Experience</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="10+ years"
                  value={doctorForm.experience}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, experience: text }))}
                />
              </View>
            </View>

            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Doctor Rating</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Rating (1-5 stars)</Text>
                {renderStarRating()}
              </View>
            </View>

            {/* Educational Qualifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Educational Qualifications</Text>
              {(doctorForm.qualifications || []).map((qualification, index) => (
                <View key={index} style={styles.inputGroup}>
                  <View style={styles.dynamicInputRow}>
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      placeholder="M.B.B.S from XYZ Medical College"
                      value={qualification}
                      onChangeText={(text) => updateQualificationField(index, text)}
                    />
                    {(doctorForm.qualifications || []).length > 1 && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeQualificationField(index)}
                      >
                        <Ionicons name="remove-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.addButton2} onPress={addQualificationField}>
                <Ionicons name="add-circle" size={20} color={Colors.kbrBlue} />
                <Text style={styles.addButtonText}>Add Qualification</Text>
              </TouchableOpacity>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="+91 98765 43210"
                  value={doctorForm.phone}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="doctor@kbrhospital.com"
                  value={doctorForm.email}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Consultation Fee (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="600"
                  value={doctorForm.consultationFee}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, consultationFee: text }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Availability</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="6 days/week"
                  value={doctorForm.availability}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, availability: text }))}
                />
              </View>
            </View>

            {/* Schedule */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Working Schedule</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Working Days</Text>
                <View style={styles.scheduleSelector}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.daySelector,
                        (doctorForm.schedule || []).includes(day) && styles.selectedDay
                      ]}
                      onPress={() => toggleScheduleDay(day)}
                    >
                      <Text style={[
                        styles.dayText,
                        (doctorForm.schedule || []).includes(day) && styles.selectedDayText
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time Slots</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="9:00 AM - 6:00 PM"
                  value={doctorForm.timeSlots}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, timeSlots: text }))}
                />
              </View>
            </View>

            {/* Expertise */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Areas of Expertise</Text>
              {(doctorForm.expertise || []).map((expertise, index) => (
                <View key={index} style={styles.inputGroup}>
                  <View style={styles.dynamicInputRow}>
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      placeholder="Cardiology, Heart Surgery"
                      value={expertise}
                      onChangeText={(text) => updateExpertiseField(index, text)}
                    />
                    {(doctorForm.expertise || []).length > 1 && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeExpertiseField(index)}
                      >
                        <Ionicons name="remove-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.addButton2} onPress={addExpertiseField}>
                <Ionicons name="add-circle" size={20} color={Colors.kbrBlue} />
                <Text style={styles.addButtonText}>Add Expertise</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 50 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Doctor Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowEditModal(false);
                resetForm();
                setSelectedDoctor(null);
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Doctor</Text>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleUpdateDoctor}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                  <Text style={styles.saveButtonText}>Update</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.modalContent, { flex: 1 }]}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Editing: {selectedDoctor?.name}</Text>
                <Text style={styles.subtitle}>Make changes to doctor information below</Text>
              </View>

            {/* Image Section */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Doctor Photo</Text>
              <TouchableOpacity style={styles.imageContainer} onPress={handleImagePicker}>
                {doctorForm.avatar ? (
                  <Image source={{ uri: doctorForm.avatar }} style={styles.doctorImageLarge} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="camera" size={40} color="#9CA3AF" />
                    <Text style={styles.placeholderText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Doctor Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Dr. John Doe"
                  value={doctorForm.name}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, name: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Specialization *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="General Physician"
                  value={doctorForm.specialization}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, specialization: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department *</Text>
                <View style={styles.departmentSelectorEdit}>
                  {availableServices.length > 0 ? availableServices.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.departmentOptionEdit,
                        doctorForm.department === service.name && styles.selectedDepartment
                      ]}
                      onPress={() => setDoctorForm(prev => ({ ...prev, department: service.name }))}
                    >
                      <Text style={[
                        styles.departmentTextEdit,
                        doctorForm.department === service.name && styles.selectedDepartmentText
                      ]}>
                        {service.name}
                      </Text>
                    </TouchableOpacity>
                  )) : (
                    <Text style={styles.noServicesText}>No services available. Please add services first.</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusSelector}>
                  {[
                    { label: 'Active', value: 'Active', color: '#10B981' },
                    { label: 'On Leave', value: 'On Leave', color: '#F59E0B' },
                    { label: 'Inactive', value: 'Inactive', color: '#EF4444' }
                  ].map((status) => (
                    <TouchableOpacity
                      key={status.value}
                      style={[
                        styles.statusOption,
                        doctorForm.status === status.value && { backgroundColor: status.color }
                      ]}
                      onPress={() => setDoctorForm(prev => ({ ...prev, status: status.value, statusColor: status.color }))}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        doctorForm.status === status.value && { color: '#FFF' }
                      ]}>
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Rating</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setDoctorForm(prev => ({ ...prev, rating: star }))}
                    >
                      <Ionicons
                        name={star <= (doctorForm.rating || 0) ? "star" : "star-outline"}
                        size={24}
                        color="#FFD700"
                      />
                    </TouchableOpacity>
                  ))}
                  <Text style={styles.ratingText}>
                    {doctorForm.rating || 0}/5
                  </Text>
                </View>
              </View>
            </View>

            {/* Qualifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Qualifications & Experience</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Medical Credentials</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="M.B.B.S., M.D."
                  value={doctorForm.credentials}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, credentials: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Years of Experience</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="10+ years"
                  value={doctorForm.experience}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, experience: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fellowship/Additional Training</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Fellowship in Cardiology"
                  value={doctorForm.fellowship}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, fellowship: text }))}
                />
              </View>

              {/* Dynamic Qualifications */}
              <View style={styles.inputGroup}>
                <View style={styles.labelWithButton}>
                  <Text style={styles.inputLabel}>Educational Qualifications</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      const newQualifications = [...(doctorForm.qualifications || []), ''];
                      setDoctorForm(prev => ({ ...prev, qualifications: newQualifications }));
                    }}
                  >
                    <Ionicons name="add" size={16} color={Colors.kbrBlue} />
                    <Text style={styles.addButtonText}>Add Qualification</Text>
                  </TouchableOpacity>
                </View>
                
                {(doctorForm.qualifications || []).map((qualification, index) => (
                  <View key={index} style={styles.dynamicInputRow}>
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      placeholder="Bachelor of Medicine"
                      value={qualification}
                      onChangeText={(text) => {
                        const newQualifications = [...(doctorForm.qualifications || [])];
                        newQualifications[index] = text;
                        setDoctorForm(prev => ({ ...prev, qualifications: newQualifications }));
                      }}
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => {
                        const newQualifications = (doctorForm.qualifications || []).filter((_, i) => i !== index);
                        setDoctorForm(prev => ({ ...prev, qualifications: newQualifications }));
                      }}
                    >
                      <Ionicons name="remove-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.addMoreButton}
                onPress={() => {
                  const newQualifications = [...(doctorForm.qualifications || []), ''];
                  setDoctorForm(prev => ({ ...prev, qualifications: newQualifications }));
                }}
              >
                <Ionicons name="add-circle-outline" size={16} color={Colors.kbrBlue} />
                <Text style={styles.addButtonText}>Add Qualification</Text>
              </TouchableOpacity>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="+91 98765 43210"
                  value={doctorForm.phone}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="doctor@kbrhospital.com"
                  value={doctorForm.email}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Consultation Fee (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="600"
                  value={doctorForm.consultationFee}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, consultationFee: text }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Availability</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="6 days/week"
                  value={doctorForm.availability}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, availability: text }))}
                />
              </View>
            </View>

            {/* Schedule */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Working Schedule</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Working Days</Text>
                <View style={styles.scheduleSelector}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.daySelector,
                        (doctorForm.schedule || []).includes(day) && styles.selectedDay
                      ]}
                      onPress={() => toggleScheduleDay(day)}
                    >
                      <Text style={[
                        styles.dayText,
                        (doctorForm.schedule || []).includes(day) && styles.selectedDayText
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time Slots</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="9:00 AM - 6:00 PM"
                  value={doctorForm.timeSlots}
                  onChangeText={(text) => setDoctorForm(prev => ({ ...prev, timeSlots: text }))}
                />
              </View>
            </View>

            {/* Expertise */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Areas of Expertise</Text>
              {(doctorForm.expertise || []).map((expertise, index) => (
                <View key={index} style={styles.inputGroup}>
                  <View style={styles.dynamicInputRow}>
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      placeholder="Cardiology, Heart Surgery"
                      value={expertise}
                      onChangeText={(text) => {
                        const newExpertise = [...(doctorForm.expertise || [])];
                        newExpertise[index] = text;
                        setDoctorForm(prev => ({ ...prev, expertise: newExpertise }));
                      }}
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => {
                        const newExpertise = (doctorForm.expertise || []).filter((_, i) => i !== index);
                        setDoctorForm(prev => ({ ...prev, expertise: newExpertise }));
                      }}
                    >
                      <Ionicons name="remove-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              <TouchableOpacity
                style={styles.addMoreButton}
                onPress={() => {
                  const newExpertise = [...(doctorForm.expertise || []), ''];
                  setDoctorForm(prev => ({ ...prev, expertise: newExpertise }));
                }}
              >
                <Ionicons name="add-circle-outline" size={16} color={Colors.kbrBlue} />
                <Text style={styles.addButtonText}>Add Expertise</Text>
              </TouchableOpacity>
            </View>

              <View style={{ height: 50 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* View Profile Modal */}
      <Modal
        visible={showViewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowViewModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowViewModal(false);
                setSelectedDoctor(null);
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Doctor Profile</Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                setShowViewModal(false);
                handleEditDoctor(selectedDoctor);
              }}
            >
              <Ionicons name="create" size={16} color="#FFF" />
              <Text style={styles.saveButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {selectedDoctor && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Doctor Header */}
              <View style={styles.viewProfileHeader}>
                <Image 
                  source={{ uri: selectedDoctor.avatar }}
                  style={styles.viewProfileImage}
                />
                <View style={styles.viewProfileInfo}>
                  <Text style={styles.viewProfileName}>{selectedDoctor.name}</Text>
                  <Text style={styles.viewProfileCredentials}>{selectedDoctor.credentials}</Text>
                  <Text style={styles.viewProfileSpecialization}>{selectedDoctor.specialization}</Text>
                  <Text style={styles.viewProfileDepartment}>{selectedDoctor.department}</Text>
                  
                  <View style={styles.viewProfileMeta}>
                    <View style={[styles.viewStatusBadge, { backgroundColor: selectedDoctor.statusColor }]}>
                      <Text style={styles.viewStatusText}>{selectedDoctor.status}</Text>
                    </View>
                    <View style={styles.viewRatingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.viewRatingText}>{selectedDoctor.rating}/5</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Professional Details */}
              <View style={styles.viewSection}>
                <Text style={styles.viewSectionTitle}>Professional Details</Text>
                
                <View style={styles.viewDetailRow}>
                  <View style={styles.viewDetailItem}>
                    <Ionicons name="school" size={20} color="#6B7280" />
                    <View style={styles.viewDetailContent}>
                      <Text style={styles.viewDetailLabel}>Experience</Text>
                      <Text style={styles.viewDetailValue}>{selectedDoctor.experience}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.viewDetailRow}>
                  <View style={styles.viewDetailItem}>
                    <Ionicons name="ribbon" size={20} color="#6B7280" />
                    <View style={styles.viewDetailContent}>
                      <Text style={styles.viewDetailLabel}>Fellowship</Text>
                      <Text style={styles.viewDetailValue}>{selectedDoctor.fellowship || 'Not specified'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.viewDetailRow}>
                  <View style={styles.viewDetailItem}>
                    <Ionicons name="cash" size={20} color="#6B7280" />
                    <View style={styles.viewDetailContent}>
                      <Text style={styles.viewDetailLabel}>Consultation Fee</Text>
                      <Text style={styles.viewDetailValue}>₹{selectedDoctor.consultationFee}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.viewDetailRow}>
                  <View style={styles.viewDetailItem}>
                    <Ionicons name="calendar" size={20} color="#6B7280" />
                    <View style={styles.viewDetailContent}>
                      <Text style={styles.viewDetailLabel}>Availability</Text>
                      <Text style={styles.viewDetailValue}>{selectedDoctor.availability}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Contact Information */}
              <View style={styles.viewSection}>
                <Text style={styles.viewSectionTitle}>Contact Information</Text>
                
                <View style={styles.viewDetailRow}>
                  <View style={styles.viewDetailItem}>
                    <Ionicons name="call" size={20} color="#6B7280" />
                    <View style={styles.viewDetailContent}>
                      <Text style={styles.viewDetailLabel}>Phone</Text>
                      <Text style={styles.viewDetailValue}>{selectedDoctor.phone}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.viewDetailRow}>
                  <View style={styles.viewDetailItem}>
                    <Ionicons name="mail" size={20} color="#6B7280" />
                    <View style={styles.viewDetailContent}>
                      <Text style={styles.viewDetailLabel}>Email</Text>
                      <Text style={styles.viewDetailValue}>{selectedDoctor.email}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Schedule */}
              <View style={styles.viewSection}>
                <Text style={styles.viewSectionTitle}>Working Schedule</Text>
                
                <View style={styles.viewScheduleContainer}>
                  <View style={styles.viewScheduleDays}>
                    {(selectedDoctor.schedule || []).map((day, index) => (
                      <View key={index} style={styles.viewScheduleDay}>
                        <Text style={styles.viewScheduleDayText}>{day}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.viewTimeSlots}>
                    <Ionicons name="time" size={16} color="#6B7280" />
                    <Text style={styles.viewTimeSlotsText}>{selectedDoctor.timeSlots}</Text>
                  </View>
                </View>
              </View>

              {/* Today's Appointments */}
              <View style={styles.viewSection}>
                <Text style={styles.viewSectionTitle}>Today's Activity</Text>
                
                <View style={styles.viewActivityCard}>
                  <Ionicons name="people" size={24} color={Colors.kbrBlue} />
                  <View style={styles.viewActivityContent}>
                    <Text style={styles.viewActivityNumber}>{selectedDoctor.todayAppointments}</Text>
                    <Text style={styles.viewActivityLabel}>Appointments Today</Text>
                  </View>
                </View>
              </View>

              {/* Areas of Expertise */}
              <View style={styles.viewSection}>
                <Text style={styles.viewSectionTitle}>Areas of Expertise</Text>
                
                <View style={styles.viewExpertiseContainer}>
                  {(selectedDoctor.expertise || []).length > 0 ? (
                    (selectedDoctor.expertise || []).map((expertise, index) => (
                      <View key={index} style={styles.viewExpertiseItem}>
                        <Ionicons name="checkmark-circle" size={16} color={Colors.kbrGreen} />
                        <Text style={styles.viewExpertiseText}>{expertise}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.viewNoExpertise}>No expertise information available</Text>
                  )}
                </View>
              </View>

              <View style={{ height: 50 }} />
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  stickySearchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainScrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  addDoctorButton: {
    backgroundColor: Colors.kbrBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsIcon: {
    marginRight: 12,
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statsTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statsSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  filterTabs: {
    flexDirection: 'row',
  },
  filterTab: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: Colors.kbrBlue,
  },
  filterTabText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  doctorsList: {
    paddingBottom: 20,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  doctorImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  doctorCredentials: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: Colors.kbrBlue,
    fontWeight: '500',
    marginTop: 2,
  },
  doctorDepartment: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  doctorMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#1F2937',
    marginLeft: 4,
    fontWeight: '500',
  },
  doctorDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  scheduleContainer: {
    marginBottom: 12,
  },
  scheduleLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  scheduleItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scheduleDay: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  scheduleDayText: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '500',
  },
  appointmentInfo: {
    marginBottom: 12,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  appointmentText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  expertisePreview: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
  },
  expertiseLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  expertiseText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
  doctorActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: Colors.kbrBlue,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    marginTop: 12,
  },
  doctorImageLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FFF',
  },
  departmentSelector: {
    marginTop: 8,
  },
  departmentOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedDepartment: {
    backgroundColor: Colors.kbrBlue,
    borderColor: Colors.kbrBlue,
  },
  departmentText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedDepartmentText: {
    color: '#FFF',
  },
  noServicesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  departmentSelectorEdit: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  departmentOptionEdit: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  departmentTextEdit: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  dynamicInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    marginLeft: 8,
    padding: 4,
  },
  addButton2: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  scheduleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  daySelector: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedDay: {
    backgroundColor: Colors.kbrBlue,
    borderColor: Colors.kbrBlue,
  },
  dayText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFF',
  },

  // View Profile Styles
  viewProfileHeader: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  viewProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  viewProfileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  viewProfileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  viewProfileCredentials: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  viewProfileSpecialization: {
    fontSize: 14,
    color: Colors.kbrBlue,
    fontWeight: '600',
    marginBottom: 2,
  },
  viewProfileDepartment: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  viewProfileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewStatusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  viewRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },

  viewSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  viewSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  viewDetailRow: {
    marginBottom: 15,
  },
  viewDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewDetailContent: {
    flex: 1,
  },
  viewDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  viewDetailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },

  viewScheduleContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 15,
  },
  viewScheduleDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  viewScheduleDay: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewScheduleDayText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  viewTimeSlots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewTimeSlotsText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  viewActivityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.kbrBlue,
  },
  viewActivityContent: {
    marginLeft: 15,
  },
  viewActivityNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.kbrBlue,
  },
  viewActivityLabel: {
    fontSize: 13,
    color: '#6B7280',
  },

  viewExpertiseContainer: {
    gap: 8,
  },
  viewExpertiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  viewExpertiseText: {
    fontSize: 14,
    color: '#374151',
  },
  viewNoExpertise: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default DoctorManagementScreen;