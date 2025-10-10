# KBR Hospital Mobile App

A comprehensive React Native mobile application for KBR Hospital, providing seamless healthcare services for both Android and iOS platforms.

## Features

### 🏥 Core Functionality
- **Splash Screen** with hospital branding
- **User Onboarding** with interactive walkthrough
- **User Authentication** (Login/Register)
- **Home Dashboard** with quick access to services
- **Appointment Booking** system
- **User Profile Management**

### 📱 Screens
1. **Splash Screen** - Hospital logo and branding
2. **Onboarding** - Feature introduction with smooth navigation
3. **Login Screen** - Secure authentication with social login options
4. **Home Screen** - Dashboard with services, appointments, and quick actions
5. **Appointment Screen** - Complete booking system with doctor selection
6. **Profile Screen** - User information management and settings

### 🎨 Design Features
- Modern Material Design principles
- Consistent color scheme and typography
- Smooth animations and transitions
- Responsive layout for various screen sizes
- Professional medical app aesthetics

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation 6
- **Icons**: Expo Vector Icons (Ionicons)
- **Styling**: StyleSheet with theme constants
- **Platform Support**: Android & iOS
- **Development**: VS Code with Expo CLI

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd "c:\Users\JANI BASHA\Downloads\New folder (4)"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on device/simulator**
   - Scan the QR code with Expo Go app (Android/iOS)
   - Press 'a' for Android emulator
   - Press 'i' for iOS simulator

## Project Structure

```
├── App.js                 # Main app component with navigation
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── babel.config.js       # Babel configuration
├── assets/               # Images and static assets
│   ├── Gemini_Generated_Image_5ppbdb5ppbdb5ppb.png
│   - `hospital-logo.jpeg`: Main hospital logo/branding image
└── src/
    ├── components/       # Reusable components
    │   ├── Button.js     # Custom button component
    │   ├── Input.js      # Custom input component
    │   └── Card.js       # Custom card component
    ├── constants/        # App constants
    │   └── theme.js      # Colors, fonts, and styling constants
    ├── screens/          # App screens
    │   ├── SplashScreen.js
    │   ├── OnboardingScreen.js
    │   ├── LoginScreen.js
    │   ├── HomeScreen.js
    │   ├── AppointmentScreen.js
    │   └── ProfileScreen.js
    └── services/         # API and service files
```

## Key Components

### Theme System
- Centralized color palette in `src/constants/theme.js`
- Consistent sizing and typography
- Easy customization and maintenance

### Navigation Flow
```
Splash → Onboarding → Login → Home ↔ Appointment
                             ↕
                           Profile
```

### Reusable Components
- **Button**: Customizable with variants (primary, secondary, outline, danger)
- **Input**: Form input with icons, validation, and error states
- **Card**: Flexible container with optional headers and icons

## Customization

### Colors
Edit `src/constants/theme.js` to modify the app's color scheme:
```javascript
export const Colors = {
  primary: '#007BFF',    // Main brand color
  secondary: '#6C757D',  // Secondary actions
  success: '#28A745',    // Success states
  danger: '#DC3545',     // Error states
  // ... more colors
};
```

### Assets
Replace images in the `assets/` folder:
- Update hospital logo and splash screen images
- Ensure proper naming conventions
- Optimize images for mobile performance

## Features Breakdown

### 🔐 Authentication
- Email/password login
- Social login integration ready
- Form validation
- Secure token handling

### 📅 Appointment System
- Department selection
- Doctor browsing with ratings
- Date and time slot selection
- Patient information form
- Booking confirmation

### 👤 Profile Management
- Personal information editing
- Medical history access
- Notification preferences
- Account settings

### 🏠 Dashboard
- Quick service access
- Upcoming appointments
- Health tips and news
- Emergency contact options

## Development Guidelines

### Code Style
- Use functional components with hooks
- Follow ESLint and Prettier configurations
- Maintain consistent file naming
- Add comments for complex logic

### State Management
- Local state with useState for simple data
- Consider Redux/Context API for complex state
- Implement proper error handling

### Performance
- Optimize images and assets
- Use FlatList for large data sets
- Implement proper loading states
- Cache API responses where appropriate

## Testing

### Running Tests
```bash
npm test
```

### Testing on Devices
1. **iOS**: Use Expo Go app or iOS Simulator
2. **Android**: Use Expo Go app or Android Emulator
3. **Web**: Open browser at localhost when running `expo start --web`

## Deployment

### Building for Production

**Android (APK)**
```bash
expo build:android
```

**iOS (IPA)**
```bash
expo build:ios
```

**App Stores**
```bash
expo upload:android
expo upload:ios
```

## Environment Variables

Create a `.env` file for configuration:
```
API_BASE_URL=https://your-api-url.com
GOOGLE_CLIENT_ID=your-google-client-id
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For technical support or questions:
- Check the [Expo documentation](https://docs.expo.dev/)
- Review [React Navigation docs](https://reactnavigation.org/)
- Contact the development team

## License

This project is proprietary to KBR Hospital. All rights reserved.

---

**Built with ❤️ for KBR Hospital**

*Ensuring quality healthcare through innovative technology solutions.*