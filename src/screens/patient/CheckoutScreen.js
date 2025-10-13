import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { ROUTES } from '../../constants/navigation';
import AppHeader from '../../components/AppHeader';

const CheckoutScreen = ({ navigation, route }) => {
  // Get cart details from navigation params
  const { cartItems, subtotal, deliveryFee, total } = route.params;
  
  // State for payment and delivery information
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [address, setAddress] = useState({
    fullName: 'John Smith',
    street: '123 Main Street',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
    phone: '9876543210',
  });
  
  // Generate a random order ID
  const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `KBR${timestamp}${random}`;
  };
  
  // Handle place order button
  const placeOrder = () => {
    // Generate order details
    const orderDate = new Date();
    const orderId = generateOrderId();
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(orderDate.getDate() + 2);
    
    const orderDetails = {
      orderId,
      items: cartItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      address,
      orderDate,
      estimatedDelivery,
      status: 'Processing'
    };
    
    Alert.alert(
      'Order Placed',
      `Your order has been successfully placed. Order ID: ${orderId}`,
      [
        { 
          text: 'View Orders', 
          onPress: () => {
            // Navigate to orders screen with new order and cart cleared flag
            navigation.navigate(ROUTES.PATIENT.PHARMACY_ORDERS, { 
              newOrder: orderDetails 
            });
            
            // Also update the pharmacy screen to clear the cart
            navigation.navigate(ROUTES.PATIENT.PHARMACY, { 
              cartItems: [],
              cartCleared: true 
            });
          }
        }
      ]
    );
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />
      <SafeAreaView style={styles.container}>
        {/* App Header */}
        <AppHeader 
          subtitle="Checkout"
          navigation={navigation}
        />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Checkout</Text>
            <Text style={styles.subtitle}>Complete your order</Text>
          </View>
          
          {/* Order Summary */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.orderSummary}>
              <Text style={styles.orderInfo}>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</Text>
              
              <View style={styles.orderTotals}>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Subtotal</Text>
                  <Text style={styles.orderValue}>₹{subtotal.toFixed(2)}</Text>
                </View>
                
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Delivery Fee</Text>
                  {deliveryFee === 0 ? (
                    <Text style={styles.freeDelivery}>FREE</Text>
                  ) : (
                    <Text style={styles.orderValue}>₹{deliveryFee.toFixed(2)}</Text>
                  )}
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.orderRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Delivery Address */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <TouchableOpacity>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Ionicons name="location-outline" size={20} color={Colors.kbrRed} />
                <Text style={styles.addressType}>Default Address</Text>
              </View>
              
              <Text style={styles.addressName}>{address.fullName}</Text>
              <Text style={styles.addressText}>{address.street}</Text>
              <Text style={styles.addressText}>{address.city}, {address.state} - {address.pincode}</Text>
              <Text style={styles.addressPhone}>{address.phone}</Text>
            </View>
          </View>
          
          {/* Payment Method */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>
            
            <View style={styles.paymentOptions}>
              <TouchableOpacity 
                style={[
                  styles.paymentOption, 
                  paymentMethod === 'card' && styles.selectedPaymentOption
                ]}
                onPress={() => setPaymentMethod('card')}
              >
                <View style={styles.paymentRadio}>
                  {paymentMethod === 'card' && <View style={styles.radioSelected} />}
                </View>
                <Ionicons name="card-outline" size={20} color={Colors.kbrBlue} />
                <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.paymentOption, 
                  paymentMethod === 'upi' && styles.selectedPaymentOption
                ]}
                onPress={() => setPaymentMethod('upi')}
              >
                <View style={styles.paymentRadio}>
                  {paymentMethod === 'upi' && <View style={styles.radioSelected} />}
                </View>
                <Ionicons name="phone-portrait-outline" size={20} color={Colors.kbrBlue} />
                <Text style={styles.paymentOptionText}>UPI</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.paymentOption, 
                  paymentMethod === 'cod' && styles.selectedPaymentOption
                ]}
                onPress={() => setPaymentMethod('cod')}
              >
                <View style={styles.paymentRadio}>
                  {paymentMethod === 'cod' && <View style={styles.radioSelected} />}
                </View>
                <Ionicons name="cash-outline" size={20} color={Colors.kbrBlue} />
                <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Notes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <Text style={styles.optionalText}>(Optional)</Text>
            </View>
            
            <TextInput
              style={styles.notesInput}
              placeholder="Add any special instructions for delivery..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Place Order Button */}
          <View style={styles.placeOrderSection}>
            <TouchableOpacity 
              style={styles.placeOrderButton}
              onPress={placeOrder}
            >
              <Text style={styles.placeOrderText}>Place and Pay Order</Text>
            </TouchableOpacity>
            
            <Text style={styles.termsText}>
              By placing your order, you agree to our Terms of Service and Privacy Policy
            </Text>
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
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Sizes.screenPadding,
    marginBottom: Sizes.lg,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.md,
  },
  sectionTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  editText: {
    fontSize: Sizes.medium,
    color: Colors.kbrBlue,
    fontWeight: '500',
  },
  optionalText: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginLeft: Sizes.xs,
  },
  orderSummary: {
    backgroundColor: Colors.lightBackground,
    borderRadius: Sizes.radiusSmall,
    padding: Sizes.md,
  },
  orderInfo: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: Sizes.md,
  },
  orderTotals: {
    gap: Sizes.sm,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderLabel: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  orderValue: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
  },
  freeDelivery: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.kbrGreen,
  },
  totalLabel: {
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.kbrRed,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Sizes.sm,
  },
  addressCard: {
    backgroundColor: Colors.lightBackground,
    borderRadius: Sizes.radiusSmall,
    padding: Sizes.md,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  addressType: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.kbrRed,
    marginLeft: Sizes.xs,
  },
  addressName: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  addressText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  addressPhone: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginTop: Sizes.xs,
  },
  paymentOptions: {
    gap: Sizes.sm,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightBackground,
    borderRadius: Sizes.radiusSmall,
    padding: Sizes.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedPaymentOption: {
    borderColor: Colors.kbrBlue,
    backgroundColor: Colors.kbrBlue + '10',
  },
  paymentRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.kbrBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.sm,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.kbrBlue,
  },
  paymentOptionText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
  },
  notesInput: {
    backgroundColor: Colors.lightBackground,
    borderRadius: Sizes.radiusSmall,
    padding: Sizes.md,
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  placeOrderSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
    paddingBottom: Sizes.xxl,
  },
  placeOrderButton: {
    backgroundColor: Colors.kbrRed,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.md,
  },
  placeOrderText: {
    color: Colors.white,
    fontSize: Sizes.large,
    fontWeight: '600',
  },
  termsText: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default CheckoutScreen;