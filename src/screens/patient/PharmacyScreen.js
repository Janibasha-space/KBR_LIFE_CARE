import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Alert,
  ToastAndroid,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { ROUTES } from '../../constants/navigation';
import { useUser } from '../../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';

// Medicine data
const MEDICINES_DATA = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    brand: 'Apollo Pharmacy',
    price: '₹3',
    description: 'For fever and pain relief',
    category: 'Analgesic',
    prescription: false
  },
  {
    id: 2,
    name: 'Amoxicillin 250mg',
    brand: 'Sun Pharma',
    price: '₹12',
    description: 'Antibiotic for bacterial infections',
    category: 'Antibiotic',
    prescription: true
  },
  {
    id: 3,
    name: 'Atorvastatin 10mg',
    brand: 'Cipla',
    price: '₹8',
    description: 'For cholesterol management',
    category: 'Cardiovascular',
    prescription: true
  },
  {
    id: 4,
    name: 'Cetirizine 10mg',
    brand: 'Dr. Reddy\'s',
    price: '₹5',
    description: 'For allergies and hay fever',
    category: 'Antihistamine',
    prescription: false
  },
  {
    id: 5,
    name: 'Metformin 500mg',
    brand: 'Zydus',
    price: '₹7',
    description: 'For diabetes management',
    category: 'Antidiabetic',
    prescription: true
  },
  {
    id: 6,
    name: 'Losartan 50mg',
    brand: 'Lupin',
    price: '₹10',
    description: 'For high blood pressure',
    category: 'Cardiovascular',
    prescription: true
  },
  {
    id: 7,
    name: 'Ibuprofen 400mg',
    brand: 'Cipla',
    price: '₹4',
    description: 'For pain and inflammation',
    category: 'Analgesic',
    prescription: false
  },
];

// Available categories for filtering
const CATEGORIES = ['All', 'Analgesic', 'Antibiotic', 'Cardiovascular', 'Antihistamine', 'Antidiabetic'];

