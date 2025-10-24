// Debug script to test appointment loading
import { AppointmentService } from './src/services/hospitalServices';

const testAppointmentLoading = async () => {
  try {
    console.log('🔍 Testing appointment loading...');
    
    // Test 1: Load all appointments
    console.log('\n--- Test 1: Load ALL appointments ---');
    const allAppointments = await AppointmentService.getAppointments();
    console.log('All appointments:', allAppointments?.length || 0);
    if (allAppointments && allAppointments.length > 0) {
      allAppointments.forEach((apt, index) => {
        console.log(`Appointment ${index + 1}:`, {
          id: apt.id,
          patientId: apt.patientId,
          serviceName: apt.serviceName,
          date: apt.date,
          appointmentDate: apt.appointmentDate,
          status: apt.status
        });
      });
    }
    
    // Test 2: Load for specific user
    console.log('\n--- Test 2: Load for specific user ---');
    const userAppointments = await AppointmentService.getAppointments('dkvlyCz70qaqDCy1XDdYJDAVRAt2');
    console.log('User appointments:', userAppointments?.length || 0);
    if (userAppointments && userAppointments.length > 0) {
      userAppointments.forEach((apt, index) => {
        console.log(`User Appointment ${index + 1}:`, {
          id: apt.id,
          patientId: apt.patientId,
          serviceName: apt.serviceName,
          date: apt.date,
          appointmentDate: apt.appointmentDate,
          status: apt.status
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Export for use in other files
export { testAppointmentLoading };