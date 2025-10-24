// Migration script to fix existing appointment user IDs
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase.config';

export class AppointmentMigration {
  
  // Fix existing appointments with wrong user IDs
  static async fixExistingAppointments() {
    try {
      console.log('🔧 Starting appointment user ID migration...');
      
      const appointmentsRef = collection(db, 'appointments');
      const snapshot = await getDocs(appointmentsRef);
      
      let updatedCount = 0;
      const correctUserId = 'dkvlyCz70qaqDCy1XDdYJDAVRAt2';
      
      // Find appointments that might belong to you based on name/email
      const yourAppointments = [];
      snapshot.forEach((docSnapshot) => {
        const appointment = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Check if this appointment belongs to you based on name or email
        const isYourAppointment = 
          appointment.patientName?.toLowerCase().includes('jani') ||
          appointment.email?.includes('skjanihoneyjani807@gmail.com') ||
          appointment.contactNumber === '9385215795';
          
        if (isYourAppointment && appointment.patientId !== correctUserId) {
          yourAppointments.push(appointment);
        }
      });
      
      console.log(`🔍 Found ${yourAppointments.length} appointments that need user ID fix`);
      
      // Update each appointment with the correct user ID
      for (const appointment of yourAppointments) {
        try {
          const appointmentRef = doc(db, 'appointments', appointment.id);
          await updateDoc(appointmentRef, {
            patientId: correctUserId,
            updatedAt: new Date().toISOString(),
            migrated: true,
            originalPatientId: appointment.patientId // Keep track of original ID
          });
          
          updatedCount++;
          console.log(`✅ Updated appointment ${appointment.id} with correct user ID`);
        } catch (error) {
          console.error(`❌ Failed to update appointment ${appointment.id}:`, error);
        }
      }
      
      console.log(`🎉 Migration complete! Updated ${updatedCount} appointments`);
      return { success: true, updatedCount, appointments: yourAppointments };
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  // List all appointments for debugging
  static async listAllAppointments() {
    try {
      const appointmentsRef = collection(db, 'appointments');
      const snapshot = await getDocs(appointmentsRef);
      
      const appointments = [];
      snapshot.forEach((doc) => {
        appointments.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('📋 All appointments in database:');
      appointments.forEach((apt, index) => {
        console.log(`${index + 1}. ID: ${apt.id}`);
        console.log(`   Patient: ${apt.patientName}`);
        console.log(`   Email: ${apt.email}`);
        console.log(`   Phone: ${apt.contactNumber}`);
        console.log(`   PatientId: ${apt.patientId}`);
        console.log(`   Date: ${apt.appointmentDate}`);
        console.log('   ---');
      });
      
      return appointments;
    } catch (error) {
      console.error('❌ Failed to list appointments:', error);
      return [];
    }
  }
}

export default AppointmentMigration;