const PharmacyScreen = ({ navigation, route = {} }) => {
  const { isLoggedIn, userData } = useUser();
  const [activeTab, setActiveTab] = useState('Browse');
  const [cartItems, setCartItems] = useState([]);
  
  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Update cart items and active tab from navigation params when returning from cart screen
  useEffect(() => {
    // Handle cart items update
    if (route.params?.cartItems !== undefined) {
      // Always update with the latest cart state from params
      setCartItems(route.params.cartItems);
    }
    
    // Handle active tab change
    if (route.params?.activateTab) {
      setActiveTab(route.params.activateTab);
      
      // If coming to Browse tab, reset search and filters for fresh start
      if (route.params.activateTab === 'Browse') {
        setSearchText('');
        setSelectedCategory('All');
        setShowDropdown(false);
      }
    }
    
    // Clear the parameters after consuming them to prevent re-use
    if (Object.keys(route.params || {}).length > 0) {
      const newParams = { ...route.params };
      if ('cartItems' in newParams) delete newParams.cartItems;
      if ('activateTab' in newParams) delete newParams.activateTab;
      navigation.setParams(newParams);
    }
  }, [route.params?.cartItems, route.params?.activateTab]);
  
  // Clear cart if order was placed
  useFocusEffect(
    useCallback(() => {
      // Check if we're returning from checkout with a cleared cart
      if (route.params?.cartCleared) {
        setCartItems([]);
        navigation.setParams({ cartCleared: null });
        
        // Show confirmation message
        if (Platform.OS === 'android') {
          ToastAndroid.show('Order placed successfully!', ToastAndroid.SHORT);
        } else {
          Alert.alert('Success', 'Your order has been placed successfully!');
        }
      }
    }, [route.params?.cartCleared])
  );
  
  // Handle scroll to close dropdown
  const handleScroll = () => {
    if (showDropdown) {
      setShowDropdown(false);
    }
  };
  
  // Navigate to cart
  const goToCart = () => {
    navigation.navigate(ROUTES.PATIENT.PHARMACY_CART, { cartItems });
  };
  
  // Navigate to orders
  const goToOrders = () => {
    navigation.navigate(ROUTES.PATIENT.PHARMACY_ORDERS);
  };
  
  // Handle tab change
  const handleTabChange = (tabName) => {
    if (tabName === 'Cart') {
      goToCart();
      return;
    }
    if (tabName === 'Orders') {
      goToOrders();
      return;
    }
    setActiveTab(tabName);
  };
  
  // Filter medicines based on search text and category
  const filteredMedicines = useMemo(() => {
    return MEDICINES_DATA.filter(medicine => {
      // Filter by search text
      const matchesSearch = searchText === '' || 
        medicine.name.toLowerCase().includes(searchText.toLowerCase()) ||
        medicine.brand.toLowerCase().includes(searchText.toLowerCase()) ||
        medicine.description.toLowerCase().includes(searchText.toLowerCase());
      
      // Filter by category
      const matchesCategory = selectedCategory === 'All' || medicine.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchText, selectedCategory]);

  // Add item to cart
  const addToCart = (medicine) => {
    const existingItem = cartItems.find(item => item.id === medicine.id);
    
    if (existingItem) {
      const updatedCart = cartItems.map(item => 
        item.id === medicine.id ? {...item, quantity: item.quantity + 1} : item
      );
      setCartItems(updatedCart);
      Alert.alert('Added to Cart', 'Quantity updated in your cart');
    } else {
      setCartItems([...cartItems, {...medicine, quantity: 1}]);
      Alert.alert('Added to Cart', 'Item added to your cart');
    }
  };
  
  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />
      <SafeAreaView style={styles.container}>
        {/* App Header */}
        <AppHeader 
          subtitle="Pharmacy"
          navigation={navigation}
        />
        
        {/* Pharmacy Cart Button */}
        <View style={styles.pharmacyHeaderBar}>
          <TouchableOpacity style={styles.cartButton} onPress={goToCart}>
            <View style={styles.cartButtonWrapper}>
              <Ionicons name="basket-outline" size={20} color={Colors.white} />
              {cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Pharmacy Header */}
          <View style={styles.pharmacyHeader}>
            <View style={styles.pharmacyTitleRow}>
              <Ionicons name="medical" size={24} color={Colors.kbrRed} />
              <Text style={styles.pharmacyTitle}>KBR Pharmacy</Text>
              <TouchableOpacity style={styles.cartIconButton} onPress={goToCart}>
                <View style={styles.cartButtonWrapper}>
                  <Ionicons name="basket-outline" size={20} color={Colors.kbrBlue} />
                  {cartItems.length > 0 && (
                    <View style={styles.cartBadgeSmall}>
                      <Text style={styles.cartBadgeTextSmall}>{cartItems.length}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.pharmacySubtitle}>Order medicines online with home delivery</Text>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Browse' && styles.activeTab]}
              onPress={() => handleTabChange('Browse')}
            >
              <Ionicons 
                name="search-outline" 
                size={16} 
                color={activeTab === 'Browse' ? Colors.white : Colors.textPrimary} 
              />
              <Text style={activeTab === 'Browse' ? styles.activeTabText : styles.tabText}>
                Browse
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => handleTabChange('Cart')}
            >
              <Ionicons name="basket-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.tabText}>Cart</Text>
              {cartItems.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{cartItems.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => handleTabChange('Orders')}
            >
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
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText ? (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Ionicons name="funnel-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.filterText}>{selectedCategory}</Text>
              <Ionicons 
                name={showDropdown ? "chevron-up-outline" : "chevron-down-outline"} 
                size={16} 
                color={Colors.textPrimary} 
              />
            </TouchableOpacity>
          </View>

          {/* Filter Dropdown */}
          {showDropdown && (
            <>
              <TouchableOpacity 
                style={styles.dropdownOverlay}
                activeOpacity={1}
                onPress={() => setShowDropdown(false)}
              />
              <View style={styles.dropdownContainer}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.dropdownItem,
                      selectedCategory === category && styles.selectedDropdownItem
                    ]}
                    onPress={() => {
                      setSelectedCategory(category);
                      setShowDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedCategory === category && styles.selectedDropdownItemText
                      ]}
                    >
                      {category}
                    </Text>
                    {selectedCategory === category && (
                      <Ionicons name="checkmark" size={18} color={Colors.kbrBlue} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Free Delivery Banner */}
          <View style={styles.deliveryBanner}>
            <Ionicons name="car-outline" size={16} color={Colors.kbrRed} />
            <Text style={styles.deliveryText}>Free delivery on orders above ₹500</Text>
          </View>

          {/* Medicines List */}
          <View style={styles.medicinesSection}>
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map(medicine => (
                <View key={medicine.id} style={styles.medicineCard}>
                  <View style={styles.medicineLeft}>
                    <View style={styles.medicineIconContainer}>
                      <Ionicons name="medical-outline" size={24} color={Colors.kbrBlue} />
                    </View>
                    <View style={styles.medicineInfo}>
                      <View style={styles.medicineHeader}>
                        <Text style={styles.medicineName}>{medicine.name}</Text>
                        {medicine.prescription && (
                          <View style={styles.prescriptionBadge}>
                            <Text style={styles.prescriptionText}>Rx</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.medicineBrand}>{medicine.brand}</Text>
                      <Text style={styles.medicineDescription}>{medicine.description}</Text>
                      <Text style={styles.medicineCategory}>{medicine.category}</Text>
                      <Text style={styles.medicinePrice}>{medicine.price}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => addToCart(medicine)}
                  >
                    <Ionicons name="add" size={16} color={Colors.white} />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.noResultsText}>No medicines found</Text>
                <Text style={styles.noResultsSubtext}>Try adjusting your search or filter</Text>
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={() => {
                    setSearchText('');
                    setSelectedCategory('All');
                  }}
                >
                  <Text style={styles.resetButtonText}>Reset Filters</Text>
                </TouchableOpacity>
              </View>
            )}
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
  cartButton: {
    padding: 8,
  },
  cartButtonWrapper: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.kbrRed,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cartBadgeSmall: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.kbrRed,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeTextSmall: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
  tabBadge: {
    backgroundColor: Colors.kbrRed,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  tabBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
  
  // Pharmacy specific header bar
  pharmacyHeaderBar: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
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
  // Dropdown styles
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 215, // Position below the filter button
    right: Sizes.screenPadding,
    width: 180,
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    paddingVertical: Sizes.sm,
    zIndex: 999,
    elevation: 5,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
  },
  selectedDropdownItem: {
    backgroundColor: Colors.lightBackground,
  },
  dropdownItemText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
  },
  selectedDropdownItemText: {
    color: Colors.kbrBlue,
    fontWeight: '600',
  },
  // No results styles
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Sizes.xl,
    marginVertical: Sizes.xl,
  },
  noResultsText: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Sizes.lg,
    marginBottom: Sizes.xs,
  },
  noResultsSubtext: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Sizes.lg,
  },
  resetButton: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: Sizes.regular,
    fontWeight: '600',
  },
});

export default PharmacyScreen;