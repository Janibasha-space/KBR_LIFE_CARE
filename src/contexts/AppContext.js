import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { 
  RoomService, 
  InvoiceService, 
  PaymentService, 
  DischargeService, 
  ReportService 
} from '../services/hospitalServices';
import { FirebaseHospitalService } from '../services/firebaseHospitalServices';
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

  // Room Management (Hospital Rooms)
  rooms: [
    {
      id: 'R001',
      roomNumber: '101',
      floor: 1,
      type: 'General Ward',
      category: 'AC',
      status: 'Occupied',
      statusColor: '#EF4444',
      patientName: 'Rajesh Kumar',
      patientId: 'KBR-IP-2024-001',
      admissionDate: '2024-01-10',
      dailyRate: 2500,
      amenities: ['AC', 'TV', 'WiFi', 'Bathroom'],
      bed: 'A',
      totalBeds: 4,
      description: 'General ward room with AC and basic amenities',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'R002',
      roomNumber: '102',
      floor: 1,
      type: 'General Ward',
      category: 'Non-AC',
      status: 'Available',
      statusColor: '#10B981',
      patientName: null,
      patientId: null,
      admissionDate: null,
      dailyRate: 1500,
      amenities: ['Fan', 'TV', 'Bathroom'],
      bed: null,
      totalBeds: 6,
      description: 'Non-AC general ward with fan and basic facilities',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'R003',
      roomNumber: '201',
      floor: 2,
      type: 'Private Room',
      category: 'Deluxe',
      status: 'Occupied',
      statusColor: '#EF4444',
      patientName: 'Priya Sharma',
      patientId: 'KBR-IP-2024-002',
      admissionDate: '2024-01-12',
      dailyRate: 4500,
      amenities: ['AC', 'TV', 'WiFi', 'Fridge', 'Sofa', 'Bathroom'],
      bed: 'Single',
      totalBeds: 1,
      description: 'Deluxe private room with premium amenities',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'R004',
      roomNumber: '301',
      floor: 3,
      type: 'ICU',
      category: 'Critical Care',
      status: 'Under Maintenance',
      statusColor: '#F59E0B',
      patientName: null,
      patientId: null,
      admissionDate: null,
      dailyRate: 8000,
      amenities: ['Ventilator', 'Monitor', 'AC', 'Oxygen'],
      bed: 'ICU Bed',
      totalBeds: 1,
      description: 'ICU room with critical care equipment',
      createdAt: '2024-01-01T00:00:00Z'
    },
  ],
};

