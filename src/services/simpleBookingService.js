// Simple Booking Service for Testing
import { 
  collection, 
  addDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase.config';

export class SimpleBookingService {
  static appointmentsCollection = 'appointments';
  static tokensCollection = 'appointmentTokens';
  static countersCollection = 'tokenCounters';

  // Generate simple token
  static async generateToken() {
    try {
      const counterRef = doc(db, this.countersCollection, 'appointmentCounter');
      const counterDoc = await getDoc(counterRef);
      
      let nextNumber = 1;
      
      if (counterDoc.exists()) {
        nextNumber = (counterDoc.data().count || 0) + 1;
        await updateDoc(counterRef, { 
          count: nextNumber,
          lastUpdated: new Date().toISOString() 
        });
      } else {
        await setDoc(counterRef, { 
          count: nextNumber,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
      
      return `KBR-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('❌ Token generation error:', error);
      // Fallback to timestamp-based token if Firebase fails
      return `KBR-${Date.now().toString().slice(-6)}`;
    }
  }

  // Simple appointment booking
  static async bookAppointment(appointmentData) {
    try {
      console.log('🚀 SimpleBookingService: Starting booking...');
      console.log('📋 Appointment data:', appointmentData);

      // Generate token
      const tokenNumber = await this.generateToken();
      console.log(`🎫 Generated token: ${tokenNumber}`);

      // Create appointment object
      const appointment = {
        ...appointmentData,
        tokenNumber: tokenNumber,
        patientId: appointmentData.patientId || `patient-${Date.now()}`,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('💾 Saving appointment to Firebase...');
      
      // Save to appointments collection
      const docRef = await addDoc(collection(db, this.appointmentsCollection), appointment);
      console.log(`✅ Appointment saved with ID: ${docRef.id}`);

      // Save token data for lookup
      const tokenData = {
        tokenNumber: tokenNumber,
        appointmentId: docRef.id,
        patientName: appointment.patientName,
        contactNumber: appointment.contactNumber,
        appointmentDate: appointment.appointmentDate,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, this.tokensCollection, tokenNumber), tokenData);
      console.log(`💾 Token data saved: ${tokenNumber}`);

      const result = {
        success: true,
        data: {
          id: docRef.id,
          ...appointment
        },
        message: `Appointment booked successfully! Your token number is: ${tokenNumber}`
      };

      console.log('🎉 Booking completed successfully');
      return result;

    } catch (error) {
      console.error('❌ SimpleBookingService error:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      return {
        success: false,
        message: `Booking failed: ${error.message}`,
        error: error
      };
    }
  }

  // Get all appointments from Firebase
  static async getAllAppointments() {
    try {
      console.log('📋 SimpleBookingService: Loading all appointments...');
      
      const appointmentsRef = collection(db, this.appointmentsCollection);
      const snapshot = await getDocs(appointmentsRef);
      
      const appointments = [];
      snapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ Loaded ${appointments.length} appointments from Firebase`);
      return appointments;
      
    } catch (error) {
      // Handle permission denied gracefully (expected when unauthenticated)
      if (error.code === 'permission-denied') {
        console.log('🔒 SimpleBookingService: Firebase permission denied - returning empty appointments for graceful degradation');
      } else {
        console.log('🔒 SimpleBookingService: Firebase error - returning empty appointments for graceful degradation:', error.message);
      }
      
      return []; // Return empty array on error
    }
  }
}

export default SimpleBookingService;