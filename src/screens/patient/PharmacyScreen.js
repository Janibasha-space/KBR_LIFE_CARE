import React from 'react';
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

const PharmacyScreen = ({ navigation }) => {
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
              <Text style={styles.headerSubtitle}>Pharmacy</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.cartButton}>
            <Ionicons name="basket-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Pharmacy Header */}
          <View style={styles.pharmacyHeader}>
            <View style={styles.pharmacyTitleRow}>
              <Ionicons name="medical" size={24} color={Colors.kbrRed} />
              <Text style={styles.pharmacyTitle}>KBR Pharmacy</Text>
              <TouchableOpacity style={styles.cartIconButton}>
                <Ionicons name="basket-outline" size={20} color={Colors.kbrBlue} />
              </TouchableOpacity>
            </View>
            <Text style={styles.pharmacySubtitle}>Order medicines online with home delivery</Text>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Ionicons name="search-outline" size={16} color={Colors.white} />
              <Text style={styles.activeTabText}>Browse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Ionicons name="basket-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.tabText}>Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Ionicons name="document-text-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.tabText}>Orders</Text>
            </TouchableOpacity>
          </View>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search medicines..."
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="funnel-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.filterText}>All</Text>
              <Ionicons name="chevron-down-outline" size={16} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Free Delivery Banner */}
          <View style={styles.deliveryBanner}>
            <Ionicons name="car-outline" size={16} color={Colors.kbrRed} />
            <Text style={styles.deliveryText}>Free delivery on orders above ₹500</Text>
          </View>

          {/* Medicines List */}
          <View style={styles.medicinesSection}>
            {/* Medicine Card 1 */}
            <View style={styles.medicineCard}>
              <View style={styles.medicineLeft}>
                <View style={styles.medicineIconContainer}>
                  <Ionicons name="medical-outline" size={24} color={Colors.kbrBlue} />
                </View>
                <View style={styles.medicineInfo}>
                  <View style={styles.medicineHeader}>
                    <Text style={styles.medicineName}>Paracetamol 500mg</Text>
                  </View>
                  <Text style={styles.medicineBrand}>Apollo Pharmacy</Text>
                  <Text style={styles.medicineDescription}>For fever and pain relief</Text>
                  <Text style={styles.medicineCategory}>Analgesic</Text>
                  <Text style={styles.medicinePrice}>₹3</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={16} color={Colors.white} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Medicine Card 2 */}
            <View style={styles.medicineCard}>
              <View style={styles.medicineLeft}>
                <View style={styles.medicineIconContainer}>
                  <Ionicons name="medical-outline" size={24} color={Colors.kbrBlue} />
                </View>
                <View style={styles.medicineInfo}>
                  <View style={styles.medicineHeader}>
                    <Text style={styles.medicineName}>Amoxicillin 250mg</Text>
                    <View style={styles.prescriptionBadge}>
                      <Text style={styles.prescriptionText}>Rx</Text>
                    </View>
                  </View>
                  <Text style={styles.medicineBrand}>Sun Pharma</Text>
                  <Text style={styles.medicineDescription}>Antibiotic for bacterial infections</Text>
                  <Text style={styles.medicineCategory}>Antibiotic</Text>
                  <Text style={styles.medicinePrice}>₹12</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={16} color={Colors.white} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Medicine Card 3 */}
            <View style={styles.medicineCard}>
              <View style={styles.medicineLeft}>
                <View style={styles.medicineIconContainer}>
                  <Ionicons name="medical-outline" size={24} color={Colors.kbrBlue} />
                </View>
                <View style={styles.medicineInfo}>
                  <View style={styles.medicineHeader}>
                    <Text style={styles.medicineName}>Atorvastatin 10mg</Text>
                    <View style={styles.prescriptionBadge}>
                      <Text style={styles.prescriptionText}>Rx</Text>
                    </View>
                  </View>
                  <Text style={styles.medicineBrand}>Cipla</Text>
                  <Text style={styles.medicineDescription}>For cholesterol management</Text>
                  <Text style={styles.medicineCategory}>Cardiovascular</Text>
                  <Text style={styles.medicinePrice}>₹8</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={16} color={Colors.white} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
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
  cartButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  pharmacyHeader: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
  },
  pharmacyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  pharmacyTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
    flex: 1,
  },
  cartIconButton: {
    padding: 8,
  },
  pharmacySubtitle: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.md,
    gap: Sizes.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    backgroundColor: Colors.background,
  },
  activeTab: {
    backgroundColor: Colors.kbrRed,
  },
  tabText: {
    marginLeft: 4,
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
  },
  activeTabText: {
    marginLeft: 4,
    fontSize: Sizes.medium,
    color: Colors.white,
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    flexDirection: 'row',
    gap: Sizes.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    gap: 4,
  },
  filterText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
  },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Sizes.screenPadding,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    marginBottom: Sizes.md,
  },
  deliveryText: {
    fontSize: Sizes.medium,
    color: Colors.kbrRed,
    marginLeft: Sizes.sm,
    fontWeight: '500',
  },
  medicinesSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xl,
  },
  medicineCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  medicineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.kbrBlue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.xs,
  },
  medicineName: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  prescriptionBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  prescriptionText: {
    fontSize: Sizes.small,
    color: Colors.white,
    fontWeight: 'bold',
  },
  medicineBrand: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  medicineDescription: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  medicineCategory: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  medicinePrice: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.kbrRed,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default PharmacyScreen;