export const AppProvider = ({ children }) => {
  const [appState, setAppState] = useState(initialAppState);
  const [useBackend, setUseBackend] = useState(true); // Firebase backend integration
  const [isLoading, setIsLoading] = useState(false);

  // Initialize data from Firebase - only when user is authenticated
  const initializeFirebaseData = async () => {
    if (!useBackend) return;
    
    // Check if user is authenticated before attempting data fetch
    const { auth } = require('../config/firebase.config');
    const currentUser = auth.currentUser;
    
    // For development/debugging purposes, allow loading data even if not authenticated
    // This is a temporary fix for the issue with payment not showing after adding
    const skipAuthCheck = true;
    
    if (!currentUser && !skipAuthCheck) {
      console.log('🔒 Skipping Firebase data initialization - user not authenticated');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    console.log('📊 Loading Firebase data...' + (currentUser ? ' (authenticated)' : ' (UNAUTHENTICATED - DEV MODE)'));
    
    try {
      // Load all data from Firebase in parallel but handle partial failures.
      const results = await Promise.allSettled([
        RoomService.getAllRooms(),
        InvoiceService.getAllInvoices(),
        PaymentService.getAllPayments(),
        ReportService.getAllReports(),
        SimpleBookingService.getAllAppointments()
      ]);

      // Map results to variables with safe fallbacks
      const mapResult = (index) => {
        const res = results[index];
        if (res && res.status === 'fulfilled') return res.value;
        console.warn(`⚠️ Service at index ${index} failed to load:`, res && res.reason ? res.reason : 'unknown');
        return null;
      };

      const rooms = mapResult(0);
      const invoices = mapResult(1);
      const payments = mapResult(2);
      const reports = mapResult(3);
      const appointments = mapResult(4);

      setAppState(prev => ({
        ...prev,
        rooms: rooms || prev.rooms,
        invoices: invoices || prev.invoices,
        payments: payments || prev.payments,
        reports: reports || prev.reports,
        appointments: appointments || prev.appointments
      }));

      console.log('✅ Firebase data loaded (partial failures tolerated)');
      console.log(`📋 Loaded ${appointments?.length || 0} appointments`);
    } catch (error) {
      if (error.message.includes('Authentication required')) {
        console.log('🔐 Firebase data loading skipped - authentication required');
      } else {
        console.error('❌ Error loading Firebase data:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (useBackend) {
      initializeFirebaseData();
    }
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
      const appointments = await SimpleBookingService.getAllAppointments();
      
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
    if (useBackend) {
      try {
        const newRoom = await RoomService.createRoom(roomData);
        setAppState(prev => ({
          ...prev,
          rooms: [...prev.rooms, newRoom]
        }));
        return newRoom;
      } catch (error) {
        console.error('Error adding room:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      const newRoom = {
        id: `R${Date.now()}`,
        status: 'Available',
        statusColor: '#10B981',
        patientName: null,
        patientId: null,
        admissionDate: null,
        createdAt: new Date().toISOString(),
        ...roomData
      };

      setAppState(prev => ({
        ...prev,
        rooms: [...prev.rooms, newRoom]
      }));

      return newRoom;
    }
  };

  const updateRoom = async (roomId, updatedData) => {
    if (useBackend) {
      try {
        await RoomService.updateRoom(roomId, updatedData);
        setAppState(prev => ({
          ...prev,
          rooms: prev.rooms.map(room =>
            room.id === roomId ? { 
              ...room, 
              ...updatedData, 
              updatedAt: new Date().toISOString() 
            } : room
          )
        }));
      } catch (error) {
        console.error('Error updating room:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room =>
          room.id === roomId ? { 
            ...room, 
            ...updatedData, 
            updatedAt: new Date().toISOString() 
          } : room
        )
      }));
    }
  };

  const deleteRoom = async (roomId) => {
    if (useBackend) {
      try {
        await RoomService.deleteRoom(roomId);
        setAppState(prev => ({
          ...prev,
          rooms: prev.rooms.filter(room => room.id !== roomId)
        }));
      } catch (error) {
        console.error('Error deleting room:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        rooms: prev.rooms.filter(room => room.id !== roomId)
      }));
    }
  };

  const dischargePatient = async (roomId) => {
    if (useBackend) {
      try {
        await RoomService.dischargePatient(roomId);
        setAppState(prev => ({
          ...prev,
          rooms: prev.rooms.map(room =>
            room.id === roomId ? {
              ...room,
              status: 'Available',
              statusColor: '#10B981',
              patientName: null,
              patientId: null,
              admissionDate: null,
              dischargedAt: new Date().toISOString()
            } : room
          )
        }));
      } catch (error) {
        console.error('Error discharging patient:', error);
        throw error;
      }
    } else {
      // Fallback to local state
      setAppState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room =>
          room.id === roomId ? {
            ...room,
            status: 'Available',
            statusColor: '#10B981',
            patientName: null,
            patientId: null,
            admissionDate: null,
            dischargedAt: new Date().toISOString()
          } : room
        )
      }));
    }
  };

  const assignPatientToRoom = async (roomId, patientData) => {
    if (useBackend) {
      try {
        await RoomService.assignPatient(roomId, patientData);
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
        await DischargeService.processDischarge(patientId, dischargeDetails);
        // Also update room status
        if (dischargeDetails.roomId) {
          await dischargePatient(dischargeDetails.roomId);
        }
      } catch (error) {
        console.error('Error processing patient discharge:', error);
        throw error;
      }
    } else {
      // Fallback - just discharge from room
      if (dischargeDetails.roomId) {
        await dischargePatient(dischargeDetails.roomId);
      }
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
    // Find patient by phone number
    const patient = appState.patients.find(p => 
      p.phone === phoneNumber || 
      p.phone.replace(/\D/g, '').includes(phoneNumber.replace(/\D/g, ''))
    );

    if (!patient) {
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
        p.id === patient.id
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

    return { success: true, patient };
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
    loadAppointments,
    refreshAppointmentData,
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