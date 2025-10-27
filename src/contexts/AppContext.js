import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { 
  InvoiceService, 
  PaymentService, 
  DischargeService, 
  ReportService,
  RoomService 
} from '../services/hospitalServices';
import { 
  FirebaseHospitalService, 
  FirebaseAppointmentService,
  FirebasePatientService,
  FirebaseRoomService,
  FirebasePaymentService,
  FirebaseDoctorService,
  firebaseHospitalServices
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
    medical: [
      { id: 'general-consultation', name: 'General Consultation', price: 600, category: 'medical' },
      { id: 'prenatal-checkup', name: 'Prenatal Checkup', price: 800, category: 'medical' },
      { id: 'diabetes-consultation', name: 'Diabetes Consultation', price: 700, category: 'medical' },
      { id: 'hypertension-checkup', name: 'Hypertension Checkup', price: 650, category: 'medical' },
    ],
    surgical: [
      { id: 'minor-surgery', name: 'Minor Surgery', price: 5000, category: 'surgical' },
      { id: 'appendectomy', name: 'Appendectomy', price: 25000, category: 'surgical' },
      { id: 'hernia-repair', name: 'Hernia Repair', price: 30000, category: 'surgical' },
    ],
    specialized: [
      { id: 'ecg-consultation', name: 'ECG & Consultation', price: 800, category: 'specialized' },
      { id: 'dental-consultation', name: 'Dental Consultation', price: 500, category: 'specialized' },
      { id: 'eye-examination', name: 'Eye Examination', price: 600, category: 'specialized' },
      { id: 'orthopedic-consultation', name: 'Orthopedic Consultation', price: 900, category: 'specialized' },
      { id: 'cardiology-consultation', name: 'Cardiology Consultation', price: 1200, category: 'specialized' },
    ],
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
  
  // Flag to prevent duplicate listener setup
  const [listenersActive, setListenersActive] = useState(false);
  
  // Flag to completely disable Firebase operations when not authenticated
  const [firebaseOperationsEnabled, setFirebaseOperationsEnabled] = useState(true); // Enable by default for public data access
  
  // Rate limiting for error logs
  const [lastLogTime, setLastLogTime] = useState({});

  // Helper function to throttle logs (prevent spam)
  const throttledLog = (key, message, intervalMs = 5000) => {
    const now = Date.now();
    const lastTime = lastLogTime[key] || 0;
    
    if (now - lastTime > intervalMs) {
      console.log(message);
      setLastLogTime(prev => ({ ...prev, [key]: now }));
      return true;
    }
    return false;
  };

  // Authentication state management
  const setCurrentUser = async (user, role = 'patient') => {
    console.log('👤 Setting current user:', user?.uid || 'null', 'Role:', role);
    
    // If user is provided, fetch their credentials from backend first
    if (user && user.uid) {
      try {
        const { doc, getDoc } = require('firebase/firestore');
        const { db } = require('../config/firebase.config');
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userCredentials = userDoc.data();
          console.log('🔐 Retrieved user credentials:', userCredentials.name);
          
          // Enhance user object with backend credentials
          user = {
            ...user,
            displayName: userCredentials.name || user.displayName,
            userData: userCredentials
          };
        }
      } catch (error) {
        console.log('⚠️ Could not fetch user credentials during login:', error.message);
      }
    }
    
    setAppState(prev => ({
      ...prev,
      currentUser: user,
      isAuthenticated: !!user,
      userRole: role,
      // Reset user-specific data when user changes
      currentPatient: null
    }));
    
    // Fetch user-specific data if user is authenticated
    if (user) {
      fetchCurrentPatientData(user.uid);
    }
  };

  // Get current patient data for the logged-in user
  const fetchCurrentPatientData = async (userId) => {
    if (!userId || !useBackend) return;
    
    try {
      console.log('🔍 Fetching patient data for user:', userId);
      
      // First, get user credentials from Firestore 'users' collection
      const { doc, getDoc } = require('firebase/firestore');
      const { db } = require('../config/firebase.config');
      
      let userFromCredentials = null;
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          userFromCredentials = userDoc.data();
          console.log('👤 User credentials from backend:', userFromCredentials.name);
          console.log('🖼️ Profile image from credentials:', userFromCredentials.profileImage);
        }
      } catch (credError) {
        console.log('⚠️ Could not fetch user credentials:', credError.message);
      }
      
      // Try to get patient record by user ID
      const patients = await FirebasePatientService.getAllPatients();
      if (patients.success) {
        const currentPatient = patients.data.find(p => 
          p.userId === userId || p.id === userId || p.email === appState.currentUser?.email
        );
        
        if (currentPatient) {
          // Merge patient data with user credentials to get the real name
          const enhancedPatient = {
            ...currentPatient,
            // Prioritize name from user credentials, then patient record
            name: userFromCredentials?.name || currentPatient.name,
            email: userFromCredentials?.email || currentPatient.email,
            phone: userFromCredentials?.phone || currentPatient.phone,
            role: userFromCredentials?.role || 'patient',
            // Prioritize profile image from user credentials, then patient record
            profileImage: userFromCredentials?.profileImage || currentPatient.profileImage
          };
          
          console.log('✅ Found patient data with credentials:', enhancedPatient.name);
          console.log('🖼️ Enhanced patient profile image:', enhancedPatient.profileImage);
          setAppState(prev => ({
            ...prev,
            currentPatient: enhancedPatient,
            // Also update currentUser with credentials name if available
            currentUser: prev.currentUser ? {
              ...prev.currentUser,
              displayName: userFromCredentials?.name || prev.currentUser.displayName,
              userData: userFromCredentials || prev.currentUser.userData
            } : prev.currentUser
          }));
          
          // Fetch user-specific data
          await fetchUserSpecificData(enhancedPatient.id);
        } else {
          console.log('⚠️ No patient record found for user:', userId);
          
          // Even if no patient record, store user credentials for name display
          if (userFromCredentials) {
            setAppState(prev => ({
              ...prev,
              currentPatient: {
                id: userId,
                name: userFromCredentials.name,
                email: userFromCredentials.email,
                phone: userFromCredentials.phone || '',
                role: userFromCredentials.role || 'patient',
                profileImage: userFromCredentials.profileImage
              }
            }));
            console.log('✅ Using user credentials as patient data:', userFromCredentials.name);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fetching current patient data:', error);
    }
  };

  // Fetch only data belonging to the current patient
  const fetchUserSpecificData = async (patientId) => {
    if (!patientId || !useBackend) return;
    
    try {
      console.log('📊 Fetching user-specific data for patient:', patientId);
      
      // Fetch appointments for this patient only
      const appointmentResult = await FirebaseAppointmentService.getAppointments(patientId);
      if (appointmentResult.success) {
        setAppState(prev => ({
          ...prev,
          appointments: appointmentResult.data
        }));
        console.log(`✅ Loaded ${appointmentResult.data.length} appointments for patient`);
      }
      
      // Fetch medical reports for this patient only
      if (ReportService && ReportService.getReportsByPatient) {
        const reportsResult = await ReportService.getReportsByPatient(patientId);
        if (reportsResult) {
          setAppState(prev => ({
            ...prev,
            medicalReports: Array.isArray(reportsResult) ? reportsResult : reportsResult.data || []
          }));
          console.log(`✅ Loaded medical reports for patient`);
        }
      }
      
      // Fetch invoices for this patient only
      if (InvoiceService && InvoiceService.getInvoicesByPatient) {
        const invoicesResult = await InvoiceService.getInvoicesByPatient(patientId);
        if (invoicesResult) {
          setAppState(prev => ({
            ...prev,
            invoices: Array.isArray(invoicesResult) ? invoicesResult : invoicesResult.data || []
          }));
          console.log(`✅ Loaded invoices for patient`);
        }
      }
      
      // Fetch payments for this patient only
      if (PaymentService && PaymentService.getPaymentsByPatient) {
        const paymentsResult = await PaymentService.getPaymentsByPatient(patientId);
        if (paymentsResult) {
          setAppState(prev => ({
            ...prev,
            payments: Array.isArray(paymentsResult) ? paymentsResult : paymentsResult.data || []
          }));
          console.log(`✅ Loaded payments for patient`);
        }
      }
      
      // Fetch discharge records for this patient only
      if (DischargeService && DischargeService.getDischargesByPatient) {
        const dischargesResult = await DischargeService.getDischargesByPatient(patientId);
        if (dischargesResult) {
          setAppState(prev => ({
            ...prev,
            discharges: Array.isArray(dischargesResult) ? dischargesResult : dischargesResult.data || []
          }));
          console.log(`✅ Loaded discharge records for patient`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error fetching user-specific data:', error);
    }
  };

  // Debug function to check authentication state
  const debugAuthState = () => {
    console.log('🔍 DEBUG: Current Authentication State');
    console.log('- Current User:', appState.currentUser?.uid, appState.currentUser?.displayName || appState.currentUser?.email);
    console.log('- Current Patient:', appState.currentPatient?.name, appState.currentPatient?.email);
    console.log('- Is Authenticated:', appState.isAuthenticated);
    console.log('- User Role:', appState.userRole);
    if (appState.currentUser?.userData) {
      console.log('- Backend Credentials:', appState.currentUser.userData);
    }
    return {
      currentUser: appState.currentUser,
      currentPatient: appState.currentPatient,
      isAuthenticated: appState.isAuthenticated,
      userRole: appState.userRole
    };
  };

  // Clear user data on logout
  const clearUserData = () => {
    console.log('🚪 Clearing user data on logout');
    
    // IMMEDIATELY disable all Firebase operations
    setFirebaseOperationsEnabled(false);
    console.log('🚫 Firebase operations disabled');
    
    // Immediately clean up all real-time listeners
    console.log('🧹 Cleaning up real-time listeners on logout...');
    const listenerTypes = Object.keys(unsubscribeFunctions);
    console.log('📋 Active listeners to cleanup:', listenerTypes);
    
    Object.entries(unsubscribeFunctions).forEach(([type, unsubscribe]) => {
      if (typeof unsubscribe === 'function') {
        try {
          console.log(`🗑️ Cleaning up ${type} listener...`);
          unsubscribe();
          console.log(`✅ ${type} listener cleaned up successfully`);
        } catch (error) {
          console.log(`⚠️ Error cleaning up ${type} listener:`, error.message);
        }
      } else {
        console.log(`⚠️ ${type} listener is not a function:`, typeof unsubscribe);
      }
    });
    
    setUnsubscribeFunctions({});
    setListenersActive(false);
    console.log('🧹 All real-time listeners cleanup completed');
    
    setAppState(prev => ({
      ...prev,
      currentUser: null,
      currentPatient: null,
      isAuthenticated: false,
      userRole: null,
      // Clear user-specific data
      appointments: [],
      medicalReports: [],
      invoices: [],
      payments: [],
      discharges: [],
      // Clear real-time data to prevent stale data
      rooms: [],
      patients: []
    }));
    
    console.log('✅ User data cleared completely');
  };

  // Force cleanup function that can be called multiple times safely
  const forceCleanupListeners = () => {
    console.log('🚨 Force cleanup of all real-time listeners...');
    
    // IMMEDIATELY disable all Firebase operations
    setFirebaseOperationsEnabled(false);
    console.log('🚫 Firebase operations forcefully disabled');
    
    // Get current listeners
    const currentListeners = Object.keys(unsubscribeFunctions);
    console.log('🔍 Current active listeners:', currentListeners);
    
    if (currentListeners.length === 0) {
      console.log('✅ No active listeners to cleanup');
    } else {
      // Cleanup each listener with enhanced error handling
      Object.entries(unsubscribeFunctions).forEach(([type, unsubscribe]) => {
        if (typeof unsubscribe === 'function') {
          try {
            console.log(`🚨 Force cleaning up ${type} listener...`);
            unsubscribe();
            console.log(`✅ ${type} listener force cleaned up`);
          } catch (error) {
            console.error(`❌ Force cleanup error for ${type}:`, error);
          }
        }
      });
    }
    
    // Clear all references
    setUnsubscribeFunctions({});
    setListenersActive(false);
    
    // Clear all real-time data
    setAppState(prev => ({
      ...prev,
      invoices: [],
      rooms: [],
      patients: [],
      // Keep static data like services and doctors
      services: prev.services,
      doctors: prev.doctors.filter(doc => doc.id && doc.id.startsWith('dr-')) // Keep only local doctors
    }));
    
    console.log('🚨 Force cleanup completed - all listeners should be inactive');
  };

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

      // Real-time listeners are now managed by the auth state change listener
      console.log('� Loading one-time data that doesn\'t require real-time updates...');

      // Load other data that doesn't need real-time updates (one-time fetch)
      const results = await Promise.allSettled([
        InvoiceService.getAllInvoices(), 
        FirebasePaymentService.getPayments(),
        ReportService.getAllReports(),
        SimpleBookingService.getAllAppointments(),
        FirebaseDoctorService.getDoctors()
      ]);

      // Map results to variables with safe fallbacks and better error logging
      const serviceNames = ['invoices', 'payments', 'reports', 'appointments', 'doctors'];
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
      const doctors = mapResult(4);

      // Update state with non-real-time data
      setAppState(prev => ({
        ...prev,
        // rooms, patients, and doctors are handled by real-time listeners above
        invoices: invoices || prev.invoices,
        payments: payments || prev.payments,
        reports: reports || prev.reports,
        appointments: appointments || prev.appointments,
        doctors: doctors || prev.doctors
      }));

      console.log('✅ Firebase data loaded (partial failures tolerated)');
      console.log(`📋 Loaded ${appointments?.length || 0} appointments`);
      console.log(`✅ Loaded ${doctors?.length || 0} doctors from backend`);
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
    
    if (!useBackend) {
      console.log('🚫 Skipping real-time listeners - backend disabled');
      return;
    }
    
    if (listenersActive) {
      console.log('🔄 Real-time listeners already active - skipping duplicate setup');
      return;
    }
    
    // Allow listeners for both authenticated and unauthenticated users since we have public read access
    const userStatus = currentUser ? `authenticated user: ${currentUser.uid}` : 'unauthenticated (public access)';
    console.log(`🔄 Setting up real-time listeners for ${userStatus}...`);
    setListenersActive(true);
    
    try {
      // Clean up existing listeners first
      Object.values(unsubscribeFunctions).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          try {
            unsubscribe();
          } catch (error) {
            console.log('⚠️ Error cleaning up existing listener:', error.message);
          }
        }
      });

      const newUnsubscribeFunctions = {};

      // Real-time rooms listener
      console.log('🔄 Setting up rooms real-time listener...');
      const roomsUnsubscribe = FirebaseRoomService.subscribeToRooms((result) => {
        // Rooms have public read access, so no authentication required
        const { auth } = require('../config/firebase.config');
        const currentUser = auth.currentUser;
        
        if (result.success) {
          const userInfo = currentUser ? ` (user: ${currentUser.uid})` : ' (public)';
          if (result.data.length > 0) {
            console.log(`🏠 Real-time rooms update: ${result.data.length} rooms${userInfo}`);
          } else {
            throttledLog('rooms-empty', `🏠 Real-time rooms update: 0 rooms${userInfo}`, 10000);
          }
          setAppState(prev => ({
            ...prev,
            rooms: removeDuplicatesById(result.data, 'rooms')
          }));
        } else if (result.warning) {
          throttledLog('rooms-warning', '⚠️ Rooms listener warning: ' + result.warning, 10000);
          // Set empty rooms on permission error
          setAppState(prev => ({
            ...prev,
            rooms: []
          }));
        } else {
          throttledLog('rooms-error', '❌ Rooms listener error: ' + result.error, 5000);
        }
      });
      if (roomsUnsubscribe) newUnsubscribeFunctions.rooms = roomsUnsubscribe;

      // Real-time patients listener  
      console.log('🔄 Setting up patients real-time listener...');
      const patientsUnsubscribe = FirebasePatientService.subscribeToPatients((result) => {
        // Add authentication check and Firebase operations check
        const { auth } = require('../config/firebase.config');
        if (!auth.currentUser || !firebaseOperationsEnabled) {
          console.log('🚫 Patients listener: User not authenticated or Firebase operations disabled, ignoring update');
          return;
        }
        
        if (result.success) {
          if (result.data.length > 0) {
            console.log(`👥 Real-time patients update: ${result.data.length} patients`);
          } else {
            throttledLog('patients-empty', '👥 Real-time patients update: 0 patients (permission denied)', 10000);
          }
          setAppState(prev => ({
            ...prev,
            patients: removeDuplicatesById(result.data, 'patients')
          }));
        } else if (result.warning) {
          throttledLog('patients-warning', '⚠️ Patients listener warning: ' + result.warning, 10000);
          // Set empty patients on permission error
          setAppState(prev => ({
            ...prev,
            patients: []
          }));
        } else {
          throttledLog('patients-error', '❌ Patients listener error: ' + result.error, 5000);
        }
      });
      if (patientsUnsubscribe) newUnsubscribeFunctions.patients = patientsUnsubscribe;

      // Real-time doctors listener
      console.log('🔄 Setting up doctors real-time listener...');
      const doctorsUnsubscribe = FirebaseDoctorService.subscribeToDoctors((result) => {
        // Doctors have public read access, so no authentication required
        const { auth } = require('../config/firebase.config');
        const currentUser = auth.currentUser;
        
        if (result.success) {
          const userInfo = currentUser ? ` (user: ${currentUser.uid})` : ' (public)';
          if (result.data.length > 0) {
            console.log(`👨‍⚕️ Real-time doctors update: ${result.data.length} doctors${userInfo}`);
          } else {
            throttledLog('doctors-empty', `👨‍⚕️ Real-time doctors update: 0 doctors${userInfo}`, 10000);
          }
          setAppState(prev => ({
            ...prev,
            doctors: removeDuplicatesById(result.data, 'doctors')
          }));
        } else if (result.warning) {
          throttledLog('doctors-warning', '⚠️ Doctors listener warning: ' + result.warning, 10000);
          // Keep existing doctors on permission error instead of clearing
          console.log('🔒 Keeping existing doctors due to permission limitation');
        } else {
          throttledLog('doctors-error', '❌ Doctors listener error: ' + result.error, 5000);
        }
      });
      if (doctorsUnsubscribe) newUnsubscribeFunctions.doctors = doctorsUnsubscribe;

      // Real-time invoices listener with enhanced authentication checks
      console.log('🔄 Setting up invoices real-time listener...');
      
      // Debug Firebase auth state before setting up listener
      const { auth } = require('../config/firebase.config');
      const currentUser = auth.currentUser;
      console.log('🔍 Firebase auth state for invoices listener:', {
        hasCurrentUser: !!currentUser,
        uid: currentUser?.uid,
        email: currentUser?.email
      });
      
      // Try to set up invoices listener with better error handling
      let invoicesUnsubscribe;
      
      try {
        invoicesUnsubscribe = firebaseHospitalServices.subscribeToInvoices((result) => {
          // Invoices have public read access, so no need to check Firebase operations
        
        if (result.success) {
          const userInfo = currentUser ? ` (user: ${currentUser.uid})` : ' (public)';
          if (result.data.length > 0) {
            console.log(`🧾 Real-time invoices update: ${result.data.length} invoices${userInfo}`);
          } else {
            throttledLog('invoices-empty', `🧾 Real-time invoices update: 0 invoices${userInfo}`, 10000);
          }
          setAppState(prev => ({
            ...prev,
            invoices: removeDuplicatesById(result.data, 'invoices')
          }));
        } else if (result.warning) {
          if (result.warning.includes('Authentication error')) {
            console.log('🔒 Authentication error in invoices listener - cleaning up');
            // Clear invoices and don't log repeatedly
            setAppState(prev => ({
              ...prev,
              invoices: []
            }));
          } else {
            throttledLog('invoices-warning', '⚠️ Invoices listener warning: ' + result.warning, 10000);
            setAppState(prev => ({
              ...prev,
              invoices: []
            }));
          }
        } else {
          // Check if this is a permissions error that we can handle gracefully
          if (result.error && result.error.includes('Missing or insufficient permissions')) {
            console.log('🔒 Permission/authentication error for invoices - disabling listener');
            // Don't log as ERROR since this is expected when not authenticated
            
            // Skip fallback fetch attempt - will be handled by one-time data loading
            console.log('🔄 Invoices listener disabled due to permissions - data will load via one-time fetch');
          } else {
            // Only log non-permissions errors as actual errors
            console.log('❌ Invoices real-time listener error:', result.error);
            throttledLog('invoices-error', '❌ Invoices listener error: ' + result.error, 5000);
          }
          
          // Clear invoices on error (only if not handled by fallback)
          if (!result.error || !result.error.includes('Missing or insufficient permissions')) {
            setAppState(prev => ({
              ...prev,
              invoices: []
            }));
          }
        }
      });
      } catch (invoicesError) {
        console.error('❌ Error setting up invoices real-time listener:', invoicesError);
        console.log('🔄 Falling back to one-time invoices fetch...');
        
        // Fallback to one-time fetch if real-time listener fails
        firebaseHospitalServices.getInvoices()
          .then(invoicesResult => {
            if (invoicesResult.success) {
              console.log('✅ Fallback invoices fetch successful:', invoicesResult.data.length, 'invoices');
              setAppState(prev => ({
                ...prev,
                invoices: removeDuplicatesById(invoicesResult.data, 'invoices')
              }));
            }
          })
          .catch(fallbackError => {
            console.log('❌ Fallback invoices fetch also failed:', fallbackError);
          });
      }
      
      if (invoicesUnsubscribe) newUnsubscribeFunctions.invoices = invoicesUnsubscribe;

      // Store unsubscribe functions
      setUnsubscribeFunctions(newUnsubscribeFunctions);
      
      console.log('✅ Real-time listeners setup complete with authentication guards');
    } catch (error) {
      console.error('❌ Error setting up real-time listeners:', error);
    }
  };

  // Authentication state listener to manage real-time listeners
  useEffect(() => {
    if (!useBackend) {
      console.log('🚫 Backend disabled - skipping auth listener setup');
      return;
    }

    const { auth, onAuthStateChanged } = require('../config/firebase.config');
    
    console.log('🔐 Setting up authentication state listener...');
    
    // Clean up any existing listeners first
    Object.values(unsubscribeFunctions).forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        try {
          unsubscribe();
          console.log('🧹 Cleaned up existing listener during auth setup');
        } catch (error) {
          console.log('⚠️ Error cleaning up existing listener during auth setup:', error.message);
        }
      }
    });
    setUnsubscribeFunctions({});
    setListenersActive(false);
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        throttledLog('auth-success', '✅ User authenticated - enabling Firebase operations and setting up real-time listeners...', 3000);
        
        // Enable Firebase operations first
        setFirebaseOperationsEnabled(true);
        console.log('✅ Firebase operations enabled for authenticated user');
        
        // Set current user with backend credentials
        await setCurrentUser(user);
        
        // User is signed in, setup real-time listeners
        setupRealTimeListeners();
      } else {
        console.log('👤 No user authenticated - enabling Firebase operations for public data access...');
        
        // Enable Firebase operations for public data even without authentication
        setFirebaseOperationsEnabled(true);
        console.log('✅ Firebase operations enabled for public data access');
        
        // Clean up user-specific listeners but keep public data listeners
        console.log('🧹 Cleaning up user-specific listeners...');
        const currentUnsubscribeFunctions = { ...unsubscribeFunctions };
        
        // Only clean up user-specific listeners (patients, rooms with auth requirements)
        if (currentUnsubscribeFunctions.patients) {
          try {
            currentUnsubscribeFunctions.patients();
            console.log('✅ Patients listener cleaned up');
          } catch (error) {
            console.log('⚠️ Error cleaning up patients listener:', error.message);
          }
        }
        
        if (currentUnsubscribeFunctions.rooms) {
          try {
            currentUnsubscribeFunctions.rooms();
            console.log('✅ Rooms listener cleaned up');
          } catch (error) {
            console.log('⚠️ Error cleaning up rooms listener:', error.message);
          }
        }
        
        // Clear user data
        await setCurrentUser(null);
        
        // Clear only user-specific data, keep public data
        setAppState(prev => ({
          ...prev,
          patients: [], // Clear user-specific data
          // Keep public data that doesn't require authentication
          doctors: prev.doctors || [],
          services: prev.services || [],
          invoices: prev.invoices || [], // Keep invoices as they have public read access
        }));
        
        // Set up public data listeners for unauthenticated access
        console.log('🔄 Setting up public data listeners for unauthenticated user...');
        setupRealTimeListeners();
        
        console.log('✅ All real-time listeners cleaned up, Firebase operations disabled, and data cleared');
      }
    });

    // Initial data load
    initializeFirebaseData();
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up auth listener and real-time listeners...');
      if (unsubscribeAuth) {
        try {
          unsubscribeAuth();
          console.log('✅ Auth listener cleaned up');
        } catch (error) {
          console.log('⚠️ Error cleaning up auth listener:', error.message);
        }
      }
      
      Object.values(unsubscribeFunctions).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          try {
            unsubscribe();
            console.log('✅ Real-time listener cleaned up');
          } catch (error) {
            console.log('⚠️ Error cleaning up listener during unmount:', error.message);
          }
        }
      });
      setListenersActive(false);
    };
  }, []);

  // Calculate real-time admin stats from actual data - including aggregated payments
  const calculateAdminStats = () => {
    // Calculate revenue from multiple sources since payments are aggregated
    let totalRevenue = 0;
    
    console.log(`📊 AppContext: calculateAdminStats called with ${appState.aggregatedPayments?.length || 0} aggregated payments`);
    
    // If we have aggregated payments, use those for more accurate calculation
    if (appState.aggregatedPayments && appState.aggregatedPayments.length > 0) {
      // Calculate total revenue from ALL payments (both fully paid and partially paid)
      // For fully paid: use full amount
      // For partially paid: use only the paid amount (not due amount)
      totalRevenue = appState.aggregatedPayments.reduce((sum, payment) => {
        console.log(`💰 Processing payment: ${payment.patientName} - Status: "${payment.status}" - Amount: ₹${payment.amount || payment.totalAmount || 0} - PaidAmount: ₹${payment.paidAmount || 0}`);
        
        if (payment.status === 'fully paid' || payment.status === 'paid' || payment.paymentStatus === 'Paid') {
          // Fully paid - use total amount
          const amount = payment.amount || payment.totalAmount || 0;
          console.log(`✅ Fully paid: Adding ₹${amount}`);
          return sum + amount;
        } else if (payment.status === 'partially paid' || payment.status === 'partial' || payment.paymentStatus === 'Partially Paid') {
          // Partially paid - use only the paid amount (not due amount)
          const paidAmount = payment.paidAmount || 0;
          console.log(`🔄 Partially paid: Adding ₹${paidAmount} (out of ₹${payment.amount || payment.totalAmount || 0})`);
          return sum + paidAmount;
        }
        // For pending payments, don't count towards revenue
        console.log(`⏳ Pending: Skipping ₹${payment.amount || payment.totalAmount || 0}`);
        return sum;
      }, 0);
      
      console.log(`💰 Revenue calculated from ${appState.aggregatedPayments.length} aggregated payments: ₹${totalRevenue}`);
    } else {
      // No aggregated payments available - calculate total PAID amount from individual sources
      console.log('📊 No aggregated payments - calculating from individual sources with PAID amounts only');
      
      // Add revenue from paid appointments (OP payments) - only count fully paid
      const appointmentRevenue = appState.appointments
        .filter(apt => apt.paymentStatus === 'Paid')
        .reduce((sum, apt) => sum + (apt.amount || apt.totalAmount || apt.consultationFee || 0), 0);
      totalRevenue += appointmentRevenue;
      console.log(`🏥 Appointment revenue (Paid only): ₹${appointmentRevenue}`);
      
      // Add revenue from patient payments (IP payments) - only count the PAID amount
      const patientRevenue = appState.patients
        .filter(patient => patient.paymentDetails && patient.paymentDetails.totalPaid > 0)
        .reduce((sum, patient) => sum + (patient.paymentDetails.totalPaid || 0), 0);
      totalRevenue += patientRevenue;
      console.log(`🏨 Patient revenue (Paid amount only): ₹${patientRevenue}`);
      
      // Add revenue from invoices that are paid
      const invoiceRevenue = appState.invoices
        .filter(invoice => invoice.status === 'Paid' || invoice.paymentStatus === 'Paid')
        .reduce((sum, invoice) => sum + (invoice.totalAmount || invoice.amount || 0), 0);
      totalRevenue += invoiceRevenue;
      console.log(`🧾 Invoice revenue (Paid only): ₹${invoiceRevenue}`);
      
      // Add revenue from direct payments collection
      const directRevenue = appState.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      totalRevenue += directRevenue;
      console.log(`💰 Direct payments revenue: ₹${directRevenue}`);
      // Fallback to individual source calculation
      // Add revenue from direct payments collection
      totalRevenue += appState.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      // Add revenue from paid appointments (OP payments)
      totalRevenue += appState.appointments
        .filter(apt => apt.paymentStatus === 'Paid')
        .reduce((sum, apt) => sum + (apt.amount || apt.totalAmount || apt.consultationFee || 0), 0);
      
      // Add revenue from patient payments (IP payments)
      totalRevenue += appState.patients
        .filter(patient => patient.paymentDetails && patient.paymentDetails.totalPaid > 0)
        .reduce((sum, patient) => sum + (patient.paymentDetails.totalPaid || 0), 0);
      
      // Add revenue from invoices that are paid
      totalRevenue += appState.invoices
        .filter(invoice => invoice.status === 'Paid' || invoice.paymentStatus === 'Paid')
        .reduce((sum, invoice) => sum + (invoice.totalAmount || invoice.amount || 0), 0);
      
      console.log(`💰 Revenue calculated from individual sources: ₹${totalRevenue}`);
    }

    const stats = {
      totalUsers: appState.patients.length,
      totalAppointments: appState.appointments.length,
      totalRevenue: totalRevenue,
      activeDoctors: appState.doctors.filter(doc => doc.status === 'Active' || doc.availability === 'Available').length || appState.doctors.length,
      todayAppointments: appState.appointments.filter(apt => {
        const today = new Date().toISOString().split('T')[0];
        return apt.date === today || apt.appointmentDate === today;
      }).length,
      confirmedAppointments: appState.appointments.filter(apt => apt.status === 'Confirmed' || apt.status === 'confirmed').length,
      pendingAppointments: appState.appointments.filter(apt => apt.status === 'Pending' || apt.status === 'pending').length,
      completedAppointments: appState.appointments.filter(apt => apt.status === 'Completed' || apt.status === 'completed').length,
    };

    console.log(`✅ AppContext: Setting adminStats - totalRevenue: ₹${stats.totalRevenue}`);
    setAppState(prev => ({
      ...prev,
      adminStats: stats
    }));
  };

  // Auto-calculate stats when data changes - using lengths to avoid infinite loops
  useEffect(() => {
    console.log('🔄 AppContext: Data length changed - triggering calculateAdminStats');
    calculateAdminStats();
  }, [
    appState.appointments.length, 
    appState.payments.length, 
    appState.patients.length, 
    appState.doctors.length,
    appState.invoices.length,
    appState.aggregatedPayments?.length
  ]);

  // Dedicated useEffect to watch for aggregatedPayments updates (even if length is same)
  useEffect(() => {
    if (appState.aggregatedPayments && appState.aggregatedPayments.length > 0) {
      console.log('💰 AppContext: AggregatedPayments updated - recalculating admin stats');
      console.log(`📊 AppContext: Received ${appState.aggregatedPayments.length} aggregated payments`);
      calculateAdminStats();
    }
  }, [appState.aggregatedPayments]);

  // Trigger recalculation when any payment-related data changes for real-time revenue updates
  useEffect(() => {
    console.log('📊 Payment data changed - triggering admin stats recalculation');
    calculateAdminStats();
  }, [
    JSON.stringify(appState.appointments.map(a => ({ id: a.id, paymentStatus: a.paymentStatus, amount: a.amount }))),
    JSON.stringify(appState.patients.map(p => ({ id: p.id, totalPaid: p.paymentDetails?.totalPaid }))),
    JSON.stringify(appState.invoices.map(i => ({ id: i.id, status: i.status, amount: i.totalAmount })))
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
  // Check if room number already exists
  const checkRoomExists = async (roomNumber) => {
    try {
      const existingRooms = appState.rooms || [];
      return existingRooms.some(room => room.roomNumber === roomNumber);
    } catch (error) {
      console.error('Error checking room existence:', error);
      return false;
    }
  };

  // Get next available room number suggestion
  const getNextAvailableRoomNumber = () => {
    try {
      const existingRooms = appState.rooms || [];
      const roomNumbers = existingRooms
        .map(room => parseInt(room.roomNumber))
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b);
      
      // Find the first gap or next number after the highest
      let nextNumber = 101; // Default starting number
      
      for (let i = 0; i < roomNumbers.length; i++) {
        if (roomNumbers[i] !== nextNumber) {
          break; // Found a gap
        }
        nextNumber++;
      }
      
      return nextNumber.toString();
    } catch (error) {
      console.error('Error getting next room number:', error);
      return '101'; // Fallback
    }
  };

  const addRoom = async (roomData) => {
    try {
      // Pre-check if room already exists to provide better UX
      const roomExists = await checkRoomExists(roomData.roomNumber);
      if (roomExists) {
        const nextAvailable = getNextAvailableRoomNumber();
        Alert.alert(
          'Room Already Exists',
          `Room ${roomData.roomNumber} is already in the system.\n\nSuggested next available room number: ${nextAvailable}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'View Existing Room', 
              style: 'default',
              onPress: () => {
                // Find and return the existing room for editing
                const existingRoom = appState.rooms.find(room => room.roomNumber === roomData.roomNumber);
                console.log('📍 Existing room details:', existingRoom);
              }
            }
          ]
        );
        return null;
      }

      const result = await FirebaseRoomService.createRoom(roomData);
      if (result.success) {
        console.log('✅ Room added successfully:', result.data.id);
        Alert.alert(
          'Success',
          `Room ${roomData.roomNumber} has been created successfully!`,
          [{ text: 'OK', style: 'default' }]
        );
        // Real-time listener will automatically update the state
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to add room');
      }
    } catch (error) {
      console.error('Error adding room:', error);
      
      // Handle specific duplicate room error (backup check)
      if (error.message && error.message.includes('already exists')) {
        const roomNumber = roomData.roomNumber;
        Alert.alert(
          'Room Already Exists',
          `Room ${roomNumber} is already in the system. Please choose a different room number or update the existing room instead.`,
          [{ text: 'OK', style: 'default' }]
        );
        // Don't re-throw for duplicate rooms - just show the alert
        return null;
      }
      
      // For other errors, show generic error message
      Alert.alert(
        'Error Adding Room',
        error.message || 'Failed to add room. Please check your connection and try again.',
        [{ text: 'OK', style: 'default' }]
      );
      
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
        const newPayment = await FirebasePaymentService.addPayment(paymentData);
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

  // Centralized function to update payment status and sync with appointments
  const updatePaymentStatusAndSync = async (paymentId, newStatus, transactionId = null) => {
    try {
      console.log(`🔄 Centralized update: Payment ${paymentId} to ${newStatus}`);
      
      // Update payment status
      await updatePaymentStatus(paymentId, newStatus, transactionId);
      
      // Find related appointment and update its payment status
      const payment = appState.payments.find(p => p.id === paymentId || p.originalId === paymentId);
      if (payment && payment.appointmentId) {
        console.log(`🔄 Updating related appointment ${payment.appointmentId}`);
        
        // Update appointment payment status
        setAppState(prev => ({
          ...prev,
          appointments: prev.appointments.map(appointment =>
            appointment.id === payment.appointmentId
              ? { 
                  ...appointment, 
                  paymentStatus: newStatus === 'paid' ? 'Paid' : newStatus === 'partial' ? 'Partially Paid' : 'Pending',
                  updatedAt: new Date().toISOString()
                }
              : appointment
          )
        }));
        
        // Update in Firebase if backend is enabled
        if (useBackend) {
          try {
            await FirebaseAppointmentService.updateAppointment(payment.appointmentId, {
              paymentStatus: newStatus === 'paid' ? 'Paid' : newStatus === 'partial' ? 'Partially Paid' : 'Pending',
              updatedAt: new Date().toISOString()
            });
          } catch (error) {
            console.warn('⚠️ Failed to update appointment payment status in Firebase:', error);
          }
        }
      }
      
      // Auto-generate invoice if payment is completed
      if (newStatus === 'paid' && payment) {
        console.log('📄 Auto-generating invoice for completed payment');
        try {
          await generateInvoiceForPayment(payment);
        } catch (error) {
          console.warn('⚠️ Invoice generation failed:', error);
        }
      }
      
      console.log('✅ Centralized payment update completed');
    } catch (error) {
      console.error('❌ Error in centralized payment update:', error);
      throw error;
    }
  };

  // Generate invoice for payment
  const generateInvoiceForPayment = async (payment) => {
    try {
      console.log('📄 Generating invoice for payment:', payment.id);
      
      const invoiceNumber = `INV-${Date.now()}`;
      const currentDate = new Date().toISOString().split('T')[0];
      
      const invoiceData = {
        invoiceNumber,
        patientId: payment.patientId,
        patientName: payment.patientName,
        issueDate: currentDate,
        dueDate: currentDate,
        totalAmount: payment.amount || payment.actualAmountPaid || payment.paidAmount,
        status: 'paid',
        description: payment.description || 'Medical Service Payment',
        serviceType: payment.type === 'appointment' ? 'OP' : payment.type === 'admission' ? 'IP' : 'General',
        items: [
          {
            name: payment.description || 'Medical Service',
            description: `${payment.type || 'payment'} - ${payment.description || 'Medical Service'}`,
            quantity: 1,
            amount: payment.amount || payment.actualAmountPaid || payment.paidAmount,
            unitPrice: payment.amount || payment.actualAmountPaid || payment.paidAmount,
            totalPrice: payment.amount || payment.actualAmountPaid || payment.paidAmount
          }
        ],
        paymentDetails: {
          paymentId: payment.id,
          paymentDate: payment.paymentDate || payment.date || new Date().toISOString(),
          paymentMethod: payment.paymentMethod || 'cash',
          transactionId: payment.transactionId,
          actualAmountPaid: payment.amount || payment.actualAmountPaid || payment.paidAmount
        },
        isAutoGenerated: true,
        generatedFrom: 'payment',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = await addInvoice(invoiceData);
      console.log('✅ Invoice generated successfully:', invoiceNumber);
      
      // Optionally send invoice to customer (implement later)
      // await sendInvoiceToCustomer(result, payment.patientId);
      
      return result;
    } catch (error) {
      console.error('❌ Error generating invoice:', error);
      throw error;
    }
  };

  const updatePaymentStatus = async (paymentId, newStatus, transactionId = null) => {
    if (useBackend) {
      try {
        await FirebasePaymentService.updatePaymentStatus(paymentId, newStatus);
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

  const updatePayment = async (paymentId, paymentData) => {
    if (useBackend) {
      try {
        await FirebasePaymentService.updatePayment(paymentId, paymentData);
        console.log('✅ Payment updated in Firebase backend:', paymentId);
        return { success: true };
      } catch (error) {
        console.error('❌ Error updating payment in Firebase backend:', error);
        throw error;
      }
    } else {
      console.log('⚠️ Backend not available, payment update is local only');
      return { success: true };
    }
  };

  const deletePayment = async (paymentId) => {
    if (useBackend) {
      try {
        await FirebasePaymentService.deletePayment(paymentId);
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
        return await FirebasePaymentService.getPaymentsByPatient(patientId);
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
        const dischargeSummary = await DischargeService.createDischargeSummary(dischargeData);
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

  // ==== PATIENT DATA MANAGEMENT ====
  const getPatientMedicalHistory = async (patientId) => {
    if (useBackend) {
      try {
        // Fetch medical history from Firebase or backend
        const patient = appState.patients.find(p => p.id === patientId);
        return patient?.medicalHistory || [];
      } catch (error) {
        console.error('Error getting patient medical history:', error);
        return [];
      }
    } else {
      const patient = appState.patients.find(p => p.id === patientId);
      return patient?.medicalHistory || [];
    }
  };

  const getRoomsByPatient = async (patientId) => {
    if (useBackend) {
      try {
        // Get rooms associated with the patient
        const patientRooms = appState.rooms.filter(room => room.patientId === patientId);
        return patientRooms;
      } catch (error) {
        console.error('Error getting patient rooms:', error);
        return [];
      }
    } else {
      const patientRooms = appState.rooms.filter(room => room.patientId === patientId);
      return patientRooms;
    }
  };

  // ==== PATIENT PAYMENT MANAGEMENT ====
  
  // Function to sync missing payments from invoices back to patient payment history
  const syncMissingPaymentsFromInvoices = () => {
    console.log('🔄 Checking for missing payments in patient history...');
    
    let hasAnyChanges = false;
    
    // First pass: check if any changes are needed to prevent unnecessary re-renders
    const updatedPatients = appState.patients.map(patient => {
      if (!patient.paymentDetails || !patient.paymentDetails.payments) {
        return patient;
      }

      // Find invoices for this patient that represent additional payments
      const patientInvoices = (appState.invoices || []).filter(invoice => 
        invoice.patientId === patient.id && 
        invoice.generatedFrom === 'payment' && 
        invoice.paymentDetails &&
        invoice.paymentDetails.actualAmountPaid > 0
      );

      if (patientInvoices.length === 0) {
        return patient;
      }

      let hasChanges = false;
      let updatedPayments = [...patient.paymentDetails.payments];

      // Check each invoice to see if it's missing from payment history
      patientInvoices.forEach(invoice => {
        const existingPayment = updatedPayments.find(payment => 
          payment.invoiceId === invoice.id ||
          payment.syncedFromInvoice === true && payment.invoiceId === invoice.id ||
          (Math.abs(payment.amount - invoice.paymentDetails.actualAmountPaid) < 0.01 &&
           payment.date === new Date(invoice.paymentDetails.paymentDate).toISOString().split('T')[0])
        );

        if (!existingPayment) {
          console.log(`🔧 Adding missing payment: ₹${invoice.paymentDetails.actualAmountPaid} for ${patient.name} (Invoice: ${invoice.id})`);
          
          const missingPayment = {
            id: `PAY-SYNC-${Date.now()}-${updatedPayments.length + 1}`,
            amount: invoice.paymentDetails.actualAmountPaid,
            type: 'Additional Payment',
            method: invoice.paymentDetails.paymentMethod || 'cash',
            date: new Date(invoice.paymentDetails.paymentDate).toISOString().split('T')[0],
            time: new Date(invoice.paymentDetails.paymentDate).toLocaleTimeString(),
            description: invoice.description || 'Payment synced from invoice',
            transactionId: invoice.paymentDetails.transactionId || null,
            invoiceId: invoice.id,
            syncedFromInvoice: true
          };

          updatedPayments.push(missingPayment);
          hasChanges = true;
          hasAnyChanges = true;
        }
      });

      if (hasChanges) {
        // Recalculate totals
        const totalPaid = updatedPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const dueAmount = Math.max(0, patient.paymentDetails.totalAmount - totalPaid);

        console.log(`✅ Synced payments for ${patient.name}: Total Paid updated from ₹${patient.paymentDetails.totalPaid} to ₹${totalPaid}`);

        return {
          ...patient,
          paymentDetails: {
            ...patient.paymentDetails,
            payments: updatedPayments,
            totalPaid: totalPaid,
            dueAmount: dueAmount,
            lastPaymentDate: updatedPayments[updatedPayments.length - 1].date,
            lastSyncedAt: new Date().toISOString()
          },
          editHistory: [
            ...(patient.editHistory || []),
            {
              action: 'payments_synced',
              timestamp: new Date().toISOString(),
              details: `Synced ${patientInvoices.length} missing payments from invoices. Total: ₹${totalPaid}`,
            }
          ]
        };
      }

      return patient;
    });
    
    // Only update state if there are actual changes
    if (hasAnyChanges) {
      console.log('✅ Updating patient state with synced payments');
      setAppState(prev => ({
        ...prev,
        patients: updatedPatients
      }));
    } else {
      console.log('✅ No missing payments found - all invoices are already synced');
    }
  };



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
    
    // Authentication State & Methods
    currentUser: appState.currentUser,
    currentPatient: appState.currentPatient,
    isAuthenticated: appState.isAuthenticated,
    userRole: appState.userRole,
    setCurrentUser,
    fetchCurrentPatientData,
    fetchUserSpecificData,
    clearUserData,
    forceCleanupListeners,
    debugAuthState,
    
    // Admin Stats (real-time calculated)
    adminStats: appState.adminStats,
    
    // Shared Data
    appointments: appState.appointments,
    doctors: appState.doctors,  
    payments: appState.payments,
    aggregatedPayments: appState.aggregatedPayments,
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
    checkRoomExists,
    getNextAvailableRoomNumber,
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
    updatePayment,
    updatePaymentStatus,
    updatePaymentStatusAndSync,
    generateInvoiceForPayment,
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
    syncMissingPaymentsFromInvoices,
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

    // Patient Data Methods  
    getPatientMedicalHistory,
    getRoomsByPatient,

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

// Hook for user authentication state
export const useAuth = () => {
  const { currentUser, currentPatient, isAuthenticated, userRole, setCurrentUser, clearUserData } = useApp();
  return {
    currentUser,
    currentPatient,
    isAuthenticated,
    userRole,
    setCurrentUser,
    clearUserData
  };
};

// Hook for user-specific data (only shows data for logged-in patient)
export const usePatientData = () => {
  const { 
    currentPatient, 
    isAuthenticated, 
    appointments, 
    medicalReports, 
    invoices, 
    payments, 
    discharges,
    fetchUserSpecificData 
  } = useApp();
  
  // Only return data if user is authenticated and has patient data
  if (!isAuthenticated || !currentPatient) {
    return {
      patient: null,
      appointments: [],
      medicalReports: [],
      invoices: [],
      payments: [],
      discharges: [],
      refreshData: () => console.log('No patient authenticated')
    };
  }
  
  return {
    patient: currentPatient,
    appointments: appointments || [],
    medicalReports: medicalReports || [],
    invoices: invoices || [],
    payments: payments || [],
    discharges: discharges || [],
    refreshData: () => fetchUserSpecificData(currentPatient.id)
  };
};

export default AppContext;