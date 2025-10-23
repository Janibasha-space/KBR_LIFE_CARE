// Test file to verify discharge function fixes
import { DischargeService } from './src/services/hospitalServices.js';

async function testDischargeFunctions() {
  console.log('Testing discharge functions...');
  
  try {
    // Test getting discharges by patient ID
    const patientId = 'KBR-PA-2024-001'; // Example patient ID
    console.log(`Testing getDischargesByPatient with patient ID: ${patientId}`);
    
    const discharges = await DischargeService.getDischargesByPatient(patientId);
    console.log('Discharges found:', discharges);
    
    if (discharges && discharges.length > 0) {
      // Test getting discharge summary with actual discharge ID
      const dischargeId = discharges[0].id;
      console.log(`Testing getDischargeSummary with discharge ID: ${dischargeId}`);
      
      const summary = await DischargeService.getDischargeSummary(dischargeId);
      console.log('Discharge summary:', summary);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Export for use in other tests
export { testDischargeFunctions };

// Run test if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testDischargeFunctions();
}