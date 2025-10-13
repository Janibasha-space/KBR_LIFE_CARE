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

  // Pharmacy Inventory (shared between admin and patient)
  pharmacy: {
    inventory: [
      {
        id: 'med-001',
        name: 'Paracetamol 500mg',
        batchNo: 'PCM2024001',
        stock: 500,
        minStock: 100,
        price: 2.50,
        salePrice: 3.00,
        expiry: '2025-12-31',
        supplier: 'Medico Distributors',
        status: 'In Stock',
        category: 'Pain Relief',
        manufacturer: 'Apollo Pharmacy'
      },
      {
        id: 'med-002',
        name: 'Amoxicillin 250mg',
        batchNo: 'AMX2024002',
        stock: 200,
        minStock: 50,
        price: 12.00,
        salePrice: 15.75,
        expiry: '2025-08-15',
        supplier: 'Sun Pharma',
        status: 'In Stock',
        category: 'Antibiotic',
        manufacturer: 'Sun Pharma'
      },
      {
        id: 'med-003',
        name: 'Atorvastatin 10mg',
        batchNo: 'ATV2024003',
        stock: 150,
        minStock: 30,
        price: 6.50,
        salePrice: 8.00,
        expiry: '2025-10-20',
        supplier: 'Cipla',
        status: 'In Stock',
        category: 'Cardiovascular',
        manufacturer: 'Cipla'
      }
    ],
    sales: [],
    totalSales: 0,
    todaySales: 0,
  },

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

  // ==== PHARMACY MANAGEMENT ====
  const purchaseMedicine = (medicineId, quantity, patientData) => {
    setAppState(prev => {
      const medicine = prev.pharmacy.inventory.find(med => med.id === medicineId);
      if (!medicine || medicine.stock < quantity) {
        Alert.alert('Error', 'Insufficient stock or medicine not found');
        return prev;
      }

      // Update inventory
      const updatedInventory = prev.pharmacy.inventory.map(med =>
        med.id === medicineId
          ? { ...med, stock: med.stock - quantity }
          : med
      );

      // Create sale record
      const sale = {
        id: `sale-${Date.now()}`,
        medicineId,
        medicineName: medicine.name,
        quantity,
        unitPrice: medicine.salePrice,
        totalAmount: medicine.salePrice * quantity,
        patientName: patientData.patientName,
        patientId: patientData.patientId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        paymentMethod: patientData.paymentMethod || 'Cash'
      };

      const updatedSales = [...prev.pharmacy.sales, sale];
      const newTotalSales = prev.pharmacy.totalSales + sale.totalAmount;
      const today = new Date().toISOString().split('T')[0];
      const newTodaySales = updatedSales
        .filter(s => s.date === today)
        .reduce((sum, s) => sum + s.totalAmount, 0);

      return {
        ...prev,
        pharmacy: {
          ...prev.pharmacy,
          inventory: updatedInventory,
          sales: updatedSales,
          totalSales: newTotalSales,
          todaySales: newTodaySales
        }
      };
    });

    // Create payment record for pharmacy purchase
    const medicine = appState.pharmacy.inventory.find(med => med.id === medicineId);
    if (medicine) {
      addPayment({
        patientName: patientData.patientName,
        amount: medicine.salePrice * quantity,
        paymentMethod: patientData.paymentMethod || 'Cash',
        paymentStatus: 'Paid',
        type: 'pharmacy'
      });
    }
  };

  const addMedicine = (medicineData) => {
    const newMedicine = {
      id: `med-${Date.now()}`,
      status: 'In Stock',
      ...medicineData
    };

    setAppState(prev => ({
      ...prev,
      pharmacy: {
        ...prev.pharmacy,
        inventory: [...prev.pharmacy.inventory, newMedicine]
      }
    }));

    return newMedicine;
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
    pharmacy: appState.pharmacy,
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

    // Pharmacy Methods
    purchaseMedicine,
    addMedicine,

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