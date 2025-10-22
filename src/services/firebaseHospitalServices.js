// Firebase Hospital Services
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';
import { FirebaseAuthService } from './firebaseAuthService';

// Firebase Appointment Service
export class FirebaseAppointmentService {
  static collectionName = 'appointments';

  // Get all appointments
  static async getAppointments(patientId = null) {
    try {
      const appointmentsRef = collection(db, this.collectionName);
      let q;
      
      if (patientId) {
        q = query(
          appointmentsRef, 
          where('patientId', '==', patientId),
          orderBy('appointmentDate', 'desc')
        );
      } else {
        q = query(appointmentsRef, orderBy('appointmentDate', 'desc'));
      }
      
      const querySnapshot = await getDocs(q);
      const appointments = [];
      
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: appointments
      };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw new Error('Failed to fetch appointments');
    }
  }

  // Book new appointment
  static async bookAppointment(appointmentData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const appointment = {
        ...appointmentData,
        patientId: appointmentData.patientId || user.uid,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, this.collectionName), appointment);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...appointment
        },
        message: 'Appointment booked successfully'
      };
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw new Error('Failed to book appointment');
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
  static collectionName = 'users';

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

  // Helper method to ensure authentication
  static async ensureAuth() {
    try {
      const authResult = await FirebaseAuthService.ensureAuthentication();
      
      if (authResult.success) {
        const user = auth.currentUser;
        console.log('✅ Auth ensured - User ID:', user?.uid);
        return user;
      } else {
        console.log('⚠️ Authentication failed, continuing without auth...');
        console.log('💡 Make sure Firebase Security Rules allow public access');
        return null; // Allow to continue without authentication
      }
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      console.log('⚠️ Continuing without authentication - check Firebase rules');
      return null; // Allow to continue without authentication
    }
  }

  // Get all doctors
  static async getDoctors() {
    try {
      // Ensure user is authenticated before accessing Firestore
      await this.ensureAuth();
      console.log('🔍 Fetching doctors with authenticated user...');
      
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
      // Ensure user is authenticated before accessing Firestore
      await this.ensureAuth();
      
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
      await FirebaseDoctorService.ensureAuth();
      
      // Get all services
      const servicesResult = await this.getServices();
      if (!servicesResult.success) {
        console.error('Failed to fetch services');
        return {
          success: false,
          data: [],
          message: 'Failed to fetch services'
        };
      }
      
      // Get all doctors
      const doctorsResult = await FirebaseDoctorService.getDoctors();
      if (!doctorsResult.success) {
        console.error('Failed to fetch doctors');
        return {
          success: false,
          data: [],
          message: 'Failed to fetch doctors'
        };
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
          assignedDoctors: assignedDoctorDetails, // Use assignedDoctors instead of doctorDetails for consistency
          doctorDetails: assignedDoctorDetails    // Keep doctorDetails for backward compatibility
        };
      });
      
      console.log(`✅ Successfully fetched ${servicesWithDoctors.length} services with doctor details`);
      
      return {
        success: true,
        data: servicesWithDoctors
      };
    } catch (error) {
      console.error('❌ Error fetching services with doctors:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch services with doctor details'
      };
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

// Export an instance for easy use
const firebaseHospitalServices = {
  getDoctors: FirebaseDoctorService.getDoctors.bind(FirebaseDoctorService),
  createDoctor: FirebaseDoctorService.createDoctor.bind(FirebaseDoctorService),
  updateDoctor: FirebaseDoctorService.updateDoctor.bind(FirebaseDoctorService),
  deleteDoctor: FirebaseDoctorService.deleteDoctor.bind(FirebaseDoctorService),
  
  getServices: FirebaseServiceApiService.getServices.bind(FirebaseServiceApiService),
  createService: FirebaseServiceApiService.createService.bind(FirebaseServiceApiService),
  updateService: FirebaseServiceApiService.updateService.bind(FirebaseServiceApiService),
  deleteService: FirebaseServiceApiService.deleteService.bind(FirebaseServiceApiService),
  assignDoctorToService: FirebaseServiceApiService.assignDoctorToService.bind(FirebaseServiceApiService),
  unassignDoctorFromService: FirebaseServiceApiService.unassignDoctorFromService.bind(FirebaseServiceApiService),
  getServicesWithDoctors: FirebaseServiceApiService.getServicesWithDoctors.bind(FirebaseServiceApiService)
};

export {
  FirebaseAppointmentService as AppointmentService,
  FirebasePatientService as PatientService,
  FirebaseDoctorService,
  FirebaseServiceApiService,
  FirebaseHospitalServiceManager,
  FirebaseTestService,
  firebaseHospitalServices
};