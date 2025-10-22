// API Configuration
const API_CONFIG = {
  // Development environment - Firebase is primary backend
  development: {
    baseURL: 'http://localhost:3000/api', // Fallback REST API (if needed)
    timeout: 10000,
    useFirebase: true, // Primary backend is Firebase
    firebaseConfig: {
      projectId: 'kbr-life-care--hospitals',
      apiKey: 'AIzaSyAU23ScOB4t2_5rYbAAXkAxv7fMvsDEPuE',
      authDomain: 'kbr-life-care--hospitals.firebaseapp.com',
      storageBucket: 'kbr-life-care--hospitals.firebasestorage.app'
    }
  },
  
  // Production environment - Firebase
  production: {
    baseURL: 'https://api.kbrhospital.com', // Fallback REST API
    timeout: 15000,
    useFirebase: true, // Primary backend is Firebase
    firebaseConfig: {
      projectId: 'kbr-life-care--hospitals',
      apiKey: 'AIzaSyAU23ScOB4t2_5rYbAAXkAxv7fMvsDEPuE',
      authDomain: 'kbr-life-care--hospitals.firebaseapp.com',
      storageBucket: 'kbr-life-care--hospitals.firebasestorage.app'
    }
  },
  
  // Staging environment (optional)
  staging: {
    baseURL: 'https://staging-api.kbrhospital.com',
    timeout: 12000,
    useFirebase: true,
    firebaseConfig: {
      projectId: 'kbr-life-care--hospitals',
      apiKey: 'AIzaSyAU23ScOB4t2_5rYbAAXkAxv7fMvsDEPuE',
      authDomain: 'kbr-life-care--hospitals.firebaseapp.com',
      storageBucket: 'kbr-life-care--hospitals.firebasestorage.app'
    }
  }
};

// Get current environment (you can set this based on your build process)
const getCurrentEnvironment = () => {
  // In React Native with Expo, you can use __DEV__ to detect development mode
  if (__DEV__) {
    return 'development';
  }
  return 'production';
};

export const getApiConfig = () => {
  const env = getCurrentEnvironment();
  return API_CONFIG[env];
};

export default API_CONFIG;