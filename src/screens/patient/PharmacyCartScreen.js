import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { ROUTES } from '../../constants/navigation';
import AppHeader from '../../components/AppHeader';

const PharmacyCartScreen = ({ navigation, route }) => {
  // Get cart items from navigation params or set default empty array
  const [cartItems, setCartItems] = useState(route.params?.cartItems || []);
  
  // Keep the pharmacy screen updated with current cart items
  useEffect(() => {
    // Update PharmacyScreen's cart whenever our cart changes
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      // Update the parent screen with latest cart before we leave
      navigation.navigate({
        name: ROUTES.PATIENT.PHARMACY, 
        params: { cartItems }, 
        merge: true
      });
    });
    
    return unsubscribe;
  }, [cartItems]);
  
  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => {
    return total + (parseFloat(item.price.replace('₹', '')) * item.quantity);
  }, 0);
  
  // Calculate delivery fee
  const deliveryFee = subtotal >= 500 ? 0 : 50;
  
  // Calculate total
  const total = subtotal + deliveryFee;
  
  // Handle quantity change
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      // Ask for confirmation before removing
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            onPress: () => {
              const updatedCart = cartItems.filter(item => item.id !== id);
              setCartItems(updatedCart);
              
              // Update navigation params to keep track of current cart
              navigation.setParams({ cartItems: updatedCart });
              
              // Force update the pharmacy screen with new cart data
              navigation.navigate({
                name: ROUTES.PATIENT.PHARMACY,
                params: { cartItems: updatedCart },
                merge: true,
              });
            },
            style: 'destructive'
          }
        ]
      );
      return;
    }
    
    // Update quantity
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCartItems(updatedCart);
    
    // Update navigation params to keep cart in sync across screens
    navigation.setParams({ cartItems: updatedCart });
  };
  
  // Proceed to checkout
  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }
    
    navigation.navigate(ROUTES.PATIENT.PHARMACY_CHECKOUT, {
      cartItems,
      subtotal,
      deliveryFee,
      total
    });
  };
  
  // Return to pharmacy and activate the Browse tab
  const continueShopping = () => {
    // Navigate to the pharmacy screen with activateTab parameter
    navigation.navigate(ROUTES.PATIENT.PHARMACY, { 
      cartItems, 
      activateTab: 'Browse' // This tells the pharmacy screen to activate the Browse tab
    });
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />
      <SafeAreaView style={styles.container}>
        {/* App Header */}
        <AppHeader 
          subtitle="Pharmacy Cart"
          navigation={navigation}
          showBackButton={true}
          customBackAction={() => {
            // Return to pharmacy screen (continue shopping) with latest cart state
            navigation.navigate(ROUTES.PATIENT.PHARMACY, { cartItems });
          }}
        />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Your Cart</Text>
            <Text style={styles.subtitle}>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</Text>
          </View>
          
          {/* Cart Items */}
          <View style={styles.cartItemsSection}>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.itemLeft}>
                    <View style={styles.medicineIconContainer}>
                      <Ionicons name="medical-outline" size={24} color={Colors.kbrBlue} />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemBrand}>{item.brand}</Text>
                      {item.prescription && (
                        <View style={styles.prescriptionBadge}>
                          <Text style={styles.prescriptionText}>Rx</Text>
                        </View>
                      )}
                      <Text style={styles.itemPrice}>{item.price}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.quantityControl}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Ionicons name="remove" size={16} color={Colors.kbrRed} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={16} color={Colors.kbrGreen} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCart}>
                <Ionicons name="basket-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <Text style={styles.emptyCartSubtext}>Add medicines to your cart from pharmacy</Text>
                <TouchableOpacity 
                  style={styles.browseButton}
                  onPress={continueShopping}
                >
                  <Text style={styles.browseButtonText}>Browse Medicines</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.white} style={{marginLeft: 8}} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {cartItems.length > 0 && (
            <>
              {/* Order Summary */}
              <View style={styles.orderSummarySection}>
                <Text style={styles.orderSummaryTitle}>Order Summary</Text>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  {deliveryFee === 0 ? (
                    <Text style={styles.freeDelivery}>FREE</Text>
                  ) : (
                    <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
                  )}
                </View>
                
                <View style={styles.deliveryNote}>
                  <Ionicons name="information-circle-outline" size={16} color={Colors.kbrBlue} />
                  <Text style={styles.deliveryNoteText}>
                    Free delivery on orders above ₹500
                  </Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                </View>
              </View>
              
              {/* Checkout Button */}
              <View style={styles.checkoutSection}>
                <TouchableOpacity 
                  style={styles.checkoutButton}
                  onPress={proceedToCheckout}
                >
                  <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </>
          )}
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
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
  },
  title: {
    fontSize: Sizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  subtitle: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
  },
  cartItemsSection: {
    paddingHorizontal: Sizes.screenPadding,
  },
  cartItem: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.md,
    marginBottom: Sizes.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.kbrBlue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  itemBrand: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  prescriptionBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: Sizes.xs,
  },
  prescriptionText: {
    fontSize: Sizes.small,
    color: Colors.white,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: Sizes.regular,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightBackground,
    borderRadius: Sizes.radiusSmall,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    width: 30,
    textAlign: 'center',
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Sizes.xl,
    marginVertical: Sizes.xl,
  },
  emptyCartText: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Sizes.lg,
    marginBottom: Sizes.xs,
  },
  emptyCartSubtext: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Sizes.lg,
  },
  browseButton: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: Colors.kbrBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  browseButtonText: {
    color: Colors.white,
    fontSize: Sizes.regular,
    fontWeight: '600',
  },
  orderSummarySection: {
    backgroundColor: Colors.white,
    marginHorizontal: Sizes.screenPadding,
    marginVertical: Sizes.lg,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderSummaryTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Sizes.sm,
  },
  summaryLabel: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
  },
  freeDelivery: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.kbrGreen,
  },
  deliveryNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue + '10',
    padding: Sizes.sm,
    borderRadius: Sizes.radiusSmall,
    marginVertical: Sizes.sm,
  },
  deliveryNoteText: {
    fontSize: Sizes.small,
    color: Colors.kbrBlue,
    marginLeft: Sizes.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Sizes.md,
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Sizes.title,
    fontWeight: 'bold',
    color: Colors.kbrRed,
  },
  checkoutSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
    paddingBottom: Sizes.xxl,
  },
  checkoutButton: {
    backgroundColor: Colors.kbrRed,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Sizes.md,
    elevation: 4,
    shadowColor: Colors.kbrRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: Sizes.large,
    fontWeight: '600',
  },
});

export default PharmacyCartScreen;