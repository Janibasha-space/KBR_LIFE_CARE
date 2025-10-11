import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useServices } from '../../contexts/ServicesContext';
import { useUser } from '../../contexts/UserContext';
import AddServiceModal from '../../components/AddServiceModal';

const ServiceManagementScreen = ({ navigation }) => {
  const { services, doctors, addService, deleteService, getServiceCounts } = useServices();
  const { isLoggedIn, userData } = useUser();
  const [showAddModal, setShowAddModal] = useState(false);
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

  const serviceCounts = getServiceCounts();

  const handleDeleteService = (categoryId, serviceId, serviceName) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${serviceName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteService(categoryId, serviceId);
            Alert.alert('Success', 'Service deleted successfully!');
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
            <Text style={styles.serviceDuration}>Duration: {service.duration}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteService(categoryId, service.id, service.name)}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.kbrRed} />
        </TouchableOpacity>
      </View>

      {/* Assigned Doctors */}
      <View style={styles.doctorsSection}>
        <Text style={styles.doctorsTitle}>Assigned Doctors:</Text>
        <View style={styles.doctorsContainer}>
          {service.doctors.map((doctor, index) => (
            <View key={index} style={styles.doctorChip}>
              <Ionicons name="person" size={14} color={Colors.kbrBlue} />
              <Text style={styles.doctorName}>{doctor}</Text>
            </View>
          ))}
        </View>
      </View>

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

  const currentServices = services[selectedCategory] || [];

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image 
              source={require('../../../assets/hospital-logo.jpeg')}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.headerTitle}>KBR LIFE CARE HOSPITALS</Text>
              <Text style={styles.headerSubtitle}>Service Management</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {isLoggedIn && (
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                {userData?.profilePicture ? (
                  <Image 
                    source={{ uri: userData.profilePicture }} 
                    style={styles.profilePicture}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person-circle" size={24} color={Colors.white} />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(renderCategoryTab)}
          </ScrollView>
        </View>

        {/* Services List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.servicesContainer}>
            {currentServices.length > 0 ? (
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
          onAddService={addService}
          doctors={doctors}
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
  header: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  deleteButton: {
    padding: Sizes.xs,
  },
  doctorsSection: {
    marginBottom: Sizes.md,
  },
  doctorsTitle: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  doctorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Sizes.xs,
  },
  doctorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue + '15',
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  doctorName: {
    fontSize: Sizes.small,
    color: Colors.kbrBlue,
    fontWeight: '500',
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
});

export default ServiceManagementScreen;