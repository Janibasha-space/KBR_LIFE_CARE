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
    price: '₹2',
    description: 'For allergy relief',
    category: 'Antihistamine',
    prescription: false
  },
  {
    id: 5,
    name: 'Omeprazole 20mg',
    brand: 'Ranbaxy',
    price: '₹5',
    description: 'For acidity and heartburn',
    category: 'Antacid',
    prescription: false
  },
];

// Categories for filtering
const CATEGORIES = [
  'All',
  'Analgesic',
  'Antibiotic',
  'Cardiovascular',
  'Antihistamine',
  'Antacid'
];

const PharmacyScreen = ({ navigation, route = {} }) => {
  const { userData } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItems, setCartItems] = useState([]);
  const [medicines] = useState(MEDICINES_DATA);

  // Get cart items from route params when navigating back from cart
  useFocusEffect(
    useCallback(() => {
      if (route.params?.updatedCartItems) {
        setCartItems(route.params.updatedCartItems);
      }
    }, [route.params?.updatedCartItems])
  );

  // Filter medicines based on search and category
  const filteredMedicines = useMemo(() => {
    return medicines.filter(medicine => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          medicine.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          medicine.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || medicine.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [medicines, searchQuery, selectedCategory]);

  // Add to cart functionality
  const addToCart = (medicine) => {
    const existingItem = cartItems.find(item => item.id === medicine.id);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === medicine.id 
          ? {...item, quantity: item.quantity + 1}
          : item
      ));
      Alert.alert('Added to Cart', 'Quantity updated in your cart');
    } else {
      setCartItems([...cartItems, {...medicine, quantity: 1}]);
      Alert.alert('Added to Cart', 'Item added to your cart');
    }
  };

  // Navigate to cart
  const navigateToCart = () => {
    navigation.navigate(ROUTES.PATIENT.PHARMACY_CART, { 
      cartItems,
      onUpdateCart: setCartItems
    });
  };

  // Get cart count
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Medicine card component
  const MedicineCard = ({ medicine }) => (
    <View style={styles.medicineCard}>
      <View style={styles.medicineInfo}>
        <Text style={styles.medicineName}>{medicine.name}</Text>
        <Text style={styles.medicineBrand}>{medicine.brand}</Text>
        <Text style={styles.medicineDescription}>{medicine.description}</Text>
        <View style={styles.medicineDetails}>
          <Text style={styles.medicineCategory}>{medicine.category}</Text>
          {medicine.prescription && (
            <View style={styles.prescriptionBadge}>
              <Text style={styles.prescriptionText}>Rx</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.medicineActions}>
        <Text style={styles.medicinePrice}>{medicine.price}</Text>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => addToCart(medicine)}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      
      <AppHeader
        title="Pharmacy"
        showBackButton={false}
        rightComponent={
          <TouchableOpacity style={styles.cartButton} onPress={navigateToCart}>
            <Ionicons name="cart" size={24} color={Colors.white} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <SafeAreaView style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={Colors.gray} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search medicines..."
                placeholderTextColor={Colors.gray}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.selectedCategoryButton
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.selectedCategoryText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Medicines Section */}
          <View style={styles.medicinesSection}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'All Medicines' : selectedCategory}
            </Text>
            
            {filteredMedicines.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="medical" size={50} color={Colors.gray} />
                <Text style={styles.emptyStateText}>No medicines found</Text>
              </View>
            ) : (
              <FlatList
                data={filteredMedicines}
                renderItem={({ item }) => <MedicineCard medicine={item} />}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
  },
  cartButton: {
    position: 'relative',
    padding: 5,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: Sizes.padding,
    backgroundColor: Colors.lightGray,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingHorizontal: Sizes.padding,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: Colors.black,
  },
  categoriesContainer: {
    paddingVertical: Sizes.padding,
    paddingHorizontal: Sizes.padding,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: Colors.white,
  },
  medicinesSection: {
    padding: Sizes.padding,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: Sizes.padding,
  },
  medicineCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.padding,
    marginBottom: Sizes.padding,
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4,
  },
  medicineBrand: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
  },
  medicineDescription: {
    fontSize: 13,
    color: Colors.darkGray,
    marginBottom: 8,
  },
  medicineDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicineCategory: {
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  prescriptionBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  prescriptionText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: 'bold',
  },
  medicineActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  medicinePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 10,
  },
});

export default PharmacyScreen;