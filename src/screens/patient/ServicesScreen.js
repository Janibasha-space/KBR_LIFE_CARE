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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';

const ServicesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const specialtyCategories = [
    {
      id: 'medical',
      title: 'Medical Specialities',
      count: 6,
      icon: 'medical-outline',
      color: Colors.kbrBlue,
      backgroundColor: Colors.kbrBlue,
    },
    {
      id: 'surgical',
      title: 'Surgical Specialities',
      count: 6,
      icon: 'cut-outline',
      color: Colors.kbrRed,
      backgroundColor: Colors.kbrRed,
    },
    {
      id: 'specialized',
      title: 'Specialized Care',
      count: 6,
      icon: 'person-outline',
      color: Colors.kbrGreen,
      backgroundColor: Colors.kbrGreen,
    },
  ];

  const renderSpecialtyCard = (specialty) => (
    <TouchableOpacity
      key={specialty.id}
      style={[styles.specialtyCard, { backgroundColor: specialty.backgroundColor }]}
      activeOpacity={0.8}
    >
      <View style={styles.specialtyContent}>
        <View style={styles.specialtyLeft}>
          <View style={[styles.specialtyIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name={specialty.icon} size={24} color={Colors.white} />
          </View>
          <View style={styles.specialtyInfo}>
            <Text style={styles.specialtyTitle}>{specialty.title}</Text>
            <Text style={styles.specialtyCount}>{specialty.count} specialities available</Text>
          </View>
        </View>
        <View style={styles.specialtyRight}>
          <View style={styles.seeDetailsButton}>
            <Ionicons name="ellipse" size={8} color={Colors.white} />
            <Text style={styles.seeDetailsText}>See Details</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.white} />
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <View style={styles.headerLogo}>
            <Ionicons name="medical" size={20} color={Colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>KBR LIFE CARE HOSPITALS</Text>
            <Text style={styles.headerSubtitle}>Services</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.loginButton}>
          <Ionicons name="log-in-outline" size={16} color={Colors.white} />
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Ionicons name="star" size={20} color={Colors.warning} />
            <Text style={styles.mainTitle}>Our Specialities</Text>
          </View>
          <Text style={styles.subtitle}>Comprehensive medical care across all specialities</Text>
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

        {/* Expand Categories Button */}
        <View style={styles.expandSection}>
          <TouchableOpacity style={styles.expandButton}>
            <Text style={styles.expandButtonText}>Expand All Categories</Text>
            <Ionicons name="add" size={20} color={Colors.kbrRed} />
          </TouchableOpacity>
        </View>

        {/* Emergency Services */}
        <View style={styles.emergencySection}>
          <TouchableOpacity style={styles.emergencyCard}>
            <View style={styles.emergencyIconContainer}>
              <Ionicons name="medical" size={32} color={Colors.white} />
            </View>
            <Text style={styles.emergencyTitle}>24/7 Emergency Services</Text>
            <Text style={styles.emergencyDescription}>
              Round-the-clock emergency care for all medical emergencies
            </Text>
          </TouchableOpacity>
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
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  mainTitle: {
    fontSize: Sizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
  },
  subtitle: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  searchSection: {
    paddingHorizontal: Sizes.screenPadding,
    marginBottom: Sizes.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
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
    gap: Sizes.md,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  specialtyInfo: {
    flex: 1,
  },
  specialtyTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  specialtyCount: {
    fontSize: Sizes.medium,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.radiusSmall,
    marginRight: Sizes.sm,
  },
  seeDetailsText: {
    color: Colors.white,
    fontSize: Sizes.small,
    marginLeft: 4,
  },
  expandSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
    alignItems: 'center',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    borderWidth: 1,
    borderColor: Colors.kbrRed,
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
    paddingBottom: Sizes.xl,
  },
  emergencyCard: {
    backgroundColor: Colors.kbrRed,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.xl,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.md,
  },
  emergencyTitle: {
    fontSize: Sizes.xlarge,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Sizes.sm,
  },
  emergencyDescription: {
    fontSize: Sizes.regular,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ServicesScreen;