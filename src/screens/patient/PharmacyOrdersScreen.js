import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { ROUTES } from '../../constants/navigation';
import AppHeader from '../../components/AppHeader';

const PharmacyOrdersScreen = ({ navigation, route }) => {
  // State for orders
  const [orders, setOrders] = useState([
    {
      orderId: 'KBR98765432',
      items: [
        {
          id: 1,
          name: 'Paracetamol 500mg',
          brand: 'Apollo Pharmacy',
          price: '₹3',
          quantity: 20,
          prescription: false
        },
        {
          id: 3,
          name: 'Atorvastatin 10mg',
          brand: 'Cipla',
          price: '₹8',
          quantity: 10,
          prescription: true
        }
      ],
      subtotal: 140,
      deliveryFee: 0,
      total: 140,
      paymentMethod: 'card',
      address: {
        fullName: 'John Smith',
        street: '123 Main Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        phone: '9876543210',
      },
      orderDate: new Date('2025-10-10T10:30:00'),
      estimatedDelivery: new Date('2025-10-12T18:00:00'),
      status: 'Delivered'
    },
    {
      orderId: 'KBR87654321',
      items: [
        {
          id: 2,
          name: 'Amoxicillin 250mg',
          brand: 'Sun Pharma',
          price: '₹12',
          quantity: 15,
          prescription: true
        }
      ],
      subtotal: 180,
      deliveryFee: 0,
      total: 180,
      paymentMethod: 'upi',
      address: {
        fullName: 'John Smith',
        street: '123 Main Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        phone: '9876543210',
      },
      orderDate: new Date('2025-10-05T14:45:00'),
      estimatedDelivery: new Date('2025-10-07T18:00:00'),
      status: 'Delivered'
    },
    {
      orderId: 'KBR76543210',
      items: [
        {
          id: 1,
          name: 'Paracetamol 500mg',
          brand: 'Apollo Pharmacy',
          price: '₹3',
          quantity: 10,
          prescription: false
        }
      ],
      subtotal: 30,
      deliveryFee: 50,
      total: 80,
      paymentMethod: 'cod',
      address: {
        fullName: 'John Smith',
        street: '123 Main Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        phone: '9876543210',
      },
      orderDate: new Date('2025-10-01T09:15:00'),
      estimatedDelivery: new Date('2025-10-03T18:00:00'),
      status: 'Delivered'
    }
  ]);

  // Check if there's a new order from navigation params
  useEffect(() => {
    if (route.params?.newOrder) {
      // Add the new order to the top of the list
      setOrders(currentOrders => [route.params.newOrder, ...currentOrders]);
      
      // Clear the param to prevent duplication on navigation
      navigation.setParams({ newOrder: null });
    }
  }, [route.params?.newOrder]);

  // Format date to display
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };
  
  // Handle view order details
  const viewOrderDetails = (order) => {
    navigation.navigate(ROUTES.PATIENT.PHARMACY_ORDER_DETAIL, { order });
  };
  
  // Handle download receipt
  const handleDownload = (orderId) => {
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
            `Order receipt ${orderId} has been downloaded successfully`,
            [{ text: 'OK' }]
          );
        }
      } catch (err) {
        console.error('Error in download simulation:', err);
        Alert.alert('Download Error', 'Failed to download the receipt. Please try again.');
      }
    }, 2000);
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />
      <SafeAreaView style={styles.container}>
        {/* App Header */}
        <AppHeader 
          subtitle="Orders"
          navigation={navigation}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Your Orders</Text>
            <Text style={styles.subtitle}>View and track your medication orders</Text>
          </View>
          
          {/* Orders List */}
          <View style={styles.ordersSection}>
            {orders.length > 0 ? (
              orders.map((order) => (
                <View key={order.orderId} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderIdLabel}>Order ID</Text>
                      <Text style={styles.orderId}>{order.orderId}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: Colors.kbrGreen + '15' }]}>
                      <Text style={[styles.statusText, { color: Colors.kbrGreen }]}>{order.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderDate}>
                      <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} /> {formatDate(order.orderDate)}
                    </Text>
                    <Text style={styles.orderAmount}>₹{order.total.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.orderItems}>
                    <Text style={styles.orderItemsTitle}>Items:</Text>
                    {order.items.map((item, index) => (
                      <Text key={index} style={styles.orderItem}>
                        • {item.name} x{item.quantity}
                      </Text>
                    ))}
                  </View>
                  
                  <View style={styles.orderActions}>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => viewOrderDetails(order)}
                    >
                      <Ionicons name="eye-outline" size={16} color={Colors.white} />
                      <Text style={styles.viewButtonText}>View Details</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={() => handleDownload(order.orderId)}
                    >
                      <Ionicons name="download-outline" size={16} color={Colors.kbrRed} />
                      <Text style={styles.downloadButtonText}>Receipt</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyOrders}>
                <Ionicons name="document-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyOrdersText}>No orders yet</Text>
                <Text style={styles.emptyOrdersSubtext}>Your pharmacy orders will appear here</Text>
                <TouchableOpacity 
                  style={styles.browseButton}
                  onPress={() => navigation.navigate(ROUTES.PATIENT.PHARMACY)}
                >
                  <Text style={styles.browseButtonText}>Shop Medicines</Text>
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
  ordersSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xxl,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.lg,
    marginBottom: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  orderIdLabel: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  orderId: {
    fontSize: Sizes.medium,
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
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  orderDate: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  orderAmount: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.kbrRed,
  },
  orderItems: {
    backgroundColor: Colors.lightBackground,
    borderRadius: Sizes.radiusSmall,
    padding: Sizes.sm,
    marginBottom: Sizes.md,
  },
  orderItemsTitle: {
    fontSize: Sizes.small,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  orderItem: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    flex: 2,
    backgroundColor: Colors.kbrBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    marginRight: Sizes.sm,
  },
  viewButtonText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '600',
    marginLeft: 4,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    borderWidth: 1,
    borderColor: Colors.kbrRed,
  },
  downloadButtonText: {
    color: Colors.kbrRed,
    fontSize: Sizes.medium,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyOrders: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Sizes.xl,
    marginVertical: Sizes.xl,
  },
  emptyOrdersText: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Sizes.lg,
    marginBottom: Sizes.xs,
  },
  emptyOrdersSubtext: {
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
  },
  browseButtonText: {
    color: Colors.white,
    fontSize: Sizes.regular,
    fontWeight: '600',
  },
});

export default PharmacyOrdersScreen;