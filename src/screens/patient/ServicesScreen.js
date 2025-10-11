import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useServices } from '../../contexts/ServicesContext';
import { useUser } from '../../contexts/UserContext';
import AppHeader from '../../components/AppHeader';

const ServicesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { getServiceCounts } = useServices();
  const { isLoggedIn, userData } = useUser();
  
  let serviceCounts;
  try {
    serviceCounts = getServiceCounts();
  } catch (error) {
    console.error('Error getting service counts:', error);
    serviceCounts = { medical: 0, surgical: 0, specialized: 0 };
  }

  const specialtyCategories = [
    {
      id: 'medical',
      title: 'Medical',
      subtitle: 'Specialties',
      count: serviceCounts.medical,
      icon: 'medical-outline',
      color: '#FFFFFF',
      backgroundColor: '#4285F4', // Blue
      description: 'Comprehensive medical care across all specialties',
    },
    {
      id: 'surgical',
      title: 'Surgical',
      subtitle: 'Specialties',
      count: serviceCounts.surgical,
      icon: 'cut-outline',
      color: '#FFFFFF',
      backgroundColor: '#EA4335', // Red
      description: 'Advanced surgical procedures and treatments',
    },
    {
      id: 'specialized',
      title: 'Specialized Care',
      subtitle: '',
      count: serviceCounts.specialized,
      icon: 'star',
      color: '#FFFFFF',
      backgroundColor: '#34A853', // Green
      description: 'Specialized treatments and expert care',
    },
  ];

  const renderSpecialtyCard = (specialty) => (
    <TouchableOpacity
      key={specialty.id}
      style={[styles.specialtyCard, { backgroundColor: specialty.backgroundColor || '#4285F4' }]}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('BookAppointment', { category: specialty.id })}
    >
      <View style={styles.specialtyContent}>
        <View style={styles.specialtyLeft}>
          <View style={styles.specialtyIconContainer}>
            <Ionicons name={specialty.icon || 'medical-outline'} size={28} color={specialty.color || '#FFFFFF'} />
          </View>
          <View style={styles.specialtyInfo}>
            <Text style={styles.specialtyTitle}>{specialty.title || 'Specialty'}</Text>
            {specialty.subtitle && <Text style={styles.specialtySubtitle}>{specialty.subtitle}</Text>}
            <Text style={styles.specialtyCount}>{(specialty.count || 0)} specialties available</Text>
          </View>
        </View>
        <View style={styles.specialtyRight}>
          <View style={styles.seeDetailsButton}>
            <View style={styles.seeDetailsDot} />
            <Text style={styles.seeDetailsText}>See Details</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.white} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmergencyCard = () => (
    <TouchableOpacity
      style={styles.emergencyCard}
      activeOpacity={0.8}
      onPress={() => {
        // Handle emergency call
      }}
    >
      <View style={styles.emergencyIconContainer}>
        <Ionicons name="medical" size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.emergencyTitle}>24/7 Emergency Services</Text>
      <Text style={styles.emergencyDescription}>
        Round-the-clock emergency care for all medical emergencies
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />
      <SafeAreaView style={styles.container}>
        {/* App Header */}
        <AppHeader 
          subtitle="Services"
          navigation={navigation}
        />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Ionicons name="star" size={20} color="#FFA500" />
            <Text style={styles.pageTitle}>Our Specialties</Text>
          </View>
          <Text style={styles.pageSubtitle}>Comprehensive medical care across all specialties</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for services or treatments..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Specialty Categories */}
        <View style={styles.specialtiesSection}>
          {specialtyCategories.map(renderSpecialtyCard)}
        </View>

        {/* Expand All Categories Button */}
        <View style={styles.expandSection}>
          <TouchableOpacity style={styles.expandButton}>
            <Text style={styles.expandText}>Expand All Categories</Text>
            <Ionicons name="add" size={20} color={Colors.kbrRed} />
          </TouchableOpacity>
        </View>

        {/* Emergency Services */}
        <View style={styles.emergencySection}>
          {renderEmergencyCard()}
        </View>
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
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.radiusSmall,
  },
  loginText: {
    color: Colors.white,
    marginLeft: 4,
    fontSize: Sizes.small,
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
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.xs,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: Sizes.xs,
  },
  pageSubtitle: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  searchSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    backgroundColor: Colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
  },
  specialtiesSection: {
    paddingHorizontal: Sizes.screenPadding,
    backgroundColor: Colors.white,
    paddingBottom: Sizes.lg,
  },
  specialtyCard: {
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  specialtyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  specialtyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  specialtyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  specialtyInfo: {
    flex: 1,
  },
  specialtyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 2,
  },
  specialtySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  specialtyCount: {
    fontSize: Sizes.small,
    color: Colors.white,
    opacity: 0.9,
  },
  specialtyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: Sizes.xs,
  },
  seeDetailsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    marginRight: 6,
  },
  seeDetailsText: {
    fontSize: Sizes.small,
    color: Colors.white,
    fontWeight: '500',
  },
  expandSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.kbrRed,
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
  },
  expandText: {
    fontSize: Sizes.medium,
    color: Colors.kbrRed,
    fontWeight: '500',
    marginRight: Sizes.xs,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expandButtonText: {
    color: Colors.kbrRed,
    fontSize: Sizes.regular,
    fontWeight: '600',
    marginRight: Sizes.sm,
  },
  emergencySection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xxl,
    backgroundColor: Colors.white,
  },
  emergencyCard: {
    backgroundColor: '#EA4335',
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.xl,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emergencyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.md,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Sizes.xs,
  },
  emergencyDescription: {
    fontSize: Sizes.medium,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
});

export default ServicesScreen;