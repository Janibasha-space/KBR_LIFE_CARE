import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  FlatList,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useServices } from '../../contexts/ServicesContext';
import UserContext, { useUser } from '../../contexts/UserContext';
import { LoadingOverlay } from '../../components/Loading';
import { bookingStyles } from '../../styles/bookingStyles';
import AppHeader from '../../components/AppHeader';

const BookAppointmentScreen = ({ navigation, route }) => {
  
  // Context hooks
  const { getAllServices } = useServices();
  const { 
    isLoggedIn, 
    userData, 
    familyMembers,
    loginUser,
    checkMobileExists, 
    registerUser, 
    sendOTP, 
    verifyOTP,
    addAppointment,
    checkAppointmentConflict,
    handleAppointmentConflict
  } = useUser();

  // Booking state management
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingStarted, setBookingStarted] = useState(false);
  
  // Reset to step 1 when component mounts
  useEffect(() => {
    setCurrentStep(1);
    setBookingStarted(false);
  }, []);

  // Control tab bar visibility based on booking state
  useEffect(() => {
    if (bookingStarted) {
      // Hide tab bar when booking process starts
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' }
      });
    } else {
      // Show tab bar on initial screen
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        }
      });
    }
  }, [bookingStarted, navigation]);
  
  const [bookingData, setBookingData] = useState({
    service: null,
    doctor: null,
    date: null,
    time: null,
    patientDetails: {
      bookingFor: 'myself', // 'myself' or 'family'
      name: '',
      age: '',
      gender: '',
      mobile: '',
    },
    paymentMethod: null,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showUserRegistration, setShowUserRegistration] = useState(false);
  const [otpVerification, setOtpVerification] = useState({
    show: false,
    mobile: '',
    otp: '',
    sentOtp: '',
  });
  const [newUserData, setNewUserData] = useState({
    username: '',
    password: '',
  });
  
  // Handle Android hardware back button
  useEffect(() => {
    const backAction = () => {
      if (currentStep === 1) {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('PatientMain');
        }
      } else {
        goToPreviousStep();
      }
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
    return () => backHandler.remove();
  }, [currentStep, navigation]);

  // Get services and sample data
  const allServices = getAllServices();
  
  // Sample doctors data based on selected service
  const getDoctorsByService = (serviceName) => {
    const doctorsData = {
      'General Medicine': [
        {
          id: 'dr-ramesh',
          name: 'Dr. K. Ramesh',
          specialization: 'General Physician, Diabetologist',
          fellowship: 'Fellowship In Echocardiography',
          rating: 4.9,
          experience: '20+ years',
          fees: 600,
          availability: '6 days/week',
          avatar: 'R',
        },
        {
          id: 'dr-rajender',
          name: 'Dr. Rajender Katroth',
          specialization: 'Medical Duty Doctor',
          rating: 4.6,
          experience: '8+ years',
          fees: 400,
          availability: '7 days/week',
          avatar: 'R',
        },
      ],
      'Diabetology': [
        {
          id: 'dr-ramesh',
          name: 'Dr. K. Ramesh',
          specialization: 'General Physician, Diabetologist',
          fellowship: 'Fellowship In Echocardiography',
          rating: 4.9,
          experience: '20+ years',
          fees: 600,
          availability: '6 days/week',
          avatar: 'R',
        },
      ],
      'Obstetrics & Gynecology': [
        {
          id: 'dr-divyavani',
          name: 'Dr. K. Divyavani',
          specialization: 'Obstetrics & Gynecology',
          rating: 4.8,
          experience: '15+ years',
          fees: 700,
          availability: '6 days/week',
          avatar: 'D',
        },
      ],
    };
    
    return doctorsData[serviceName] || [];
  };

  // Sample time slots
  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  ];

  // Generate date options (next 7 days)
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        id: i,
        day: daysOfWeek[date.getDay()],
        date: date.getDate(),
        month: months[date.getMonth()],
        fullDate: date.toISOString().split('T')[0],
        available: true,
      });
    }
    return dates;
  };

