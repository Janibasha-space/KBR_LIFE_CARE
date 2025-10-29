# KBR Life Care Hospital Mobile App

A comprehensive **React Native hospital management application** built with **Expo** and **Firebase**, providing complete healthcare management solutions for both patients and administrators.

---

## 🏥 **Overview**

**KBR Life Care** is a full-featured hospital management mobile application designed to streamline healthcare operations. The app serves both **patients** and **hospital administrators** with dedicated interfaces for appointment booking, patient management, medical records, payments, and comprehensive hospital administration.

### **Key Highlights**
- 🔥 **Firebase Integration** - Real-time data synchronization and authentication
- 👨‍⚕️ **Multi-Role System** - Patient and Admin interfaces with role-based access
- 📱 **Cross-Platform** - iOS, Android, and Web support via Expo
- 🏗️ **Production-Ready** - Complete hospital management features
- 🎨 **Modern UI/UX** - Professional medical app design

---

## 🚀 **Features**

### **For Patients**
- 📋 **Appointment Booking** - Schedule appointments with doctors
- 👤 **Profile Management** - Manage personal and medical information
- 🏥 **Service Booking** - Access hospital services and diagnostics
- 📊 **Medical Reports** - View and manage medical test results
- 💰 **Payment History** - Track payments and invoices
- 📞 **Doctor Directory** - Browse and contact healthcare providers

### **For Administrators**
- 📈 **Admin Dashboard** - Real-time hospital metrics and analytics
- 👥 **Patient Management** - Complete patient record management
- 👨‍⚕️ **Doctor Management** - Manage healthcare staff and schedules
- 🏨 **Room Management** - Hospital room and bed management
- 💼 **Service Management** - Configure hospital services and pricing
- 📋 **Appointment Management** - Oversee all patient appointments
- 🧾 **Invoice Management** - Handle billing and payment processing
- 📊 **Reports & Analytics** - Generate hospital performance reports

---

## 🛠️ **Technology Stack**

### **Core Technologies**
- **Framework**: React Native 0.81.5 with Expo 54.0.20
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Navigation**: React Navigation 7.x (Stack, Tab, Drawer)
- **State Management**: React Context API with custom hooks
- **UI Components**: Custom components with Expo Vector Icons

### **Key Dependencies**
- **Firebase**: `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`
- **Navigation**: `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/drawer`
- **UI**: `expo-linear-gradient`, `react-native-vector-icons`, `@expo/vector-icons`
- **Media**: `expo-image-picker`, `expo-document-picker`, `expo-media-library`
- **Storage**: `@react-native-async-storage/async-storage`

---

## 📱 **App Architecture**

### **Screen Structure**
```
├── 🌟 Splash & Onboarding
├── 🔐 Authentication System
├── 👤 Patient Portal
│   ├── Home Dashboard
│   ├── Appointment Booking
│   ├── Services & Diagnostics
│   ├── Medical Reports
│   ├── Payment History
│   ├── Doctor Directory
│   └── Profile Management
└── 🏥 Admin Portal
    ├── Dashboard & Analytics
    ├── Patient Management
    ├── Doctor Management
    ├── Room Management
    ├── Service Management
    ├── Appointment Management
    ├── Invoice Management
    └── Reports & Admin Profile
```

### **Project Structure**
```
KBR_LIFE_CARE/
├── 📱 App.js                          # Main app entry point
├── ⚙️ app.json                       # Expo configuration
├── 📦 package.json                   # Dependencies
├── 🔧 babel.config.js               # Babel configuration
├── 🔥 firebase.json                 # Firebase configuration
├── 🌐 .env.development              # Development environment
├── 🌐 .env.production               # Production environment
├── 🖼️ assets/                       # Images and static files
├── 📚 docs/                         # Documentation
│   ├── FIREBASE_INTEGRATION_GUIDE.md
│   ├── PERFORMANCE_GUIDE.md
│   ├── BACKEND_CONNECTION_GUIDE.md
│   └── ASSETS_GUIDE.md
└── 💻 src/
    ├── 🧩 components/              # Reusable UI components
    │   ├── AppHeader.js
    │   ├── AuthModal.js
    │   ├── LoadingScreen.js
    │   └── FirebaseInitializer.js
    ├── ⚙️ config/                  # App configuration
    │   ├── firebase.config.js
    │   └── firebaseDataSetup.js
    ├── 📐 constants/               # Theme and constants
    │   └── theme.js
    ├── 🔄 contexts/                # React contexts
    │   ├── AppContext.js
    │   ├── FirebaseAuthContext.js
    │   └── UnifiedAuthContext.js
    ├── 🖥️ screens/                  # App screens
    │   ├── SplashScreen.js
    │   ├── OnboardingScreen.js
    │   ├── patient/               # Patient screens
    │   │   ├── PatientHomeScreen.js
    │   │   ├── AppointmentScreen.js
    │   │   ├── ServicesScreen.js
    │   │   ├── MedicalReportsScreen.js
    │   │   └── ProfileScreen.js
    │   └── admin/                 # Admin screens
    │       ├── AdminDashboardScreen.js
    │       ├── PatientManagementScreen.js
    │       ├── DoctorManagementScreen.js
    │       └── ServiceManagementScreen.js
    ├── 🔧 services/                # API and business logic
    │   ├── authService.js
    │   ├── firebaseAuthService.js
    │   ├── hospitalServices.js
    │   └── firebaseHospitalServices.js
    ├── 🎨 styles/                  # Global styles
    └── 🛠️ utils/                   # Utility functions
        ├── firebaseDebug.js
        └── firebaseTest.js
```

