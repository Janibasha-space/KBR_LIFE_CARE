# Firebase Network Request Failed - Troubleshooting Guide

## ❌ Current Error
```
ERROR Anonymous sign-in error: [FirebaseError: Firebase: Error (auth/network-request-failed).]
ERROR Firebase login error: [FirebaseError: Firebase: Error (auth/network-request-failed).]
ERROR Firebase registration error: [FirebaseError: Firebase: Error (auth/network-request-failed).]
```

## 🔍 Root Cause Analysis

The `auth/network-request-failed` error indicates **network connectivity issues**:

1. **No Internet Connection**
2. **Firewall/Proxy blocking Firebase**
3. **DNS resolution issues**
4. **Firebase servers temporarily unavailable**
5. **React Native network configuration issues**

## 🛠️ Troubleshooting Steps

### Step 1: Check Basic Connectivity

**Test Internet Connection:**
```bash
# Test if you can reach Google
ping google.com

# Test if you can reach Firebase
ping firebase.google.com
```

**Test in Browser:**
- Visit: https://firebase.google.com
- Visit: https://console.firebase.google.com
- Check if they load properly

### Step 2: Check React Native Network Permissions

**For Android** - Ensure network permissions in `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

**For iOS** - Check network settings and ensure no restrictions

### Step 3: Test Firebase Configuration

**Verify Firebase Project Status:**
1. Go to Firebase Console: https://console.firebase.google.com
2. Check if project "kbr-life-care--hospitals" is active
3. Verify Authentication is enabled
4. Check project quotas and billing status

### Step 4: Debug Network Issues

**Add network debugging to your Firebase service:**

```javascript
// Add this to firebaseAuthService.js for debugging
import { connectAuthEmulator } from 'firebase/auth';

// For development/debugging only
if (__DEV__) {
  console.log('🌐 Testing Firebase connectivity...');
  
  // Test basic Firebase connection
  auth.onAuthStateChanged((user) => {
    console.log('🔥 Firebase Auth State:', user ? 'Connected' : 'Disconnected');
  });
}
```

### Step 5: Implement Better Error Handling

**Enhanced error handling with retry logic:**

```javascript
// Enhanced authentication with retry
static async signInWithRetry(method, ...args) {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Auth attempt ${attempt}/${maxRetries}`);
      return await method(...args);
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error.code);
      
      if (error.code === 'auth/network-request-failed' && attempt < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      throw error; // Re-throw if max retries reached or different error
    }
  }
}
```

## 🎯 Quick Fixes to Try

### Fix 1: Restart Metro and Clear Cache
```bash
# Stop Metro bundler
# Then run:
npx react-native start --reset-cache
```

### Fix 2: Check Firebase Project Settings
- Verify project ID: `kbr-life-care--hospitals`
- Check if billing is enabled (required for some features)
- Verify API keys are not restricted

### Fix 3: Test with Different Network
- Try mobile hotspot
- Try different WiFi network
- Check if corporate firewall is blocking

### Fix 4: Temporary Offline Mode
```javascript
// Add offline mode fallback
static async initializeAuth() {
  try {
    // Try Firebase auth
    return await this.signInAnonymously();
  } catch (error) {
    if (error.code === 'auth/network-request-failed') {
      console.log('🔌 Network issue detected, using offline mode');
      // Return mock user for development
      return {
        success: true,
        data: {
          user: {
            id: 'offline-user',
            name: 'Offline User',
            email: 'offline@kbrlifecare.com',
            role: 'admin',
            isOffline: true
          }
        },
        message: 'Using offline mode due to network issues'
      };
    }
    throw error;
  }
}
```

## 🚀 Most Likely Solutions

1. **Check Internet Connection** - Test basic connectivity
2. **Restart App/Metro** - Clear any cached network issues  
3. **Check Firebase Console** - Verify project is active
4. **Try Different Network** - Rule out firewall/proxy issues

## 🔧 Immediate Steps

1. **Verify Internet**: Can you browse other websites?
2. **Check Firebase Console**: Is your project accessible?
3. **Restart Development**: Stop Metro, clear cache, restart
4. **Try Mobile Hotspot**: Test with different network

The network error is usually temporary. Most commonly it's resolved by checking internet connectivity and restarting the development environment.