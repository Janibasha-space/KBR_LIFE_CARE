import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  createDrawerNavigator, 
  DrawerContentScrollView, 
  DrawerItemList, 
  DrawerItem 
} from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './src/constants/theme';
import { ServicesProvider } from './src/contexts/ServicesContext';
import { UnifiedAuthProvider } from './src/contexts/UnifiedAuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppProvider } from './src/contexts/AppContext';

// Import services
import NetworkService from './src/services/networkService';
import FirebaseInitializer from './src/components/FirebaseInitializer';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Patient screens
import PatientHomeScreen from './src/screens/patient/PatientHomeScreen';
import AppointmentScreen from './src/screens/patient/AppointmentScreen';
import ServicesScreen from './src/screens/patient/ServicesScreen';
import DiagnosticTestsScreen from './src/screens/patient/DiagnosticTestsScreen';
import MedicalReportsScreen from './src/screens/patient/MedicalReportsScreen';
import ReportDetailScreen from './src/screens/patient/ReportDetailScreen';
import DoctorsScreen from './src/screens/patient/DoctorsScreen';
import TreatmentDetailsScreen from './src/screens/patient/TreatmentDetailsScreen';

import ProfileScreen from './src/screens/patient/ProfileScreen';
import BookAppointmentScreen from './src/screens/patient/BookAppointmentScreen';
import EditProfileScreen from './src/screens/patient/EditProfileScreen';

// Admin screens
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import ServiceManagementScreen from './src/screens/admin/ServiceManagementScreen';
import PatientManagementScreen from './src/screens/admin/PatientManagementScreen';
import PaymentManagementScreen from './src/screens/admin/PaymentManagementScreen';
import InvoiceManagementScreen from './src/screens/admin/InvoiceManagementScreen';
import DischargeManagementScreen from './src/screens/admin/DischargeManagementScreen';

import PatientDetailsScreen from './src/screens/admin/PatientDetailsScreen';
import PatientMedicalReportsScreen from './src/screens/admin/PatientMedicalReportsScreen';
import PatientPaymentInvoicesScreen from './src/screens/admin/PatientPaymentInvoicesScreen';
import PaymentDetailsScreen from './src/screens/admin/PaymentDetailsScreen';
import RoomManagementScreen from './src/screens/admin/RoomManagementScreen';
import DoctorManagementScreen from './src/screens/admin/DoctorManagementScreen';
import AppointmentManagementScreen from './src/screens/admin/AppointmentManagementScreen';
import AppointmentDetailsScreen from './src/screens/admin/AppointmentDetailsScreen';
import TestManagementScreen from './src/screens/admin/TestManagementScreen';
import ReportsScreen from './src/screens/admin/ReportsScreen';
import AdminProfileScreen from './src/screens/admin/AdminProfileScreen';

// Firebase Integration Test Screen
import ExampleApiUsageScreen from './src/screens/ExampleApiUsageScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Custom Drawer Content with Profile and Logout
function CustomDrawerContent(props) {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Navigate to login/onboarding screen
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            });
          },
        },
      ],
    );
  };

  const handleProfile = () => {
    // Navigate to admin profile screen
    props.navigation.navigate('AdminProfile');
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Header Section */}
      <View style={styles.drawerHeader}>
        <Image 
          source={require('./assets/hospital-logo.jpeg')}
          style={styles.drawerLogo}
          resizeMode="contain"
        />
        <View style={styles.drawerHeaderText}>
          <Text style={styles.drawerTitle}>KBR LIFE CARE</Text>
          <Text style={styles.drawerSubtitle}>Admin Panel</Text>
          <Text style={styles.adminName}>Admin King</Text>
        </View>
      </View>

      {/* Drawer Items */}
      <DrawerContentScrollView 
        {...props}
        contentContainerStyle={styles.drawerScrollView}
      >
        <DrawerItemList {...props} />
        
        {/* Divider */}
        <View style={styles.drawerDivider} />
        
        {/* Profile Item */}
        <DrawerItem
          label="Profile"
          icon={({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          )}
          onPress={handleProfile}
          activeTintColor={Colors.kbrRed}
          inactiveTintColor={Colors.textSecondary}
          labelStyle={styles.drawerItemLabel}
        />
        
        {/* Logout Item */}
        <DrawerItem
          label="Logout"
          icon={({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color="#EF4444" />
          )}
          onPress={handleLogout}
          activeTintColor="#EF4444"
          inactiveTintColor="#EF4444"
          labelStyle={[styles.drawerItemLabel, { color: '#EF4444' }]}
        />
      </DrawerContentScrollView>
    </View>
  );
}

// Patient Tab Navigator
function PatientTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'BookAppointment') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Doctors') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 2,
          borderTopColor: Colors.primary,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={PatientHomeScreen} />
      <Tab.Screen 
        name="BookAppointment" 
        component={BookAppointmentScreen}
        options={{
          title: 'Book Appointment'
        }}
      />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Doctors" component={DoctorsScreen} />
      <Tab.Screen name="Reports" component={MedicalReportsScreen} />
    </Tab.Navigator>
  );
}

