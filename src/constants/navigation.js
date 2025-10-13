// Navigation route names
export const ROUTES = {
  // Auth & Onboarding
  SPLASH: 'Splash',
  ONBOARDING: 'Onboarding',
  
  // Main navigators
  PATIENT_MAIN: 'PatientMain',
  ADMIN_MAIN: 'AdminMain',
  
  // Patient screens
  PATIENT: {
    HOME: 'Home',
    APPOINTMENTS: 'Appointments',
    SERVICES: 'Services',
    REPORTS: 'Reports',
    REPORT_DETAIL: 'ReportDetail',
    PHARMACY: 'Pharmacy',
    PHARMACY_CART: 'PharmacyCartScreen',
    PHARMACY_CHECKOUT: 'CheckoutScreen',
    PHARMACY_ORDERS: 'PharmacyOrdersScreen',
    PHARMACY_ORDER_DETAIL: 'PharmacyOrderDetailScreen',
    PROFILE: 'Profile',
    BOOK_APPOINTMENT: 'BookAppointment',
  },
  
  // Admin screens
  ADMIN: {
    DASHBOARD: 'Dashboard',
    PATIENTS: 'Patients',
    PAYMENTS: 'Payments',
    DISCHARGE: 'Discharge',
    PHARMACY: 'Pharmacy',
    SERVICE_MANAGEMENT: 'ServiceManagement',
  },
};

// Navigation linking configuration
export const LINKING_CONFIG = {
  prefixes: ['kbrhospital://'],
  config: {
    screens: {
      [ROUTES.SPLASH]: 'splash',
      [ROUTES.ONBOARDING]: 'onboarding',
      [ROUTES.PATIENT_MAIN]: {
        screens: {
          [ROUTES.PATIENT.HOME]: 'home',
          [ROUTES.PATIENT.APPOINTMENTS]: 'appointments',
          [ROUTES.PATIENT.SERVICES]: 'services',
          [ROUTES.PATIENT.REPORTS]: 'reports',
          [ROUTES.PATIENT.REPORT_DETAIL]: 'report-detail',
          [ROUTES.PATIENT.PHARMACY]: 'pharmacy',
          [ROUTES.PATIENT.PHARMACY_CART]: 'pharmacy-cart',
          [ROUTES.PATIENT.PHARMACY_CHECKOUT]: 'pharmacy-checkout',
          [ROUTES.PATIENT.PHARMACY_ORDERS]: 'pharmacy-orders',
          [ROUTES.PATIENT.PHARMACY_ORDER_DETAIL]: 'pharmacy-order-detail',
          [ROUTES.PATIENT.PROFILE]: 'profile',
        },
      },
      [ROUTES.ADMIN_MAIN]: {
        screens: {
          [ROUTES.ADMIN.DASHBOARD]: 'admin/dashboard',
          [ROUTES.ADMIN.PATIENTS]: 'admin/patients',
          [ROUTES.ADMIN.PAYMENTS]: 'admin/payments',
          [ROUTES.ADMIN.DISCHARGE]: 'admin/discharge',
          [ROUTES.ADMIN.PHARMACY]: 'admin/pharmacy',
        },
      },
      [ROUTES.PATIENT.BOOK_APPOINTMENT]: 'book-appointment',
      [ROUTES.ADMIN.SERVICE_MANAGEMENT]: 'admin/services',
    },
  },
};

// Screen options configurations
export const SCREEN_OPTIONS = {
  headerShown: false,
  gestureEnabled: true,
  animation: 'slide_from_right',
};

export const TAB_SCREEN_OPTIONS = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarActiveTintColor: '#4A90E2',
  tabBarInactiveTintColor: '#8E8E93',
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '500',
  },
};

// Navigation utilities
export const NavigationUtils = {
  // Safe navigation function
  navigate: (navigation, routeName, params = {}) => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate(routeName, params);
    }
  },
  
  // Go back safely
  goBack: (navigation) => {
    if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    }
  },
  
  // Reset navigation stack
  reset: (navigation, routeName, params = {}) => {
    if (navigation && typeof navigation.reset === 'function') {
      navigation.reset({
        index: 0,
        routes: [{ name: routeName, params }],
      });
    }
  },
  
  // Replace current screen
  replace: (navigation, routeName, params = {}) => {
    if (navigation && typeof navigation.replace === 'function') {
      navigation.replace(routeName, params);
    }
  },
};

export default {
  ROUTES,
  LINKING_CONFIG,
  SCREEN_OPTIONS,
  TAB_SCREEN_OPTIONS,
  NavigationUtils,
};