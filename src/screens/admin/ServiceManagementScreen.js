import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { FirebaseHospitalServiceManager, FirebaseServiceApiService, FirebaseDoctorService } from '../../services/firebaseHospitalServices';
import AddServiceModal from '../../components/AddServiceModal';
import AssignDoctorModal from '../../components/AssignDoctorModal';
import AppHeader from '../../components/AppHeader';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase.config';

const ServiceManagementScreen = ({ navigation }) => {
  const { user } = useFirebaseAuth();
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('medical');

  const categories = [
    { 
      id: 'medical', 
      name: 'Medical Specialties', 
      color: '#4285F4',
      icon: 'medical-outline'
    },
    { 
      id: 'surgical', 
      name: 'Surgical Specialties', 
      color: '#EA4335',
      icon: 'cut-outline'
    },
    { 
      id: 'specialized', 
      name: 'Specialized Care', 
      color: '#34A853',
      icon: 'star-outline'
    },
  ];

  // Load services from Firebase with doctor details
  const loadServicesWithDoctors = async () => {
    try {
      setLoading(true);
      const result = await FirebaseServiceApiService.getServicesWithDoctors();
      if (result.success) {
        setServices(result.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // Load doctors from Firebase
  const loadDoctors = async () => {
    try {
      const result = await FirebaseDoctorService.getDoctors();
      if (result.success) {
        setDoctors(result.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  useEffect(() => {
    loadServicesWithDoctors();
    loadDoctors();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDoctors(); // Refresh doctors list to get newly added doctors
      loadServicesWithDoctors(); // Refresh services as well
    }, [])
  );

  // Handle assignment changes
  const handleAssignmentChange = () => {
    loadServicesWithDoctors(); // Refresh services data
    loadDoctors(); // Refresh doctors list for AddServiceModal
  };

  // Handle assign doctor button press
  const handleAssignDoctor = (service) => {
    setSelectedService(service);
    setShowAssignModal(true);
  };

  // Get service counts by category
  const getServiceCounts = () => {
    const counts = { medical: 0, surgical: 0, specialized: 0 };
    services.forEach(service => {
      if (counts.hasOwnProperty(service.category)) {
        counts[service.category]++;
      }
    });
    return counts;
  };

  const serviceCounts = getServiceCounts();

  const handleAddService = async (serviceData) => {
    setLoading(true);
    try {
      const result = await FirebaseServiceApiService.createService(serviceData);
      if (result.success) {
        Alert.alert('Success', 'Service added successfully!');
        setShowAddModal(false);
        // Refresh the services list
        loadServicesWithDoctors();
      } else {
        throw new Error(result.message || 'Failed to create service');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      Alert.alert('Error', error.message || 'Failed to create service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (categoryId, serviceId, serviceName) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${serviceName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await FirebaseHospitalServiceManager.deleteService(serviceId);
              if (result.success) {
                Alert.alert('Success', 'Service deleted successfully!');
              } else {
                throw new Error(result.message || 'Failed to delete service');
              }
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', error.message || 'Failed to delete service. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const renderCategoryTab = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryTab,
        { borderBottomColor: category.color },
        selectedCategory === category.id && styles.activeCategoryTab
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <View style={styles.tabContent}>
        <Ionicons 
          name={category.icon} 
          size={20} 
          color={selectedCategory === category.id ? category.color : Colors.textSecondary} 
        />
        <Text style={[
          styles.tabText,
          selectedCategory === category.id && { color: category.color }
        ]}>
          {category.name}
        </Text>
        <View style={[styles.countBadge, { backgroundColor: category.color }]}>
          <Text style={styles.countText}>
            {serviceCounts[category.id] || 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderServiceCard = (service, categoryId) => (
    <View key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceLeft}>
          <View style={[
            styles.serviceIconContainer, 
            { backgroundColor: categories.find(c => c.id === categoryId)?.color + '15' }
          ]}>
            <Ionicons 
              name="medical-outline" 
              size={24} 
              color={categories.find(c => c.id === categoryId)?.color} 
            />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>{service.name}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
            <Text style={styles.serviceDuration}>Duration: {service.duration || 'Not specified'}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.assignButton}
            onPress={() => handleAssignDoctor(service)}
          >
            <Ionicons name="person-add-outline" size={18} color={Colors.kbrBlue} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteService(categoryId, service.id, service.name)}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.kbrRed} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Assigned Doctors */}
      <View style={styles.doctorsSection}>
        <View style={styles.doctorsSectionHeader}>
          <Text style={styles.doctorsTitle}>
            Assigned Doctors ({service.doctorDetails?.length || 0})
          </Text>
          <TouchableOpacity 
            style={styles.assignDoctorButton}
            onPress={() => handleAssignDoctor(service)}
          >
            <Ionicons name="add-circle-outline" size={16} color={Colors.kbrBlue} />
            <Text style={styles.assignDoctorText}>Assign Doctor</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.doctorsContainer}>
          {service.doctorDetails && service.doctorDetails.length > 0 ? (
            service.doctorDetails.map((doctor, index) => (
              <View key={index} style={styles.doctorChip}>
                <Ionicons name="person" size={14} color={Colors.kbrBlue} />
                <View>
                  <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noDoctorsContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.noDoctorsText}>No doctors assigned</Text>
            </View>
          )}
        </View>
      </View>

      {/* Service Price */}
      {service.price && (
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Price:</Text>
          <Text style={styles.priceValue}>₹{service.price}</Text>
        </View>
      )}

      {/* Service Tags */}
      {service.tags && service.tags.length > 0 && (
        <View style={styles.tagsSection}>
          <Text style={styles.tagsTitle}>Tags:</Text>
          <View style={styles.tagsContainer}>
            {service.tags.map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const currentServices = services.filter(service => service.category === selectedCategory);

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
          title="Service Management"
          subtitle="Add, edit, or remove hospital services and specialties"
          navigation={navigation}
          showBackButton={true}
          useSimpleAdminHeader={true}
        />

        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(renderCategoryTab)}
          </ScrollView>
        </View>

        {/* Add Service Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.addServiceButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.addServiceText}>Add New Service</Text>
          </TouchableOpacity>
        </View>

        {/* Services List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.servicesContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading services...</Text>
              </View>
            ) : currentServices.length > 0 ? (
              currentServices.map(service => renderServiceCard(service, selectedCategory))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="medical-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyTitle}>No Services Added</Text>
                <Text style={styles.emptyDescription}>
                  Start by adding services to this category
                </Text>
                <TouchableOpacity 
                  style={styles.emptyAddButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Ionicons name="add" size={20} color={Colors.white} />
                  <Text style={styles.emptyAddText}>Add First Service</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Service Modal */}
        <AddServiceModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddService={handleAddService}
          doctors={doctors}
        />

        {/* Assign Doctor Modal */}
        <AssignDoctorModal
          visible={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          service={selectedService}
          onAssignmentChange={handleAssignmentChange}
        />
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
  actionSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addServiceButton: {
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
  addServiceText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: Sizes.md,
  },
  headerLogoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Sizes.sm,
  },
  headerTitle: {
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: Sizes.small,
    color: Colors.white,
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  profilePicture: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryTab: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeCategoryTab: {
    borderBottomWidth: 3,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.xs,
  },
  tabText: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: Sizes.small,
    color: Colors.white,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  servicesContainer: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Sizes.md,
  },
  serviceLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  serviceDescription: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Sizes.xs,
  },
  serviceDuration: {
    fontSize: Sizes.small,
    color: Colors.kbrBlue,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  assignButton: {
    padding: 8,
    backgroundColor: Colors.kbrBlue + '15',
    borderRadius: 6,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: Colors.kbrRed + '15',
    borderRadius: 6,
  },
  doctorsSection: {
    marginBottom: Sizes.md,
  },
  doctorsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.xs,
  },
  doctorsTitle: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  assignDoctorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.kbrBlue + '15',
    borderRadius: 12,
    gap: 4,
  },
  assignDoctorText: {
    fontSize: Sizes.small,
    color: Colors.kbrBlue,
    fontWeight: '500',
  },
  doctorsContainer: {
    flexDirection: 'column',
    gap: Sizes.xs,
  },
  doctorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue + '10',
    paddingHorizontal: Sizes.sm,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.kbrBlue,
  },
  doctorName: {
    fontSize: Sizes.small,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  doctorSpecialty: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  noDoctorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  noDoctorsText: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.sm,
    paddingTop: Sizes.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceLabel: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  priceValue: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.success,
  },
  tagsSection: {
    marginTop: Sizes.xs,
  },
  tagsTitle: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Sizes.xs,
  },
  tagChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Sizes.xxl,
  },
  emptyTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Sizes.lg,
    marginBottom: Sizes.xs,
  },
  emptyDescription: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Sizes.xl,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    gap: Sizes.xs,
  },
  emptyAddText: {
    fontSize: Sizes.medium,
    color: Colors.white,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Sizes.xl * 2,
  },
  loadingText: {
    marginTop: Sizes.md,
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
});

export default ServiceManagementScreen;