// Admin Tab Navigator
function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Patients') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Appointments') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Payments') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: Colors.kbrBlue,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 2,
          borderTopColor: Colors.kbrBlue,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        headerShown: false,
      })}
    >
            <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen}
        getId={() => 'dashboard-tab-screen'}
      />
      <Tab.Screen 
        name="Patients" 
        component={PatientManagementScreen}
        getId={() => 'patients-tab-screen'}
      />
      <Tab.Screen 
        name="Appointments" 
        component={AppointmentManagementScreen}
        getId={() => 'appointments-tab-screen'}
      />
      <Tab.Screen 
        name="Payments" 
        component={PaymentManagementScreen}
        getId={() => 'payments-tab-screen'}
        options={{
          tabBarLabel: 'Payments'
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        getId={() => 'reports-tab-screen'}
      />
    </Tab.Navigator>
  );
}

// Admin Drawer Navigator
function AdminDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: Colors.white,
          width: 300,
        },
        drawerActiveTintColor: Colors.kbrRed,
        drawerInactiveTintColor: Colors.textSecondary,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
      }}
    >
      <Drawer.Screen 
        name="AdminTabs" 
        component={AdminTabNavigator}
        getId={() => 'admin-tabs-drawer-screen'}
        options={{
          drawerLabel: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="DoctorManagement" 
        component={DoctorManagementScreen}
        options={{
          drawerLabel: 'Doctors',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="ServiceManagement" 
        component={ServiceManagementScreen}
        options={{
          drawerLabel: 'Services',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="InvoiceManagement" 
        component={InvoiceManagementScreen}
        options={{
          drawerLabel: 'Invoice Management',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen 
        name="TestManagement" 
        component={TestManagementScreen}
        options={{
          drawerLabel: 'Tests',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="flask-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="RoomManagement" 
        component={RoomManagementScreen}
        options={{
          drawerLabel: 'Rooms',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bed-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="DischargeManagement" 
        component={DischargeManagementScreen}
        options={{
          drawerLabel: 'Discharge',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{
          drawerLabel: 'Reports',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize network service
    NetworkService.init();
    
    // Add network connectivity listener
    const unsubscribe = NetworkService.addListener((isConnected) => {
      if (!isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    });
    
    // Cleanup on unmount
    return () => {
      NetworkService.cleanup();
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FirebaseInitializer>
          <UnifiedAuthProvider>
            <ServicesProvider>
              <AppProvider>
                  <NavigationContainer
                    independent={true}
                  >
                  <StatusBar style="light" backgroundColor={Colors.primary} />
                  <Stack.Navigator 
                    initialRouteName="Splash"
                    screenOptions={{
                      headerShown: false
                    }}
                  >
                    <Stack.Screen 
                      name="Splash" 
                      component={SplashScreen} 
                      getId={() => 'splash-screen'}
                    />
                    <Stack.Screen 
                      name="Onboarding" 
                      component={OnboardingScreen}
                      getId={() => 'onboarding-screen'}
                    />
                    <Stack.Screen 
                      name="PatientMain" 
                      component={PatientTabNavigator}
                      getId={() => 'patient-main-screen'}
                    />
                    <Stack.Screen 
                      name="AdminMain" 
                      component={AdminDrawerNavigator}
                      getId={() => 'admin-main-screen'}
                    />
                    <Stack.Screen 
                      name="Profile" 
                      component={ProfileScreen}
                      getId={() => 'profile-screen'}
                    />
                    <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
                    <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
                    <Stack.Screen name="AppointmentScreen" component={AppointmentScreen} />
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                    <Stack.Screen name="PatientDetails" component={PatientDetailsScreen} />
                    <Stack.Screen name="PatientMedicalReports" component={PatientMedicalReportsScreen} />
                    <Stack.Screen name="PatientPaymentInvoices" component={PatientPaymentInvoicesScreen} />
                    <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
                    <Stack.Screen name="TreatmentDetails" component={TreatmentDetailsScreen} />
                    <Stack.Screen name="DiagnosticTests" component={DiagnosticTestsScreen} />
                    <Stack.Screen name="FirebaseTest" component={ExampleApiUsageScreen} />
                  </Stack.Navigator>
                  </NavigationContainer>
                </AppProvider>
              </ServicesProvider>
            </UnifiedAuthProvider>
          </FirebaseInitializer>
        </ThemeProvider>
      </SafeAreaProvider>
);
}

// Drawer Styles
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  drawerHeader: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  drawerHeaderText: {
    flex: 1,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 2,
  },
  drawerSubtitle: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500',
    marginBottom: 4,
  },
  adminName: {
    fontSize: 14,
    color: '#E3F2FD',
    opacity: 0.9,
  },
  drawerScrollView: {
    paddingTop: 0,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  drawerItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: -8,
  },
});