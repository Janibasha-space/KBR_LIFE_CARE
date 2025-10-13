import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';

// Central App Context for Admin-Patient Integration
// This context manages all shared data between admin and patient dashboards

const AppContext = createContext();

// Initial comprehensive state
const initialAppState = {
  // Admin Dashboard Stats (Real-time calculated from actual data)
  adminStats: {
    totalUsers: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    activeDoctors: 0,
    todayAppointments: 0,
    confirmedAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
  },

  // Shared Services (from ServicesContext but enhanced)
  services: {
    medical: [],
    surgical: [],
    specialized: [],
  },

  // Shared Appointments (both admin and patient view same data)
  appointments: [],

  // Doctor Management (shared between admin and patient)
  doctors: [
    {
      id: 'dr-ramesh',
      name: 'Dr. K. Ramesh',
      credentials: 'M.B.B.S., M.D',
      specialization: 'General Physician',
      department: 'General Medicine',
      fellowship: 'Fellowship in Echocardiography',
      experience: '20+ years',
      rating: 4.9,
      consultationFee: 600,
      status: 'Active',
      availability: '6 days/week',
      phone: '+91 98765 43210',
      email: 'dr.ramesh@kbrhospital.com',
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      timeSlots: '9:00 AM - 6:00 PM',
      todayAppointments: 0,
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80'
    },
    {
      id: 'dr-divyavani',
      name: 'Dr. K. Divyavani',
      credentials: 'M.B.B.S., M.S',
      specialization: 'Obstetrics & Gynecology',
      department: 'Gynecology', 
      fellowship: 'Fellowship in Fetal Medicine',
      experience: '15+ years',
      rating: 4.8,
      consultationFee: 800,
      status: 'Active',
      availability: '5 days/week',
      phone: '+91 98765 43211',
      email: 'dr.divyavani@kbrhospital.com',
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      timeSlots: '10:00 AM - 5:00 PM',
      todayAppointments: 0,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80'
    },
    {
      id: 'dr-thukaram',
      name: 'Dr. K. Thukaram',
      credentials: 'B.D.S, M.D.S',
      specialization: 'Orthodontics & Dentofacial Orthopaedics',
      department: 'Dentistry',
      fellowship: 'Fellowship in Aesthetic Dentistry',
      experience: '12+ years',
      rating: 4.7,
      consultationFee: 500,
      status: 'Active',
      availability: '6 days/week',
      phone: '+91 98765 43213',
      email: 'dr.thukaram@kbrhospital.com',
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      timeSlots: '9:00 AM - 6:00 PM',
      todayAppointments: 0,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80'
    }
  ],



  // Payment Management (shared)
  payments: [],
  
  // Test Management (integrated with patient services)
  tests: [
    {
      id: 'test-001',
      name: 'Complete Blood Count (CBC)',
      price: 350,
      category: 'Blood Test',
      department: 'Lab',
      description: 'Complete blood analysis including RBC, WBC, Platelets, Hemoglobin',
      sampleRequired: 'Blood',
      testDuration: '15 minutes',
      reportTime: '4-6 hours',
      isActive: true,
      bookings: 0
    },
    {
      id: 'test-002',
      name: 'Lipid Profile',
      price: 500,
      category: 'Blood Test',
      department: 'Biochemistry',
      description: 'Cholesterol, Triglycerides, HDL, LDL analysis',
      sampleRequired: 'Blood',
      testDuration: '20 minutes',
      reportTime: '8-12 hours',
      isActive: true,
      bookings: 0
    },
    {
      id: 'test-003',
      name: 'X-Ray Chest',
      price: 300,
      category: 'Imaging',
      department: 'Radiology',
      description: 'Chest X-ray for lung examination',
      sampleRequired: 'None',
      testDuration: '10 minutes',
      reportTime: '2-4 hours',
      isActive: true,
      bookings: 0
    },
    {
      id: 'test-004',
      name: 'ECG',
      price: 200,
      category: 'Cardiac',
      department: 'Cardiology',
      description: 'Heart rhythm analysis',
      sampleRequired: 'None',
      testDuration: '15 minutes',
      reportTime: '1-2 hours', 
      isActive: true,
      bookings: 0
    },
    {
      id: 'test-005',
      name: '2D Echo',
      price: 1200,
      category: 'Cardiac',
      department: 'Cardiology',
      description: 'Heart structure assessment',
      sampleRequired: 'None',
      testDuration: '45 minutes',
      reportTime: '4-6 hours',
      isActive: true,
      bookings: 0
    }
  ],

  // User Management
  patients: [],
  registeredUsers: 0,
};