// Step navigation methods
  const goToNextStep = () => {
    setCurrentStep(prev => {
      // Special handling for step 3 (Date/Time selection)
      if (prev === 3 && !isLoggedIn) {
        // Show login/signup step for non-logged users after date selection
        return 4; // This will now be the login/signup step
      }
      // After login/signup, go to patient details
      if (prev === 4 && !isLoggedIn) {
        return 5; // Patient details for newly logged in users
      }
      // For logged-in users after patient details, skip OTP and go to payment
      if (prev === 4 && isLoggedIn) {
        return 6; // Skip step 5 (OTP) and go directly to payment
      }
      // For newly registered users after patient details, also skip OTP
      if (prev === 5) {
        return 6; // Skip OTP for all users
      }
      return Math.min(prev + 1, 7);
    });
  };

  const goToPreviousStep = () => {
    const newStep = Math.max(currentStep - 1, 1);
    setCurrentStep(newStep);
    // Show tab bar again when returning to step 1
    if (newStep === 1) {
      setBookingStarted(false);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  // Handle service selection (Step 1)
  const handleServiceSelect = (service) => {
    setBookingData(prev => ({ ...prev, service }));
    setBookingStarted(true); // Hide tab bar when booking starts
    goToNextStep();
  };

  // Handle doctor selection (Step 2)
  const handleDoctorSelect = (doctor) => {
    setBookingData(prev => ({ ...prev, doctor }));
    goToNextStep();
  };

  // Handle date and time selection (Step 3)
  const handleDateTimeSelect = (date, time) => {
    setBookingData(prev => ({ ...prev, date, time }));
    goToNextStep();
  };

  // Handle patient details submission (Step 4)
  const handlePatientDetails = async (details) => {
    setBookingData(prev => ({ ...prev, patientDetails: details }));
    
    // Check if user exists for new users
    if (!isLoggedIn) {
      const exists = await checkMobileExists(details.mobile);
      if (!exists) {
        setShowUserRegistration(true);
        return;
      }
    }
    
    goToNextStep();
  };

  // Handle user registration
  const handleUserRegistration = async () => {
    setLoading(true);
    try {
      const result = await registerUser(
        bookingData.patientDetails.mobile,
        newUserData.username,
        newUserData.password
      );
      
      if (result.success) {
        setShowUserRegistration(false);
        setOtpVerification({
          show: true,
          mobile: bookingData.patientDetails.mobile,
          otp: '',
          sentOtp: '',
        });
        
        // Send OTP
        const otpResult = await sendOTP(bookingData.patientDetails.mobile);
        if (otpResult.success) {
          setOtpVerification(prev => ({ ...prev, sentOtp: otpResult.otp }));
        }
      } else {
        Alert.alert('Registration Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpVerification = async () => {
    setLoading(true);
    try {
      const result = await verifyOTP(otpVerification.mobile, otpVerification.otp);
      if (result.success) {
        setOtpVerification({ show: false, mobile: '', otp: '', sentOtp: '' });
        goToNextStep();
      } else {
        Alert.alert('Invalid OTP', 'Please enter the correct OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle payment method selection (Step 6)
  const handlePaymentSelect = (method) => {
    setBookingData(prev => ({ ...prev, paymentMethod: method }));
    processBooking(method);
  };

  // Process booking and handle conflicts
  const processBooking = async (paymentMethod) => {
    setLoading(true);
    try {
      // Check for conflicts
      const conflict = checkAppointmentConflict(
        bookingData.date,
        bookingData.time,
        bookingData.patientDetails.name
      );

      const finalBookingData = {
        ...bookingData,
        paymentMethod,
        serviceName: bookingData.service.name,
        doctorName: bookingData.doctor.name,
        patientName: bookingData.patientDetails.name,
        paymentType: paymentMethod === 'razorpay' ? 'online' : 'hospital',
        amount: bookingData.doctor.fees,
      };

      if (conflict) {
        const result = await handleAppointmentConflict(conflict, finalBookingData);
        if (result.success) {
          setBookingData(prev => ({ ...prev, appointment: result.appointment }));
          goToNextStep(); // Go to confirmation
        }
      } else {
        const appointment = addAppointment(finalBookingData);
        setBookingData(prev => ({ ...prev, appointment }));
        goToNextStep(); // Go to confirmation
      }
    } catch (error) {
      Alert.alert('Error', 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1SelectService />;
      case 2:
        return <Step2SelectDoctor />;
      case 3:
        return <Step3SelectDateTime />;
      case 4:
        // For non-logged users, show login/signup after date selection
        if (!isLoggedIn) {
          return <Step4LoginSignup />;
        }
        // For logged users, go directly to patient details
        return <Step4PatientDetails />;
      case 5:
        return <Step5VerifyMobile />;
      case 6:
        return <Step6Payment />;
      case 7:
        return <Step7Confirmation />;
      default:
        return <Step1SelectService />;
    }
  };

  // Step 1: Select Service (Image 1)
  const Step1SelectService = () => {
    return (
      <View style={{flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20, paddingTop: 20}}>
        <Text style={{fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8}}>
          Select Service
        </Text>
        <Text style={{fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 30}}>
          Choose the medical service you need
        </Text>
        
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
          {allServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={() => handleServiceSelect(service)}
              activeOpacity={0.9}
            >
              <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: Colors.kbrBlue,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16
                }}>
                  <Ionicons name={service.icon || 'medical-outline'} size={28} color="white" />
                </View>
                <View style={{flex: 1}}>
                  <Text style={{fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 6}}>
                    {service.name}
                  </Text>
                  <Text style={{fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 12}} numberOfLines={2}>
                    {service.description}
                  </Text>
                  <View style={{alignSelf: 'flex-end'}}>
                    <Text style={{fontSize: 12, color: Colors.kbrBlue, fontWeight: '600'}}>
                      {service.duration}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Step 2: Select Doctor (Image 2)
  const Step2SelectDoctor = () => {
    const doctors = getDoctorsByService(bookingData.service?.name);
    
    return (
      <View style={{flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20, paddingTop: 20}}>
        <Text style={{fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8}}>
          Select Doctor
        </Text>
        <Text style={{fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 10}}>
          Choose your preferred specialist
        </Text>
        <View style={{
          backgroundColor: Colors.kbrBlue,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          alignSelf: 'center',
          marginBottom: 30
        }}>
          <Text style={{color: 'white', fontSize: 14, fontWeight: '600'}}>
            {bookingData.service?.name}
          </Text>
        </View>
        
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
          {doctors.map((doctor) => (
            <TouchableOpacity
              key={doctor.id}
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={() => handleDoctorSelect(doctor)}
              activeOpacity={0.9}
            >
              <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <View style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: Colors.kbrBlue,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16
                }}>
                  <Text style={{color: 'white', fontSize: 28, fontWeight: 'bold'}}>
                    {doctor.avatar}
                  </Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={{fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 6}}>
                    {doctor.name}
                  </Text>
                  <Text style={{fontSize: 14, color: '#6B7280', marginBottom: 4}}>
                    {doctor.specialization}
                  </Text>
                  {doctor.fellowship && (
                    <Text style={{fontSize: 12, color: '#9CA3AF', marginBottom: 8}}>
                      {doctor.fellowship}
                    </Text>
                  )}
                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 16}}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={{fontSize: 13, color: '#374151', marginLeft: 4, fontWeight: '600'}}>
                        {doctor.rating}
                      </Text>
                    </View>
                    <Text style={{fontSize: 13, color: '#6B7280'}}>
                      {doctor.experience}
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={{fontSize: 16, color: Colors.kbrBlue, fontWeight: 'bold'}}>
                      ₹{doctor.fees}
                    </Text>
                    <Text style={{fontSize: 12, color: '#9CA3AF'}}>
                      {doctor.availability}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              marginTop: 20,
            }}
            onPress={goToPreviousStep}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.kbrBlue} />
            <Text style={{fontSize: 16, color: Colors.kbrBlue, fontWeight: '600', marginLeft: 8}}>
              Back to Services
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // Step 3: Select Date & Time (Image 3)
  const Step3SelectDateTime = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const dates = generateDateOptions();
    
    return (
      <View style={{flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20, paddingTop: 20}}>
        <Text style={{fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8}}>
          Select Date & Time
        </Text>
        <Text style={{fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 10}}>
          Choose your preferred appointment slot
        </Text>
        <View style={{
          backgroundColor: Colors.kbrBlue,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          alignSelf: 'center',
          marginBottom: 30
        }}>
          <Text style={{color: 'white', fontSize: 14, fontWeight: '600'}}>
            {bookingData.doctor?.name}
          </Text>
        </View>
        
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
          {/* Date Selection */}
          <Text style={{fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16}}>
            Select Date
          </Text>
          {dates.map((date) => (
            <TouchableOpacity
              key={date.id}
              style={{
                backgroundColor: selectedDate?.id === date.id ? Colors.kbrBlue : 'white',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: selectedDate?.id === date.id ? Colors.kbrBlue : '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 3,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onPress={() => setSelectedDate(date)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={{
                  fontSize: 16, 
                  fontWeight: 'bold', 
                  color: selectedDate?.id === date.id ? 'white' : '#1F2937',
                  marginBottom: 4
                }}>
                  {date.day}
                </Text>
                <Text style={{
                  fontSize: 20, 
                  fontWeight: 'bold', 
                  color: selectedDate?.id === date.id ? 'white' : Colors.kbrBlue
                }}>
                  {date.date}
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                color: selectedDate?.id === date.id ? 'white' : '#10B981',
                fontWeight: '600'
              }}>
                Available
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Time Selection */}
          {selectedDate && (
            <>
              <Text style={{fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 24, marginBottom: 16}}>
                Select Time
              </Text>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                marginBottom: 20
              }}>
                {timeSlots.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      backgroundColor: selectedTime === time ? Colors.kbrBlue : 'white',
                      borderRadius: 8,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      marginBottom: 12,
                      width: '48%',
                      borderWidth: 1,
                      borderColor: selectedTime === time ? Colors.kbrBlue : '#E5E7EB',
                      alignItems: 'center'
                    }}
                    onPress={() => setSelectedTime(time)}
                    activeOpacity={0.8}
                  >
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: selectedTime === time ? 'white' : '#374151'
                    }}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={{
                backgroundColor: '#FEF3C7',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                alignItems: 'center'
              }}>
                <Text style={{fontSize: 14, color: '#92400E', fontWeight: '600'}}>
                  Tokens booked today: 7 / 30
                </Text>
              </View>
            </>
          )}
          
          {selectedDate && selectedTime && (
            <TouchableOpacity
              style={{
                backgroundColor: Colors.kbrBlue,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 20,
                marginBottom: 40
              }}
              onPress={() => handleDateTimeSelect(selectedDate.fullDate, selectedTime)}
            >
              <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
                Continue
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  };

  // Step 4: Login/Signup (for non-logged users)
  const Step4LoginSignup = () => {
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
    const [authData, setAuthData] = useState({
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    });

    const handleAuth = async () => {
      if (authMode === 'login') {
        // Handle login with email and password
        if (!authData.email || !authData.password) {
          Alert.alert('Error', 'Please enter both email and password');
          return;
        }
        // Mock login logic - in real app, validate with backend
        const mockUser = {
          id: Date.now().toString(),
          email: authData.email,
          username: authData.email.split('@')[0],
          name: authData.email.split('@')[0],
        };
        loginUser(mockUser);
        goToNextStep();
      } else {
        // Handle signup
        if (!authData.email || !authData.username || !authData.password || !authData.confirmPassword) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }
        if (authData.password !== authData.confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }
        try {
          // Create new user with email
          const newUser = {
            id: Date.now().toString(),
            email: authData.email,
            username: authData.username,
            name: authData.username,
            password: authData.password, // In real app, this would be hashed
            createdAt: new Date().toISOString(),
          };
          loginUser(newUser);
          Alert.alert('Success', 'Account created successfully');
          goToNextStep();
        } catch (error) {
          Alert.alert('Error', 'Registration failed. Please try again.');
        }
      }
    };

    return (
      <View style={{flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20, paddingTop: 20}}>
        <Text style={{fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8}}>
          {authMode === 'login' ? 'Sign In' : 'Create Account'}
        </Text>
        <Text style={{fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 30}}>
          {authMode === 'login' ? 'Sign in to continue booking' : 'Create an account to book appointment'}
        </Text>

        {/* Auth Mode Toggle */}
        <View style={{flexDirection: 'row', marginBottom: 30, backgroundColor: '#fff', borderRadius: 25, padding: 4}}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 20,
              backgroundColor: authMode === 'login' ? Colors.kbrBlue : 'transparent',
            }}
            onPress={() => setAuthMode('login')}
          >
            <Text style={{
              textAlign: 'center',
              color: authMode === 'login' ? '#fff' : '#6B7280',
              fontWeight: '600',
            }}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 20,
              backgroundColor: authMode === 'signup' ? Colors.kbrBlue : 'transparent',
            }}
            onPress={() => setAuthMode('signup')}
          >
            <Text style={{
              textAlign: 'center',
              color: authMode === 'signup' ? '#fff' : '#6B7280',
              fontWeight: '600',
            }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auth Form */}
        <View style={{backgroundColor: '#fff', borderRadius: 12, padding: 20}}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 15,
              fontSize: 16,
              marginBottom: 15,
            }}
            placeholder="Email Address"
            value={authData.email}
            onChangeText={(text) => setAuthData(prev => ({...prev, email: text}))}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {authMode === 'signup' && (
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 15,
                fontSize: 16,
                marginBottom: 15,
              }}
              placeholder="Username"
              value={authData.username}
              onChangeText={(text) => setAuthData(prev => ({...prev, username: text}))}
            />
          )}

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 15,
              fontSize: 16,
              marginBottom: authMode === 'signup' ? 15 : 0,
            }}
            placeholder="Password"
            value={authData.password}
            onChangeText={(text) => setAuthData(prev => ({...prev, password: text}))}
            secureTextEntry
          />

          {authMode === 'signup' && (
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 15,
                fontSize: 16,
              }}
              placeholder="Confirm Password"
              value={authData.confirmPassword}
              onChangeText={(text) => setAuthData(prev => ({...prev, confirmPassword: text}))}
              secureTextEntry
            />
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={{
            backgroundColor: Colors.kbrBlue,
            paddingVertical: 15,
            borderRadius: 25,
            marginTop: 30,
            alignItems: 'center',
          }}
          onPress={handleAuth}
        >
          <Text style={{color: '#fff', fontSize: 16, fontWeight: '600'}}>
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Step 4/5: Patient Details (Image 4)
  const Step4PatientDetails = () => {
    const [formData, setFormData] = useState({
      bookingFor: 'myself',
      name: isLoggedIn ? userData?.name || '' : '',
      age: '',
      gender: '',
      mobile: isLoggedIn ? userData?.mobileNumber || '' : '',
    });
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);

    const genderOptions = ['Male', 'Female', 'Other'];

    const handleSubmit = () => {
      if (!formData.name || !formData.age || !formData.gender || !formData.mobile) {
        Alert.alert('Error', 'Please fill all required fields');
        return;
      }
      handlePatientDetails(formData);
    };

    return (
      <View style={{flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20, paddingTop: 20}}>
        <Text style={{fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8}}>
          Patient Details
        </Text>
        <Text style={{fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 30}}>
          Enter patient information
        </Text>
        
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
          <View style={{backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20}}>
            {/* Booking For Options */}
            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 12}}>
              Booking for
            </Text>
            <View style={{flexDirection: 'row', marginBottom: 24}}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 32,
                  paddingVertical: 8
                }}
                onPress={() => setFormData(prev => ({ ...prev, bookingFor: 'myself' }))}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: formData.bookingFor === 'myself' ? Colors.kbrBlue : '#D1D5DB',
                  backgroundColor: formData.bookingFor === 'myself' ? Colors.kbrBlue : 'transparent',
                  marginRight: 8,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {formData.bookingFor === 'myself' && (
                    <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: 'white'}} />
                  )}
                </View>
                <Text style={{fontSize: 16, color: '#374151'}}>Myself</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8
                }}
                onPress={() => setFormData(prev => ({ ...prev, bookingFor: 'family' }))}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: formData.bookingFor === 'family' ? Colors.kbrBlue : '#D1D5DB',
                  backgroundColor: formData.bookingFor === 'family' ? Colors.kbrBlue : 'transparent',
                  marginRight: 8,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {formData.bookingFor === 'family' && (
                    <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: 'white'}} />
                  )}
                </View>
                <Text style={{fontSize: 16, color: '#374151'}}>Family Member</Text>
              </TouchableOpacity>
            </View>

            {/* Patient Name */}
            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 8}}>
              Patient Name *
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: 'white',
                marginBottom: 20
              }}
              placeholder="Enter patient's full name"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />

            {/* Age and Gender Row */}
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
              <View style={{flex: 0.48}}>
                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 8}}>
                  Age *
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: 'white'
                  }}
                  placeholder="Age"
                  keyboardType="numeric"
                  value={formData.age}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
                />
              </View>
              
              <View style={{flex: 0.48}}>
                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 8}}>
                  Gender *
                </Text>
                <View style={{position: 'relative'}}>
                  <TouchableOpacity 
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderRadius: 8,
                      padding: 12,
                      backgroundColor: 'white',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                  >
                    <Text style={{
                      fontSize: 16,
                      color: formData.gender ? '#374151' : '#9CA3AF'
                    }}>
                      {formData.gender || 'Select gender'}
                    </Text>
                    <Ionicons 
                      name={showGenderDropdown ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                  
                  {showGenderDropdown && (
                    <View style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderRadius: 8,
                      marginTop: 4,
                      zIndex: 1000,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 5,
                    }}>
                      {genderOptions.map((option, index) => (
                        <TouchableOpacity
                          key={option}
                          style={{
                            padding: 12,
                            borderBottomWidth: index < genderOptions.length - 1 ? 1 : 0,
                            borderBottomColor: '#F3F4F6',
                          }}
                          onPress={() => {
                            setFormData(prev => ({ ...prev, gender: option }));
                            setShowGenderDropdown(false);
                          }}
                        >
                          <Text style={{
                            fontSize: 16,
                            color: formData.gender === option ? Colors.kbrBlue : '#374151',
                            fontWeight: formData.gender === option ? '600' : '400',
                          }}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Mobile Number */}
            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 8}}>
              Mobile Number *
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: 'white',
                marginBottom: 30
              }}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              value={formData.mobile}
              onChangeText={(text) => setFormData(prev => ({ ...prev, mobile: text }))}
            />

            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity 
                style={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  flex: 0.45
                }}
                onPress={goToPreviousStep}
              >
                <Text style={{fontSize: 16, fontWeight: '600', color: '#374151', textAlign: 'center'}}>
                  Back
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{
                  backgroundColor: Colors.kbrBlue,
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  flex: 0.45
                }}
                onPress={handleSubmit}
              >
                <Text style={{fontSize: 16, fontWeight: '600', color: 'white', textAlign: 'center'}}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Step 5: Verify Mobile (Image 5)
  const Step5VerifyMobile = () => {
    return (
      <View style={{flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20, paddingTop: 20}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100}}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Colors.kbrBlue,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 30
          }}>
            <Ionicons name="phone-portrait-outline" size={40} color="white" />
          </View>
          
          <Text style={{fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 12}}>
            Verify Mobile Number
          </Text>
          <Text style={{fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 40, lineHeight: 24}}>
            We'll send an OTP to verify your mobile number
          </Text>
          
          <View style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            width: '100%',
            marginBottom: 30,
            alignItems: 'center'
          }}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: Colors.kbrBlue, marginBottom: 8}}>
              {bookingData.patientDetails?.mobile}
            </Text>
            <Text style={{fontSize: 14, color: '#6B7280', textAlign: 'center'}}>
              OTP will be sent to this number
            </Text>
          </View>
          
          <TouchableOpacity 
            style={{
              backgroundColor: Colors.kbrBlue,
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 32,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 30,
              minWidth: 200,
              justifyContent: 'center'
            }}
            onPress={() => setOtpVerification(prev => ({ ...prev, show: true }))}
          >
            <Ionicons name="phone-portrait-outline" size={20} color="white" style={{marginRight: 8}} />
            <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
              Send OTP
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12
            }}
            onPress={goToPreviousStep}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.kbrBlue} />
            <Text style={{fontSize: 16, color: Colors.kbrBlue, fontWeight: '600', marginLeft: 8}}>
              Back to Patient Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Step 6: Payment (Image 6)
  const Step6Payment = () => {
    return (
      <View style={{flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20, paddingTop: 20}}>
        <Text style={{fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8}}>
          Payment
        </Text>
        <Text style={{fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 30}}>
          Complete your booking payment
        </Text>
        
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
          {/* Booking Summary */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16}}>
              Booking Summary
            </Text>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8}}>
              <Text style={{fontSize: 14, color: '#6B7280'}}>Service:</Text>
              <Text style={{fontSize: 14, color: '#374151', fontWeight: '600', flex: 1, textAlign: 'right'}}>
                {bookingData.service?.name}
              </Text>
            </View>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8}}>
              <Text style={{fontSize: 14, color: '#6B7280'}}>Doctor:</Text>
              <Text style={{fontSize: 14, color: '#374151', fontWeight: '600', flex: 1, textAlign: 'right'}}>
                {bookingData.doctor?.name}
              </Text>
            </View>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8}}>
              <Text style={{fontSize: 14, color: '#6B7280'}}>Date:</Text>
              <Text style={{fontSize: 14, color: '#374151', fontWeight: '600', flex: 1, textAlign: 'right'}}>
                {new Date(bookingData.date).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8}}>
              <Text style={{fontSize: 14, color: '#6B7280'}}>Time:</Text>
              <Text style={{fontSize: 14, color: '#374151', fontWeight: '600', flex: 1, textAlign: 'right'}}>
                {bookingData.time}
              </Text>
            </View>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8}}>
              <Text style={{fontSize: 14, color: '#6B7280'}}>Patient:</Text>
              <Text style={{fontSize: 14, color: '#374151', fontWeight: '600', flex: 1, textAlign: 'right'}}>
                {bookingData.patientDetails?.name}
              </Text>
            </View>
            
            <View style={{
              height: 1,
              backgroundColor: '#E5E7EB',
              marginVertical: 12
            }} />
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8}}>
              <Text style={{fontSize: 16, fontWeight: 'bold', color: '#1F2937'}}>Total Amount:</Text>
              <Text style={{fontSize: 18, fontWeight: 'bold', color: Colors.kbrBlue}}>
                ₹{bookingData.doctor?.fees}
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <Text style={{fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16}}>
            Select Payment Method
          </Text>
          
          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E5E7EB'
            }}
            onPress={() => handlePaymentSelect('razorpay')}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#EEF2FF',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16
            }}>
              <Ionicons name="card-outline" size={20} color={Colors.kbrBlue} />
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4}}>
                Online Payment
              </Text>
              <Text style={{fontSize: 14, color: '#6B7280'}}>
                Cards, UPI, Wallet & More
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              marginBottom: 30,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E5E7EB'
            }}
            onPress={() => handlePaymentSelect('hospital')}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#F0FDF4',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16
            }}>
              <Ionicons name="business-outline" size={20} color="#10B981" />
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4}}>
                Pay at Hospital
              </Text>
              <Text style={{fontSize: 14, color: '#6B7280'}}>
                Cash or Card at Reception
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40}}>
            <TouchableOpacity 
              style={{
                backgroundColor: '#F3F4F6',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                flex: 0.45
              }}
              onPress={goToPreviousStep}
            >
              <Text style={{fontSize: 16, fontWeight: '600', color: '#374151', textAlign: 'center'}}>
                Back
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{
                backgroundColor: Colors.kbrBlue,
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                flex: 0.45,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={() => handlePaymentSelect('razorpay')}
            >
              <Ionicons name="card" size={16} color="white" style={{marginRight: 8}} />
              <Text style={{fontSize: 16, fontWeight: '600', color: 'white'}}>
                Pay Now
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Step 7: Booking Confirmation (Image 7)
  const Step7Confirmation = () => {
    return (
      <View style={{flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20, paddingTop: 20}}>
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
          <View style={{alignItems: 'center', paddingBottom: 40}}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#DCFCE7',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24
            }}>
              <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            </View>
            
            <Text style={{fontSize: 28, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8}}>
              Booking Confirmed!
            </Text>
            <Text style={{fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 30, lineHeight: 24}}>
              Your appointment has been successfully booked
            </Text>
            
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 20,
              width: '100%',
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <Text style={{fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, textAlign: 'center'}}>
                Appointment Details
              </Text>
              
              <View style={{
                backgroundColor: Colors.kbrBlue,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                alignItems: 'center'
              }}>
                <Text style={{fontSize: 14, color: 'white', marginBottom: 4}}>Token Number</Text>
                <Text style={{fontSize: 24, fontWeight: 'bold', color: 'white'}}>
                  {bookingData.appointment?.tokenNumber || 'KBR08'}
                </Text>
              </View>
              
              <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8}}>
                <Text style={{fontSize: 14, color: '#6B7280'}}>Service:</Text>
                <Text style={{fontSize: 14, color: '#374151', fontWeight: '600', flex: 1, textAlign: 'right'}}>
                  {bookingData.service?.name}
                </Text>
              </View>
              
              <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8}}>
                <Text style={{fontSize: 14, color: '#6B7280'}}>Doctor:</Text>
                <Text style={{fontSize: 14, color: '#374151', fontWeight: '600', flex: 1, textAlign: 'right'}}>
                  {bookingData.doctor?.name}
                </Text>
              </View>
              
              <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8}}>
                <Text style={{fontSize: 14, color: '#6B7280'}}>Date & Time:</Text>
                <Text style={{fontSize: 14, color: '#374151', fontWeight: '600', flex: 1, textAlign: 'right'}}>
                  {new Date(bookingData.date).toLocaleDateString()} at {bookingData.time}
                </Text>
              </View>
              
              <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8}}>
                <Text style={{fontSize: 14, color: '#6B7280'}}>Patient:</Text>
                <Text style={{fontSize: 14, color: '#374151', fontWeight: '600', flex: 1, textAlign: 'right'}}>
                  {bookingData.patientDetails?.name}
                </Text>
              </View>
              
              <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8}}>
                <Text style={{fontSize: 14, color: '#6B7280'}}>Payment ID:</Text>
                <Text style={{fontSize: 14, color: Colors.kbrBlue, fontWeight: '600', flex: 1, textAlign: 'right'}}>
                  {bookingData.appointment?.paymentId || 'PAY79545253'}
                </Text>
              </View>
            </View>

            {/* Important Notes */}
            <View style={{
              backgroundColor: '#FEF3C7',
              borderRadius: 12,
              padding: 16,
              width: '100%',
              marginBottom: 30
            }}>
              <Text style={{fontSize: 16, fontWeight: 'bold', color: '#92400E', marginBottom: 12}}>
                Important Notes:
              </Text>
              <Text style={{fontSize: 14, color: '#92400E', lineHeight: 20, marginBottom: 8}}>
                • Please arrive 15 minutes before your appointment time
              </Text>
              <Text style={{fontSize: 14, color: '#92400E', lineHeight: 20, marginBottom: 8}}>
                • Bring a valid ID proof and insurance card (if applicable)
              </Text>
              <Text style={{fontSize: 14, color: '#92400E', lineHeight: 20, marginBottom: 8}}>
                • You can reschedule or cancel up to 2 hours before
              </Text>
              <Text style={{fontSize: 14, color: '#92400E', lineHeight: 20}}>
                • For emergencies, call our helpline: 1800-419-1397
              </Text>
            </View>

            <TouchableOpacity 
              style={{
                backgroundColor: Colors.kbrBlue,
                borderRadius: 12,
                paddingVertical: 16,
                width: '100%',
                marginBottom: 16,
                alignItems: 'center'
              }}
              onPress={() => {
                setCurrentStep(1);
                setBookingStarted(false); // Show tab bar again when starting new booking
                setBookingData({
                  service: null,
                  doctor: null,
                  date: null,
                  time: null,
                  patientDetails: { bookingFor: 'myself', name: '', age: '', gender: '', mobile: '' },
                  paymentMethod: null,
                });
              }}
            >
              <Text style={{fontSize: 16, fontWeight: 'bold', color: 'white'}}>
                Book Another Appointment
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                paddingVertical: 16,
                width: '100%',
                alignItems: 'center'
              }}
              onPress={() => navigation.navigate('PatientMain')}
            >
              <Text style={{fontSize: 16, fontWeight: '600', color: '#374151'}}>
                Go to Home
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />
      <SafeAreaView style={{flex: 1, backgroundColor: '#f5f5f5'}}>
        {/* App Header */}
        <AppHeader 
          subtitle="Book Appointment"
          navigation={navigation}
          showBackButton={true}
          customBackAction={() => {
            if (currentStep === 1) {
              // Check if we can go back, otherwise navigate to PatientMain
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('PatientMain', { screen: 'Home' });
              }
            } else {
              goToPreviousStep();
            }
          }}
        />

        {/* Progress Header */}
        <View style={{
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingVertical: 15,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB'
        }}>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: '#1F2937'}}>Book Appointment</Text>
          <Text style={{fontSize: 14, color: '#6B7280'}}>Step {currentStep} of 7</Text>
        </View>

        {/* Step Content */}
        <View style={{flex: 1}}>
          {renderStepContent()}
        </View>

        {/* Loading Overlay */}
        <LoadingOverlay visible={loading} message="Processing..." />

        {/* User Registration Modal */}
        <Modal visible={showUserRegistration} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Create Account</Text>
              <Text style={styles.modalSubtitle}>Set up your account to continue</Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Enter username"
                value={newUserData.username}
                onChangeText={(text) => setNewUserData(prev => ({ ...prev, username: text }))}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Enter password"
                secureTextEntry
                value={newUserData.password}
                onChangeText={(text) => setNewUserData(prev => ({ ...prev, password: text }))}
              />
              
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowUserRegistration(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleUserRegistration}
                >
                  <Text style={styles.modalConfirmText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* OTP Verification Modal */}
        <Modal visible={otpVerification.show} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Verify Mobile Number</Text>
              <Text style={styles.modalSubtitle}>
                We'll send an OTP to {otpVerification.mobile}
              </Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Enter 6-digit OTP"
                keyboardType="numeric"
                maxLength={6}
                value={otpVerification.otp}
                onChangeText={(text) => setOtpVerification(prev => ({ ...prev, otp: text }))}
              />
              
              <TouchableOpacity
                style={styles.otpButton}
                onPress={handleOtpVerification}
              >
                <Text style={styles.otpButtonText}>Verify OTP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

