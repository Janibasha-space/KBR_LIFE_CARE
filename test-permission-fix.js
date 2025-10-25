// Test script to verify permission error handling fixes
import { FirebasePatientService, FirebaseRoomService } from './src/services/firebaseHospitalServices';

console.log('🧪 Testing permission error handling...');

// Test room subscription
console.log('Testing room subscription...');
const roomUnsubscribe = FirebaseRoomService.subscribeToRooms((result) => {
  if (result.success) {
    console.log('✅ Rooms subscription successful:', result.data.length, 'rooms');
  } else if (result.warning) {
    console.log('⚠️ Rooms subscription warning:', result.warning);
  } else {
    console.log('❌ Rooms subscription error:', result.error);
  }
});

// Test patients subscription
console.log('Testing patients subscription...');
const patientsUnsubscribe = FirebasePatientService.subscribeToPatients((result) => {
  if (result.success) {
    console.log('✅ Patients subscription successful:', result.data.length, 'patients');
  } else if (result.warning) {
    console.log('⚠️ Patients subscription warning:', result.warning);
  } else {
    console.log('❌ Patients subscription error:', result.error);
  }
});

// Cleanup after 5 seconds
setTimeout(() => {
  console.log('🧹 Cleaning up test subscriptions...');
  if (roomUnsubscribe) roomUnsubscribe();
  if (patientsUnsubscribe) patientsUnsubscribe();
  console.log('✅ Test completed');
}, 5000);