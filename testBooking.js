// Test Booking Function
// Use this to test if Firebase connection works

import { SimpleBookingService } from './src/services/simpleBookingService';

export const testBooking = async () => {
  console.log('🧪 Testing booking functionality...');

  const testAppointmentData = {
    serviceId: 'test-service-1',
    doctorId: 'test-doctor-1',
    appointmentDate: '2025-10-24 10:00',
    serviceName: 'Test Service',
    doctorName: 'Dr. Test',
    patientName: 'Test Patient',
    contactNumber: '+1234567890',
    email: 'test@test.com',
    paymentType: 'hospital',
    amount: 100,
    totalAmount: 100,
  };

  try {
    console.log('📋 Test data:', testAppointmentData);
    const result = await SimpleBookingService.bookAppointment(testAppointmentData);
    
    if (result.success) {
      console.log('✅ Test booking successful!');
      console.log('🎫 Token:', result.data.tokenNumber);
      console.log('🆔 Appointment ID:', result.data.id);
    } else {
      console.log('❌ Test booking failed:', result.message);
    }

    return result;
  } catch (error) {
    console.error('❌ Test booking error:', error);
    return { success: false, error };
  }
};

// Console command to test
// Run: testBooking().then(console.log)
console.log('📝 To test booking, run: testBooking()');