import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';

// Initial user state
const initialUserState = {
  isLoggedIn: false,
  userData: null,
  familyMembers: [],
  appointments: [],
  invoices: [],
};

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(initialUserState);
  const [tokenCounter, setTokenCounter] = useState(8);

  // Generate unique token numbers
  const generateTokenNumber = () => {
    const tokenNumber = `KBR${String(tokenCounter).padStart(2, '0')}`;
    setTokenCounter(prev => prev + 1);
    return tokenNumber;
  };

  // Login user
  const loginUser = (userData) => {
    // Create sample appointments for testing
    const sampleAppointments = [
      {
        id: '1',
        serviceName: 'Pediatrics',
        doctorName: 'Dr. K. Vijay Shankar',
        date: '2024-09-20',
        time: '2:30 PM',
        tokenNumber: 'KBR02',
        status: 'confirmed',
        patientName: userData.name,
        patientAge: userData.age || '30',
        patientGender: userData.gender || 'Male',
        paymentMethod: 'Online',
        paymentStatus: 'Paid'
      },
      {
        id: '2',
        serviceName: 'General Medicine',
        doctorName: 'Dr. K. Ramesh',
        date: '2024-09-10',
        time: '10:00 AM',
        tokenNumber: 'KBR01',
        status: 'completed',
        patientName: userData.name,
        patientAge: userData.age || '30',
        patientGender: userData.gender || 'Male',
        paymentMethod: 'Online',
        paymentStatus: 'Paid'
      }
    ];

    setUser(prev => ({
      ...prev,
      isLoggedIn: true,
      userData: {
        ...userData,
        id: userData.id || Date.now().toString(),
      },
      appointments: sampleAppointments,
    }));
  };

  // Logout user
  const logoutUser = () => {
    setUser(initialUserState);
    setTokenCounter(1);
  };

  // Update user data
  const updateUser = async (updatedUserData) => {
    return new Promise((resolve, reject) => {
      try {
        setUser(prev => ({
          ...prev,
          userData: {
            ...prev.userData,
            ...updatedUserData,
          },
        }));
        resolve({ success: true });
      } catch (error) {
        reject(error);
      }
    });
  };

  // Register new user (during booking flow)
  const registerUser = async (mobileNumber, username, password) => {
    try {
      // Simulate API call to check if mobile exists
      const userExists = await checkMobileExists(mobileNumber);
      
      if (userExists) {
        return { success: false, message: 'Mobile number already registered. Please login.' };
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        mobileNumber,
        username,
        password, // In real app, this would be hashed
        email: '',
        createdAt: new Date().toISOString(),
      };

      loginUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  // Check if mobile number exists in database
  const checkMobileExists = async (mobileNumber) => {
    // Mock API call - In real app, this would check your backend
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate some existing users
        const existingNumbers = ['+919876543210', '+919876543211'];
        resolve(existingNumbers.includes(mobileNumber));
      }, 1000);
    });
  };

  // Add family member
  const addFamilyMember = (memberData) => {
    const newMember = {
      id: Date.now().toString(),
      ...memberData,
      addedAt: new Date().toISOString(),
    };

    setUser(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, newMember],
    }));

    return newMember;
  };

  // Remove family member
  const removeFamilyMember = (memberId) => {
    setUser(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(member => member.id !== memberId),
    }));
  };

  // Update family member
  const updateFamilyMember = (memberId, updatedData) => {
    setUser(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member =>
        member.id === memberId ? { ...member, ...updatedData } : member
      ),
    }));
  };

  // Add appointment
  const addAppointment = (appointmentData) => {
    const newAppointment = {
      id: Date.now().toString(),
      tokenNumber: generateTokenNumber(),
      status: 'confirmed',
      paymentStatus: appointmentData.paymentType === 'hospital' ? 'pending' : 'completed',
      paymentId: appointmentData.paymentType === 'online' ? `PAY${Date.now()}` : null,
      bookedAt: new Date().toISOString(),
      ...appointmentData,
    };

    setUser(prev => ({
      ...prev,
      appointments: [...prev.appointments, newAppointment],
    }));

    // Create and store invoice
    const invoice = createInvoice(newAppointment);
    addInvoice(invoice);

    return newAppointment;
  };

  // Add invoice
  const addInvoice = (invoiceData) => {
    const newInvoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...invoiceData,
    };

    setUser(prev => ({
      ...prev,
      invoices: [...prev.invoices, newInvoice],
    }));

    return newInvoice;
  };

  // Create invoice from appointment data
  const createInvoice = (appointmentData) => {
    return {
      appointmentId: appointmentData.id,
      patientName: appointmentData.patientName,
      serviceName: appointmentData.serviceName,
      doctorName: appointmentData.doctorName,
      date: appointmentData.date,
      time: appointmentData.time,
      amount: appointmentData.amount || 500, // Default consultation fee
      paymentMethod: appointmentData.paymentType,
      paymentStatus: appointmentData.paymentStatus,
      paymentId: appointmentData.paymentId,
      tokenNumber: appointmentData.tokenNumber,
    };
  };

  // Cancel appointment
  const cancelAppointment = (appointmentId) => {
    setUser(prev => ({
      ...prev,
      appointments: prev.appointments.map(appointment =>
        appointment.id === appointmentId
          ? { ...appointment, status: 'cancelled', cancelledAt: new Date().toISOString() }
          : appointment
      ),
    }));
  };

  // Reschedule appointment
  const rescheduleAppointment = (appointmentId, newDate, newTime) => {
    setUser(prev => ({
      ...prev,
      appointments: prev.appointments.map(appointment =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              date: newDate,
              time: newTime,
              status: 'rescheduled',
              rescheduledAt: new Date().toISOString(),
            }
          : appointment
      ),
    }));
  };

  // Get upcoming appointments
  const getUpcomingAppointments = () => {
    const now = new Date();
    return user.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= now && appointment.status === 'confirmed';
    });
  };

  // Get past appointments
  const getPastAppointments = () => {
    const now = new Date();
    return user.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate < now || appointment.status === 'completed';
    });
  };

  // Check for appointment conflicts
  const checkAppointmentConflict = (date, time, patientName) => {
    const conflicts = user.appointments.filter(appointment => 
      appointment.date === date &&
      appointment.time === time &&
      appointment.patientName === patientName &&
      appointment.status === 'confirmed'
    );
    
    return conflicts.length > 0 ? conflicts[0] : null;
  };

  // Handle appointment conflict resolution
  const handleAppointmentConflict = (conflictingAppointment, newBookingData) => {
    return new Promise((resolve) => {
      Alert.alert(
        'Appointment Conflict',
        `You already have an appointment on ${conflictingAppointment.date} at ${conflictingAppointment.time} for ${conflictingAppointment.patientName}.\n\nWhat would you like to do?`,
        [
          {
            text: 'Cancel Previous & Book New',
            onPress: () => {
              cancelAppointment(conflictingAppointment.id);
              const newAppointment = addAppointment(newBookingData);
              resolve({ success: true, appointment: newAppointment, action: 'replaced' });
            },
          },
          {
            text: 'Keep Both Appointments',
            onPress: () => {
              const newAppointment = addAppointment(newBookingData);
              resolve({ success: true, appointment: newAppointment, action: 'kept_both' });
            },
          },
          {
            text: 'Cancel New Booking',
            style: 'cancel',
            onPress: () => {
              resolve({ success: false, action: 'cancelled' });
            },
          },
        ],
        { cancelable: false }
      );
    });
  };

  // Send OTP (mock implementation)
  const sendOTP = async (mobileNumber) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // In real app, you would send OTP via SMS service
        console.log(`Mock OTP for ${mobileNumber}: ${otp}`);
        resolve({ success: true, otp });
      }, 2000);
    });
  };

  // Verify OTP (mock implementation)
  const verifyOTP = async (mobileNumber, enteredOTP) => {
    return new Promise(resolve => {
      setTimeout(() => {
        // In real app, you would verify against sent OTP
        // For demo, accept any 6-digit number
        const isValid = enteredOTP.length === 6 && /^\d+$/.test(enteredOTP);
        resolve({ success: isValid });
      }, 1500);
    });
  };

  const contextValue = {
    // User state
    user,
    isLoggedIn: user.isLoggedIn,
    userData: user.userData,
    familyMembers: user.familyMembers,
    appointments: user.appointments,
    invoices: user.invoices,
    
    // Authentication methods
    loginUser,
    logoutUser,
    updateUser,
    registerUser,
    checkMobileExists,
    
    // Family member methods
    addFamilyMember,
    removeFamilyMember,
    updateFamilyMember,
    
    // Appointment methods
    addAppointment,
    cancelAppointment,
    rescheduleAppointment,
    getUpcomingAppointments,
    getPastAppointments,
    checkAppointmentConflict,
    handleAppointmentConflict,
    
    // Invoice methods
    addInvoice,
    createInvoice,
    
    // Utility methods
    generateTokenNumber,
    sendOTP,
    verifyOTP,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;