# Firebase Anonymous Authentication Error - Fix Guide

## ❌ Current Error
```
ERROR Anonymous sign-in error: [FirebaseError: Firebase: Error (auth/admin-restricted-operation).]
```

## 🔍 Root Cause Analysis

The `auth/admin-restricted-operation` error occurs when:
1. **Anonymous Authentication is DISABLED** in Firebase Console
2. **Firebase Security Rules** are restricting anonymous access
3. **Firebase Auth domain restrictions** are blocking the operation

## 🛠️ Solution Steps

### Step 1: Enable Anonymous Authentication in Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: KBR_LIFE_CARE
3. **Navigate to Authentication**:
   - Click "Authentication" in left sidebar
   - Click "Sign-in method" tab
4. **Enable Anonymous Provider**:
   - Find "Anonymous" provider in the list
   - Click the "pencil/edit" icon
   - Toggle "Enable" to ON
   - Click "Save"

### Step 2: Update Firebase Security Rules (if needed)

Check your Firestore Security Rules allow anonymous access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users (including anonymous)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Verify Firebase Configuration

Ensure your Firebase config in `src/config/firebase.config.js` is correct:

```javascript
// Firebase configuration should have all required fields
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Step 4: Test Authentication Status

Add this debug code to test authentication:

```javascript
// In your component or service
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase.config';

// Monitor auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('✅ User authenticated:', user.uid, user.isAnonymous ? '(Anonymous)' : '(Registered)');
  } else {
    console.log('❌ No user authenticated');
  }
});
```

## 🎯 Quick Fix Commands

If you need to disable anonymous auth temporarily, you can comment out the call:

```javascript
// In firebaseAuthService.js or wherever it's called
// static async signInAnonymously() {
//   // Temporarily disabled
//   return { success: false, message: 'Anonymous auth disabled' };
// }
```

## 🚀 Verification Steps

After enabling anonymous auth:

1. **Test in app**: Try the guest/anonymous login
2. **Check Firebase Console**: Should see anonymous users in Authentication > Users
3. **Monitor logs**: Should see "✅ Anonymous sign-in successful" in console

## 📋 Most Likely Solution

**Enable Anonymous Authentication in Firebase Console** - this is the most common cause of this error. The anonymous provider is disabled by default and needs to be manually enabled.

## 🔧 Alternative Approaches

If you don't want anonymous auth, you can:
1. Remove anonymous sign-in calls from your code
2. Use email/password authentication only
3. Implement a default demo user instead

Would you like me to help you modify the code to remove anonymous authentication if it's not needed?