import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { useApp } from '../../contexts/AppContext';
import AppHeader from '../../components/AppHeader';
import { 
  FirebaseAppointmentService,
  FirebasePatientService, 
  FirebaseDoctorService,
  FirebasePaymentService,
  firebaseHospitalServices 
} from '../../services/firebaseHospitalServices';
import { collection, query, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase.config';

// Helper function to create transparent colors
const getTransparentColor = (color, opacity) => `${color}${opacity}`;

const AdminDashboardScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useFirebaseAuth();
  const { appState, adminStats } = useApp();
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    activeDoctors: 0,
    todayAppointments: 0,
    recentAppointments: [],
    pendingInvoicesCount: 0
  });

  // Helper function to format currency properly
  const formatCurrency = (amount) => {
    // Ensure we have a valid number
    const numAmount = parseFloat(amount) || 0;
    
    // Handle edge cases and ensure proper formatting
    if (isNaN(numAmount) || !isFinite(numAmount)) {
      return '₹0';
    }
    
    // Round to 2 decimal places to avoid floating point issues
    const roundedAmount = Math.round(numAmount * 100) / 100;
    
    // Use Indian locale for proper number formatting
    return `₹${roundedAmount.toLocaleString('en-IN')}`;
  };

  console.log('🏥 AdminDashboardScreen rendered, isAuthenticated:', isAuthenticated, 'Render timestamp:', Date.now());

  // Fetch real-time dashboard data from Firebase
  useEffect(() => {
    if (isInitialized) return; // Prevent multiple initializations
    
    console.log('🔄 AdminDashboard useEffect triggered, isAuthenticated:', isAuthenticated);
    
    // Force fetch data even if authentication status is being checked
    const fetchData = async () => {
      console.log('🚀 Force fetching dashboard data...');
      try {
        setLoading(true);
        
        // Fetch all data from Firebase collections using proper services
        const [doctorsResult, appointmentsResult, usersResult, paymentsResult] = await Promise.all([
          FirebaseDoctorService.getDoctors(),
          FirebaseAppointmentService.getAppointments(),
          FirebasePatientService.getAllUsers(),
          FirebasePaymentService.getPayments()
        ]);

        const doctors = doctorsResult?.success ? doctorsResult.data : [];
        const appointments = appointmentsResult?.success ? appointmentsResult.data : [];
        const users = usersResult?.success ? usersResult.data : [];
        const payments = paymentsResult?.success ? paymentsResult.data : [];
        
        // Calculate real stats from Firebase data
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointments.filter(apt => 
          apt.appointmentDate && apt.appointmentDate.startsWith(today)
        ).length;

        // Calculate total registered users (people who have logged into the app)
        const totalRegisteredUsers = users.length;

        // Use revenue from AppContext adminStats (which aggregates from all sources)
        const totalRevenue = appState.adminStats?.totalRevenue || adminStats?.totalRevenue || 0;
        console.log('💰 Dashboard using revenue from AppContext:', totalRevenue);

        // Use active doctors from AppContext adminStats
        const activeDoctorsToday = appState.adminStats?.activeDoctors || adminStats?.activeDoctors || doctors.length;

        // Get recent appointments (latest 3)
        const recentAppointments = appointments
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map(appointment => ({
            id: appointment.id,
            patientName: appointment.patientName || 'N/A',
            doctor: `${appointment.doctorName || 'Dr. Unknown'} • ${appointment.specialty || 'General'}`,
            time: `${appointment.appointmentDate || 'TBD'} • ₹${appointment.consultationFee || appointment.amount || 0}`,
            status: appointment.status || 'pending',
            avatar: (appointment.patientName || 'U').charAt(0).toUpperCase(),
          }));

        const newDashboardData = {
          totalUsers: appState.adminStats?.totalUsers || adminStats?.totalUsers || totalRegisteredUsers,
          totalAppointments: appState.adminStats?.totalAppointments || adminStats?.totalAppointments || appointments.length,
          totalRevenue: totalRevenue, // Use calculated revenue from AppContext
          activeDoctors: activeDoctorsToday, // Use calculated active doctors from AppContext
          todayAppointments: appState.adminStats?.todayAppointments || adminStats?.todayAppointments || todayAppointments,
          recentAppointments: recentAppointments,
          pendingInvoicesCount: appointments.filter(apt => apt.status === 'pending').length
        };

        setDashboardData(newDashboardData);
        setIsInitialized(true); // Mark as initialized

        console.log('📊 Dashboard Stats Updated:', {
          registeredUsers: totalRegisteredUsers,
          totalAppointments: appointments.length,
          totalRevenue: totalRevenue,
          activeDoctors: activeDoctorsToday,
          todayAppointments: todayAppointments,
          paymentsProcessed: payments.length
        });

      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        // Set fallback data
        setDashboardData({
          totalUsers: 0,
          totalAppointments: 0,
          totalRevenue: 0,
          activeDoctors: 0,
          todayAppointments: 0,
          recentAppointments: [],
          pendingInvoicesCount: 0
        });
        setIsInitialized(true); // Mark as initialized even on error
      } finally {
        setLoading(false);
      }
    };

    // Always fetch data regardless of auth status
    fetchData();
    
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, but data fetch attempted');
      return;
    }

    // Set up real-time listeners for live updates (only once)
    const appointmentsQuery = query(
      collection(db, 'appointments'), 
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      console.log('🔄 Appointments updated, refreshing dashboard...');
      if (isInitialized) fetchData();
    });

    const doctorsQuery = query(collection(db, 'doctors'));
    const unsubscribeDoctors = onSnapshot(doctorsQuery, (snapshot) => {
      console.log('🔄 Doctors updated, refreshing dashboard...');
      if (isInitialized) fetchData();
    });

    // Listen to users collection for real-time user count updates
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      console.log('🔄 Users updated, refreshing dashboard...');
      if (isInitialized) fetchData();
    });

    // Listen to payments collection for real-time revenue updates
    const paymentsQuery = query(collection(db, 'payments'));
    const unsubscribePayments = onSnapshot(paymentsQuery, (snapshot) => {
      console.log('🔄 Payments updated, refreshing dashboard...');
      if (isInitialized) fetchData();
    });

    // Cleanup listeners
    return () => {
      unsubscribeAppointments();
      unsubscribeDoctors();
      unsubscribeUsers();
      unsubscribePayments();
    };
  }, [isAuthenticated]); // Removed problematic dependencies

  // Memoize adminStats to prevent unnecessary re-renders
  const memoizedAdminStats = useMemo(() => {
    return {
      totalRevenue: appState.adminStats?.totalRevenue || adminStats?.totalRevenue || 0,
      totalUsers: appState.adminStats?.totalUsers || adminStats?.totalUsers || 0,
      totalAppointments: appState.adminStats?.totalAppointments || adminStats?.totalAppointments || 0,
      activeDoctors: appState.adminStats?.activeDoctors || adminStats?.activeDoctors || 0,
      todayAppointments: appState.adminStats?.todayAppointments || adminStats?.todayAppointments || 0,
    };
  }, [
    appState.adminStats?.totalRevenue, 
    appState.adminStats?.totalUsers,
    appState.adminStats?.totalAppointments,
    appState.adminStats?.activeDoctors,
    appState.adminStats?.todayAppointments,
    adminStats?.totalRevenue,
    adminStats?.totalUsers,
    adminStats?.totalAppointments,
    adminStats?.activeDoctors,
    adminStats?.todayAppointments
  ]);

  // Update dashboard data when adminStats change (without refetching from Firebase)
  useEffect(() => {
    if (memoizedAdminStats.totalRevenue > 0 || memoizedAdminStats.totalUsers > 0) {
      console.log('🔄 AdminStats changed - updating dashboard display');
      console.log('💰 New revenue from adminStats:', memoizedAdminStats.totalRevenue);
      
      setDashboardData(prev => ({
        ...prev,
        totalRevenue: memoizedAdminStats.totalRevenue || prev.totalRevenue || 0,
        totalUsers: memoizedAdminStats.totalUsers || prev.totalUsers || 0,
        totalAppointments: memoizedAdminStats.totalAppointments || prev.totalAppointments || 0,
        activeDoctors: memoizedAdminStats.activeDoctors || prev.activeDoctors || 0,
        todayAppointments: memoizedAdminStats.todayAppointments || prev.todayAppointments || 0,
      }));
    }
  }, [memoizedAdminStats]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, color: Colors.textSecondary }}>Loading dashboard...</Text>
      </View>
    );
  }

  // Add debugging for revenue amount
  console.log('💰 Dashboard Revenue Debug:', {
    totalRevenue: dashboardData.totalRevenue,
    type: typeof dashboardData.totalRevenue,
    isNaN: isNaN(dashboardData.totalRevenue),
    formatted: formatCurrency(dashboardData.totalRevenue)
  });

  // Real-time stats cards with live Firebase data
  const statsCards = [
    {
      id: 'users',
      title: 'Total Users',
      value: dashboardData.totalUsers.toString(),
      change: `${dashboardData.totalUsers} registered`,
      icon: 'people-outline',
      backgroundColor: Colors.totalUsers || '#E8F4FD',
      iconColor: Colors.kbrRed,
    },
    {
      id: 'appointments',
      title: 'Appointments',
      value: dashboardData.totalAppointments.toString(),
      change: `${dashboardData.todayAppointments} today`,
      icon: 'calendar-outline',
      backgroundColor: Colors.appointments || '#FFF2E8',
      iconColor: Colors.kbrBlue,
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: formatCurrency(dashboardData.totalRevenue),
      change: 'Total collected',
      icon: 'trending-up-outline',
      backgroundColor: Colors.revenue || '#E8F5E8',
      iconColor: Colors.kbrGreen,
    },
    {
      id: 'doctors',
      title: 'Active Doctors',
      value: dashboardData.activeDoctors.toString(),
      change: 'Available today',
      icon: 'medical-outline',
      backgroundColor: Colors.activeDoctors || '#F3E8FF',
      iconColor: Colors.kbrPurple,
    },
  ];

  // Recent appointments from Firebase data
  const recentAppointments = dashboardData.recentAppointments;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return getTransparentColor(Colors.confirmed, '20');
      case 'pending': return getTransparentColor(Colors.pending, '20');
      case 'completed': return getTransparentColor(Colors.completed, '20');
      default: return getTransparentColor(Colors.textSecondary, '20');
    }
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar 
        backgroundColor="transparent" 
        barStyle="light-content" 
        translucent={true} 
      />
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        {/* App Header */}
        <AppHeader 
          title="KBR LIFE CARE HOSPITALS"
          subtitle="Admin Dashboard"
          navigation={navigation}
          showMenuButton={true}
          hideProfileButton={true}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              {statsCards.slice(0, 2).map((card, index) => (
                <View key={`stats-${card.id}-${index}`} style={[styles.statsCard, { backgroundColor: card.backgroundColor }]}>
                  <View style={styles.statsCardContent}>
                    <View style={styles.statsLeft}>
                      <Text style={styles.statsTitle}>{card.title}</Text>
                      <Text style={styles.statsValue}>{card.value}</Text>
                      <View style={styles.statsChange}>
                        <Ionicons name="trending-up" size={12} color={Colors.kbrGreen} />
                        <Text style={styles.statsChangeText}>{card.change}</Text>
                      </View>
                    </View>
                    <View style={[styles.statsIconContainer, { backgroundColor: getTransparentColor(card.iconColor, '20') }]}>
                      <Ionicons name={card.icon} size={24} color={card.iconColor} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.statsRow}>
              {statsCards.slice(2, 4).map((card, index) => (
                <View key={`stats-${card.id}-${index + 2}`} style={[styles.statsCard, { backgroundColor: card.backgroundColor }]}>
                  <View style={styles.statsCardContent}>
                    <View style={styles.statsLeft}>
                      <Text style={styles.statsTitle}>{card.title}</Text>
                      <Text style={styles.statsValue}>{card.value}</Text>
                      <View style={styles.statsChange}>
                        <Ionicons name="trending-up" size={12} color={Colors.kbrGreen} />
                        <Text style={styles.statsChangeText}>{card.change}</Text>
                      </View>
                    </View>
                    <View style={[styles.statsIconContainer, { backgroundColor: getTransparentColor(card.iconColor, '20') }]}>
                      <Ionicons name={card.icon} size={24} color={card.iconColor} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('ServiceManagement')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.kbrBlue + '15' }]}>
                <Ionicons name="medical-outline" size={24} color={Colors.kbrBlue} />
              </View>
              <Text style={styles.quickActionTitle}>Manage Services</Text>
              <Text style={styles.quickActionSubtitle}>Add, edit, or remove services</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.getParent()?.navigate('DoctorManagement')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.kbrGreen + '15' }]}>
                <Ionicons name="people-outline" size={24} color={Colors.kbrGreen} />
              </View>
              <Text style={styles.quickActionTitle}>Manage Doctors</Text>
              <Text style={styles.quickActionSubtitle}>Add or assign doctors</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Payments')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F6' + '15' }]}>
                <Ionicons name="wallet-outline" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionTitle}>Payment Management</Text>
              <Text style={styles.quickActionSubtitle}>Track payments & transactions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('InvoiceManagement')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
                <Ionicons name="document-text-outline" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.quickActionTitle}>Invoice Management</Text>
              <Text style={styles.quickActionSubtitle}>Create & manage invoices</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Appointments')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.kbrRed + '15' }]}>
                <Ionicons name="calendar-outline" size={24} color={Colors.kbrRed} />
              </View>
              <Text style={styles.quickActionTitle}>View Appointments</Text>
              <Text style={styles.quickActionSubtitle}>Manage all appointments</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, styles.featuredActionCard]}
              onPress={() => navigation.navigate('Reports')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.kbrPurple + '15' }]}>
                <Ionicons name="analytics-outline" size={28} color={Colors.kbrPurple} />
              </View>
              <Text style={styles.quickActionTitle}>📊 Hospital Reports</Text>
              <Text style={styles.quickActionSubtitle}>Analytics, revenue & insights</Text>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Financial Overview Section */}
        <View style={styles.financialSection}>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.financialCards}>
            <TouchableOpacity 
              style={[styles.financialCard, { backgroundColor: '#10B981' + '10' }]}
              onPress={() => navigation.navigate('Payments')}
            >
              <View style={styles.financialCardHeader}>
                <Ionicons name="trending-up" size={24} color="#10B981" />
                <Text style={styles.financialAmount}>{formatCurrency(dashboardData.totalRevenue)}</Text>
              </View>
              <Text style={styles.financialTitle}>Total Revenue</Text>
              <Text style={styles.financialSubtitle}>All payments collected</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.financialCard, { backgroundColor: '#F59E0B' + '10' }]}
              onPress={() => navigation.navigate('InvoiceManagement')}
            >
              <View style={styles.financialCardHeader}>
                <Ionicons name="time" size={24} color="#F59E0B" />
                <Text style={styles.financialAmount}>{dashboardData.pendingInvoicesCount}</Text>
              </View>
              <Text style={styles.financialTitle}>Pending Appointments</Text>
              <Text style={styles.financialSubtitle}>Need confirmation</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Appointments */}
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Appointments</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.appointmentsList}>
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment, index) => (
                <View key={`appointment-${appointment.id || 'temp'}-${index}`} style={styles.appointmentItem}>
                  <View style={styles.appointmentLeft}>
                    <View style={[styles.avatar, { backgroundColor: Colors.kbrRed }]}>
                      <Text style={styles.avatarText}>{appointment.avatar}</Text>
                    </View>
                    <View style={styles.appointmentInfo}>
                      <View style={styles.appointmentHeader}>
                        <Text style={styles.patientName}>{appointment.patientName}</Text>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(appointment.status) }
                        ]}>
                          <Text style={styles.statusText}>{appointment.status}</Text>
                        </View>
                      </View>
                      <Text style={styles.doctorInfo}>{appointment.doctor}</Text>
                      <Text style={styles.appointmentTime}>{appointment.time}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.appointmentAction}
                    onPress={() => {
                      // TODO: Implement appointment details view
                      console.log('View appointment details:', appointment);
                    }}
                  >
                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>No appointments yet</Text>
                <Text style={styles.emptyStateSubtext}>Appointments will appear here once patients start booking</Text>
              </View>
            )}
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
  // Enhanced Professional Admin Header Styles
  header: {
    backgroundColor: Colors.kbrBlue,
    paddingTop: 15,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  
  // Top Header Row Styles
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: 12,
  },
  hospitalBranding: {
    flex: 1,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  adminLogoImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  hospitalTextSection: {
    marginLeft: 14,
  },
  hospitalName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
    lineHeight: 26,
  },
  hospitalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  
  // Header Actions Styles
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBarButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  
  // Bottom Header Row Styles
  bottomHeaderRow: {
    paddingHorizontal: Sizes.screenPadding,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeMessage: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#E3F2FD',
    fontWeight: '400',
    opacity: 0.9,
  },
  
  // Quick Navigation Styles
  quickNavContainer: {
    paddingHorizontal: Sizes.screenPadding,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 8,
  },
  quickNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickNavText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
    marginLeft: 6,
  },
  loginText: {
    color: Colors.white,
    marginLeft: 4,
    fontSize: Sizes.small,
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingTop: Sizes.lg,
    paddingBottom: Sizes.md,
  },
  statsGrid: {
    gap: Sizes.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Sizes.md,
  },
  statsCard: {
    flex: 1,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsLeft: {
    flex: 1,
  },
  statsTitle: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: Sizes.xlarge,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statsChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsChangeText: {
    fontSize: Sizes.small,
    color: Colors.kbrGreen,
    marginLeft: 4,
    fontWeight: '500',
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionsSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Sizes.md,
  },
  quickActionCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    width: '47%',
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.sm,
  },
  quickActionTitle: {
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Sizes.xs,
  },
  quickActionSubtitle: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Financial Section
  financialSection: {
    paddingHorizontal: Sizes.screenPadding,
    marginBottom: Sizes.xl,
  },
  financialCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Sizes.md,
  },
  financialCard: {
    flex: 0.48,
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  financialCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Sizes.sm,
  },
  financialAmount: {
    fontSize: Sizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  financialTitle: {
    fontSize: Sizes.regular,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  financialSubtitle: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },

  appointmentsSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  viewAllText: {
    fontSize: Sizes.medium,
    color: Colors.kbrRed,
    fontWeight: '500',
  },
  appointmentsList: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appointmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  avatarText: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.white,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  patientName: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 2,
    borderRadius: Sizes.radiusSmall,
  },
  statusText: {
    fontSize: Sizes.small,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  doctorInfo: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  moreButton: {
    padding: Sizes.sm,
  },

  // Featured Reports Card Styles
  featuredActionCard: {
    borderWidth: 2,
    borderColor: Colors.kbrPurple + '30',
    backgroundColor: Colors.kbrPurple + '08',
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.kbrPurple,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.xl * 2,
  },
  emptyStateText: {
    fontSize: Sizes.large,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Sizes.md,
    marginBottom: Sizes.xs,
  },
  emptyStateSubtext: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});

export default AdminDashboardScreen;