export const AppProvider = ({ children }) => {
  const [appState, setAppState] = useState(initialAppState);

  // Calculate real-time admin stats from actual data
  const calculateAdminStats = () => {
    const stats = {
      totalUsers: appState.patients.length,
      totalAppointments: appState.appointments.length,
      totalRevenue: appState.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
      activeDoctors: appState.doctors.filter(doc => doc.status === 'Active').length,
      todayAppointments: appState.appointments.filter(apt => {
        const today = new Date().toISOString().split('T')[0];
        return apt.date === today;
      }).length,
      confirmedAppointments: appState.appointments.filter(apt => apt.status === 'confirmed').length,
      pendingAppointments: appState.appointments.filter(apt => apt.status === 'pending').length,
      completedAppointments: appState.appointments.filter(apt => apt.status === 'completed').length,
    };

    setAppState(prev => ({
      ...prev,
      adminStats: stats
    }));
  };

  // Auto-calculate stats when data changes
  useEffect(() => {
    calculateAdminStats();
  }, [appState.appointments, appState.payments, appState.patients, appState.doctors]);

  // ==== APPOINTMENT MANAGEMENT ====
  const addAppointment = (appointmentData) => {
    const newAppointment = {
      id: `apt-${Date.now()}`,
      tokenNumber: `KBR${String(appState.appointments.length + 1).padStart(2, '0')}`,
      status: 'confirmed',
      paymentStatus: appointmentData.paymentType === 'hospital' ? 'pending' : 'paid',
      paymentId: appointmentData.paymentType === 'online' ? `PAY${Date.now()}` : null,
      bookedAt: new Date().toISOString(),
      ...appointmentData,
    };

    setAppState(prev => ({
      ...prev,
      appointments: [...prev.appointments, newAppointment]
    }));

    // Create payment record
    if (appointmentData.paymentType === 'online') {
      addPayment({
        appointmentId: newAppointment.id,
        patientName: appointmentData.patientName,
        amount: appointmentData.amount,
        paymentMethod: 'Online',
        paymentStatus: 'Paid',
        type: 'appointment'
      });
    }

    // Update doctor's today appointments
    updateDoctorAppointmentCount(appointmentData.doctorName);

    return newAppointment;
  };

  const updateAppointmentStatus = (appointmentId, status) => {
    setAppState(prev => ({
      ...prev,
      appointments: prev.appointments.map(apt =>
        apt.id === appointmentId ? { ...apt, status, updatedAt: new Date().toISOString() } : apt
      )
    }));
  };

  const cancelAppointment = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'cancelled');
  };

  // ==== DOCTOR MANAGEMENT ====
  const addDoctor = (doctorData) => {
    const newDoctor = {
      id: `dr-${Date.now()}`,
      status: 'Active',
      todayAppointments: 0,
      ...doctorData
    };

    setAppState(prev => ({
      ...prev,
      doctors: [...prev.doctors, newDoctor]
    }));

    return newDoctor;
  };

  const updateDoctorAppointmentCount = (doctorName) => {
    setAppState(prev => ({
      ...prev,
      doctors: prev.doctors.map(doc =>
        doc.name === doctorName 
          ? { ...doc, todayAppointments: doc.todayAppointments + 1 }
          : doc
      )
    }));
  };

  // ==== PAYMENT MANAGEMENT ====
  const addPayment = (paymentData) => {
    const newPayment = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      ...paymentData
    };

    setAppState(prev => ({
      ...prev,
      payments: [...prev.payments, newPayment]
    }));

    return newPayment;
  };

  // ==== TEST MANAGEMENT ====
  const bookTest = (testId, patientData) => {
    setAppState(prev => ({
      ...prev,
      tests: prev.tests.map(test =>
        test.id === testId
          ? { ...test, bookings: test.bookings + 1 }
          : test
      )
    }));

    // Create payment record for test
    const test = appState.tests.find(t => t.id === testId);
    if (test) {
      addPayment({
        patientName: patientData.patientName,
        amount: test.price,
        paymentMethod: patientData.paymentMethod || 'Online',
        paymentStatus: 'Paid',
        type: 'test',
        testName: test.name
      });
    }
  };

  const addTest = (testData) => {
    const newTest = {
      id: `test-${Date.now()}`,
      isActive: true,
      bookings: 0,
      ...testData
    };

    setAppState(prev => ({
      ...prev,
      tests: [...prev.tests, newTest]
    }));

    return newTest;
  };

  // ==== PATIENT MANAGEMENT ====
  const registerPatient = (patientData) => {
    const newPatient = {
      id: `patient-${Date.now()}`,
      registeredAt: new Date().toISOString(),
      ...patientData
    };

    setAppState(prev => ({
      ...prev,
      patients: [...prev.patients, newPatient],
      registeredUsers: prev.registeredUsers + 1
    }));

    return newPatient;
  };

  // ==== SERVICE MANAGEMENT ====
  const addService = (categoryId, serviceData) => {
    const newService = {
      id: `service-${Date.now()}`,
      ...serviceData
    };

    setAppState(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [categoryId]: [...(prev.services[categoryId] || []), newService]
      }
    }));

    return newService;
  };

  const contextValue = {
    // State
    appState,
    
    // Admin Stats (real-time calculated)
    adminStats: appState.adminStats,
    
    // Shared Data
    appointments: appState.appointments,
    doctors: appState.doctors,  
    payments: appState.payments,
    tests: appState.tests,
    patients: appState.patients,
    services: appState.services,

    // Appointment Methods
    addAppointment,
    updateAppointmentStatus,
    cancelAppointment,

    // Doctor Methods
    addDoctor,
    updateDoctorAppointmentCount,

    // Payment Methods
    addPayment,

    // Test Methods
    bookTest,
    addTest,

    // Patient Methods
    registerPatient,

    // Service Methods
    addService,

    // Utility Methods
    calculateAdminStats,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;