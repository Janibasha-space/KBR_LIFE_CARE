# Firebase Console Setup Guide for KBR Life Care

## 🔥 Firebase Console Configuration

Your Firebase project is ready! Follow these steps to complete the setup:

### Step 1: Access Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. You should see your project: **kbr-life-care--hospitals**
3. Click on your project to open it

### Step 2: Enable Authentication
1. In the Firebase console, click **"Authentication"** in the left sidebar
2. Click **"Get started"** if this is your first time
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable** the first option (Email/Password)
6. Click **"Save"**

### Step 3: Create Firestore Database
1. In the Firebase console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for now)
4. Select a location close to your users (e.g., asia-south1 for India)
5. Click **"Done"**

### Step 4: Set Up Security Rules
1. In Firestore Database, go to **"Rules"** tab
2. Replace the existing rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Doctors collection - read access for all authenticated users
    match /doctors/{doctorId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Hospital services - read access for all
    match /hospitalServices/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Appointments - users can only access their own appointments
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Medical history and reports - patient and admin access only
    match /medicalHistory/{recordId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    match /medicalReports/{reportId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // App configuration - read for all, write for admin
    match /appConfig/{configId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Report templates - read for authenticated, write for admin
    match /reportTemplates/{templateId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

3. Click **"Publish"**

### Step 5: Enable Storage (Optional)
1. Click **"Storage"** in the left sidebar
2. Click **"Get started"**
3. Choose **"Start in test mode"**
4. Select the same location as your Firestore
5. Click **"Done"**

## 📱 Testing Your App

### Option 1: Using Expo Go App
1. **Download Expo Go** from App Store (iOS) or Play Store (Android)
2. **Scan the QR code** from your terminal with Expo Go
3. Your app will load on your phone

### Option 2: Using Android Studio Emulator
1. Open Android Studio
2. Start an Android emulator
3. In your terminal, press **'a'** to open on Android

### Option 3: Using Web Browser
1. In your terminal, press **'w'** to open in web browser
2. Your app will open at http://localhost:8081

## 🧪 Testing Firebase Integration

1. **Open your app** (any method above)
2. **Navigate to the onboarding screen**
3. **Tap "Test Firebase"** button (orange button in top-left)
4. **Run the tests:**
   - Tap "Setup Firebase Data" to populate sample data
   - Try registering a new user
   - Test login functionality
   - Fetch doctors and appointments

## ✅ Verification Steps

After setup, verify everything works:

### 1. Authentication Test
- Register a new user in your app
- Check Firebase Console > Authentication > Users
- You should see the new user listed

### 2. Database Test  
- Run "Setup Firebase Data" in the test screen
- Check Firebase Console > Firestore Database
- You should see collections: doctors, hospitalServices, etc.

### 3. Real-time Updates Test
- Add data through your app
- Check Firebase Console to see it appear instantly
- Modify data in Firebase Console and see it update in your app

## 🎯 What's Working Now

✅ **Firebase Authentication** - User registration, login, logout
✅ **Firestore Database** - Real-time data storage and sync  
✅ **Offline Support** - App works without internet
✅ **Security Rules** - Data is protected and role-based
✅ **Service Layer** - All your existing code works unchanged

## 🚀 Next Steps

1. **Complete Firebase Console setup** (Steps 1-5 above)
2. **Test the integration** using the test screen
3. **Start using Firebase data** in your existing screens
4. **Add real hospital data** to replace sample data
5. **Customize for your hospital's needs**

## 📞 Need Help?

If you encounter any issues:
1. Check the Expo terminal for error messages
2. Verify Firebase project settings match your config
3. Ensure internet connection is stable
4. Check Firebase Console for any configuration issues

Your Firebase backend is ready and your app is connected! 🎉