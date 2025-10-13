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
  payments: [
    {
      id: 'INV-2024-001',
      patientId: 'KBR-IP-2024-001',
      patientName: 'Rajesh Kumar',
      date: '2024-01-15',
      time: '10:30 AM',
      amount: 1200,
      description: 'Consultation Fee - Dr. K. Ramesh',
      type: 'consultation',
      status: 'paid',
      paymentMethod: 'Online',
      transactionId: 'TXN123456789',
      items: [
        { name: 'Doctor Consultation', amount: 800 },
        { name: 'Registration Fee', amount: 200 },
        { name: 'Medical Records', amount: 200 }
      ]
    },
    {
      id: 'INV-2024-002',
      patientId: 'KBR-IP-2024-001',
      patientName: 'Rajesh Kumar',
      date: '2024-01-16',
      time: '02:15 PM',
      amount: 15000,
      description: 'Room Charges & Medications',
      type: 'admission',
      status: 'paid',
      paymentMethod: 'Card',
      transactionId: 'TXN123456790',
      items: [
        { name: 'Room Charges (3 days)', amount: 9000 },
        { name: 'Medications', amount: 3500 },
        { name: 'Nursing Care', amount: 2000 },
        { name: 'Service Charges', amount: 500 }
      ]
    },
    {
      id: 'INV-2024-003',
      patientId: 'KBR-OP-2024-501',
      patientName: 'Priya Sharma',
      date: '2024-01-18',
      time: '11:45 AM',
      amount: 800,
      description: 'Gynecology Consultation',
      type: 'consultation',
      status: 'paid',
      paymentMethod: 'Cash',
      transactionId: 'TXN123456791',
      items: [
        { name: 'Gynecology Consultation', amount: 600 },
        { name: 'Prescription', amount: 200 }
      ]
    },
    {
      id: 'INV-2024-004',
      patientId: 'KBR-IP-2024-002',
      patientName: 'Amit Patel',
      date: '2024-01-20',
      time: '09:20 AM',
      amount: 2500,
      description: 'Orthopedic Surgery',
      type: 'surgery',
      status: 'pending',
      paymentMethod: 'Cash',
      transactionId: null,
      items: [
        { name: 'Surgery Fee', amount: 2000 },
        { name: 'Anesthesia', amount: 300 },
        { name: 'OT Charges', amount: 200 }
      ]
    },
  ],
  
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
  patients: [
    {
      id: 'KBR-IP-2024-001',
      name: 'Rajesh Kumar',
      age: 45,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+91 98765 43210',
      emergencyContact: '+91 98765 43211',
      address: 'Hyderabad, Telangana',
      doctor: 'Dr. K. Ramesh',
      department: 'Cardiology',
      referredBy: 'Dr. Suresh (City Hospital)',
      symptoms: 'Chest pain and shortness of breath',
      allergies: 'Penicillin',
      patientType: 'IP',
      status: 'IP',
      statusText: 'Admitted',
      statusColor: '#007AFF',
      room: '201',
      bedNo: 'A1',
      admissionDate: '2024-01-05',
      registrationDate: '2024-01-05',
      registrationTime: '09:30 AM',
      medicalReports: [],
      editHistory: [{
        action: 'created',
        timestamp: '2024-01-05T09:30:00Z',
        details: 'Patient registered and admitted',
      }],
    },
    {
      id: 'KBR-OP-2024-501',
      name: 'Priya Sharma',
      age: 32,
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+91 98765 43220',
      emergencyContact: '+91 98765 43221',
      address: 'Secunderabad, Telangana',
      doctor: 'Dr. K. Divyasri',
      department: 'Gynecology',
      referredBy: 'Self',
      symptoms: 'Regular checkup',
      allergies: 'None',
      patientType: 'OP',
      status: 'OP',
      statusText: 'Consultation',
      statusColor: '#34C759',
      registrationDate: '2024-01-10',
      registrationTime: '11:15 AM',
      medicalReports: [],
      editHistory: [{
        action: 'created',
        timestamp: '2024-01-10T11:15:00Z',
        details: 'Patient registered for consultation',
      }],
    },
    {
      id: 'KBR-IP-2024-002',
      name: 'Amit Patel',
      age: 55,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+91 98765 43230',
      emergencyContact: '+91 98765 43231',
      address: 'Begumpet, Hyderabad',
      doctor: 'Dr. Mahesh Kumar',
      department: 'Orthopedics',
      referredBy: 'Dr. Ravi (Apollo Hospital)',
      symptoms: 'Knee joint pain and stiffness',
      allergies: 'Aspirin',
      patientType: 'IP',
      status: 'IP',
      statusText: 'Under Treatment',
      statusColor: '#FF9500',
      room: '305',
      bedNo: 'B2',
      admissionDate: '2024-01-08',
      registrationDate: '2024-01-08',
      registrationTime: '02:45 PM',
      medicalReports: [],
      editHistory: [{
        action: 'created',
        timestamp: '2024-01-08T14:45:00Z',
        details: 'Patient registered and admitted for orthopedic treatment',
      }],
    },
  ],
  registeredUsers: 3,
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

  // Auto-calculate stats when data changes - using lengths to avoid infinite loops
  useEffect(() => {
    calculateAdminStats();
  }, [
    appState.appointments.length, 
    appState.payments.length, 
    appState.patients.length, 
    appState.doctors.length
  ]);

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
    // Generate unique invoice ID
    const invoiceCount = appState.payments.length + 1;
    const newPayment = {
      id: `INV-2024-${invoiceCount.toString().padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      }),
      ...paymentData
    };

    setAppState(prev => ({
      ...prev,
      payments: [...prev.payments, newPayment]
    }));

    return newPayment;
  };

  const updatePaymentStatus = (paymentId, newStatus, transactionId = null) => {
    setAppState(prev => ({
      ...prev,
      payments: prev.payments.map(payment =>
        payment.id === paymentId
          ? { 
              ...payment, 
              status: newStatus,
              ...(transactionId && { transactionId })
            }
          : payment
      )
    }));
  };

  const deletePayment = (paymentId) => {
    setAppState(prev => ({
      ...prev,
      payments: prev.payments.filter(payment => payment.id !== paymentId)
    }));
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

  const addPatient = (patientData) => {
    const newPatient = {
      ...patientData,
      registeredAt: new Date().toISOString(),
    };

    setAppState(prev => ({
      ...prev,
      patients: [...prev.patients, newPatient],
      registeredUsers: prev.registeredUsers + 1
    }));

    return newPatient;
  };

  const updatePatient = (patientId, updatedData) => {
    setAppState(prev => ({
      ...prev,
      patients: prev.patients.map(patient =>
        patient.id === patientId ? { ...patient, ...updatedData } : patient
      )
    }));
  };

  const deletePatient = (patientId) => {
    setAppState(prev => ({
      ...prev,
      patients: prev.patients.filter(patient => patient.id !== patientId),
      registeredUsers: prev.registeredUsers - 1
    }));
  };

  // ==== PATIENT PAYMENT MANAGEMENT ====
  const addPatientPayment = (patientId, paymentData) => {
    setAppState(prev => ({
      ...prev,
      patients: prev.patients.map(patient => {
        if (patient.id === patientId && patient.paymentDetails) {
          const newPayment = {
            id: `PAY-${Date.now()}-${patient.paymentDetails.payments.length + 1}`,
            amount: parseFloat(paymentData.amount),
            type: paymentData.type,
            method: paymentData.method,
            date: paymentData.date || new Date().toISOString().split('T')[0],
            time: paymentData.time || new Date().toLocaleTimeString(),
            description: paymentData.description,
            transactionId: paymentData.transactionId || null,
          };

          const updatedPayments = [...patient.paymentDetails.payments, newPayment];
          const totalPaid = updatedPayments.reduce((sum, payment) => sum + payment.amount, 0);
          const dueAmount = patient.paymentDetails.totalAmount - totalPaid;

          return {
            ...patient,
            paymentDetails: {
              ...patient.paymentDetails,
              payments: updatedPayments,
              totalPaid: totalPaid,
              dueAmount: dueAmount,
              lastPaymentDate: newPayment.date,
            },
            editHistory: [
              ...patient.editHistory,
              {
                action: 'payment_added',
                timestamp: new Date().toISOString(),
                details: `Payment added: ₹${newPayment.amount} via ${newPayment.method}`,
              }
            ]
          };
        }
        return patient;
      })
    }));
  };

  const getPatientPaymentSummary = (patientId) => {
    const patient = appState.patients.find(p => p.id === patientId);
    if (!patient || !patient.paymentDetails) {
      return null;
    }

    return {
      patientId: patient.id,
      patientName: patient.name,
      totalAmount: patient.paymentDetails.totalAmount,
      totalPaid: patient.paymentDetails.totalPaid,
      dueAmount: patient.paymentDetails.dueAmount,
      payments: patient.paymentDetails.payments,
      paymentStatus: patient.paymentDetails.dueAmount <= 0 ? 'Fully Paid' : 
                    patient.paymentDetails.totalPaid > 0 ? 'Partially Paid' : 'Pending',
    };
  };

  const getAllPendingPayments = () => {
    return appState.patients
      .filter(patient => patient.paymentDetails && patient.paymentDetails.dueAmount > 0)
      .map(patient => ({
        patientId: patient.id,
        patientName: patient.name,
        patientType: patient.patientType,
        totalAmount: patient.paymentDetails.totalAmount,
        totalPaid: patient.paymentDetails.totalPaid,
        dueAmount: patient.paymentDetails.dueAmount,
        lastPaymentDate: patient.paymentDetails.lastPaymentDate,
      }));
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
    updatePaymentStatus,
    deletePayment,

    // Test Methods
    bookTest,
    addTest,

    // Patient Methods
    registerPatient,
    addPatient,
    updatePatient,
    deletePatient,

    // Patient Payment Methods
    addPatientPayment,
    getPatientPaymentSummary,
    getAllPendingPayments,

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