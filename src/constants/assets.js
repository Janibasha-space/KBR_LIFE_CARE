// Centralized asset imports to avoid duplicate require() calls
export const ASSETS = {
  // Hospital branding
  HOSPITAL_LOGO: require('../assets/hospital-logo.jpeg'),
  
  // App images
  SPLASH_IMAGE: require('../assets/Gemini_Generated_Image_5ppbdb5ppbdb5ppb.png'),
  
  // Icons
  APP_ICON: require('../assets/icon.png'),
  ADAPTIVE_ICON: require('../assets/adaptive-icon.png'),
  FAVICON: require('../assets/favicon.png'),
  SPLASH_ICON: require('../assets/splash.png'),
};

// Default images for fallbacks
export const DEFAULT_IMAGES = {
  HOSPITAL_LOGO: ASSETS.HOSPITAL_LOGO,
  USER_AVATAR: null, // Will use Ionicons instead
};

export default ASSETS;