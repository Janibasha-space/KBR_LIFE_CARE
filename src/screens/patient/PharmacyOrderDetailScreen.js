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
  Platform,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { ROUTES } from '../../constants/navigation';
import AppHeader from '../../components/AppHeader';

const PharmacyOrderDetailScreen = ({ navigation, route }) => {
  // Get order details from navigation params
  const { order } = route.params;
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  
  // Format date to display
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };
  
  // Format time to display
  const formatTime = (date) => {
    const d = new Date(date);
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} ${ampm}`;
  };
  
  // Handle download receipt
  const handleDownload = () => {
    if (downloadInProgress) return;
    
    setDownloadInProgress(true);
    
    // Show downloading notification
    Alert.alert('Downloading', 'Download started...', [{ text: 'OK' }]);
    
    // Simulate download delay
    setTimeout(() => {
      try {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Receipt downloaded successfully!', ToastAndroid.SHORT);
        } else {
          Alert.alert(
            'Download Complete', 
            `Order receipt ${order.orderId} has been downloaded successfully`,
            [{ text: 'OK' }]
          );
        }
        
        setDownloadInProgress(false);
        
      } catch (err) {
        console.error('Error in download simulation:', err);
        Alert.alert('Download Error', 'Failed to download the receipt. Please try again.');
        setDownloadInProgress(false);
      }
    }, 2000);
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />
      <SafeAreaView style={styles.container}>
        {/* App Header */}
        <AppHeader 
          subtitle="Order Details"
          navigation={navigation}
        />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Order Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View>
                <Text style={styles.orderIdLabel}>Order ID</Text>
                <Text style={styles.orderId}>{order.orderId}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: Colors.kbrGreen + '15' }]}>
                <Text style={[styles.statusText, { color: Colors.kbrGreen }]}>{order.status}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.statusDetails}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Order Date</Text>
                <Text style={styles.statusValue}>
                  {formatDate(order.orderDate)} at {formatTime(order.orderDate)}
                </Text>
              </View>
              
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Estimated Delivery</Text>
                <Text style={styles.statusValue}>{formatDate(order.estimatedDelivery)}</Text>
              </View>
              
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Payment Method</Text>
                <Text style={styles.statusValue}>
                  {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                   order.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
                </Text>
              </View>
            </View>
            
            <View style={styles.actionsRow}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleDownload}
                disabled={downloadInProgress}
              >
                {downloadInProgress ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons name="download-outline" size={16} color={Colors.white} />
                )}
                <Text style={styles.actionButtonText}>
                  {downloadInProgress ? 'Downloading...' : 'Download Receipt'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            
            {order.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemLeft}>
                  <View style={styles.medicineIconContainer}>
                    <Ionicons name="medical-outline" size={20} color={Colors.kbrBlue} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemBrand}>{item.brand}</Text>
                    <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                  </View>
                </View>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            ))}
          </View>
          
          {/* Price Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Details</Text>
            
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Item Total</Text>
              <Text style={styles.priceValue}>₹{order.subtotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              {order.deliveryFee === 0 ? (
                <Text style={styles.freeDelivery}>FREE</Text>
              ) : (
                <Text style={styles.priceValue}>₹{order.deliveryFee.toFixed(2)}</Text>
              )}
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.priceItem}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>₹{order.total.toFixed(2)}</Text>
            </View>
          </View>
          
          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>{order.address.fullName}</Text>
              <Text style={styles.addressText}>{order.address.street}</Text>
              <Text style={styles.addressText}>{order.address.city}, {order.address.state} - {order.address.pincode}</Text>
              <Text style={styles.addressPhone}>{order.address.phone}</Text>
            </View>
          </View>
          
          {/* Track Order */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Track Order</Text>
            
            <View style={styles.trackingSteps}>
              <View style={[styles.trackingStep, styles.completedStep]}>
                <View style={styles.stepIndicatorContainer}>
                  <View style={[styles.stepIndicator, styles.completedIndicator]}>
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                  </View>
                  <View style={styles.stepLine} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Order Placed</Text>
                  <Text style={styles.stepTime}>
                    {formatDate(order.orderDate)}, {formatTime(order.orderDate)}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.trackingStep, styles.activeStep]}>
                <View style={styles.stepIndicatorContainer}>
                  <View style={[styles.stepIndicator, styles.activeIndicator]} />
                  <View style={[styles.stepLine, styles.inactiveLine]} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Processing</Text>
                  <Text style={styles.stepTime}>Your order is being processed</Text>
                </View>
              </View>
              
              <View style={styles.trackingStep}>
                <View style={styles.stepIndicatorContainer}>
                  <View style={styles.stepIndicator} />
                  <View style={[styles.stepLine, styles.inactiveLine]} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Shipped</Text>
                  <Text style={styles.stepTime}>Pending</Text>
                </View>
              </View>
              
              <View style={styles.trackingStep}>
                <View style={styles.stepIndicatorContainer}>
                  <View style={styles.stepIndicator} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Delivered</Text>
                  <Text style={styles.stepTime}>Expected by {formatDate(order.estimatedDelivery)}</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Help & Support */}
          <View style={styles.supportSection}>
            <TouchableOpacity style={styles.supportButton}>
              <Ionicons name="help-circle-outline" size={20} color={Colors.kbrBlue} />
              <Text style={styles.supportButtonText}>Need help with this order?</Text>
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
  scrollView: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: Colors.white,
    margin: Sizes.screenPadding,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdLabel: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  orderId: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.radiusSmall,
  },
  statusText: {
    fontSize: Sizes.small,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Sizes.md,
  },
  statusDetails: {
    marginBottom: Sizes.md,
  },
  statusItem: {
    marginBottom: Sizes.sm,
  },
  statusLabel: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  statusValue: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: Colors.kbrRed,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    gap: Sizes.xs,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '600',
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
  sectionTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Sizes.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicineIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.kbrBlue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemBrand: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  itemQty: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  itemPrice: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Sizes.sm,
  },
  priceLabel: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  priceValue: {
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
  addressCard: {
    backgroundColor: Colors.lightBackground,
    borderRadius: Sizes.radiusSmall,
    padding: Sizes.md,
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
  },
  trackingSteps: {
    marginTop: Sizes.sm,
  },
  trackingStep: {
    flexDirection: 'row',
  },
  stepIndicatorContainer: {
    alignItems: 'center',
    width: 24,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIndicator: {
    backgroundColor: Colors.kbrGreen,
  },
  activeIndicator: {
    backgroundColor: Colors.kbrBlue,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.kbrGreen,
    marginTop: 2,
    marginBottom: 2,
  },
  inactiveLine: {
    backgroundColor: Colors.border,
  },
  stepContent: {
    marginLeft: Sizes.sm,
    paddingBottom: Sizes.lg,
    flex: 1,
  },
  stepTitle: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  stepTime: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  supportSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xxl,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: Sizes.xs,
  },
  supportButtonText: {
    fontSize: Sizes.medium,
    color: Colors.kbrBlue,
    fontWeight: '600',
  },
});

export default PharmacyOrderDetailScreen;