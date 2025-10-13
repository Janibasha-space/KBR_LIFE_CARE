import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useUser } from '../../contexts/UserContext';
import { useApp } from '../../contexts/AppContext';

// Helper function to create transparent colors
const getTransparentColor = (color, opacity) => `${color}${opacity}`;

const AdminDashboardScreen = ({ navigation }) => {
  const [adminName] = useState('Admin King');
  const { isLoggedIn, userData } = useUser();
  
  // Use AppContext for real-time data
  const { 
    adminStats, 
    appointments, 
    pharmacy 
  } = useApp();

  // Real-time stats cards with live data from AppContext
  const statsCards = [
    {
      id: 'users',
      title: 'Total Users',
      value: adminStats.totalUsers.toString(),
      change: `${adminStats.totalUsers} registered`,
      icon: 'people-outline',
      backgroundColor: Colors.totalUsers,
      iconColor: Colors.kbrRed,
    },
    {
      id: 'appointments',
      title: 'Appointments',
      value: adminStats.totalAppointments.toString(),
      change: `${adminStats.todayAppointments} today`,
      icon: 'calendar-outline',
      backgroundColor: Colors.appointments,
      iconColor: Colors.kbrBlue,
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: `₹${adminStats.totalRevenue.toLocaleString()}`,
      change: `₹${pharmacy.todaySales.toLocaleString()} today`,
      icon: 'trending-up-outline',
      backgroundColor: Colors.revenue,
      iconColor: Colors.kbrGreen,
    },
    {
      id: 'doctors',
      title: 'Active Doctors',
      value: adminStats.activeDoctors.toString(),
      change: 'All available',
      icon: 'medical-outline',
      backgroundColor: Colors.activeDoctors,
      iconColor: Colors.kbrPurple,
    },
  ];

  // Recent appointments from real AppContext data
  const recentAppointments = appointments
    .slice(0, 3) // Show only latest 3
    .map(appointment => ({
      id: appointment.id,
      patientName: appointment.patientName,
      doctor: `${appointment.doctorName} • ${appointment.specialization}`,
      time: `${appointment.date} ${appointment.time} • ₹${appointment.amount}`,
      status: appointment.status,
      avatar: appointment.patientName.charAt(0).toUpperCase(),
    }));

  const renderStatsCard = (card) => (
    <View key={card.id} style={[styles.statsCard, { backgroundColor: card.backgroundColor }]}>
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
  );

  const renderAppointmentItem = (appointment) => (
    <View key={appointment.id} style={styles.appointmentItem}>
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
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={16} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

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
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />
      <SafeAreaView style={styles.container}>
      {/* Enhanced Professional Admin Header */}
      <View style={styles.header}>
        {/* Top Header Row */}
        <View style={styles.topHeaderRow}>
          <View style={styles.hospitalBranding}>
            <View style={styles.logoSection}>
              <Image 
                source={require('../../../assets/hospital-logo.jpeg')}
                style={styles.adminLogoImage}
                resizeMode="contain"
              />
              <View style={styles.hospitalTextSection}>
                <Text style={styles.hospitalName}>KBR LIFE CARE</Text>
                <Text style={styles.hospitalSubtitle}>ADMIN DASHBOARD</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.menuBarButton}
              onPress={() => navigation.getParent()?.openDrawer()}
            >
              <Ionicons name="menu" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Header Row */}
        <View style={styles.bottomHeaderRow}>
          <Text style={styles.welcomeMessage}>Hospital Management System</Text>
          <View style={styles.statusIndicator}>
            <View style={styles.onlineIndicator} />
            <Text style={styles.statusText}>System Online • Live Dashboard</Text>
          </View>
        </View>


      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              {renderStatsCard(statsCards[0])}
              {renderStatsCard(statsCards[1])}
            </View>
            <View style={styles.statsRow}>
              {renderStatsCard(statsCards[2])}
              {renderStatsCard(statsCards[3])}
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
              onPress={() => navigation.navigate('Appointments')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.kbrRed + '15' }]}>
                <Ionicons name="calendar-outline" size={24} color={Colors.kbrRed} />
              </View>
              <Text style={styles.quickActionTitle}>View Appointments</Text>
              <Text style={styles.quickActionSubtitle}>Manage all appointments</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.getParent()?.navigate('Reports')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.kbrPurple + '15' }]}>
                <Ionicons name="analytics-outline" size={24} color={Colors.kbrPurple} />
              </View>
              <Text style={styles.quickActionTitle}>Reports</Text>
              <Text style={styles.quickActionSubtitle}>View analytics & reports</Text>
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
            {recentAppointments.map(renderAppointmentItem)}
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
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  hospitalTextSection: {
    marginLeft: 12,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  hospitalSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFD700',
    letterSpacing: 1,
    marginTop: -2,
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
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
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
});

export default AdminDashboardScreen;