---

## 🔥 **Firebase Integration**

### **Services Configured**
- **🔐 Firebase Authentication** - Email/password login with user roles
- **📊 Firestore Database** - Real-time data storage and synchronization
- **💾 Firebase Storage** - Image and document storage
- **🔒 Security Rules** - Proper data access control
- **📱 Real-time Listeners** - Live data updates across the app

### **Data Collections**
```
Firestore Database:
├── 👥 users/              # User profiles and authentication data
├── 👨‍⚕️ doctors/            # Doctor profiles and availability
├── 📋 appointments/       # Patient appointments
├── 🏥 services/           # Hospital services and pricing
├── 🏨 rooms/              # Room and bed management
├── 📊 medicalReports/     # Patient medical test results
├── 💰 payments/           # Payment history and invoices
└── 🔧 admissions/         # Patient admission records
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Expo Go** app on mobile device
- **Firebase Project** with Firestore enabled

### **Installation**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Janibasha-space/KBR_LIFE_CARE.git
   cd KBR_LIFE_CARE
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Update `src/config/firebase.config.js` with your Firebase credentials
   - Ensure Firestore and Authentication are enabled in Firebase Console

4. **Start Development Server**
   ```bash
   npx expo start
   ```

5. **Run on Device/Simulator**
   - **Mobile**: Scan QR code with Expo Go app
   - **Android Emulator**: Press `a` in terminal
   - **iOS Simulator**: Press `i` in terminal
   - **Web Browser**: Press `w` in terminal

---

## 👥 **User Roles & Access**

### **Patient Users**
- Register and login with email/password
- Book and manage appointments
- Access medical reports and payment history
- Update personal profile information
- Browse hospital services and doctors

### **Admin Users**
- Full hospital management dashboard
- Manage all patient records and appointments  
- Configure hospital services and pricing
- Generate reports and analytics
- Manage doctor schedules and availability
- Process payments and generate invoices

---

## 🔧 **Development**

### **Environment Configuration**
```bash
# .env.development
API_BASE_URL=https://your-dev-api.com
FIREBASE_ENVIRONMENT=development

# .env.production  
API_BASE_URL=https://your-prod-api.com
FIREBASE_ENVIRONMENT=production
```

### **Running Tests**
```bash
# Start the test Firebase screen
npx expo start
# Navigate to Firebase Test screen in the app
```

### **Code Style Guidelines**
- Use **functional components** with React hooks
- Follow **consistent naming conventions**
- Implement **proper error handling**
- Add **TypeScript** (optional but recommended)
- Use **ESLint** and **Prettier** for code formatting

---

## 📱 **Platform Support**

### **iOS**
- Minimum iOS version: 11.0
- Bundle identifier: `com.kbrhospital.app`
- Supports iPhone and iPad

### **Android**
- Minimum SDK version: 21 (Android 5.0)
- Package name: `com.kbrhospital.app`
- Supports all Android devices

### **Web**
- Modern browsers with ES6 support
- Responsive design for desktop and mobile web

---

## 🚢 **Deployment**

### **Building for Production**

**Expo Application Services (EAS)**
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

**Classic Expo Build**
```bash
# Build APK
expo build:android

# Build IPA
expo build:ios
```

---

## 🔒 **Security Features**

- **Firebase Authentication** - Secure user login and registration
- **Firestore Security Rules** - Database access control
- **Role-based Access Control** - Patient vs Admin permissions
- **Data Validation** - Input sanitization and validation
- **Secure Storage** - Encrypted local data storage

---

## 📊 **Performance Optimization**

- **Image Optimization** - Compressed assets and lazy loading
- **FlatList Implementation** - Efficient large data rendering
- **Real-time Listeners** - Optimized Firebase subscriptions
- **Memory Management** - Proper cleanup of listeners and timers
- **Bundle Splitting** - Optimized app bundle size

---

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📞 **Support & Documentation**

### **Additional Documentation**
- 🔥 [Firebase Integration Guide](docs/FIREBASE_INTEGRATION_GUIDE.md)
- ⚡ [Performance Guide](docs/PERFORMANCE_GUIDE.md)
- 🔌 [Backend Connection Guide](docs/BACKEND_CONNECTION_GUIDE.md)
- 🖼️ [Assets Guide](docs/ASSETS_GUIDE.md)

### **Help & Resources**
- **Expo Documentation**: [https://docs.expo.dev/](https://docs.expo.dev/)
- **React Navigation**: [https://reactnavigation.org/](https://reactnavigation.org/)
- **Firebase Documentation**: [https://firebase.google.com/docs](https://firebase.google.com/docs)

---

## 📄 **License**

This project is proprietary to **KBR Life Care Hospital**. All rights reserved.

---

## 🏆 **About KBR Life Care**

**KBR Life Care Hospital** is committed to providing exceptional healthcare services through innovative technology solutions. This mobile application represents our dedication to digital transformation in healthcare management.

---

<div align="center">

**🏥 Built with ❤️ for KBR Life Care Hospital**

*Empowering Healthcare Through Technology*

[![Expo](https://img.shields.io/badge/Expo-54.0.20-blue?style=for-the-badge&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

</div>