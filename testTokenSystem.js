// Test Token Generation System
// This file demonstrates how the KBR token system works

import TokenService from '../src/services/tokenService';
import { FirebaseHospitalService } from '../src/services/firebaseHospitalServices';

// Test token generation
export const testTokenGeneration = async () => {
  console.log('🧪 Testing Token Generation System...\n');

  try {
    // Test 1: Generate tokens
    console.log('📝 Test 1: Generating appointment tokens');
    const token1 = await TokenService.generateAppointmentToken();
    console.log(`Generated token 1: ${token1}`);

    const token2 = await TokenService.generateAppointmentToken();
    console.log(`Generated token 2: ${token2}`);

    const token3 = await TokenService.generateAppointmentToken();
    console.log(`Generated token 3: ${token3}\n`);

    // Test 2: Get current counter
    console.log('📊 Test 2: Getting current token count');
    const counterInfo = await TokenService.getCurrentTokenCount();
    console.log('Counter info:', counterInfo.data);
    console.log('');

    // Test 3: Book appointment with token
    console.log('📅 Test 3: Booking appointment with token generation');
    const appointmentData = {
      patientName: 'John Doe',
      contactNumber: '+1234567890',
      email: 'john.doe@email.com',
      appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      doctorId: 'doctor-1',
      doctorName: 'Dr. Smith',
      serviceId: 'service-1',
      serviceName: 'General Consultation',
      totalAmount: 100,
      paymentType: 'online'
    };

    const bookingResult = await FirebaseHospitalService.bookAppointment(appointmentData);
    console.log('Booking result:', {
      success: bookingResult.success,
      tokenNumber: bookingResult.data?.tokenNumber,
      appointmentId: bookingResult.data?.id,
      message: bookingResult.message
    });
    console.log('');

    // Test 4: Lookup appointment by token
    if (bookingResult.success) {
      console.log('🔍 Test 4: Looking up appointment by token');
      const lookupResult = await FirebaseHospitalService.getAppointmentByToken(bookingResult.data.tokenNumber);
      console.log('Lookup result:', {
        success: lookupResult.success,
        tokenNumber: lookupResult.data?.token?.tokenNumber,
        patientName: lookupResult.data?.appointment?.patientName,
        status: lookupResult.data?.appointment?.status
      });
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Test data examples
export const sampleAppointmentData = {
  patientName: 'Jane Smith',
  contactNumber: '+1987654321',
  email: 'jane.smith@email.com',
  appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
  doctorId: 'doctor-2',
  doctorName: 'Dr. Johnson',
  serviceId: 'service-2',
  serviceName: 'Cardiology Consultation',
  totalAmount: 150,
  paymentType: 'hospital'
};

// How to use the token system:
export const usageInstructions = `
🏥 KBR Life Care Token System Usage

1. BOOKING AN APPOINTMENT:
   - Call FirebaseHospitalService.bookAppointment(appointmentData)
   - System automatically generates unique token (KBR-001, KBR-002, etc.)
   - Token is saved in both appointment and token collections
   - Returns appointment data with tokenNumber

2. LOOKING UP APPOINTMENTS:
   - Call FirebaseHospitalService.getAppointmentByToken("KBR-001")
   - Returns full appointment and token details
   - Use TokenLookupModal component for UI

3. ADMIN TOKEN MANAGEMENT:
   - TokenService.getCurrentTokenCount() - Get current counter
   - TokenService.getAllAppointmentTokens() - Get all tokens
   - TokenService.resetTokenCounter() - Reset counter (admin only)

4. PATIENT EXPERIENCE:
   - Patient books appointment normally
   - Gets token number immediately (KBR-XXX)
   - Can use token to check appointment status
   - Token shown in confirmation screen and alerts

5. INTEGRATION POINTS:
   - BookAppointmentScreen: Shows token in success alert
   - AppContext: Uses Firebase service for booking
   - TokenLookupModal: Admin/staff token lookup interface
   - FirebaseHospitalService: Core booking with token generation

6. DATABASE STRUCTURE:
   - appointments collection: Contains appointment with tokenNumber field
   - appointmentTokens collection: Token lookup data
   - tokenCounters collection: Maintains sequential numbering
`;

console.log(usageInstructions);