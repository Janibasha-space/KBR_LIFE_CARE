// Firebase Data Setup Script
// This script creates sample data in your Firebase Firestore database
// Run this once to populate your database with initial data

import { 
  collection, 
  addDoc, 
  doc, 
  setDoc 
} from 'firebase/firestore';
import { db } from './firebase.config';

// Sample doctors data
const sampleDoctors = [
  {
    name: 'Dr. Rajesh Kumar',
    specialty: 'Cardiology',
    qualification: 'MBBS, MD (Cardiology)',
    experience: '15 years',
    phone: '+91-9876543210',
    email: 'rajesh.kumar@kbrhospital.com',
    image: 'https://example.com/doctor1.jpg',
    consultationFee: 500,
    rating: 4.8,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timings: '9:00 AM - 5:00 PM',
    about: 'Experienced cardiologist specializing in heart diseases and cardiac surgeries.'
  },
  {
    name: 'Dr. Priya Sharma',
    specialty: 'Pediatrics',
    qualification: 'MBBS, MD (Pediatrics)',
    experience: '12 years',
    phone: '+91-9876543211',
    email: 'priya.sharma@kbrhospital.com',
    image: 'https://example.com/doctor2.jpg',
    consultationFee: 400,
    rating: 4.9,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    timings: '10:00 AM - 6:00 PM',
    about: 'Dedicated pediatrician with expertise in child healthcare and development.'
  },
  {
    name: 'Dr. Amit Singh',
    specialty: 'Orthopedics',
    qualification: 'MBBS, MS (Orthopedics)',
    experience: '18 years',
    phone: '+91-9876543212',
    email: 'amit.singh@kbrhospital.com',
    image: 'https://example.com/doctor3.jpg',
    consultationFee: 600,
    rating: 4.7,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    timings: '2:00 PM - 8:00 PM',
    about: 'Expert orthopedic surgeon specializing in joint replacements and sports injuries.'
  },
  {
    name: 'Dr. Sneha Reddy',
    specialty: 'Dermatology',
    qualification: 'MBBS, MD (Dermatology)',
    experience: '10 years',
    phone: '+91-9876543213',
    email: 'sneha.reddy@kbrhospital.com',
    image: 'https://example.com/doctor4.jpg',
    consultationFee: 450,
    rating: 4.6,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    timings: '11:00 AM - 7:00 PM',
    about: 'Skilled dermatologist focusing on skin care and cosmetic treatments.'
  }
];

// Sample hospital services
const sampleServices = [
  {
    name: 'Emergency Care',
    category: 'Emergency',
    description: '24/7 emergency medical services with advanced life support',
    price: 0,
    duration: 'Immediate',
    image: 'https://example.com/emergency.jpg',
    features: ['24/7 Availability', 'Advanced Equipment', 'Expert Staff']
  },
  {
    name: 'General Consultation',
    category: 'Consultation',
    description: 'Comprehensive health checkup and consultation',
    price: 300,
    duration: '30 minutes',
    image: 'https://example.com/consultation.jpg',
    features: ['Health Assessment', 'Medical Advice', 'Prescription']
  },
  {
    name: 'Blood Test Package',
    category: 'Diagnostics',
    description: 'Complete blood count and basic metabolic panel',
    price: 800,
    duration: '15 minutes',
    image: 'https://example.com/blood-test.jpg',
    features: ['CBC', 'Blood Sugar', 'Cholesterol', 'Liver Function']
  },
  {
    name: 'X-Ray Imaging',
    category: 'Imaging',
    description: 'Digital X-ray imaging services',
    price: 400,
    duration: '10 minutes',
    image: 'https://example.com/xray.jpg',
    features: ['Digital Imaging', 'Quick Results', 'Expert Analysis']
  },
  {
    name: 'Physiotherapy',
    category: 'Rehabilitation',
    description: 'Physical therapy and rehabilitation services',
    price: 600,
    duration: '45 minutes',
    image: 'https://example.com/physiotherapy.jpg',
    features: ['Pain Management', 'Movement Therapy', 'Recovery Support']
  }
];

// Sample medical reports template
const sampleReports = [
  {
    type: 'Blood Test',
    category: 'Laboratory',
    normalRanges: {
      hemoglobin: '12-16 g/dL',
      whiteBloodCells: '4000-11000 /μL',
      platelets: '150000-450000 /μL',
      glucose: '70-100 mg/dL'
    }
  },
  {
    type: 'X-Ray',
    category: 'Imaging',
    bodyParts: ['Chest', 'Abdomen', 'Limbs', 'Spine']
  },
  {
    type: 'ECG',
    category: 'Cardiac',
    parameters: ['Heart Rate', 'Rhythm', 'Conduction', 'Axis']
  }
];

// Function to setup Firebase data
export const setupFirebaseData = async () => {
  try {
    console.log('Setting up Firebase data...');
    
    // Add doctors
    console.log('Adding doctors...');
    for (const doctor of sampleDoctors) {
      await addDoc(collection(db, 'doctors'), {
        ...doctor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Add services
    console.log('Adding services...');
    for (const service of sampleServices) {
      await addDoc(collection(db, 'hospitalServices'), {
        ...service,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Add report templates
    console.log('Adding report templates...');
    for (const report of sampleReports) {
      await addDoc(collection(db, 'reportTemplates'), {
        ...report,
        createdAt: new Date().toISOString()
      });
    }
    
    // Create app configuration
    console.log('Creating app configuration...');
    await setDoc(doc(db, 'appConfig', 'general'), {
      hospitalName: 'KBR Life Care Hospital',
      address: 'Hospital Address, City, State',
      phone: '+91-9876543200',
      email: 'info@kbrhospital.com',
      emergencyNumber: '108',
      workingHours: '24/7',
      lastUpdated: new Date().toISOString()
    });
    
    console.log('Firebase data setup completed successfully!');
    return { success: true, message: 'Data setup completed' };
    
  } catch (error) {
    console.error('Error setting up Firebase data:', error);
    throw new Error('Failed to setup Firebase data');
  }
};

// Firestore Security Rules (copy this to Firebase Console)
export const firestoreSecurityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Doctors collection - read access for all authenticated users
    match /doctors/{doctorId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        resource.data.role == 'admin' || request.auth.token.admin == true;
    }
    
    // Hospital services - read access for all
    match /hospitalServices/{serviceId} {
      allow read: if true; // Public read access
      allow write: if request.auth != null && 
        resource.data.role == 'admin' || request.auth.token.admin == true;
    }
    
    // Appointments - users can only access their own appointments
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         resource.data.doctorId == request.auth.uid ||
         request.auth.token.admin == true);
    }
    
    // Medical history - only patient and authorized staff can access
    match /medicalHistory/{recordId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         request.auth.token.admin == true);
    }
    
    // Medical reports - only patient and authorized staff can access  
    match /medicalReports/{reportId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         request.auth.token.admin == true);
    }
    
    // App configuration - read access for all
    match /appConfig/{configId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Report templates - read access for authenticated users
    match /reportTemplates/{templateId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
`;

export default setupFirebaseData;