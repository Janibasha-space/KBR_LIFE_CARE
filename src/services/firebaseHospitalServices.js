// Firebase Hospital Services
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../config/firebase.config';
import { FirebaseAuthService } from './firebaseAuthService';
import TokenService from './tokenService';

// Utility function to safely update or create documents
// Helper function to clean undefined values from data
const cleanDataForFirebase = (data) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Recursively clean nested objects
        const cleanedNested = cleanDataForFirebase(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else if (Array.isArray(value)) {
        // Clean arrays
        const cleanedArray = value.filter(item => item !== undefined && item !== null);
        if (cleanedArray.length > 0) {
          cleaned[key] = cleanedArray;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
};

const safeUpdateDoc = async (docRef, data, options = {}) => {
  try {
    // Clean the data to remove undefined values
    const cleanedData = cleanDataForFirebase(data);
    console.log(`🧹 Cleaned data for document ${docRef.id}:`, Object.keys(cleanedData));
    
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.warn(`⚠️ Document ${docRef.id} not found. Creating new document.`);
      
      const newData = {
        id: docRef.id,
        ...cleanedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(docRef, newData);
      return { created: true, message: 'Document created successfully' };
    } else {
      await updateDoc(docRef, {
        ...cleanedData,
        updatedAt: new Date().toISOString()
      });
      return { created: false, message: 'Document updated successfully' };
    }
  } catch (error) {
    console.error('Error in safeUpdateDoc:', error);
    throw error;
  }
};

// Firebase Appointment Service
export class FirebaseAppointmentService {
  static collectionName = 'appointments';

  // Get all appointments
  static async getAppointments(patientId = null) {
    try {
      console.log('📋 FirebaseAppointmentService: Fetching appointments...');
      
      const appointmentsRef = collection(db, this.collectionName);
      let q;
      
      if (patientId) {
        // Use only where clause to avoid index requirement
        q = query(appointmentsRef, where('patientId', '==', patientId));
      } else {
        // For admin - get all appointments and sort in JavaScript
        q = query(appointmentsRef);
      }
      
      // Force fresh data from server (bypass cache)
      const querySnapshot = await getDocs(q);
      const appointments = [];
      
      querySnapshot.forEach((doc) => {
        const documentData = doc.data();
        const appointmentData = {
          firebaseDocId: doc.id,  // Preserve the actual Firebase document ID
          ...documentData,
          // Backwards compatibility: use 'id' field from data as appointmentId, fallback to Firebase doc ID
          appointmentId: documentData.id || doc.id,
          // Ensure we always have an 'id' field for React components (use Firebase doc ID)
          id: doc.id
        };
        console.log(`📋 Raw Firebase appointment data for ${doc.id}:`, appointmentData);
        appointments.push(appointmentData);
      });
      
      // Sort by appointmentDate in JavaScript to avoid index requirement
      appointments.sort((a, b) => {
        const dateA = new Date(a.appointmentDate || a.date || 0);
        const dateB = new Date(b.appointmentDate || b.date || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      console.log(`✅ Successfully fetched ${appointments.length} appointments for patientId: ${patientId || 'all'}`);
      
      return {
        success: true,
        data: appointments
      };
    } catch (error) {
      // Handle permission denied gracefully (expected when unauthenticated)
      if (error.code === 'permission-denied') {
        console.log('🔒 Firebase permission denied - returning empty appointments array for graceful degradation');
        return {
          success: true,
          data: [],
          warning: 'Permission denied - showing empty data'
        };
      }
      
      // For other errors, also return empty array to prevent app crashes
      console.log('🔒 Firebase error - returning empty appointments array for graceful degradation:', error.message);
      return {
        success: true,
        data: [],
        warning: `Error: ${error.message}`
      };
    }
  }

  // Book new appointment with token generation
  static async bookAppointment(appointmentData) {
    try {
      const user = auth.currentUser;
      console.log('🔐 Firebase auth currentUser:', user ? 'Authenticated' : 'Not authenticated');
      
      // For now, allow booking even if Firebase auth is not set up properly
      // In production, you should ensure proper authentication
      const patientId = user?.uid || `temp-user-${Date.now()}`;
      console.log('👤 Using patient ID:', patientId);

      console.log('📱 Starting appointment booking with token generation...');

      // Generate unique token number
      const tokenNumber = await TokenService.generateAppointmentToken();
      console.log(`🎫 Generated token: ${tokenNumber}`);

      const appointment = {
        ...appointmentData,
        patientId: appointmentData.patientId || patientId,
        tokenNumber: tokenNumber,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save appointment to appointments collection
      const docRef = await addDoc(collection(db, this.collectionName), appointment);
      console.log(`✅ Appointment saved with ID: ${docRef.id}`);

      // Save token with appointment details to token collection
      const tokenData = {
        tokenNumber: tokenNumber,
        appointmentId: docRef.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        serviceId: appointment.serviceId,
        appointmentDate: appointment.appointmentDate,
        patientName: appointment.patientName,
        contactNumber: appointment.contactNumber,
        status: 'scheduled'
      };

      await TokenService.saveAppointmentToken(tokenData);
      console.log(`💾 Token data saved: ${tokenNumber}`);

      const result = {
        success: true,
        data: {
          id: docRef.id,
          ...appointment
        },
        message: `Appointment booked successfully! Your token number is: ${tokenNumber}`
      };

      console.log('🎉 Appointment booking completed successfully');
      return result;

    } catch (error) {
      console.error('❌ Error booking appointment:', error);
      throw new Error(`Failed to book appointment: ${error.message}`);
    }
  }

  // Get appointment by token number
  static async getAppointmentByToken(tokenNumber) {
    try {
      console.log(`🔍 Looking up appointment with token: ${tokenNumber}`);
      
      const tokenResult = await TokenService.getAppointmentByToken(tokenNumber);
      
      if (!tokenResult.success) {
        return {
          success: false,
          message: 'Token not found'
        };
      }

      // Get full appointment details
      const appointmentRef = doc(db, this.collectionName, tokenResult.data.appointmentId);
      const appointmentDoc = await getDoc(appointmentRef);

      if (!appointmentDoc.exists()) {
        return {
          success: false,
          message: 'Appointment not found'
        };
      }

      return {
        success: true,
        data: {
          token: tokenResult.data,
          appointment: {
            id: appointmentDoc.id,
            ...appointmentDoc.data()
          }
        }
      };

    } catch (error) {
      console.error('❌ Error fetching appointment by token:', error);
      throw new Error('Failed to fetch appointment by token');
    }
  }

  // Cancel appointment
  static async cancelAppointment(appointmentId) {
    try {
      const appointmentRef = doc(db, this.collectionName, appointmentId);
      await updateDoc(appointmentRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Appointment cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw new Error('Failed to cancel appointment');
    }
  }

  // Reschedule appointment
  static async rescheduleAppointment(appointmentId, newDateTime) {
    try {
      const appointmentRef = doc(db, this.collectionName, appointmentId);
      await updateDoc(appointmentRef, {
        appointmentDate: newDateTime,
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Appointment rescheduled successfully'
      };
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw new Error('Failed to reschedule appointment');
    }
  }

  // Update appointment with comprehensive data
  static async updateAppointment(appointmentId, updateData) {
    try {
      console.log(`🔄 Updating appointment ${appointmentId} with data:`, updateData);
      
      const appointmentRef = doc(db, this.collectionName, appointmentId);
      
      // Try to update directly first - this is more efficient
      console.log(`📝 Attempting direct update for document: ${appointmentId}`);
      console.log(`🔍 Collection: ${this.collectionName}, Document ID: ${appointmentId}`);
      
      // First, let's verify the document exists
      console.log(`🔍 Checking if document exists before update...`);
      const preCheckDoc = await getDoc(appointmentRef);
      console.log(`📄 Document exists: ${preCheckDoc.exists()}`);
      
      if (preCheckDoc.exists()) {
        console.log(`📋 Current document data:`, preCheckDoc.data());
      }
      
      const dataToUpdate = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      try {
        await updateDoc(appointmentRef, dataToUpdate);
        console.log(`✅ Appointment ${appointmentId} updated successfully via direct update`);
        
        return {
          success: true,
          message: 'Appointment updated successfully'
        };
      } catch (updateError) {
        console.log(`⚠️ Direct update failed: ${updateError.message}, checking if document exists...`);
        
        // If direct update fails, check if document exists
        const appointmentDoc = await getDoc(appointmentRef);
        
        if (!appointmentDoc.exists()) {
          console.warn(`⚠️ Appointment document ${appointmentId} does not exist. Creating new document.`);
          
          // Create the document with the update data
          const dataToCreate = {
            id: appointmentId,
            ...updateData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await setDoc(appointmentRef, dataToCreate);
          console.log(`✅ Appointment ${appointmentId} created successfully`);
          
          return {
            success: true,
            message: 'Appointment created successfully'
          };
        }
        
        // Document exists but update failed, try again
        console.log(`📝 Document exists, retrying update...`);
        await updateDoc(appointmentRef, dataToUpdate);
        console.log(`✅ Appointment ${appointmentId} updated successfully on retry`);
        
        return {
          success: true,
          message: 'Appointment updated successfully'
        };
      }
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      throw new Error(`Failed to update appointment: ${error.message}`);
    }
  }

  // Get available time slots (mock implementation - you can enhance this)
  static async getAvailableSlots(doctorId, date) {
    try {
      // This is a simplified implementation
      // In a real app, you'd check doctor availability against existing appointments
      const slots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ];
      
      return {
        success: true,
        data: slots.map(time => ({
          time,
          available: true
        }))
      };
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw new Error('Failed to fetch available slots');
    }
  }
}

// Firebase Patient Service
export class FirebasePatientService {
  static collectionName = 'patients';

  // Create new patient
  static async createPatient(patientData) {
    try {
      console.log('👤 Creating patient in Firebase...', patientData.name);
      
      const patient = {
        ...patientData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, this.collectionName), patient);
      
      console.log(`✅ Patient created successfully with ID: ${docRef.id}`);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...patient
        },
        message: 'Patient created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating patient:', error);
      throw new Error(`Failed to create patient: ${error.message}`);
    }
  }

  // Get all patients (for admin dashboard)  
  static async getAllPatients() {
    try {
      const patientsRef = collection(db, this.collectionName);
      const querySnapshot = await getDocs(patientsRef);
      
      const patients = [];
      querySnapshot.forEach((doc) => {
        patients.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Successfully fetched ${patients.length} patients`);
      return {
        success: true,
        data: patients
      };
    } catch (error) {
      // Handle permission denied gracefully
      if (error.code === 'permission-denied') {
        console.log('🔒 Firebase permission denied - returning empty patients array for graceful degradation');
        return {
          success: true,
          data: [],
          warning: 'Permission denied - showing empty data'
        };
      }
      
      console.error('❌ Error fetching patients:', error);
      throw new Error(`Failed to fetch patients: ${error.message}`);
    }
  }

  // Real-time patients listener
  static subscribeToPatients(callback) {
    try {
      console.log('🔄 Setting up real-time patients listener...');
      
      const patientsRef = collection(db, this.collectionName);
      
      const unsubscribe = onSnapshot(patientsRef, 
        (querySnapshot) => {
          const patients = [];
          querySnapshot.forEach((doc) => {
            patients.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          console.log(`🔄 Real-time update: ${patients.length} patients`);
          callback({
            success: true,
            data: patients
          });
        },
        (error) => {
          if (error.code === 'permission-denied') {
            console.log('🔒 Permission denied - providing empty patients for graceful degradation');
            callback({
              success: true,
              data: [],
              warning: 'Permission denied - showing empty data'
            });
          } else {
            console.error('❌ Real-time patients listener error:', error);
            callback({
              success: false,
              data: [],
              error: error.message
            });
          }
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up patients listener:', error);
      return null;
    }
  }

  // Get all users (for admin dashboard)
  static async getAllUsers() {
    try {
      const usersRef = collection(db, this.collectionName);
      const querySnapshot = await getDocs(usersRef);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Successfully fetched ${users.length} users`);
      return {
        success: true,
        data: users
      };
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  // Get patient profile
  static async getProfile(patientId) {
    try {
      const userDoc = await getDoc(doc(db, this.collectionName, patientId));
      
      if (!userDoc.exists()) {
        throw new Error('Patient not found');
      }
      
      return {
        success: true,
        data: {
          id: userDoc.id,
          ...userDoc.data()
        }
      };
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      throw new Error('Failed to fetch patient profile');
    }
  }

  // Get or create patient profile from user credentials
  static async getOrCreateProfileFromUser(userId) {
    try {
      // First try to find existing patient record by userId
      const patientsRef = collection(db, this.collectionName);
      const q = query(patientsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Found existing patient record
        const patientDoc = querySnapshot.docs[0];
        console.log('✅ Found existing patient record for user:', userId);
        return {
          success: true,
          data: {
            id: patientDoc.id,
            ...patientDoc.data()
          }
        };
      }
      
      // No patient record found, try to get user credentials and create profile
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userCredentials = userDoc.data();
          console.log('📋 Creating patient profile from user credentials:', userCredentials.name);
          
          // Create a patient profile from user credentials
          const patientProfile = {
            id: userId,
            name: userCredentials.name || 'User',
            email: userCredentials.email || '',
            phone: userCredentials.phone || '',
            userId: userId,
            role: userCredentials.role || 'patient',
            bloodGroup: 'Not specified',
            address: '',
            emergencyContact: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          return {
            success: true,
            data: patientProfile,
            isTemporary: true // Flag to indicate this is created from user credentials
          };
        }
      } catch (userError) {
        console.log('⚠️ Could not fetch user credentials:', userError.message);
      }
      
      // Return minimal profile if everything fails
      return {
        success: true,
        data: {
          id: userId,
          name: 'User',
          email: '',
          phone: '',
          userId: userId,
          role: 'patient',
          bloodGroup: 'Not specified',
          address: '',
          emergencyContact: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        isTemporary: true
      };
      
    } catch (error) {
      console.error('Error in getOrCreateProfileFromUser:', error);
      throw new Error('Failed to get or create user profile');
    }
  }

  // Update patient profile
  static async updateProfile(patientId, profileData) {
    try {
      const userRef = doc(db, this.collectionName, patientId);
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Error updating patient profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  // Get patient medical history
  static async getMedicalHistory(patientId) {
    try {
      const medicalHistoryRef = collection(db, 'medicalHistory');
      const q = query(
        medicalHistoryRef,
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const history = [];
      
      querySnapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: history
      };
    } catch (error) {
      console.error('Error fetching medical history:', error);
      throw new Error('Failed to fetch medical history');
    }
  }

  // Get patient reports
  static async getReports(patientId) {
    try {
      const reportsRef = collection(db, 'medicalReports');
      const q = query(
        reportsRef,
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reports = [];
      
      querySnapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw new Error('Failed to fetch reports');
    }
  }
}

// Firebase Doctor Service
class FirebaseDoctorService {
  static collectionName = 'doctors';

  // Helper method to check authentication status
  static async ensureAuth(allowUnauthenticated = false) {
    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      
      if (user) {
        console.log('✅ User authenticated - ID:', user.uid);
        return user;
      } else if (allowUnauthenticated) {
        // Skip anonymous authentication since it's restricted, proceed with unauthenticated mode
        console.log('⚠️ Proceeding without authentication - using graceful degradation mode');
        return null;
      } else {
        // Don't attempt data fetching when no user is authenticated
        throw new Error('Authentication required - please login to access data');
      }
    } catch (error) {
      if (error.message.includes('Authentication required')) {
        throw error; // Re-throw auth requirement error
      }
      console.error('❌ Auth check failed:', error);
      throw new Error('Authentication check failed');
    }
  }

  // Get all doctors
  static async getDoctors() {
    try {
      // Allow public access to doctors data - no authentication required
      console.log('🔍 Fetching doctors for all users...');
      
      const doctorsRef = collection(db, this.collectionName);
      const querySnapshot = await getDocs(doctorsRef);
      const doctors = [];
      
      querySnapshot.forEach((doc) => {
        doctors.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Successfully fetched ${doctors.length} doctors`);
      
      return {
        success: true,
        data: doctors
      };
    } catch (error) {
      console.error('❌ Error fetching doctors:', error);
      console.error('Error code:', error.code);
      
      // Handle permission denied gracefully
      if (error.code === 'permission-denied') {
        console.log('🔒 Firebase permission denied - returning empty doctors array for graceful degradation');
        return {
          success: true,
          data: [],
          warning: 'Permission denied - showing empty data'
        };
      }
      console.error('Error message:', error.message);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied: Check Firebase Security Rules or user authentication');
      } else if (error.code === 'unavailable') {
        throw new Error('Firebase is temporarily unavailable. Check your internet connection.');
      } else {
        throw new Error(`Failed to fetch doctors: ${error.message}`);
      }
    }
  }

  // Get doctor by specialty
  static async getDoctorsBySpecialty(specialty) {
    try {
      const doctorsRef = collection(db, this.collectionName);
      const q = query(doctorsRef, where('specialty', '==', specialty));
      
      const querySnapshot = await getDocs(q);
      const doctors = [];
      
      querySnapshot.forEach((doc) => {
        doctors.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: doctors
      };
    } catch (error) {
      console.error('Error fetching doctors by specialty:', error);
      throw new Error('Failed to fetch doctors');
    }
  }

  // Get doctor profile
  static async getDoctorProfile(doctorId) {
    try {
      const doctorDoc = await getDoc(doc(db, this.collectionName, doctorId));
      
      if (!doctorDoc.exists()) {
        throw new Error('Doctor not found');
      }
      
      return {
        success: true,
        data: {
          id: doctorDoc.id,
          ...doctorDoc.data()
        }
      };
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      throw new Error('Failed to fetch doctor profile');
    }
  }

  // Create new doctor
  static async createDoctor(doctorData) {
    try {
      // Ensure user is authenticated before accessing Firestore
      await this.ensureAuth();
      console.log('👨‍⚕️ Creating doctor with authenticated user...');
      
      const doctor = {
        ...doctorData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, this.collectionName), doctor);
      
      console.log('✅ Doctor created successfully with ID:', docRef.id);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...doctor
        },
        message: 'Doctor created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating doctor:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied: Check Firebase Security Rules or user authentication');
      } else if (error.code === 'unavailable') {
        throw new Error('Firebase is temporarily unavailable. Check your internet connection.');
      } else {
        throw new Error(`Failed to create doctor: ${error.message}`);
      }
    }
  }

  // Update doctor
  static async updateDoctor(doctorId, doctorData) {
    try {
      const doctorRef = doc(db, this.collectionName, doctorId);
      await updateDoc(doctorRef, {
        ...doctorData,
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Doctor updated successfully'
      };
    } catch (error) {
      console.error('Error updating doctor:', error);
      throw new Error('Failed to update doctor');
    }
  }

  // Delete doctor
  static async deleteDoctor(doctorId) {
    try {
      const doctorRef = doc(db, this.collectionName, doctorId);
      await deleteDoc(doctorRef);
      
      return {
        success: true,
        message: 'Doctor deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting doctor:', error);
      throw new Error('Failed to delete doctor');
    }
  }

  // Subscribe to real-time doctors updates
  static subscribeToDoctors(callback) {
    try {
      console.log('🔄 Setting up real-time doctors listener...');
      const doctorsRef = collection(db, this.collectionName);
      
      const unsubscribe = onSnapshot(doctorsRef, 
        (querySnapshot) => {
          const doctors = [];
          querySnapshot.forEach((doc) => {
            doctors.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          console.log(`🔄 Real-time update: ${doctors.length} doctors`);
          callback({
            success: true,
            data: doctors
          });
        },
        (error) => {
          console.error('❌ Doctors listener error:', error);
          if (error.code === 'permission-denied') {
            console.log('🔒 Permission denied for doctors - using empty array');
            callback({
              success: true,
              data: [],
              warning: 'Permission denied - limited access'
            });
          } else {
            callback({
              success: false,
              error: error.message
            });
          }
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up doctors listener:', error);
      callback({
        success: false,
        error: error.message
      });
      return null;
    }
  }
}

// Firebase Service API Service
class FirebaseServiceApiService {
  static collectionName = 'hospitalServices';

  // Helper method to ensure authentication - delegate to FirebaseDoctorService
  static async ensureAuth() {
    return await FirebaseDoctorService.ensureAuth();
  }

  // Get all services with assigned doctors
  static async getServices() {
    try {
      // Allow public access to services data - no authentication required
      console.log('🔍 Fetching services for all users...');
      
      const servicesRef = collection(db, this.collectionName);
      const querySnapshot = await getDocs(servicesRef);
      const services = [];
      
      querySnapshot.forEach((doc) => {
        const serviceData = doc.data();
        services.push({
          id: doc.id,
          ...serviceData,
          assignedDoctors: serviceData.assignedDoctors || [], // Ensure this field exists
          doctorCount: serviceData.assignedDoctors ? serviceData.assignedDoctors.length : 0
        });
      });
      
      console.log(`✅ Successfully fetched ${services.length} services`);
      
      return {
        success: true,
        data: services
      };
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      throw new Error('Failed to fetch services');
    }
  }

  // Get services by category
  static async getServicesByCategory(category) {
    try {
      const servicesRef = collection(db, this.collectionName);
      const q = query(servicesRef, where('category', '==', category));
      
      const querySnapshot = await getDocs(q);
      const services = [];
      
      querySnapshot.forEach((doc) => {
        services.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: services
      };
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw new Error('Failed to fetch services');
    }
  }

  // Create new service (admin only)
  static async createService(serviceData) {
    try {
      // For admin operations, we'll allow creation without authentication check
      // TODO: Implement proper admin authentication

      const service = {
        ...serviceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, this.collectionName), service);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...service
        },
        message: 'Service created successfully'
      };
    } catch (error) {
      console.error('Error creating service:', error);
      throw new Error('Failed to create service');
    }
  }

  // Update service (admin only)
  static async updateService(serviceId, serviceData) {
    try {
      const serviceRef = doc(db, this.collectionName, serviceId);
      await updateDoc(serviceRef, {
        ...serviceData,
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Service updated successfully'
      };
    } catch (error) {
      console.error('Error updating service:', error);
      throw new Error('Failed to update service');
    }
  }

  // Delete service (admin only)
  static async deleteService(serviceId) {
    try {
      const serviceRef = doc(db, this.collectionName, serviceId);
      await deleteDoc(serviceRef);
      
      return {
        success: true,
        message: 'Service deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting service:', error);
      throw new Error('Failed to delete service');
    }
  }

  // Assign doctor to service
  static async assignDoctorToService(serviceId, doctorId) {
    try {
      await FirebaseDoctorService.ensureAuth();
      
      const serviceRef = doc(db, this.collectionName, serviceId);
      const serviceDoc = await getDoc(serviceRef);
      
      if (!serviceDoc.exists()) {
        throw new Error('Service not found');
      }
      
      const serviceData = serviceDoc.data();
      const currentDoctors = serviceData.assignedDoctors || [];
      
      // Check if doctor is already assigned - return success instead of error
      if (currentDoctors.includes(doctorId)) {
        console.log(`ℹ️ Doctor ${doctorId} is already assigned to service ${serviceId}`);
        return {
          success: true,
          message: 'Doctor is already assigned to this service',
          alreadyAssigned: true
        };
      }
      
      // Add doctor to the service
      const updatedDoctors = [...currentDoctors, doctorId];
      
      await updateDoc(serviceRef, {
        assignedDoctors: updatedDoctors,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Doctor ${doctorId} assigned to service ${serviceId}`);
      
      return {
        success: true,
        message: 'Doctor assigned to service successfully',
        alreadyAssigned: false
      };
    } catch (error) {
      console.error('❌ Error assigning doctor to service:', error);
      return {
        success: false,
        message: error.message || 'Failed to assign doctor to service'
      };
    }
  }

  // Unassign doctor from service
  static async unassignDoctorFromService(serviceId, doctorId) {
    try {
      await FirebaseDoctorService.ensureAuth();
      
      const serviceRef = doc(db, this.collectionName, serviceId);
      const serviceDoc = await getDoc(serviceRef);
      
      if (!serviceDoc.exists()) {
        return {
          success: false,
          message: 'Service not found'
        };
      }
      
      const serviceData = serviceDoc.data();
      const currentDoctors = serviceData.assignedDoctors || [];
      
      // Check if doctor is actually assigned
      if (!currentDoctors.includes(doctorId)) {
        console.log(`ℹ️ Doctor ${doctorId} is not assigned to service ${serviceId}`);
        return {
          success: true,
          message: 'Doctor is not assigned to this service',
          wasNotAssigned: true
        };
      }
      
      // Remove doctor from the service
      const updatedDoctors = currentDoctors.filter(id => id !== doctorId);
      
      await updateDoc(serviceRef, {
        assignedDoctors: updatedDoctors,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Doctor ${doctorId} unassigned from service ${serviceId}`);
      
      return {
        success: true,
        message: 'Doctor unassigned from service successfully',
        wasNotAssigned: false
      };
    } catch (error) {
      console.error('❌ Error unassigning doctor from service:', error);
      return {
        success: false,
        message: error.message || 'Failed to unassign doctor from service'
      };
    }
  }

  // Get services with detailed doctor information
  static async getServicesWithDoctors() {
    try {
      // Allow public access - no authentication required
      console.log('🔍 Fetching services with doctor details for all users...');
      
      // Get all services
      const servicesResult = await this.getServices();
      if (!servicesResult.success) {
        throw new Error('Failed to fetch services');
      }
      
      // Get all doctors
      const doctorsResult = await FirebaseDoctorService.getDoctors();
      if (!doctorsResult.success) {
        throw new Error('Failed to fetch doctors');
      }
      
      const doctors = doctorsResult.data;
      const services = servicesResult.data;
      
      // Enhance services with doctor details
      const servicesWithDoctors = services.map(service => {
        const assignedDoctorDetails = (service.assignedDoctors || [])
          .map(doctorId => doctors.find(doctor => doctor.id === doctorId))
          .filter(doctor => doctor !== undefined);
        
        return {
          ...service,
          doctorDetails: assignedDoctorDetails
        };
      });
      
      console.log(`✅ Successfully fetched ${servicesWithDoctors.length} services with doctor details`);
      
      return {
        success: true,
        data: servicesWithDoctors
      };
    } catch (error) {
      console.error('❌ Error fetching services with doctors:', error);
      throw new Error('Failed to fetch services with doctor details');
    }
  }
}

// Firebase Hospital Services Management
class FirebaseHospitalServiceManager {
  static collectionName = 'hospitalServices';

  // Get all services
  static async getServices() {
    try {
      const q = query(collection(db, this.collectionName));
      const querySnapshot = await getDocs(q);
      
      const services = [];
      querySnapshot.forEach((doc) => {
        services.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: services
      };
    } catch (error) {
      console.error('Error getting services:', error);
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  }

  // Create new service
  static async createService(serviceData) {
    try {
      const service = {
        ...serviceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };

      const docRef = await addDoc(collection(db, this.collectionName), service);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...service
        },
        message: 'Service created successfully'
      };
    } catch (error) {
      console.error('Error creating service:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Update service
  static async updateService(serviceId, serviceData) {
    try {
      const serviceRef = doc(db, this.collectionName, serviceId);
      await updateDoc(serviceRef, {
        ...serviceData,
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Service updated successfully'
      };
    } catch (error) {
      console.error('Error updating service:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Delete service
  static async deleteService(serviceId) {
    try {
      const serviceRef = doc(db, this.collectionName, serviceId);
      await deleteDoc(serviceRef);
      
      return {
        success: true,
        message: 'Service deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting service:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

// Firebase Test Management Service
class FirebaseTestService {
  static collectionName = 'tests';

  // Get all tests
  static async getTests() {
    try {
      const q = query(collection(db, this.collectionName));
      const querySnapshot = await getDocs(q);
      
      const tests = [];
      querySnapshot.forEach((doc) => {
        tests.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: tests
      };
    } catch (error) {
      console.error('Error getting tests:', error);
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  }

  // Create new test
  static async createTest(testData) {
    try {
      const test = {
        ...testData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };

      const docRef = await addDoc(collection(db, this.collectionName), test);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...test
        },
        message: 'Test created successfully'
      };
    } catch (error) {
      console.error('Error creating test:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Update test
  static async updateTest(testId, testData) {
    try {
      const testRef = doc(db, this.collectionName, testId);
      await updateDoc(testRef, {
        ...testData,
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Test updated successfully'
      };
    } catch (error) {
      console.error('Error updating test:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Delete test
  static async deleteTest(testId) {
    try {
      const testRef = doc(db, this.collectionName, testId);
      await deleteDoc(testRef);
      
      return {
        success: true,
        message: 'Test deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting test:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

// Firebase Room Management Service
class FirebaseRoomService {
  static collectionName = 'rooms';

  // Helper method to ensure authentication
  static async ensureAuth(allowUnauthenticated = false) {
    return await FirebaseDoctorService.ensureAuth(allowUnauthenticated);
  }

  // Get all rooms (one-time fetch)
  static async getRooms() {
    try {
      await this.ensureAuth(true); // Allow unauthenticated access for viewing rooms
      
      const roomsRef = collection(db, this.collectionName);
      const q = query(roomsRef, orderBy('roomNumber', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const rooms = [];
      querySnapshot.forEach((doc) => {
        rooms.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Successfully fetched ${rooms.length} rooms`);
      return {
        success: true,
        data: rooms
      };
    } catch (error) {
      // Handle permission denied gracefully (expected when unauthenticated)
      if (error.code === 'permission-denied') {
        console.log('🔒 Firebase permission denied - returning empty rooms array for graceful degradation');
        return {
          success: true,
          data: [],
          warning: 'Permission denied - showing empty data'
        };
      }
      
      // For other errors, also return empty array to prevent app crashes
      console.log('🔒 Firebase error - returning empty rooms array for graceful degradation:', error.message);
      return {
        success: true,
        data: [],
        warning: `Error: ${error.message}`
      };
    }
  }

  // Real-time rooms listener
  static subscribeToRooms(callback) {
    try {
      console.log('🔄 Setting up real-time rooms listener...');
      
      const roomsRef = collection(db, this.collectionName);
      const q = query(roomsRef, orderBy('roomNumber', 'asc'));
      
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const rooms = [];
          querySnapshot.forEach((doc) => {
            rooms.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          console.log(`🔄 Real-time update: ${rooms.length} rooms`);
          callback({
            success: true,
            data: rooms
          });
        },
        (error) => {
          if (error.code === 'permission-denied') {
            console.log('🔒 Permission denied - providing empty rooms for graceful degradation');
            callback({
              success: true,
              data: [],
              warning: 'Permission denied - showing empty data'
            });
          } else {
            console.error('❌ Real-time rooms listener error:', error);
            callback({
              success: false,
              data: [],
              error: error.message
            });
          }
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up rooms listener:', error);
      return null;
    }
  }

  // Create new room
  static async createRoom(roomData) {
    try {
      await this.ensureAuth();
      
      // Check if room number already exists
      const roomsRef = collection(db, this.collectionName);
      const q = query(roomsRef, where('roomNumber', '==', roomData.roomNumber));
      const existingRooms = await getDocs(q);
      
      if (!existingRooms.empty) {
        throw new Error(`Room ${roomData.roomNumber} already exists`);
      }
      
      // Generate bed labels for this room
      const generateBedLabels = (totalBeds) => {
        const bedLabels = [];
        for (let i = 1; i <= totalBeds; i++) {
          bedLabels.push(`${roomData.roomNumber}${String.fromCharCode(64 + i)}`); // A, B, C, etc.
        }
        return bedLabels;
      };

      const bedLabels = generateBedLabels(roomData.totalBeds || 1);
      
      const room = {
        ...roomData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: roomData.status || 'Available',
        statusColor: roomData.statusColor || '#10B981',
        patientName: null,
        patientId: null,
        admissionDate: null,
        // Bed management arrays
        occupiedBeds: [],
        availableBeds: [...bedLabels],
        bedLabels: bedLabels
      };

      const docRef = await addDoc(collection(db, this.collectionName), room);
      
      console.log(`✅ Room ${roomData.roomNumber} created successfully`);
      return {
        success: true,
        data: {
          id: docRef.id,
          ...room
        },
        message: 'Room created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating room:', error);
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }

  // Update room
  static async updateRoom(roomId, roomData) {
    try {
      await this.ensureAuth();
      
      const roomRef = doc(db, this.collectionName, roomId);
      const result = await safeUpdateDoc(roomRef, roomData);
      
      console.log(`✅ Room ${roomId} ${result.created ? 'created' : 'updated'} successfully`);
      
      return {
        success: true,
        message: result.message,
        created: result.created
      };
    } catch (error) {
      console.error('❌ Error updating room:', error);
      throw new Error(`Failed to update room: ${error.message}`);
    }
  }

  // Delete room
  static async deleteRoom(roomId) {
    try {
      await this.ensureAuth();
      
      const roomRef = doc(db, this.collectionName, roomId);
      await deleteDoc(roomRef);
      
      console.log(`✅ Room ${roomId} deleted successfully`);
      return {
        success: true,
        message: 'Room deleted successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting room:', error);
      throw new Error(`Failed to delete room: ${error.message}`);
    }
  }

  // Assign patient to room
  static async assignPatient(roomId, patientData) {
    try {
      await this.ensureAuth();
      
      const roomRef = doc(db, this.collectionName, roomId);
      await updateDoc(roomRef, {
        status: 'Occupied',
        statusColor: '#EF4444',
        patientName: patientData.patientName,
        patientId: patientData.patientId,
        admissionDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Patient ${patientData.patientName} assigned to room ${roomId}`);
      return {
        success: true,
        message: 'Patient assigned to room successfully'
      };
    } catch (error) {
      console.error('❌ Error assigning patient to room:', error);
      throw new Error(`Failed to assign patient to room: ${error.message}`);
    }
  }

  // Discharge patient from room
  static async dischargePatient(roomId) {
    try {
      await this.ensureAuth();
      
      const roomRef = doc(db, this.collectionName, roomId);
      await updateDoc(roomRef, {
        status: 'Available',
        statusColor: '#10B981',
        patientName: null,
        patientId: null,
        admissionDate: null,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Patient discharged from room ${roomId}`);
      return {
        success: true,
        message: 'Patient discharged successfully'
      };
    } catch (error) {
      console.error('❌ Error discharging patient from room:', error);
      throw new Error(`Failed to discharge patient from room: ${error.message}`);
    }
  }

  // Get room statistics
  static async getRoomStats() {
    try {
      const rooms = await this.getRooms();
      if (!rooms.success) return { success: false, data: {} };
      
      const allRooms = rooms.data;
      const stats = {
        totalRooms: allRooms.length,
        occupiedRooms: allRooms.filter(r => r.status === 'Occupied').length,
        availableRooms: allRooms.filter(r => r.status === 'Available').length,
        underMaintenance: allRooms.filter(r => r.status === 'Under Maintenance').length,
        occupancyRate: 0
      };
      
      stats.occupancyRate = stats.totalRooms > 0 ? 
        Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ Error getting room stats:', error);
      return {
        success: false,
        data: {}
      };
    }
  }

  // Assign patient to specific bed
  static async assignPatientToBed(roomIdOrNumber, bedNumber, patientData) {
    try {
      await this.ensureAuth();
      
      console.log('🛏️ Assigning patient to bed - Room ID/Number:', roomIdOrNumber, 'Bed:', bedNumber, 'Patient:', patientData);
      
      if (!roomIdOrNumber) {
        throw new Error('Room ID or room number is required but not provided');
      }
      
      // Extract room number from bed number if needed (bedNumber format: "7091A")
      const roomNumber = bedNumber.replace(/[A-Za-z]/g, ''); // Remove letters to get room number
      console.log('🔍 Extracted room number from bed:', roomNumber);
      
      // Always search by room number first (more reliable than potentially stale IDs)
      console.log('🔍 Searching for room by room number:', roomNumber);
      const roomsRef = collection(db, this.collectionName);
      const q = query(roomsRef, where('roomNumber', '==', roomNumber));
      const querySnapshot = await getDocs(q);
      
      let roomRef;
      let roomDoc;
      
      if (!querySnapshot.empty) {
        // Use the first matching room (there should only be one per room number)
        roomDoc = querySnapshot.docs[0];
        roomRef = roomDoc.ref;
        console.log('✅ Found room by room number:', roomDoc.data()?.roomNumber, 'Firebase ID:', roomDoc.id);
      } else {
        // Fallback: try to find by the provided ID if room number search failed
        console.log('🔍 Room number search failed, trying by provided ID:', roomIdOrNumber);
        roomRef = doc(db, this.collectionName, roomIdOrNumber);
        roomDoc = await getDoc(roomRef);
      }
      
      if (!roomDoc || !roomDoc.exists()) {
        console.error('❌ Room not found by room number:', roomNumber);
        console.log('🔍 Debugging: Checking all rooms in Firebase...');
        const allRoomsRef = collection(db, this.collectionName);
        const allRoomsSnapshot = await getDocs(allRoomsRef);
        console.log('🔍 All Firebase rooms:');
        allRoomsSnapshot.forEach((doc) => {
          console.log(`  - ID: ${doc.id}, Data:`, doc.data());
        });
        
        throw new Error(`Room not found with room number: ${roomNumber}`);
      }
      
      const roomData = roomDoc.data();
      const currentOccupiedBeds = roomData.occupiedBeds || [];
      const currentAvailableBeds = roomData.availableBeds || [];
      
      // Check if bed is available
      if (!currentAvailableBeds.includes(bedNumber)) {
        throw new Error(`Bed ${bedNumber} is not available`);
      }
      
      // Add to occupied beds
      const newOccupiedBeds = [...currentOccupiedBeds, {
        bedNumber,
        patientName: patientData.name,
        patientId: patientData.id,
        admissionDate: new Date().toISOString().split('T')[0]
      }];
      
      // Remove from available beds
      const newAvailableBeds = currentAvailableBeds.filter(bed => bed !== bedNumber);
      
      // Calculate new room status
      const totalBeds = roomData.totalBeds || 1;
      let newStatus = 'Available';
      let newStatusColor = '#10B981';
      
      if (newOccupiedBeds.length === totalBeds) {
        newStatus = 'Occupied';
        newStatusColor = '#EF4444';
      } else if (newOccupiedBeds.length > 0) {
        newStatus = 'Partially Occupied';
        newStatusColor = '#F59E0B';
      }
      
      await updateDoc(roomRef, {
        occupiedBeds: newOccupiedBeds,
        availableBeds: newAvailableBeds,
        status: newStatus,
        statusColor: newStatusColor,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Patient ${patientData.name} assigned to bed ${bedNumber} in room ${roomNumber}`);
      return {
        success: true,
        message: 'Patient assigned to bed successfully'
      };
    } catch (error) {
      console.error('❌ Error assigning patient to bed:', error);
      throw new Error(`Failed to assign patient to bed: ${error.message}`);
    }
  }

  // Release patient from specific bed
  static async releasePatientFromBed(roomId, bedNumber, patientId) {
    try {
      await this.ensureAuth();
      
      const roomRef = doc(db, this.collectionName, roomId);
      const roomDoc = await getDoc(roomRef);
      
      if (!roomDoc.exists()) {
        throw new Error('Room not found');
      }
      
      const roomData = roomDoc.data();
      const currentOccupiedBeds = roomData.occupiedBeds || [];
      const currentAvailableBeds = roomData.availableBeds || [];
      
      // Remove from occupied beds
      const newOccupiedBeds = currentOccupiedBeds.filter(
        bed => bed.bedNumber !== bedNumber || bed.patientId !== patientId
      );
      
      // Add back to available beds (if room is not under maintenance)
      const newAvailableBeds = roomData.status !== 'Under Maintenance' ? 
        [...currentAvailableBeds, bedNumber] : currentAvailableBeds;
      
      // Calculate new room status
      const totalBeds = roomData.totalBeds || 1;
      let newStatus = 'Available';
      let newStatusColor = '#10B981';
      
      if (roomData.status === 'Under Maintenance') {
        newStatus = 'Under Maintenance';
        newStatusColor = '#F59E0B';
      } else if (newOccupiedBeds.length === totalBeds) {
        newStatus = 'Occupied';
        newStatusColor = '#EF4444';
      } else if (newOccupiedBeds.length > 0) {
        newStatus = 'Partially Occupied';
        newStatusColor = '#F59E0B';
      }
      
      await updateDoc(roomRef, {
        occupiedBeds: newOccupiedBeds,
        availableBeds: newAvailableBeds,
        status: newStatus,
        statusColor: newStatusColor,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Patient ${patientId} released from bed ${bedNumber} in room ${roomId}`);
      return {
        success: true,
        message: 'Patient released from bed successfully'
      };
    } catch (error) {
      console.error('❌ Error releasing patient from bed:', error);
      throw new Error(`Failed to release patient from bed: ${error.message}`);
    }
  }

  // Get available beds for a room
  static async getAvailableBeds(roomId) {
    try {
      await this.ensureAuth(true); // Allow unauthenticated access
      
      const roomRef = doc(db, this.collectionName, roomId);
      const roomDoc = await getDoc(roomRef);
      
      if (!roomDoc.exists()) {
        return {
          success: false,
          data: []
        };
      }
      
      const roomData = roomDoc.data();
      const availableBeds = roomData.availableBeds || [];
      
      return {
        success: true,
        data: availableBeds
      };
    } catch (error) {
      console.error('❌ Error getting available beds:', error);
      return {
        success: false,
        data: []
      };
    }
  }
}

// Firebase Invoice Management Service
class FirebaseInvoiceService {
  static collectionName = 'invoices';

  // Helper method to ensure authentication
  static async ensureAuth(allowUnauthenticated = false) {
    return await FirebaseDoctorService.ensureAuth(allowUnauthenticated);
  }

  // Get all invoices
  static async getInvoices() {
    try {
      await this.ensureAuth(true); // Allow unauthenticated access for viewing invoices
      
      const invoicesRef = collection(db, this.collectionName);
      const q = query(invoicesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const invoices = [];
      querySnapshot.forEach((doc) => {
        invoices.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Successfully fetched ${invoices.length} invoices`);
      return {
        success: true,
        data: invoices
      };
    } catch (error) {
      // Handle permission denied gracefully (expected when unauthenticated)
      if (error.code === 'permission-denied') {
        console.log('🔒 Firebase permission denied - returning empty invoices array for graceful degradation');
        return {
          success: true,
          data: [],
          warning: 'Permission denied - showing empty data'
        };
      }
      
      // For other errors, also return empty array to prevent app crashes
      console.log('🔒 Firebase error - returning empty invoices array for graceful degradation:', error.message);
      return {
        success: true,
        data: [],
        warning: `Error: ${error.message}`
      };
    }
  }

  // Subscribe to real-time invoices updates
  static subscribeToInvoices(callback) {
    try {
      console.log('🔄 Setting up real-time invoices listener...');
      
      // Check authentication before setting up listener
      const { auth } = require('../config/firebase.config');
      const currentUser = auth.currentUser;
      
      // For now, let's not require authentication for invoices since the rules allow public read
      // This will prevent permission errors while still allowing the listener to work
      if (!currentUser) {
        console.log('⚠️ Setting up invoices listener without authentication (public read access)');
      } else {
        console.log('✅ Setting up invoices listener with authenticated user:', currentUser.uid);
      }
      
      const invoicesRef = collection(db, this.collectionName);
      const q = query(invoicesRef, orderBy('createdAt', 'desc'));
      
      // Create a flag to track if this listener should be active
      let isListenerActive = true;
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        try {
          // Check if listener is still active
          if (!isListenerActive) {
            console.log('🚫 Invoices listener callback: Listener inactive, ignoring update');
            return;
          }
          
          // Since invoices have public read access, we don't need to block based on auth
          const { auth } = require('../config/firebase.config');
          const currentUser = auth.currentUser;
          
          const invoices = [];
          querySnapshot.forEach((doc) => {
            invoices.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          const userInfo = currentUser ? ` (user: ${currentUser.uid})` : ' (public access)';
          console.log(`🔄 Real-time update: ${invoices.length} invoices${userInfo}`);
          callback({
            success: true,
            data: invoices
          });
        } catch (error) {
          console.error('❌ Error processing invoices snapshot:', error);
          callback({
            success: false,
            error: error.message,
            data: []
          });
        }
      }, (error) => {
        // Mark listener as inactive immediately to prevent further errors
        isListenerActive = false;
        
        if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
          console.log('🔒 Permission/authentication error for invoices - disabling listener');
          // Don't log as ERROR for expected permission issues
          callback({
            success: true,
            data: [],
            warning: 'Authentication error - listener disabled'
          });
        } else if (error.code === 'unavailable' || error.code === 'deadline-exceeded') {
          console.log('🌐 Network error for invoices - will retry automatically');
          // Don't mark as inactive for network errors, but don't spam callbacks
          return;
        } else {
          console.error('❌ Invoices real-time listener error:', error);
          console.log('🚫 Unknown error for invoices - disabling listener');
          callback({
            success: false,
            error: error.message,
            data: []
          });
        }
      });
      
      // Return a wrapped unsubscribe function that also marks listener as inactive
      return () => {
        try {
          console.log('🗑️ Unsubscribing from invoices listener and marking as inactive');
          isListenerActive = false;
          if (unsubscribe) {
            unsubscribe();
          }
        } catch (error) {
          console.error('❌ Error during invoices listener unsubscribe:', error);
        }
      };
    } catch (error) {
      console.error('❌ Error setting up invoices real-time listener:', error);
      callback({
        success: false,
        error: error.message,
        data: []
      });
      return null;
    }
  }

  // Create new invoice
  static async createInvoice(invoiceData) {
    try {
      await this.ensureAuth();
      
      const invoiceNumber = `INV-${Date.now()}`;
      const invoice = {
        ...invoiceData,
        invoiceNumber,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const docRef = await addDoc(collection(db, this.collectionName), invoice);
      
      console.log(`✅ Invoice ${invoiceNumber} created successfully`);
      return {
        success: true,
        data: {
          id: docRef.id,
          ...invoice
        },
        message: 'Invoice created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  // Update invoice status
  static async updateInvoiceStatus(invoiceId, status) {
    try {
      await this.ensureAuth();
      
      const invoiceRef = doc(db, this.collectionName, invoiceId);
      const result = await safeUpdateDoc(invoiceRef, { status });
      
      console.log(`✅ Invoice ${invoiceId} status ${result.created ? 'created and set' : 'updated'} to ${status}`);
      return {
        success: true,
        message: result.message,
        created: result.created
      };
    } catch (error) {
      console.error('❌ Error updating invoice status:', error);
      throw new Error(`Failed to update invoice status: ${error.message}`);
    }
  }

  // Update invoice (general update)
  static async updateInvoice(invoiceId, invoiceData) {
    try {
      await this.ensureAuth();
      
      const invoiceRef = doc(db, this.collectionName, invoiceId);
      const result = await safeUpdateDoc(invoiceRef, invoiceData);
      
      console.log(`✅ Invoice ${invoiceId} ${result.created ? 'created' : 'updated'} successfully`);
      return {
        success: true,
        message: result.message,
        created: result.created
      };
    } catch (error) {
      console.error('❌ Error updating invoice:', error);
      throw new Error(`Failed to update invoice: ${error.message}`);
    }
  }

  // Delete invoice
  static async deleteInvoice(invoiceId) {
    try {
      await this.ensureAuth();
      
      const invoiceRef = doc(db, this.collectionName, invoiceId);
      await deleteDoc(invoiceRef);
      
      console.log(`✅ Invoice ${invoiceId} deleted successfully`);
      return {
        success: true,
        message: 'Invoice deleted successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting invoice:', error);
      throw new Error(`Failed to delete invoice: ${error.message}`);
    }
  }

  // Get invoices by patient
  static async getInvoicesByPatient(patientId) {
    try {
      await this.ensureAuth();
      
      const invoicesRef = collection(db, this.collectionName);
      const q = query(
        invoicesRef,
        where('patientId', '==', patientId)
        // Temporarily removed orderBy to avoid index requirement
        // orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const invoices = [];
      querySnapshot.forEach((doc) => {
        invoices.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort in JavaScript instead of Firestore to avoid index requirement
      invoices.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      return {
        success: true,
        data: invoices
      };
    } catch (error) {
      console.error('❌ Error fetching patient invoices:', error);
      throw new Error(`Failed to fetch patient invoices: ${error.message}`);
    }
  }

  // Get invoice statistics
  static async getInvoiceStats() {
    try {
      const invoices = await this.getInvoices();
      if (!invoices.success) return { success: false, data: {} };
      
      const allInvoices = invoices.data;
      const stats = {
        totalInvoices: allInvoices.length,
        totalAmount: allInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
        paidInvoices: allInvoices.filter(inv => inv.status === 'paid').length,
        pendingInvoices: allInvoices.filter(inv => inv.status === 'pending').length,
        overdueInvoices: allInvoices.filter(inv => inv.status === 'overdue').length
      };
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ Error getting invoice stats:', error);
      return {
        success: false,
        data: {}
      };
    }
  }
}

// Firebase Payment Management Service
class FirebasePaymentService {
  static collectionName = 'payments';

  // Helper method to ensure authentication
  static async ensureAuth(allowUnauthenticated = false) {
    return await FirebaseDoctorService.ensureAuth(allowUnauthenticated);
  }

  // Get all payments
  static async getPayments() {
    try {
      await this.ensureAuth(true); // Allow unauthenticated access for viewing payments
      
      const paymentsRef = collection(db, this.collectionName);
      const q = query(paymentsRef, orderBy('paymentDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const payments = [];
      querySnapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Successfully fetched ${payments.length} payments`);
      return {
        success: true,
        data: payments
      };
    } catch (error) {
      // Handle permission denied gracefully (expected when unauthenticated)
      if (error.code === 'permission-denied') {
        console.log('🔒 Firebase permission denied - returning empty payments array for graceful degradation');
        return {
          success: true,
          data: [],
          warning: 'Permission denied - showing empty data'
        };
      }
      
      // For other errors, also return empty array to prevent app crashes
      console.log('🔒 Firebase error - returning empty payments array for graceful degradation:', error.message);
      return {
        success: true,
        data: [],
        warning: `Error: ${error.message}`
      };
    }
  }

  // Add new payment
  static async addPayment(paymentData) {
    try {
      await this.ensureAuth();
      
      const payment = {
        ...paymentData,
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: paymentData.status || 'paid'
      };

      const docRef = await addDoc(collection(db, this.collectionName), payment);
      
      console.log(`✅ Payment added successfully for patient ${paymentData.patientId}`);
      return {
        success: true,
        data: {
          id: docRef.id,
          ...payment
        },
        message: 'Payment added successfully'
      };
    } catch (error) {
      console.error('❌ Error adding payment:', error);
      throw new Error(`Failed to add payment: ${error.message}`);
    }
  }

  // Update payment status
  static async updatePaymentStatus(paymentId, status) {
    try {
      await this.ensureAuth();
      
      const paymentRef = doc(db, this.collectionName, paymentId);
      const result = await safeUpdateDoc(paymentRef, {
        status,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Payment ${paymentId} status ${result.created ? 'created and set' : 'updated'} to ${status}`);
      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Error updating payment status:', error);
      throw new Error(`Failed to update payment status: ${error.message}`);
    }
  }

  // Update complete payment record (for additional payments)
  static async updatePayment(paymentId, paymentData) {
    try {
      await this.ensureAuth();
      
      const paymentRef = doc(db, this.collectionName, paymentId);
      const result = await safeUpdateDoc(paymentRef, {
        ...paymentData,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Payment ${paymentId} ${result.created ? 'created' : 'updated'} successfully with additional payment`);
      return {
        success: true,
        data: {
          id: paymentId,
          ...paymentData
        },
        message: result.message
      };
    } catch (error) {
      console.error('❌ Error updating payment:', error);
      throw new Error(`Failed to update payment: ${error.message}`);
    }
  }

  // Delete payment
  static async deletePayment(paymentId) {
    try {
      await this.ensureAuth();
      
      const paymentRef = doc(db, this.collectionName, paymentId);
      await deleteDoc(paymentRef);
      
      console.log(`✅ Payment ${paymentId} deleted successfully`);
      return {
        success: true,
        message: 'Payment deleted successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting payment:', error);
      throw new Error(`Failed to delete payment: ${error.message}`);
    }
  }

  // Get payments by patient
  static async getPaymentsByPatient(patientId) {
    try {
      await this.ensureAuth();
      
      const paymentsRef = collection(db, this.collectionName);
      const q = query(
        paymentsRef,
        where('patientId', '==', patientId)
        // Temporarily removed orderBy to avoid index requirement
        // orderBy('paymentDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const payments = [];
      querySnapshot.forEach((doc) => {
        payments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort in JavaScript instead of Firestore to avoid index requirement
      payments.sort((a, b) => {
        const dateA = a.paymentDate?.toDate?.() || new Date(a.paymentDate || 0);
        const dateB = b.paymentDate?.toDate?.() || new Date(b.paymentDate || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      return {
        success: true,
        data: payments
      };
    } catch (error) {
      console.error('❌ Error fetching patient payments:', error);
      throw new Error(`Failed to fetch patient payments: ${error.message}`);
    }
  }

  // Get payment statistics
  static async getPaymentStats() {
    try {
      const payments = await this.getPayments();
      if (!payments.success) return { success: false, data: {} };
      
      const allPayments = payments.data;
      const stats = {
        totalRevenue: allPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
        totalPending: allPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
        fullyPaidCount: allPayments.filter(p => p.status === 'paid').length,
        pendingCount: allPayments.filter(p => p.status === 'pending').length,
        partiallyPaidCount: allPayments.filter(p => p.status === 'partial').length,
        totalPatients: new Set(allPayments.map(p => p.patientId)).size
      };
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ Error getting payment stats:', error);
      return {
        success: false,
        data: {}
      };
    }
  }
}

// Firebase Discharge Management Service
class FirebaseDischargeService {
  static collectionName = 'discharges';

  // Helper method to ensure authentication
  static async ensureAuth() {
    return await FirebaseDoctorService.ensureAuth();
  }

  // Helper method to sanitize discharge data and remove undefined values
  static sanitizeDischargeData(data) {
    const sanitized = {};
    
    // Define default values for required fields
    const defaults = {
      patientId: '',
      patientName: '',
      admissionDate: null,
      condition: '',
      doctor: '',
      department: '',
      summaryNotes: '',
      doctorRecommendations: '',
      followUpInstructions: '',
      medications: '',
      totalCost: 0,
      costBreakdown: {
        roomCharges: 0,
        medicationCharges: 0,
        testCharges: 0,
        consultationCharges: 0,
        miscellaneous: 0
      },
      treatmentTimeline: [],
      comprehensiveData: {}
    };
    
    // Recursively sanitize object to remove undefined values
    const sanitizeValue = (value) => {
      if (value === undefined) {
        return null;
      } else if (value === null) {
        return null;
      } else if (Array.isArray(value)) {
        return value.map(item => sanitizeValue(item)).filter(item => item !== null);
      } else if (typeof value === 'object' && value !== null) {
        const sanitizedObj = {};
        for (const [key, val] of Object.entries(value)) {
          const sanitizedVal = sanitizeValue(val);
          if (sanitizedVal !== null && sanitizedVal !== undefined) {
            sanitizedObj[key] = sanitizedVal;
          }
        }
        return Object.keys(sanitizedObj).length > 0 ? sanitizedObj : {};
      } else {
        return value;
      }
    };
    
    // Apply defaults and sanitize
    const merged = { ...defaults, ...data };
    for (const [key, value] of Object.entries(merged)) {
      const sanitizedValue = sanitizeValue(value);
      if (sanitizedValue !== null && sanitizedValue !== undefined) {
        sanitized[key] = sanitizedValue;
      } else if (key in defaults) {
        // Keep default values for required fields
        sanitized[key] = defaults[key];
      }
    }
    
    return sanitized;
  }

  // Get all discharge records
  static async getDischarges() {
    try {
      await this.ensureAuth();
      
      const dischargesRef = collection(db, this.collectionName);
      const q = query(dischargesRef, orderBy('dischargeDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const discharges = [];
      querySnapshot.forEach((doc) => {
        discharges.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Successfully fetched ${discharges.length} discharge records`);
      return {
        success: true,
        data: discharges
      };
    } catch (error) {
      console.error('❌ Error fetching discharge records:', error);
      throw new Error(`Failed to fetch discharge records: ${error.message}`);
    }
  }

  // Create discharge summary
  static async createDischargeSummary(dischargeData) {
    try {
      await this.ensureAuth();
      
      // Sanitize data to remove undefined values and ensure all required fields exist
      const sanitizedData = this.sanitizeDischargeData(dischargeData);
      
      const discharge = {
        ...sanitizedData,
        dischargeDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Discharged'
      };

      const docRef = await addDoc(collection(db, this.collectionName), discharge);
      
      console.log(`✅ Discharge summary created for patient ${dischargeData.patientId}`);
      return {
        success: true,
        data: {
          id: docRef.id,
          ...discharge
        },
        message: 'Discharge summary created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating discharge summary:', error);
      throw new Error(`Failed to create discharge summary: ${error.message}`);
    }
  }

  // Update discharge summary
  static async updateDischargeSummary(dischargeId, dischargeData) {
    try {
      await this.ensureAuth();
      
      const dischargeRef = doc(db, this.collectionName, dischargeId);
      const result = await safeUpdateDoc(dischargeRef, {
        ...dischargeData,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Discharge summary ${dischargeId} ${result.created ? 'created and set' : 'updated'} successfully`);
      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Error updating discharge summary:', error);
      throw new Error(`Failed to update discharge summary: ${error.message}`);
    }
  }

  // Delete discharge summary
  static async deleteDischargeSummary(dischargeId) {
    try {
      await this.ensureAuth();
      
      const dischargeRef = doc(db, this.collectionName, dischargeId);
      await deleteDoc(dischargeRef);
      
      console.log(`✅ Discharge summary ${dischargeId} deleted successfully`);
      return {
        success: true,
        message: 'Discharge summary deleted successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting discharge summary:', error);
      throw new Error(`Failed to delete discharge summary: ${error.message}`);
    }
  }

  // Get discharge summaries by patient
  static async getDischargesByPatient(patientId) {
    try {
      await this.ensureAuth();
      
      const dischargesRef = collection(db, this.collectionName);
      const q = query(
        dischargesRef,
        where('patientId', '==', patientId)
      );
      const querySnapshot = await getDocs(q);
      
      const discharges = [];
      querySnapshot.forEach((doc) => {
        discharges.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by discharge date in JavaScript to avoid index requirement
      discharges.sort((a, b) => {
        const dateA = a.dischargeDate?.toDate?.() || new Date(a.dischargeDate || 0);
        const dateB = b.dischargeDate?.toDate?.() || new Date(b.dischargeDate || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      return {
        success: true,
        data: discharges
      };
    } catch (error) {
      console.error('❌ Error fetching patient discharge records:', error);
      throw new Error(`Failed to fetch patient discharge records: ${error.message}`);
    }
  }

  // Get discharge statistics
  static async getDischargeStats() {
    try {
      const discharges = await this.getDischarges();
      if (!discharges.success) return { success: false, data: {} };
      
      const allDischarges = discharges.data;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const stats = {
        totalDischarges: allDischarges.length,
        thisMonth: allDischarges.filter(d => {
          const dischargeDate = new Date(d.dischargeDate);
          return dischargeDate.getMonth() === currentMonth && 
                 dischargeDate.getFullYear() === currentYear;
        }).length
      };
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ Error getting discharge stats:', error);
      return {
        success: false,
        data: {}
      };
    }
  }

  // Get specific discharge summary by ID
  static async getDischargeSummary(dischargeId) {
    try {
      await this.ensureAuth();
      
      const dischargeRef = doc(db, this.collectionName, dischargeId);
      const docSnap = await getDoc(dischargeRef);
      
      if (docSnap.exists()) {
        console.log(`✅ Successfully fetched discharge summary ${dischargeId}`);
        return {
          success: true,
          data: {
            id: docSnap.id,
            ...docSnap.data()
          }
        };
      } else {
        console.log(`❌ Discharge summary ${dischargeId} not found`);
        return {
          success: false,
          message: 'Discharge summary not found'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching discharge summary:', error);
      throw new Error(`Failed to fetch discharge summary: ${error.message}`);
    }
  }
}

// Firebase Admin Service
class FirebaseAdminService {
  static collectionName = 'admins';

  // Helper method to ensure authentication
  static async ensureAuth() {
    return await FirebaseDoctorService.ensureAuth();
  }

  // Get admin profile based on current logged-in user
  static async getAdminProfile() {
    try {
      console.log('🔍 Fetching admin profile for logged-in user...');
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently logged in');
      }

      // First check if the user is in the admins collection
      const adminRef = doc(db, this.collectionName, user.uid);
      const adminDoc = await getDoc(adminRef);

      if (adminDoc.exists()) {
        console.log('✅ Admin profile found in admins collection');
        return {
          success: true,
          data: {
            id: adminDoc.id,
            ...adminDoc.data()
          }
        };
      }

      // If not in admins collection, check users collection for admin role
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin' || userData.role === 'administrator') {
          console.log('✅ Admin found in users collection');
          
          // Create admin profile based on user data
          const adminProfile = {
            name: userData.name || user.displayName || 'Admin User',
            email: userData.email || user.email,
            phone: userData.phone || '+91 98765 43210',
            role: 'Administrator',
            department: userData.department || 'Hospital Management',
            joinDate: userData.createdAt ? userData.createdAt.split('T')[0] : '2020-01-15',
            permissions: userData.permissions || ['Full Access', 'User Management', 'System Configuration'],
            profileImage: userData.profileImage || 'hospital-logo.jpeg',
            userId: user.uid
          };

          return {
            success: true,
            data: adminProfile
          };
        }
      }

      // If user exists but is not admin, throw error
      throw new Error('Current user does not have admin privileges');

    } catch (error) {
      console.error('❌ Error fetching admin profile:', error);
      
      // Return default admin profile for demo purposes if no specific admin found
      if (error.message.includes('admin privileges')) {
        throw error;
      }
      
      return {
        success: true,
        data: {
          name: 'Admin User',
          email: auth.currentUser?.email || 'admin@kbrhospital.com',
          phone: '+91 98765 43210',
          role: 'Administrator',
          department: 'Hospital Management',
          joinDate: '2020-01-15',
          permissions: ['Full Access', 'User Management', 'System Configuration'],
          profileImage: 'hospital-logo.jpeg',
          userId: auth.currentUser?.uid
        }
      };
    }
  }

  // Update admin profile
  static async updateAdminProfile(profileData) {
    try {
      console.log('📝 Updating admin profile...');
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently logged in');
      }

      // Update in users collection
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      });

      // Also update in admins collection if it exists
      const adminRef = doc(db, this.collectionName, user.uid);
      const adminDoc = await getDoc(adminRef);

      if (adminDoc.exists()) {
        await updateDoc(adminRef, {
          ...profileData,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create admin document
        await setDoc(adminRef, {
          ...profileData,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Update Firebase Auth profile if name changed
      if (profileData.name && user) {
        await updateProfile(user, { displayName: profileData.name });
      }

      console.log('✅ Admin profile updated successfully');
      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('❌ Error updating admin profile:', error);
      throw new Error(`Failed to update admin profile: ${error.message}`);
    }
  }

  // Check if current user is admin
  static async isCurrentUserAdmin() {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      // Check users collection for admin role
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role === 'admin' || userData.role === 'administrator';
      }

      // Check admins collection
      const adminRef = doc(db, this.collectionName, user.uid);
      const adminDoc = await getDoc(adminRef);

      return adminDoc.exists();
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}

// Firebase Reports Management Service
class FirebaseReportsService {
  static collectionName = 'medicalReports';

  // Helper method to ensure authentication
  static async ensureAuth(allowUnauthenticated = false) {
    return await FirebaseDoctorService.ensureAuth(allowUnauthenticated);
  }

  // Get all reports
  static async getReports() {
    try {
      await this.ensureAuth(true); // Allow unauthenticated access for viewing reports
      
      const reportsRef = collection(db, this.collectionName);
      const q = query(reportsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const reports = [];
      querySnapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Successfully fetched ${reports.length} reports`);
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      // Handle permission denied gracefully (expected when unauthenticated)
      if (error.code === 'permission-denied') {
        console.log('🔒 Firebase permission denied - returning empty reports array for graceful degradation');
        return {
          success: true,
          data: [],
          warning: 'Permission denied - showing empty data'
        };
      }
      
      // For other errors, also return empty array to prevent app crashes
      console.log('🔒 Firebase error - returning empty reports array for graceful degradation:', error.message);
      return {
        success: true,
        data: [],
        warning: `Error: ${error.message}`
      };
    }
  }

  // Create new report
  static async createReport(reportData) {
    try {
      await this.ensureAuth();
      
      const report = {
        ...reportData,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        status: 'available',
        sentToPatient: false,
        viewedByPatient: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: reportData.files || [],
        // Generate display properties
        icon: this.getReportIcon(reportData.type),
        iconColor: this.getReportIconColor(reportData.category),
        bgColor: this.getReportBgColor(reportData.category)
      };

      const docRef = await addDoc(collection(db, this.collectionName), report);
      
      console.log(`✅ Report ${reportData.type} created successfully for patient ${reportData.patientId}`);
      return {
        success: true,
        data: {
          id: docRef.id,
          ...report
        },
        message: 'Report created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating report:', error);
      throw new Error(`Failed to create report: ${error.message}`);
    }
  }

  // Update report
  static async updateReport(reportId, reportData) {
    try {
      await this.ensureAuth();
      
      const reportRef = doc(db, this.collectionName, reportId);
      const result = await safeUpdateDoc(reportRef, {
        ...reportData,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Report ${reportId} ${result.created ? 'created and set' : 'updated'} successfully`);
      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Error updating report:', error);
      throw new Error(`Failed to update report: ${error.message}`);
    }
  }

  // Delete report
  static async deleteReport(reportId) {
    try {
      await this.ensureAuth();
      
      const reportRef = doc(db, this.collectionName, reportId);
      await deleteDoc(reportRef);
      
      console.log(`✅ Report ${reportId} deleted successfully`);
      return {
        success: true,
        message: 'Report deleted successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting report:', error);
      throw new Error(`Failed to delete report: ${error.message}`);
    }
  }

  // Mark report as sent to patient
  static async markReportAsSent(reportId, phoneNumber) {
    try {
      await this.ensureAuth();
      
      const reportRef = doc(db, this.collectionName, reportId);
      await updateDoc(reportRef, {
        sentToPatient: true,
        sentToPhoneNumber: phoneNumber,
        sentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Report ${reportId} marked as sent to ${phoneNumber}`);
      return {
        success: true,
        message: 'Report marked as sent successfully'
      };
    } catch (error) {
      console.error('❌ Error marking report as sent:', error);
      throw new Error(`Failed to mark report as sent: ${error.message}`);
    }
  }

  // Add file to report
  static async addFileToReport(reportId, fileData) {
    try {
      await this.ensureAuth();
      
      const reportRef = doc(db, this.collectionName, reportId);
      const reportDoc = await getDoc(reportRef);
      
      if (!reportDoc.exists()) {
        throw new Error('Report not found');
      }
      
      const currentFiles = reportDoc.data().files || [];
      const updatedFiles = [...currentFiles, fileData];
      
      await updateDoc(reportRef, {
        files: updatedFiles,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ File added to report ${reportId}`);
      return {
        success: true,
        message: 'File added to report successfully'
      };
    } catch (error) {
      console.error('❌ Error adding file to report:', error);
      throw new Error(`Failed to add file to report: ${error.message}`);
    }
  }

  // Get reports by patient
  static async getReportsByPatient(patientId) {
    try {
      await this.ensureAuth();
      
      const reportsRef = collection(db, this.collectionName);
      const q = query(
        reportsRef,
        where('patientId', '==', patientId)
        // Temporarily removed orderBy to avoid index requirement
        // orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const reports = [];
      querySnapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort in JavaScript instead of Firestore to avoid index requirement
      reports.sort((a, b) => {
        const dateA = a.date?.toDate?.() || new Date(a.date || 0);
        const dateB = b.date?.toDate?.() || new Date(b.date || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('❌ Error fetching patient reports:', error);
      throw new Error(`Failed to fetch patient reports: ${error.message}`);
    }
  }

  // Get report statistics
  static async getReportsStats() {
    try {
      const reports = await this.getReports();
      if (!reports.success) return { success: false, data: {} };
      
      const allReports = reports.data;
      const totalStorage = allReports.reduce((total, report) => {
        return total + (report.files || []).reduce((sum, file) => sum + (file.size || 0), 0);
      }, 0);
      
      const stats = {
        totalReports: allReports.length,
        totalPatients: new Set(allReports.map(r => r.patientId)).size,
        totalStorage,
        sentReports: allReports.filter(r => r.sentToPatient).length,
        pendingReports: allReports.filter(r => !r.sentToPatient).length
      };
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ Error getting reports stats:', error);
      return {
        success: false,
        data: {}
      };
    }
  }

  // Helper methods for report display
  static getReportIcon(type) {
    const iconMap = {
      'Blood Test': '🩸',
      'X-Ray': '🦴',
      'MRI': '🧠',
      'CT Scan': '📊',
      'ECG': '❤️',
      'Ultrasound': '👶',
      'Lab Report': '🧪',
      'Pathology': '🔬',
      'default': '📄'
    };
    return iconMap[type] || iconMap.default;
  }

  static getReportIconColor(category) {
    const colorMap = {
      'Laboratory': '#3B82F6',
      'Radiology': '#8B5CF6',
      'Cardiology': '#EF4444',
      'Pathology': '#10B981',
      'Other': '#6B7280'
    };
    return colorMap[category] || colorMap.Other;
  }

  static getReportBgColor(category) {
    const bgColorMap = {
      'Laboratory': '#EBF8FF',
      'Radiology': '#F3F0FF',
      'Cardiology': '#FEF2F2',
      'Pathology': '#F0FDF4',
      'Other': '#F9FAFB'
    };
    return bgColorMap[category] || bgColorMap.Other;
  }
}

// Export an instance for easy use
const firebaseHospitalServices = {
  // Appointment Services
  updateAppointment: FirebaseAppointmentService.updateAppointment.bind(FirebaseAppointmentService),
  
  // Patient Services
  createPatient: FirebasePatientService.createPatient.bind(FirebasePatientService),
  getAllPatients: FirebasePatientService.getAllPatients.bind(FirebasePatientService),
  subscribeToPatients: FirebasePatientService.subscribeToPatients.bind(FirebasePatientService),
  getProfile: FirebasePatientService.getProfile.bind(FirebasePatientService),
  updateProfile: FirebasePatientService.updateProfile.bind(FirebasePatientService),
  getMedicalHistory: FirebasePatientService.getMedicalHistory.bind(FirebasePatientService),
  getReports: FirebasePatientService.getReports.bind(FirebasePatientService),
  
  // Doctor Services
  getDoctors: FirebaseDoctorService.getDoctors.bind(FirebaseDoctorService),
  createDoctor: FirebaseDoctorService.createDoctor.bind(FirebaseDoctorService),
  updateDoctor: FirebaseDoctorService.updateDoctor.bind(FirebaseDoctorService),
  deleteDoctor: FirebaseDoctorService.deleteDoctor.bind(FirebaseDoctorService),
  
  // Hospital Services
  getServices: FirebaseServiceApiService.getServices.bind(FirebaseServiceApiService),
  createService: FirebaseServiceApiService.createService.bind(FirebaseServiceApiService),
  updateService: FirebaseServiceApiService.updateService.bind(FirebaseServiceApiService),
  deleteService: FirebaseServiceApiService.deleteService.bind(FirebaseServiceApiService),
  assignDoctorToService: FirebaseServiceApiService.assignDoctorToService.bind(FirebaseServiceApiService),
  unassignDoctorFromService: FirebaseServiceApiService.unassignDoctorFromService.bind(FirebaseServiceApiService),
  getServicesWithDoctors: FirebaseServiceApiService.getServicesWithDoctors.bind(FirebaseServiceApiService),
  
  // Test Services
  getTests: FirebaseTestService.getTests.bind(FirebaseTestService),
  createTest: FirebaseTestService.createTest.bind(FirebaseTestService),
  updateTest: FirebaseTestService.updateTest.bind(FirebaseTestService),
  deleteTest: FirebaseTestService.deleteTest.bind(FirebaseTestService),
  
  // Room Services
  getRooms: FirebaseRoomService.getRooms.bind(FirebaseRoomService),
  subscribeToRooms: FirebaseRoomService.subscribeToRooms.bind(FirebaseRoomService),
  createRoom: FirebaseRoomService.createRoom.bind(FirebaseRoomService),
  updateRoom: FirebaseRoomService.updateRoom.bind(FirebaseRoomService),
  deleteRoom: FirebaseRoomService.deleteRoom.bind(FirebaseRoomService),
  assignPatient: FirebaseRoomService.assignPatient.bind(FirebaseRoomService),
  dischargePatient: FirebaseRoomService.dischargePatient.bind(FirebaseRoomService),
  getRoomStats: FirebaseRoomService.getRoomStats.bind(FirebaseRoomService),
  
  // Bed Management Services
  assignPatientToBed: FirebaseRoomService.assignPatientToBed.bind(FirebaseRoomService),
  releasePatientFromBed: FirebaseRoomService.releasePatientFromBed.bind(FirebaseRoomService),
  getAvailableBeds: FirebaseRoomService.getAvailableBeds.bind(FirebaseRoomService),
  
  // Invoice Services
  getInvoices: FirebaseInvoiceService.getInvoices.bind(FirebaseInvoiceService),
  subscribeToInvoices: FirebaseInvoiceService.subscribeToInvoices.bind(FirebaseInvoiceService),
  createInvoice: FirebaseInvoiceService.createInvoice.bind(FirebaseInvoiceService),
  updateInvoiceStatus: FirebaseInvoiceService.updateInvoiceStatus.bind(FirebaseInvoiceService),
  updateInvoice: FirebaseInvoiceService.updateInvoice.bind(FirebaseInvoiceService),
  deleteInvoice: FirebaseInvoiceService.deleteInvoice.bind(FirebaseInvoiceService),
  getInvoicesByPatient: FirebaseInvoiceService.getInvoicesByPatient.bind(FirebaseInvoiceService),
  getInvoiceStats: FirebaseInvoiceService.getInvoiceStats.bind(FirebaseInvoiceService),
  
  // Payment Services
  getPayments: FirebasePaymentService.getPayments.bind(FirebasePaymentService),
  addPayment: FirebasePaymentService.addPayment.bind(FirebasePaymentService),
  updatePaymentStatus: FirebasePaymentService.updatePaymentStatus.bind(FirebasePaymentService),
  updatePayment: FirebasePaymentService.updatePayment.bind(FirebasePaymentService),
  deletePayment: FirebasePaymentService.deletePayment.bind(FirebasePaymentService),
  getPaymentsByPatient: FirebasePaymentService.getPaymentsByPatient.bind(FirebasePaymentService),
  getPaymentStats: FirebasePaymentService.getPaymentStats.bind(FirebasePaymentService),
  
  // Discharge Services
  getDischarges: FirebaseDischargeService.getDischarges.bind(FirebaseDischargeService),
  getDischargeSummary: FirebaseDischargeService.getDischargeSummary.bind(FirebaseDischargeService),
  createDischargeSummary: FirebaseDischargeService.createDischargeSummary.bind(FirebaseDischargeService),
  updateDischargeSummary: FirebaseDischargeService.updateDischargeSummary.bind(FirebaseDischargeService),
  deleteDischargeSummary: FirebaseDischargeService.deleteDischargeSummary.bind(FirebaseDischargeService),
  getDischargesByPatient: FirebaseDischargeService.getDischargesByPatient.bind(FirebaseDischargeService),
  getDischargeStats: FirebaseDischargeService.getDischargeStats.bind(FirebaseDischargeService),
  
  // Report Services
  getReports: FirebaseReportsService.getReports.bind(FirebaseReportsService),
  createReport: FirebaseReportsService.createReport.bind(FirebaseReportsService),
  updateReport: FirebaseReportsService.updateReport.bind(FirebaseReportsService),
  deleteReport: FirebaseReportsService.deleteReport.bind(FirebaseReportsService),
  markReportAsSent: FirebaseReportsService.markReportAsSent.bind(FirebaseReportsService),
  addFileToReport: FirebaseReportsService.addFileToReport.bind(FirebaseReportsService),
  getReportsByPatient: FirebaseReportsService.getReportsByPatient.bind(FirebaseReportsService),
  getReportsStats: FirebaseReportsService.getReportsStats.bind(FirebaseReportsService)
};

export {
  FirebaseAppointmentService as AppointmentService,
  FirebasePatientService as PatientService,
  FirebaseDoctorService,
  FirebaseServiceApiService,
  FirebaseHospitalServiceManager,
  FirebaseTestService,
  FirebaseRoomService,
  FirebaseInvoiceService,
  FirebasePaymentService,
  FirebaseDischargeService,
  FirebaseAdminService,
  FirebaseReportsService,
  firebaseHospitalServices
};