// Use the imported booking styles
const styles = StyleSheet.create({
  ...bookingStyles,
  // Add any component-specific overrides here
  stepContainer: {
    flex: 1,
  },
  stepScrollView: {
    flex: 1,
    paddingHorizontal: Sizes.screenPadding,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: Sizes.md,
  },
  headerLogoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Sizes.sm,
  },
  headerTitle: {
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: Sizes.small,
    color: Colors.white,
    opacity: 0.9,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.radiusSmall,
  },
  loginText: {
    color: Colors.white,
    marginLeft: 4,
    fontSize: Sizes.small,
  },
  scrollView: {
    flex: 1,
  },
  progressSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  progressStep: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionTitleContainer: {
    paddingHorizontal: Sizes.screenPadding,
    paddingTop: Sizes.xl,
    paddingBottom: Sizes.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Sizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  sectionSubtitle: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  servicesSection: {
    paddingHorizontal: Sizes.screenPadding,
    gap: Sizes.md,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    marginBottom: Sizes.md,
  },
  serviceLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  serviceDescription: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Sizes.md,
    gap: Sizes.xs,
  },
  tagItem: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: Sizes.xs,
    marginBottom: Sizes.xs,
  },
  tagText: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: Colors.kbrBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    gap: Sizes.xs,
  },
  bookButtonText: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.white,
  },
  buttonSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.xl,
  },
  continueButton: {
    backgroundColor: Colors.kbrBlue,
    borderRadius: Sizes.radiusLarge,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.white,
    marginRight: Sizes.sm,
  },
  noServicesContainer: {
    alignItems: 'center',
    paddingVertical: Sizes.xxl,
  },
  noServicesText: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  noServicesSubtext: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default BookAppointmentScreen;