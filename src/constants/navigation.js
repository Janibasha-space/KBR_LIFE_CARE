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
    PROFILE: 'Profile',
    BOOK_APPOINTMENT: 'BookAppointment',
    DOCTORS: 'Doctors',
  },
  
  // Admin screens
  ADMIN: {
    DASHBOARD: 'Dashboard',
    PATIENTS: 'Patients',
    PATIENT_DETAILS: 'PatientDetails',
    PATIENT_MEDICAL_REPORTS: 'PatientMedicalReports',
    PAYMENTS: 'Payments',
    DISCHARGE: 'Discharge',
    SERVICE_MANAGEMENT: 'ServiceManagement',
    REPORTS: 'Reports',
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
          [ROUTES.PATIENT.PROFILE]: 'profile',
          [ROUTES.PATIENT.DOCTORS]: 'doctors',
        },
      },
      [ROUTES.ADMIN_MAIN]: {
        screens: {
          [ROUTES.ADMIN.DASHBOARD]: 'admin/dashboard',
          [ROUTES.ADMIN.PATIENTS]: 'admin/patients',
          [ROUTES.ADMIN.PAYMENTS]: 'admin/payments',
          [ROUTES.ADMIN.DISCHARGE]: 'admin/discharge',
          [ROUTES.ADMIN.REPORTS]: 'admin/reports',
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