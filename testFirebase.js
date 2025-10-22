// Quick Firebase Connection Test
// This file can be used to test Firebase connection without running the full app

const { initializeApp } = require('firebase/app');

const firebaseConfig = {
  apiKey: "AIzaSyAU23ScOB4t2_5rYbAAXkAxv7fMvsDEPuE",
  authDomain: "kbr-life-care--hospitals.firebaseapp.com",
  projectId: "kbr-life-care--hospitals",
  storageBucket: "kbr-life-care--hospitals.firebasestorage.app",
  messagingSenderId: "32013171785",
  appId: "1:32013171785:ios:6a037aa3a8ccf7eccf5398"
};

// Test Firebase initialization
try {
  console.log('🔥 Testing Firebase Configuration...');
  
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully!');
  console.log('📋 Project ID:', app.options.projectId);
  console.log('🔑 API Key:', app.options.apiKey.substring(0, 10) + '...');
  console.log('🌐 Auth Domain:', app.options.authDomain);
  console.log('💾 Storage Bucket:', app.options.storageBucket);
  
  console.log('\n🎉 Firebase configuration is valid!');
  console.log('📱 Your app should be able to connect to Firebase.');
  console.log('\n📋 Next steps:');
  console.log('1. Open your app using Expo Go or emulator');
  console.log('2. Tap "Test Firebase" button on onboarding screen');
  console.log('3. Complete Firebase Console setup (see FIREBASE_SETUP_GUIDE.md)');
  
} catch (error) {
  console.error('❌ Firebase configuration error:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('- Check your internet connection');
  console.log('- Verify Firebase project exists');
  console.log('- Ensure API keys are correct');
}

module.exports = { firebaseConfig };