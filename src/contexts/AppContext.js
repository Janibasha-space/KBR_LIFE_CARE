import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { 
  InvoiceService, 
  PaymentService, 
  DischargeService, 
  ReportService 
} from '../services/hospitalServices';
import { 
  FirebaseHospitalService, 
  FirebaseAppointmentService,
  FirebasePatientService,
  FirebaseRoomService
} from '../services/firebaseHospitalServices';
import { SimpleBookingService } from '../services/simpleBookingService';

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

  // Shared Appointments (loaded from Firebase/real bookings only)
  appointments: [],

  // Hospital Admissions (patient admission records)
  admissions: [],

  // Test Appointments (lab tests, diagnostics)
  testAppointments: [],

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

  // Invoice Management (separate from payments)
  invoices: [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2024-001',
      patientId: 'KBR-IP-2024-001',
      patientName: 'Rajesh Kumar',
      description: 'Medical Consultation & Lab Tests',
      issueDate: '2024-01-15',
      dueDate: '2024-02-14',
      status: 'paid',
      totalAmount: 2500,
      items: [
        { name: 'Doctor Consultation', description: 'General checkup', quantity: 1, rate: 800, amount: 800 },
        { name: 'Blood Test - CBC', description: 'Complete blood count', quantity: 1, rate: 350, amount: 350 },
        { name: 'X-Ray Chest', description: 'Chest X-ray examination', quantity: 1, rate: 300, amount: 300 },
        { name: 'ECG', description: 'Electrocardiogram', quantity: 1, rate: 200, amount: 200 },
        { name: 'Registration Fee', description: 'Hospital registration', quantity: 1, rate: 200, amount: 200 },
        { name: 'Medical Records', description: 'Patient file setup', quantity: 1, rate: 150, amount: 150 },
        { name: 'Service Charges', description: 'Administrative charges', quantity: 1, rate: 500, amount: 500 }
      ],
      notes: 'Follow-up required after 2 weeks',
      terms: 'Payment due within 30 days',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2024-002',
      patientId: 'KBR-OP-2024-501',
      patientName: 'Priya Sharma',
      description: 'Gynecology Consultation & Tests',
      issueDate: '2024-01-18',
      dueDate: '2024-02-17',
      status: 'pending',
      totalAmount: 1800,
      items: [
        { name: 'Gynecology Consultation', description: 'Specialist consultation', quantity: 1, rate: 700, amount: 700 },
        { name: 'Ultrasound', description: 'Pelvic ultrasound', quantity: 1, rate: 800, amount: 800 },
        { name: 'Lab Tests', description: 'Hormonal analysis', quantity: 1, rate: 300, amount: 300 }
      ],
      notes: 'Regular checkup recommended',
      terms: 'Payment due within 30 days',
      createdAt: '2024-01-18T11:45:00Z',
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-2024-003',
      patientId: 'KBR-IP-2024-002',
      patientName: 'Amit Patel',
      description: 'Orthopedic Surgery & Treatment',
      issueDate: '2024-01-20',
      dueDate: '2024-02-19',
      status: 'overdue',
      totalAmount: 25000,
      items: [
        { name: 'Orthopedic Surgery', description: 'Knee replacement surgery', quantity: 1, rate: 20000, amount: 20000 },
        { name: 'Anesthesia', description: 'General anesthesia', quantity: 1, rate: 2000, amount: 2000 },
        { name: 'OT Charges', description: 'Operation theater charges', quantity: 1, rate: 1500, amount: 1500 },
        { name: 'Post-op Care', description: '3 days monitoring', quantity: 3, rate: 500, amount: 1500 }
      ],
      notes: 'Surgery completed successfully. Follow-up in 1 week.',
      terms: 'Payment due within 30 days. Insurance claims accepted.',
      createdAt: '2024-01-20T09:20:00Z',
    }
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

  // Reports Management (Medical Reports for Patients)
  reports: [
    {
      id: 'RPT001',
      type: 'Blood Test Results',
      patientId: 'KBR-IP-2024-001',
      patientName: 'Rajesh Kumar',
      patientPhone: '+91 98765 43210',
      doctorId: 'dr-ramesh',
      doctorName: 'Dr. K. Ramesh',
      date: '2024-10-12',
      time: '10:30 AM',
      status: 'available',
      files: [
        {
          id: 'file_001',
          name: 'blood_test_report.jpg',
          type: 'image',
          uri: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80',
          size: 2400000, // 2.4 MB in bytes
          mimeType: 'image/jpeg',
          uploadedAt: '2024-10-12T10:30:00Z'
        }
      ],
      notes: 'CBC report showing normal values. Follow-up recommended in 3 months.',
      createdAt: '2024-10-12T10:30:00Z',
      updatedAt: '2024-10-12T10:30:00Z',
      sentToPatient: true,
      sentAt: '2024-10-12T11:00:00Z',
      viewedByPatient: false,
      category: 'Laboratory',
      priority: 'normal',
      icon: 'B',
      iconColor: '#3B82F6',
      bgColor: '#EBF4FF'
    },
    {
      id: 'RPT002',
      type: 'Ultrasound Report',
      patientId: 'KBR-OP-2024-501',
      patientName: 'Priya Sharma',
      patientPhone: '+91 98765 43220',
      doctorId: 'dr-divyavani',
      doctorName: 'Dr. K. Divyavani',
      date: '2024-10-11',
      time: '02:15 PM',
      status: 'available',
      files: [
        {
          id: 'file_002',
          name: 'ultrasound_report.pdf',
          type: 'document',
          uri: 'https://example.com/ultrasound_report.pdf',
          size: 5350000, // 5.35 MB
          mimeType: 'application/pdf',
          uploadedAt: '2024-10-11T14:15:00Z'
        }
      ],
      notes: 'Pelvic ultrasound showing normal findings. Regular monitoring suggested.',
      createdAt: '2024-10-11T14:15:00Z',
      updatedAt: '2024-10-11T14:15:00Z',
      sentToPatient: true,
      sentAt: '2024-10-11T15:00:00Z',
      viewedByPatient: true,
      viewedAt: '2024-10-11T16:30:00Z',
      category: 'Radiology',
      priority: 'normal',
      icon: 'U',
      iconColor: '#8B5CF6',
      bgColor: '#F3F0FF'
    },
    {
      id: 'RPT003',
      type: 'X-Ray Report',
      patientId: 'KBR-IP-2024-002',
      patientName: 'Amit Patel',
      patientPhone: '+91 98765 43230',
      doctorId: 'dr-ramesh',
      doctorName: 'Dr. K. Ramesh',
      date: '2024-10-10',
      time: '09:45 AM',
      status: 'available',
      files: [
        {
          id: 'file_003',
          name: 'xray_knee_joint.jpg',
          type: 'image',
          uri: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80',
          size: 1880000, // 1.88 MB
          mimeType: 'image/jpeg',
          uploadedAt: '2024-10-10T09:45:00Z'
        }
      ],
      notes: 'Knee X-ray showing mild arthritis. Physical therapy recommended.',
      createdAt: '2024-10-10T09:45:00Z',
      updatedAt: '2024-10-10T09:45:00Z',
      sentToPatient: false,
      sentAt: null,
      viewedByPatient: false,
      category: 'Radiology',
      priority: 'high',
      icon: 'X',
      iconColor: '#10B981',
      bgColor: '#ECFDF5'
    }
  ],

  // User Management (will be loaded from Firebase)
  patients: [],
  registeredUsers: 0,

  // Room Management (Hospital Rooms) - Real-time data from Firebase
  rooms: [],
};

