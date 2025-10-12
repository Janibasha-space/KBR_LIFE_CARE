import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './src/constants/theme';
import { ServicesProvider } from './src/contexts/ServicesContext';
import { UserProvider } from './src/contexts/UserContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Patient screens
import PatientHomeScreen from './src/screens/patient/PatientHomeScreen';
import AppointmentScreen from './src/screens/patient/AppointmentScreen';
import ServicesScreen from './src/screens/patient/ServicesScreen';
import MedicalReportsScreen from './src/screens/patient/MedicalReportsScreen';
import PharmacyScreen from './src/screens/patient/PharmacyScreen';
import ProfileScreen from './src/screens/patient/ProfileScreen';
import BookAppointmentScreen from './src/screens/patient/BookAppointmentScreen';
import EditProfileScreen from './src/screens/patient/EditProfileScreen';

// Admin screens
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import ServiceManagementScreen from './src/screens/admin/ServiceManagementScreen';
import PatientManagementScreen from './src/screens/admin/PatientManagementScreen';
import PaymentManagementScreen from './src/screens/admin/PaymentManagementScreen';
import DischargeManagementScreen from './src/screens/admin/DischargeManagementScreen';
import AdminPharmacyScreen from './src/screens/admin/AdminPharmacyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
          } else if (route.name === 'Pharmacy') {
            iconName = focused ? 'medical' : 'medical-outline';
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
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
      <Tab.Screen name="Reports" component={MedicalReportsScreen} />
      <Tab.Screen name="Pharmacy" component={PharmacyScreen} />
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
          } else if (route.name === 'Payments') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Discharge') {
            iconName = focused ? 'document' : 'document-outline';
          } else if (route.name === 'Pharmacy') {
            iconName = focused ? 'medical' : 'medical-outline';
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Patients" component={PatientManagementScreen} />
      <Tab.Screen name="Payments" component={PaymentManagementScreen} />
      <Tab.Screen name="Discharge" component={DischargeManagementScreen} />
      <Tab.Screen name="Pharmacy" component={AdminPharmacyScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <ServicesProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor={Colors.primary} />
            <Stack.Navigator 
              initialRouteName="Splash"
              screenOptions={{
                headerShown: false
              }}
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="PatientMain" component={PatientTabNavigator} />
              <Stack.Screen name="AdminMain" component={AdminTabNavigator} />
              <Stack.Screen name="ServiceManagementScreen" component={ServiceManagementScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="AppointmentScreen" component={AppointmentScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          </ServicesProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
