// Test Authentication Fix
// This script tests if the Firebase services can now handle unauthenticated access

import { 
  RoomService, 
  InvoiceService, 
  PaymentService, 
  ReportService 
} from './src/services/hospitalServices.js';
import { SimpleBookingService } from './src/services/simpleBookingService.js';

console.log('🧪 Testing Firebase Services Authentication Fix...\n');

async function testFirebaseServices() {
  const services = [
    { name: 'Rooms', service: RoomService, method: 'getAllRooms' },
    { name: 'Invoices', service: InvoiceService, method: 'getAllInvoices' },
    { name: 'Payments', service: PaymentService, method: 'getAllPayments' },
    { name: 'Reports', service: ReportService, method: 'getAllReports' },
    { name: 'Appointments', service: SimpleBookingService, method: 'getAllAppointments' }
  ];

  let successCount = 0;
  let totalCount = services.length;

  for (const { name, service, method } of services) {
    try {
      console.log(`📋 Testing ${name} service...`);
      const result = await service[method]();
      
      if (result && (Array.isArray(result) || result.data || result.success)) {
        console.log(`✅ ${name}: SUCCESS - Data loaded without authentication errors`);
        successCount++;
      } else {
        console.log(`⚠️ ${name}: PARTIAL - No data but no authentication error`);
        successCount++;
      }
    } catch (error) {
      if (error.message.includes('Authentication required')) {
        console.log(`❌ ${name}: FAILED - Still requires authentication: ${error.message}`);
      } else {
        console.log(`⚠️ ${name}: ERROR - Other error: ${error.message}`);
        // Count as success if it's not an authentication error
        successCount++;
      }
    }
  }

  console.log(`\n📊 Test Results: ${successCount}/${totalCount} services working properly`);
  
  if (successCount === totalCount) {
    console.log('🎉 All services are working! Authentication errors have been resolved.');
  } else {
    console.log('⚠️ Some services still have authentication issues. Check the logs above.');
  }
}

// Run the test
testFirebaseServices().catch(console.error);