// Helper function to remove duplicates by ID
const removeDuplicatesById = (items, type) => {
  const uniqueItems = [];
  const seenIds = new Set();
  
  for (const item of items) {
    if (!seenIds.has(item.id)) {
      uniqueItems.push(item);
      seenIds.add(item.id);
    }
  }
  
  if (items.length !== uniqueItems.length) {
    console.warn(`⚠️ Removed ${items.length - uniqueItems.length} duplicate ${type}`);
  }
  
  return uniqueItems;
};

export const AppProvider = ({ children }) => {
  const [appState, setAppState] = useState(initialAppState);
  const [useBackend, setUseBackend] = useState(true); // Firebase backend integration
  const [isLoading, setIsLoading] = useState(false);

  // Real-time listeners cleanup functions
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState({});

  // Initialize data from Firebase - handle both authenticated and unauthenticated access
  const initializeFirebaseData = async () => {
    if (!useBackend) return;
    
    // Check if user is authenticated before attempting data fetch
    const { auth } = require('../config/firebase.config');
    const currentUser = auth.currentUser;
    
    setIsLoading(true);
    console.log('📊 Loading Firebase data...' + (currentUser ? ' (authenticated)' : ' (unauthenticated - public data only)'));
    
    try {
      // Clean up existing real-time listeners first
      Object.values(unsubscribeFunctions).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });

      // Only set up real-time listeners if user is authenticated
      const newUnsubscribeFunctions = {};
      
      if (currentUser) {
        console.log('🔄 Setting up real-time listeners for authenticated user...');
        
        // Real-time rooms listener
        console.log('🔄 Setting up rooms real-time listener...');
        const roomsUnsubscribe = FirebaseRoomService.subscribeToRooms((result) => {
          if (result.success) {
            console.log(`🏠 Real-time rooms update: ${result.data.length} rooms`);
            setAppState(prev => ({
              ...prev,
              rooms: removeDuplicatesById(result.data, 'rooms')
            }));
          }
        });
        if (roomsUnsubscribe) newUnsubscribeFunctions.rooms = roomsUnsubscribe;

        // Real-time patients listener  
        console.log('🔄 Setting up patients real-time listener...');
        const patientsUnsubscribe = FirebasePatientService.subscribeToPatients((result) => {
          if (result.success) {
            console.log(`👥 Real-time patients update: ${result.data.length} patients`);
            setAppState(prev => ({
              ...prev,
              patients: removeDuplicatesById(result.data, 'patients')
            }));
          }
        });
        if (patientsUnsubscribe) newUnsubscribeFunctions.patients = patientsUnsubscribe;

        // Store unsubscribe functions
        setUnsubscribeFunctions(newUnsubscribeFunctions);
      } else {
        console.log('👤 User not authenticated - skipping real-time listeners, using one-time fetch');
      }

      // Load other data that doesn't need real-time updates (one-time fetch)
      const results = await Promise.allSettled([
        InvoiceService.getAllInvoices(), 
        PaymentService.getAllPayments(),
        ReportService.getAllReports(),
        SimpleBookingService.getAllAppointments()
      ]);

      // Map results to variables with safe fallbacks and better error logging
      const serviceNames = ['invoices', 'payments', 'reports', 'appointments'];
      const mapResult = (index) => {
        const res = results[index];
        const serviceName = serviceNames[index];
        
        if (res && res.status === 'fulfilled') {
          const data = res.value?.data || res.value || [];
          console.log(`✅ ${serviceName}: loaded ${Array.isArray(data) ? data.length : 'N/A'} items`);
          return data;
        } else {
          const errorMessage = res?.reason?.message || res?.reason || 'Unknown error';
          console.warn(`⚠️ Service ${serviceName} failed to load: ${errorMessage}`);
          return [];
        }
      };

      const invoices = mapResult(0);
      const payments = mapResult(1);
      const reports = mapResult(2);
      const appointments = mapResult(3);

      // Update state with non-real-time data
      setAppState(prev => ({
        ...prev,
        // rooms and patients are handled by real-time listeners above
        invoices: invoices || prev.invoices,
        payments: payments || prev.payments,
        reports: reports || prev.reports,
        appointments: appointments || prev.appointments
      }));

      console.log('✅ Firebase data loaded (partial failures tolerated)');
      console.log(`📋 Loaded ${appointments?.length || 0} appointments`);
    } catch (error) {
      if (error.message.includes('Authentication required')) {
        console.log('🔐 Firebase data loading completed with authentication limitations');
      } else {
        console.error('❌ Error during Firebase data loading:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time listeners after authentication
  const setupRealTimeListeners = () => {
    const { auth } = require('../config/firebase.config');
    const currentUser = auth.currentUser;
    
    if (!useBackend || !currentUser) return;
    
    console.log('🔄 Setting up real-time listeners for authenticated user...');
    
    try {
      // Clean up existing listeners first
      Object.values(unsubscribeFunctions).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });

      const newUnsubscribeFunctions = {};

      // Real-time rooms listener
      console.log('🔄 Setting up rooms real-time listener...');
      const roomsUnsubscribe = FirebaseRoomService.subscribeToRooms((result) => {
        if (result.success) {
          console.log(`🏠 Real-time rooms update: ${result.data.length} rooms`);
          setAppState(prev => ({
            ...prev,
            rooms: removeDuplicatesById(result.data, 'rooms')
          }));
        }
      });
      if (roomsUnsubscribe) newUnsubscribeFunctions.rooms = roomsUnsubscribe;

      // Real-time patients listener  
      console.log('🔄 Setting up patients real-time listener...');
      const patientsUnsubscribe = FirebasePatientService.subscribeToPatients((result) => {
        if (result.success) {
          console.log(`👥 Real-time patients update: ${result.data.length} patients`);
          setAppState(prev => ({
            ...prev,
            patients: removeDuplicatesById(result.data, 'patients')
          }));
        }
      });
      if (patientsUnsubscribe) newUnsubscribeFunctions.patients = patientsUnsubscribe;

      // Store unsubscribe functions
      setUnsubscribeFunctions(newUnsubscribeFunctions);
      
      console.log('✅ Real-time listeners setup complete');
    } catch (error) {
      console.error('❌ Error setting up real-time listeners:', error);
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (useBackend) {
      initializeFirebaseData();
    }
    
    // Cleanup listeners on unmount
    return () => {
      console.log('🧹 Cleaning up real-time listeners...');
      Object.values(unsubscribeFunctions).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [useBackend]);

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
  const addAppointment = async (appointmentData) => {
    try {
      console.log('📱 AppContext: Booking appointment via Firebase service...');
      console.log('📋 AppContext: Appointment data received:', appointmentData);
      
      // Use Simple Booking service for testing (switch back to FirebaseHospitalService when auth is fixed)
      const result = await SimpleBookingService.bookAppointment(appointmentData);
      console.log('🔥 Booking service result:', result);
      
      if (result.success) {
        // Update local state with the new appointment
        const newAppointment = result.data;
        
        setAppState(prev => ({
          ...prev,
          appointments: [...prev.appointments, newAppointment]
        }));

        // Create payment record if online payment
        if (appointmentData.paymentType === 'online') {
          try {
            addPayment({
              appointmentId: newAppointment.id,
              patientId: newAppointment.patientId,
              amount: appointmentData.totalAmount || appointmentData.amount || 0,
              method: 'online',
              status: 'paid',
              date: new Date().toISOString(),
              description: `Payment for appointment ${newAppointment.tokenNumber}`
            });
          } catch (paymentError) {
            console.warn('⚠️ Payment record creation failed:', paymentError);
            // Don't fail the whole booking if payment record fails
          }
        }

        console.log(`✅ AppContext: Appointment booked successfully with token: ${newAppointment.tokenNumber}`);
        return newAppointment;
      } else {
        console.error('❌ Booking failed:', result);
        throw new Error(result.message || 'Failed to book appointment');
      }

    } catch (error) {
      console.error('❌ AppContext: Error booking appointment:', error);
      throw error;
    }
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

  // Load appointments from database
  const loadAppointments = async () => {
    try {
      console.log('📋 Loading appointments from database...');
      
      // Use FirebaseAppointmentService for consistency with the management screen
      const result = await FirebaseAppointmentService.getAppointments();
      const appointments = result.success ? result.data : [];
      
      setAppState(prev => ({
        ...prev,
        appointments: appointments || []
      }));
      
      console.log(`✅ Loaded ${appointments?.length || 0} appointments from database`);
      return appointments;
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      return [];
    }
  };

  const refreshAppointmentData = async () => {
    console.log('🔄 Refreshing appointment data...');
    await loadAppointments();
  };

  // Force refresh global appointments (called when appointments are added/updated)
  const forceRefreshAppointments = async () => {
    console.log('🔥 Force refreshing global appointment data...');
    await loadAppointments();
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

  const updateDoctor = (doctorId, updatedData) => {
    setAppState(prev => ({
      ...prev,
      doctors: prev.doctors.map(doc =>
        doc.id === doctorId ? { ...doc, ...updatedData } : doc
      )
    }));
  };

  const deleteDoctor = (doctorId) => {
    setAppState(prev => ({
      ...prev,
      doctors: prev.doctors.filter(doc => doc.id !== doctorId)
    }));
  };

  // ==== ROOM MANAGEMENT ====
  const addRoom = async (roomData) => {
    try {
      const result = await FirebaseRoomService.addRoom(roomData);
      if (result.success) {
        console.log('✅ Room added successfully:', result.data.id);
        // Real-time listener will automatically update the state
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to add room');
      }
    } catch (error) {
      console.error('Error adding room:', error);
      throw error;
    }
  };

  const updateRoom = async (roomId, updatedData) => {
    try {
      const result = await FirebaseRoomService.updateRoom(roomId, updatedData);
      if (result.success) {
        console.log('✅ Room updated successfully:', roomId);
        // Real-time listener will automatically update the state
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update room');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      const result = await FirebaseRoomService.deleteRoom(roomId);
      if (result.success) {
        console.log('✅ Room deleted successfully:', roomId);
        // Real-time listener will automatically update the state
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  };
      // Fallback to local state


  const dischargePatient = async (roomId) => {
    try {
      const result = await FirebaseRoomService.dischargePatient(roomId);
      if (result.success) {
        console.log('✅ Patient discharged successfully from room:', roomId);
        // Real-time listener will automatically update the state
        return true;
      } else {
        throw new Error(result.error || 'Failed to discharge patient');
      }
    } catch (error) {
      console.error('Error discharging patient:', error);
      throw error;
    }
  };

  const assignPatientToRoom = async (roomId, patientData) => {
    if (useBackend) {
      try {
        await FirebaseRoomService.assignPatient(roomId, patientData);
        setAppState(prev => ({
          ...prev,
          rooms: prev.rooms.map(room =>
            room.id === roomId ? {
              ...room,
              status: 'Occupied',
              statusColor: '#EF4444',
              patientName: patientData.name,
              patientId: patientData.id,
              admissionDate: new Date().toISOString().split('T')[0],
              assignedAt: new Date().toISOString()
            } : room
          )
        }));
      } catch (error) {
        console.error('Error assigning patient to room:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room =>
          room.id === roomId ? {
            ...room,
            status: 'Occupied',
            statusColor: '#EF4444',
            patientName: patientData.name,
            patientId: patientData.id,
            admissionDate: new Date().toISOString().split('T')[0],
            assignedAt: new Date().toISOString()
          } : room
        )
      }));
    }
  };

  // ==== BED MANAGEMENT ====
  // Generate bed labels for a room based on totalBeds and room type
  const generateBedLabels = (totalBeds, roomType, roomNumber) => {
    const labels = [];
    
    if (roomType === 'ICU') {
      for (let i = 1; i <= totalBeds; i++) {
        labels.push(`ICU-${i}`);
      }
    } else if (roomType === 'Private Room') {
      labels.push('Single');
    } else {
      // General Ward - use room number prefix
      const prefix = roomNumber.charAt(0); // Get first character of room number (1 for 101, 2 for 201)
      for (let i = 1; i <= totalBeds; i++) {
        labels.push(`${prefix}${i}`);
      }
    }
    
    return labels;
  };

  // Get available beds for a room
  const getAvailableBeds = (roomId) => {
    const room = appState.rooms.find(r => r.id === roomId);
    if (!room) return [];
    
    // If room is under maintenance, no beds available
    if (room.status === 'Under Maintenance' || room.status === 'Out of Order') {
      return [];
    }
    
    return room.availableBeds || [];
  };

  // Get occupied beds for a room
  const getOccupiedBeds = (roomId) => {
    const room = appState.rooms.find(r => r.id === roomId);
    return room?.occupiedBeds || [];
  };

  // Assign a patient to a specific bed
  const assignPatientToBed = async (roomId, bedNumber, patientData) => {
    if (useBackend) {
      try {
        // Update Firebase with bed assignment
        await FirebaseRoomService.assignPatientToBed(roomId, bedNumber, patientData);
        
        setAppState(prev => ({
          ...prev,
          rooms: prev.rooms.map(room => {
            if (room.id === roomId) {
              const newOccupiedBeds = [...(room.occupiedBeds || []), {
                bedNumber,
                patientName: patientData.name,
                patientId: patientData.id,
                admissionDate: new Date().toISOString().split('T')[0]
              }];
              
              const newAvailableBeds = (room.availableBeds || []).filter(bed => bed !== bedNumber);
              
              // Update room status based on bed occupancy
              let newStatus = 'Available';
              let newStatusColor = '#10B981';
              
              if (newOccupiedBeds.length === room.totalBeds) {
                newStatus = 'Occupied';
                newStatusColor = '#EF4444';
              } else if (newOccupiedBeds.length > 0) {
                newStatus = 'Partially Occupied';
                newStatusColor = '#F59E0B';
              }
              
              return {
                ...room,
                occupiedBeds: newOccupiedBeds,
                availableBeds: newAvailableBeds,
                status: newStatus,
                statusColor: newStatusColor
              };
            }
            return room;
          })
        }));
        
      } catch (error) {
        console.error('Error assigning patient to bed:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => {
          if (room.id === roomId) {
            const newOccupiedBeds = [...(room.occupiedBeds || []), {
              bedNumber,
              patientName: patientData.name,
              patientId: patientData.id,
              admissionDate: new Date().toISOString().split('T')[0]
            }];
            
            const newAvailableBeds = (room.availableBeds || []).filter(bed => bed !== bedNumber);
            
            // Update room status based on bed occupancy
            let newStatus = 'Available';
            let newStatusColor = '#10B981';
            
            if (newOccupiedBeds.length === room.totalBeds) {
              newStatus = 'Occupied';
              newStatusColor = '#EF4444';
            } else if (newOccupiedBeds.length > 0) {
              newStatus = 'Partially Occupied';
              newStatusColor = '#F59E0B';
            }
            
            return {
              ...room,
              occupiedBeds: newOccupiedBeds,
              availableBeds: newAvailableBeds,
              status: newStatus,
              statusColor: newStatusColor
            };
          }
          return room;
        })
      }));
    }
  };

  // Release a patient from a specific bed (for discharge)
  const releasePatientFromBed = async (roomId, bedNumber, patientId) => {
    if (useBackend) {
      try {
        await FirebaseRoomService.releasePatientFromBed(roomId, bedNumber, patientId);
        
        setAppState(prev => ({
          ...prev,
          rooms: prev.rooms.map(room => {
            if (room.id === roomId) {
              const newOccupiedBeds = (room.occupiedBeds || []).filter(
                bed => bed.bedNumber !== bedNumber || bed.patientId !== patientId
              );
              
              const newAvailableBeds = [...(room.availableBeds || []), bedNumber];
              
              // Update room status based on bed occupancy
              let newStatus = 'Available';
              let newStatusColor = '#10B981';
              
              if (newOccupiedBeds.length === room.totalBeds) {
                newStatus = 'Occupied';
                newStatusColor = '#EF4444';
              } else if (newOccupiedBeds.length > 0) {
                newStatus = 'Partially Occupied';
                newStatusColor = '#F59E0B';
              }
              
              return {
                ...room,
                occupiedBeds: newOccupiedBeds,
                availableBeds: newAvailableBeds,
                status: newStatus,
                statusColor: newStatusColor
              };
            }
            return room;
          })
        }));
        
      } catch (error) {
        console.error('Error releasing patient from bed:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => {
          if (room.id === roomId) {
            const newOccupiedBeds = (room.occupiedBeds || []).filter(
              bed => bed.bedNumber !== bedNumber || bed.patientId !== patientId
            );
            
            const newAvailableBeds = [...(room.availableBeds || []), bedNumber];
            
            // Update room status based on bed occupancy
            let newStatus = 'Available';
            let newStatusColor = '#10B981';
            
            if (newOccupiedBeds.length === room.totalBeds) {
              newStatus = 'Occupied';
              newStatusColor = '#EF4444';
            } else if (newOccupiedBeds.length > 0) {
              newStatus = 'Partially Occupied';
              newStatusColor = '#F59E0B';
            }
            
            return {
              ...room,
              occupiedBeds: newOccupiedBeds,
              availableBeds: newAvailableBeds,
              status: newStatus,
              statusColor: newStatusColor
            };
          }
          return room;
        })
      }));
    }
  };

  // Get rooms with available beds (for patient registration)
  const getAvailableRooms = () => {
    return appState.rooms.filter(room => {
      // Exclude rooms under maintenance or out of order
      if (room.status === 'Under Maintenance' || room.status === 'Out of Order') {
        return false;
      }
      
      // Include rooms that have available beds
      return (room.availableBeds || []).length > 0;
    });
  };

  // ==== PAYMENT MANAGEMENT ====
  const addPayment = async (paymentData) => {
    if (useBackend) {
      try {
        const newPayment = await PaymentService.processPayment(paymentData);
        setAppState(prev => ({
          ...prev,
          payments: [...prev.payments, newPayment]
        }));
        return newPayment;
      } catch (error) {
        console.error('Error adding payment:', error);
        throw error;
      }
    } else {
      // Fallback to local state - Generate unique invoice ID
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
    }
  };

  const updatePaymentStatus = async (paymentId, newStatus, transactionId = null) => {
    if (useBackend) {
      try {
        await PaymentService.updatePaymentStatus(paymentId, newStatus);
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
      } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
      }
    } else {
      // Fallback to local state
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
    }
  };

  const deletePayment = async (paymentId) => {
    if (useBackend) {
      try {
        await PaymentService.deletePayment(paymentId);
        setAppState(prev => ({
          ...prev,
          payments: prev.payments.filter(payment => payment.id !== paymentId)
        }));
      } catch (error) {
        console.error('Error deleting payment:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        payments: prev.payments.filter(payment => payment.id !== paymentId)
      }));
    }
  };

  const getPaymentsByPatient = async (patientId) => {
    if (useBackend) {
      try {
        return await PaymentService.getPaymentsByPatient(patientId);
      } catch (error) {
        console.error('Error getting payments by patient:', error);
        return [];
      }
    } else {
      return appState.payments.filter(payment => payment.patientId === patientId);
    }
  };

  const getPendingPayments = () => {
    return appState.payments.filter(payment => payment.status === 'pending');
  };

  // ==== INVOICE MANAGEMENT ====
  const addInvoice = async (invoiceData) => {
    if (useBackend) {
      try {
        const newInvoice = await InvoiceService.createInvoice(invoiceData);
        setAppState(prev => ({
          ...prev,
          invoices: [...prev.invoices, newInvoice]
        }));
        return newInvoice;
      } catch (error) {
        console.error('Error adding invoice:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      const newInvoice = {
        id: `inv-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...invoiceData
      };

      setAppState(prev => ({
        ...prev,
        invoices: [...prev.invoices, newInvoice]
      }));

      return newInvoice;
    }
  };

  const updateInvoiceStatus = async (invoiceId, newStatus) => {
    if (useBackend) {
      try {
        await InvoiceService.updateInvoiceStatus(invoiceId, newStatus);
        setAppState(prev => ({
          ...prev,
          invoices: prev.invoices.map(invoice =>
            invoice.id === invoiceId
              ? { ...invoice, status: newStatus, updatedAt: new Date().toISOString() }
              : invoice
          )
        }));
      } catch (error) {
        console.error('Error updating invoice status:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        invoices: prev.invoices.map(invoice =>
          invoice.id === invoiceId
            ? { ...invoice, status: newStatus, updatedAt: new Date().toISOString() }
            : invoice
        )
      }));
    }
  };

  const deleteInvoice = async (invoiceId) => {
    if (useBackend) {
      try {
        await InvoiceService.deleteInvoice(invoiceId);
        setAppState(prev => ({
          ...prev,
          invoices: prev.invoices.filter(invoice => invoice.id !== invoiceId)
        }));
      } catch (error) {
        console.error('Error deleting invoice:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        invoices: prev.invoices.filter(invoice => invoice.id !== invoiceId)
      }));
    }
  };

  const updateInvoice = async (invoiceId, updatedData) => {
    if (useBackend) {
      try {
        await InvoiceService.updateInvoice(invoiceId, updatedData);
        setAppState(prev => ({
          ...prev,
          invoices: prev.invoices.map(invoice =>
            invoice.id === invoiceId
              ? { ...invoice, ...updatedData, updatedAt: new Date().toISOString() }
              : invoice
          )
        }));
      } catch (error) {
        console.error('Error updating invoice:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        invoices: prev.invoices.map(invoice =>
          invoice.id === invoiceId
            ? { ...invoice, ...updatedData, updatedAt: new Date().toISOString() }
            : invoice
        )
      }));
    }
  };

  const getInvoicesByPatient = async (patientId) => {
    if (useBackend) {
      try {
        return await InvoiceService.getInvoicesByPatient(patientId);
      } catch (error) {
        console.error('Error getting invoices by patient:', error);
        return [];
      }
    } else {
      return appState.invoices.filter(invoice => invoice.patientId === patientId);
    }
  };

  const getPendingInvoices = () => {
    return appState.invoices.filter(invoice => 
      invoice.status === 'pending' || invoice.status === 'overdue'
    );
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
  const registerPatient = async (patientData) => {
    if (useBackend) {
      try {
        const result = await FirebasePatientService.createPatient(patientData);
        if (result.success) {
          const newPatient = result.data;
          setAppState(prev => {
            // Check if patient already exists to prevent duplicates
            const existsIndex = prev.patients.findIndex(p => p.id === newPatient.id);
            if (existsIndex >= 0) {
              // Update existing patient
              console.log('✅ Patient updated in context:', newPatient.id);
              return {
                ...prev,
                patients: prev.patients.map((p, i) => i === existsIndex ? newPatient : p)
              };
            } else {
              // Add new patient
              console.log('✅ Patient registered in Firebase:', newPatient.id);
              return {
                ...prev,
                patients: [...prev.patients, newPatient],
                registeredUsers: prev.registeredUsers + 1
              };
            }
          });
          return newPatient;
        } else {
          throw new Error(result.message || 'Failed to register patient');
        }
      } catch (error) {
        console.error('❌ Error registering patient:', error);
        throw error;
      }
    } else {
      // Fallback to local state
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
    }
  };

  const addPatient = (patientData) => {
    // This method will delegate to registerPatient for Firebase integration
    return registerPatient(patientData);
  };

  const updatePatient = async (patientId, updatedData) => {
    if (useBackend) {
      try {
        const result = await FirebasePatientService.updateProfile(patientId, updatedData);
        if (result.success) {
          setAppState(prev => ({
            ...prev,
            patients: prev.patients.map(patient =>
              patient.id === patientId ? { ...patient, ...updatedData, updatedAt: new Date().toISOString() } : patient
            )
          }));
          console.log('✅ Patient updated in Firebase:', patientId);
        } else {
          throw new Error(result.message || 'Failed to update patient');
        }
      } catch (error) {
        console.error('❌ Error updating patient:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        patients: prev.patients.map(patient =>
          patient.id === patientId ? { ...patient, ...updatedData } : patient
        )
      }));
    }
  };

  const deletePatient = async (patientId) => {
    if (useBackend) {
      try {
        // Note: Add delete method to FirebasePatientService if needed
        console.log('🗑️ Deleting patient from Firebase:', patientId);
        setAppState(prev => ({
          ...prev,
          patients: prev.patients.filter(patient => patient.id !== patientId),
          registeredUsers: prev.registeredUsers - 1
        }));
        console.log('✅ Patient deleted from local state:', patientId);
      } catch (error) {
        console.error('❌ Error deleting patient:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        patients: prev.patients.filter(patient => patient.id !== patientId),
        registeredUsers: prev.registeredUsers - 1
      }));
    }
  };

  // Load patients from Firebase
  const loadPatients = async () => {
    if (!useBackend) return [];
    
    try {
      console.log('👥 Loading patients from Firebase...');
      const result = await FirebasePatientService.getAllPatients();
      
      if (result.success) {
        const rawPatients = result.data || [];
        // Deduplicate patients by ID to prevent duplicate key errors
        const uniquePatients = rawPatients.filter((patient, index, self) => 
          index === self.findIndex(p => p.id === patient.id)
        );
        
        setAppState(prev => {
          // Additional check to ensure no duplicates when updating state
          const finalUniquePatients = uniquePatients.filter((patient, index, self) => 
            index === self.findIndex(p => p.id === patient.id && p.name === patient.name)
          );
          
          return {
            ...prev,
            patients: finalUniquePatients,
            registeredUsers: finalUniquePatients.length
          };
        });
        
        if (rawPatients.length !== uniquePatients.length) {
          console.warn(`⚠️ Removed ${rawPatients.length - uniquePatients.length} duplicate patients`);
        }
        
        console.log(`✅ Loaded ${uniquePatients.length} patients from Firebase`);
        return uniquePatients;
      } else {
        console.warn('⚠️ Failed to load patients:', result.message);
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading patients:', error);
      return [];
    }
  };

  // Refresh patient data
  const refreshPatientData = async () => {
    console.log('🔄 Refreshing patient data...');
    await loadPatients();
  };

  // ==== DISCHARGE MANAGEMENT ====
  const createDischargeSummary = async (patientId, dischargeData) => {
    if (useBackend) {
      try {
        const dischargeSummary = await DischargeService.createDischargeSummary(patientId, dischargeData);
        return dischargeSummary;
      } catch (error) {
        console.error('Error creating discharge summary:', error);
        throw error;
      }
    } else {
      // Fallback to local state - Create discharge summary
      const dischargeSummary = {
        id: `discharge-${Date.now()}`,
        patientId,
        ...dischargeData,
        createdAt: new Date().toISOString()
      };
      return dischargeSummary;
    }
  };

  const getDischargeSummary = async (patientId) => {
    if (useBackend) {
      try {
        return await DischargeService.getDischargeSummary(patientId);
      } catch (error) {
        console.error('Error getting discharge summary:', error);
        return null;
      }
    } else {
      // Fallback - return mock data
      return null;
    }
  };

  const getDischargesByPatient = async (patientId) => {
    if (useBackend) {
      try {
        return await DischargeService.getDischargesByPatient(patientId);
      } catch (error) {
        console.error('Error getting patient discharges:', error);
        return [];
      }
    } else {
      // Fallback - return empty array
      return [];
    }
  };

  const getDischargeStatistics = async () => {
    if (useBackend) {
      try {
        return await DischargeService.getDischargeStatistics();
      } catch (error) {
        console.error('Error getting discharge statistics:', error);
        return { totalDischarges: 0, thisMonth: 0 };
      }
    } else {
      // Fallback - return mock stats
      return { totalDischarges: 2, thisMonth: 2 };
    }
  };

  const processPatientDischarge = async (patientId, dischargeDetails) => {
    if (useBackend) {
      try {
        // First, find the patient to get room and bed information
        const patient = appState.patients.find(p => p.id === patientId);
        
        await DischargeService.processDischarge(patientId, dischargeDetails);
        
        // Release the specific bed if patient has room and bed assigned
        if (patient && patient.roomId && patient.bedNo) {
          console.log(`🏥 Releasing bed ${patient.bedNo} in room ${patient.room} for discharged patient ${patient.name}`);
          await releasePatientFromBed(patient.roomId, patient.bedNo, patientId);
        } else if (dischargeDetails.roomId) {
          // Fallback to old discharge method
          await dischargePatient(dischargeDetails.roomId);
        }
        
        // Update patient status in local state
        setAppState(prev => ({
          ...prev,
          patients: prev.patients.map(p => 
            p.id === patientId ? {
              ...p,
              status: 'Discharged',
              statusText: 'Discharged',
              statusColor: '#6B7280',
              dischargeDate: dischargeDetails.dischargeDate || new Date().toISOString(),
              room: null,
              bedNo: null,
              roomId: null
            } : p
          )
        }));
        
      } catch (error) {
        console.error('Error processing patient discharge:', error);
        throw error;
      }
    } else {
      // Fallback - find patient and release bed
      const patient = appState.patients.find(p => p.id === patientId);
      
      if (patient && patient.roomId && patient.bedNo) {
        await releasePatientFromBed(patient.roomId, patient.bedNo, patientId);
      } else if (dischargeDetails.roomId) {
        await dischargePatient(dischargeDetails.roomId);
      }
      
      // Update patient status in local state
      setAppState(prev => ({
        ...prev,
        patients: prev.patients.map(p => 
          p.id === patientId ? {
            ...p,
            status: 'Discharged',
            statusText: 'Discharged',
            statusColor: '#6B7280',
            dischargeDate: dischargeDetails.dischargeDate || new Date().toISOString(),
            room: null,
            bedNo: null,
            roomId: null
          } : p
        )
      }));
    }
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

  // ==== REPORTS MANAGEMENT ====
  const addReport = async (reportData) => {
    if (useBackend) {
      try {
        const newReport = await ReportService.createReport(reportData);
        setAppState(prev => ({
          ...prev,
          reports: [...prev.reports, newReport]
        }));
        return newReport;
      } catch (error) {
        console.error('Error adding report:', error);
        throw error;
      }
    } else {
      // Fallback to local state - Generate icon and colors based on report type
      const getReportDisplay = (type) => {
        const firstLetter = type.charAt(0).toUpperCase();
        const colors = [
          { icon: firstLetter, iconColor: '#3B82F6', bgColor: '#EBF4FF' },
          { icon: firstLetter, iconColor: '#8B5CF6', bgColor: '#F3F0FF' },
          { icon: firstLetter, iconColor: '#10B981', bgColor: '#ECFDF5' },
          { icon: firstLetter, iconColor: '#F59E0B', bgColor: '#FFFBEB' },
          { icon: firstLetter, iconColor: '#EF4444', bgColor: '#FEF2F2' },
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      };

      const display = getReportDisplay(reportData.type);
      const newReport = {
        id: `RPT${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        }),
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sentToPatient: false,
        sentAt: null,
        viewedByPatient: false,
        priority: 'normal',
        category: 'Laboratory',
        files: [],
        ...display,
        ...reportData,
      };

      setAppState(prev => ({
        ...prev,
        reports: [...prev.reports, newReport]
      }));

      return newReport;
    }
  };

  const updateReport = async (reportId, updatedData) => {
    if (useBackend) {
      try {
        await ReportService.updateReport(reportId, updatedData);
        setAppState(prev => ({
          ...prev,
          reports: prev.reports.map(report =>
            report.id === reportId
              ? { 
                  ...report, 
                  ...updatedData, 
                  updatedAt: new Date().toISOString() 
                }
              : report
          )
        }));
      } catch (error) {
        console.error('Error updating report:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        reports: prev.reports.map(report =>
          report.id === reportId
            ? { 
                ...report, 
                ...updatedData, 
                updatedAt: new Date().toISOString() 
              }
            : report
        )
      }));
    }
  };

  const deleteReport = async (reportId) => {
    if (useBackend) {
      try {
        await ReportService.deleteReport(reportId);
        setAppState(prev => ({
          ...prev,
          reports: prev.reports.filter(report => report.id !== reportId)
        }));
      } catch (error) {
        console.error('Error deleting report:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        reports: prev.reports.filter(report => report.id !== reportId)
      }));
    }
  };

  const addFileToReport = (reportId, fileData) => {
    const fileWithId = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uploadedAt: new Date().toISOString(),
      ...fileData
    };

    setAppState(prev => ({
      ...prev,
      reports: prev.reports.map(report =>
        report.id === reportId
          ? {
              ...report,
              files: [...(report.files || []), fileWithId],
              updatedAt: new Date().toISOString()
            }
          : report
      )
    }));

    return fileWithId;
  };

  const removeFileFromReport = (reportId, fileId) => {
    setAppState(prev => ({
      ...prev,
      reports: prev.reports.map(report =>
        report.id === reportId
          ? {
              ...report,
              files: report.files.filter(file => file.id !== fileId),
              updatedAt: new Date().toISOString()
            }
          : report
      )
    }));
  };

  const sendReportToPatient = (reportId, phoneNumber, notificationData = null) => {
    // Find patient by phone number with improved matching
    const patient = appState.patients.find(p => {
      const patientPhone = p.phone || p.phoneNumber || p.mobile || '';
      const cleanPatientPhone = patientPhone.replace(/\D/g, '');
      const cleanSearchPhone = phoneNumber.replace(/\D/g, '');
      
      return (
        patientPhone === phoneNumber ||
        cleanPatientPhone === cleanSearchPhone ||
        cleanPatientPhone.includes(cleanSearchPhone) ||
        cleanSearchPhone.includes(cleanPatientPhone)
      );
    });

    // If not found by phone, try to find by report's patientId
    let foundPatient = patient;
    if (!foundPatient) {
      const report = appState.reports.find(r => r.id === reportId);
      if (report && report.patientId) {
        foundPatient = appState.patients.find(p => p.id === report.patientId);
        console.log('⚠️ Found patient by report patientId instead of phone:', foundPatient?.id);
      }
    }

    if (!foundPatient) {
      throw new Error('Patient not found with this phone number');
    }

    // Update report as sent
    setAppState(prev => ({
      ...prev,
      reports: prev.reports.map(report =>
        report.id === reportId
          ? {
              ...report,
              sentToPatient: true,
              sentAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : report
      )
    }));

    // Add to patient's medical reports
    setAppState(prev => ({
      ...prev,
      patients: prev.patients.map(p =>
        p.id === foundPatient.id
          ? {
              ...p,
              medicalReports: [
                ...(p.medicalReports || []),
                {
                  id: reportId,
                  type: appState.reports.find(r => r.id === reportId)?.type || 'Medical Report',
                  date: new Date().toISOString().split('T')[0],
                  receivedAt: new Date().toISOString(),
                  viewed: false
                }
              ]
            }
          : p
      )
    }));

    return { success: true, patient: foundPatient };
  };

  const markReportAsViewed = (reportId, patientId) => {
    setAppState(prev => ({
      ...prev,
      reports: prev.reports.map(report =>
        report.id === reportId
          ? {
              ...report,
              viewedByPatient: true,
              viewedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : report
      ),
      patients: prev.patients.map(p =>
        p.id === patientId
          ? {
              ...p,
              medicalReports: (p.medicalReports || []).map(mr =>
                mr.id === reportId
                  ? { ...mr, viewed: true, viewedAt: new Date().toISOString() }
                  : mr
              )
            }
          : p
      )
    }));
  };

  const getReportsByPatient = (patientId) => {
    return appState.reports.filter(report => report.patientId === patientId);
  };

  const getReportsByDoctor = (doctorId) => {
    return appState.reports.filter(report => report.doctorId === doctorId);
  };

  const getPendingReports = () => {
    return appState.reports.filter(report => !report.sentToPatient);
  };

  const getReportsStats = () => {
    const totalReports = appState.reports.length;
    const sentReports = appState.reports.filter(r => r.sentToPatient).length;
    const viewedReports = appState.reports.filter(r => r.viewedByPatient).length;
    const pendingReports = totalReports - sentReports;

    return {
      totalReports,
      sentReports,
      viewedReports,
      pendingReports,
      totalPatients: appState.patients.length,
      totalStorage: appState.reports.reduce((total, report) => {
        const reportSize = report.files?.reduce((fileTotal, file) => fileTotal + (file.size || 0), 0) || 0;
        return total + reportSize;
      }, 0)
    };
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
    isLoading,
    useBackend,
    setUseBackend,
    setAppState, // Exposing setAppState to allow direct updates
    refreshData: initializeFirebaseData, // Expose function to reinitialize real-time listeners
    
    // Admin Stats (real-time calculated)
    adminStats: appState.adminStats,
    
    // Shared Data
    appointments: appState.appointments,
    doctors: appState.doctors,  
    payments: appState.payments,
    invoices: appState.invoices,
    tests: appState.tests,
    patients: appState.patients,
    services: appState.services,
    reports: appState.reports,
    rooms: appState.rooms,

    // Appointment Methods
    addAppointment,
    updateAppointmentStatus,
    cancelAppointment,

    // Doctor Methods
    addDoctor,
    updateDoctor,
    deleteDoctor,
    updateDoctorAppointmentCount,

    // Room Methods
    addRoom,
    updateRoom,
    deleteRoom,
    dischargePatient,
    assignPatientToRoom,

    // Bed Management Methods
    generateBedLabels,
    getAvailableBeds,
    getOccupiedBeds,
    assignPatientToBed,
    releasePatientFromBed,
    getAvailableRooms,

    // Payment Methods
    addPayment,
    updatePaymentStatus,
    deletePayment,
    getPaymentsByPatient,
    getPendingPayments,

    // Invoice Methods
    addInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    updateInvoice,
    getInvoicesByPatient,
    getPendingInvoices,

    // Test Methods
    bookTest,
    addTest,

    // Patient Methods
    registerPatient,
    addPatient,
    updatePatient,
    deletePatient,
    loadPatients,
    refreshPatientData,

    // Patient Payment Methods
    addPatientPayment,
    getPatientPaymentSummary,
    getAllPendingPayments,

    // Service Methods
    addService,

    // Discharge Methods
    createDischargeSummary,
    getDischargeSummary,
    getDischargesByPatient,
    getDischargeStatistics,
    processPatientDischarge,

    // Reports Methods
    addReport,
    updateReport,
    deleteReport,
    addFileToReport,
    removeFileFromReport,
    sendReportToPatient,
    markReportAsViewed,
    getReportsByPatient,
    getReportsByDoctor,
    getPendingReports,
    getReportsStats,

    // Utility Methods
    calculateAdminStats,
    initializeFirebaseData,
    setupRealTimeListeners,
    loadAppointments,
    refreshAppointmentData,
    forceRefreshAppointments,
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