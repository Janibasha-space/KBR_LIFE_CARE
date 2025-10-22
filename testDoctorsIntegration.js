/**
 * Test Firebase Doctors Integration
 * This file tests if doctors are properly loaded from Firebase
 */

const { firebaseHospitalServices } = require('./src/services/firebaseHospitalServices');

async function testDoctorsIntegration() {
  console.log('🔥 Testing Firebase Doctors Integration...\n');
  
  try {
    // Test 1: Load all doctors
    console.log('📋 Test 1: Loading all doctors...');
    const doctors = await firebaseHospitalServices.getDoctors();
    console.log(`✅ Found ${doctors.length} doctors in Firebase`);
    
    if (doctors.length > 0) {
      console.log('Sample doctor:', {
        id: doctors[0].id,
        name: doctors[0].name,
        specialty: doctors[0].specialty,
        qualifications: doctors[0].qualifications,
        experience: doctors[0].experience,
        consultationFee: doctors[0].consultationFee
      });
    } else {
      console.log('❌ No doctors found - please add some doctors in admin dashboard first');
    }
    
    // Test 2: Load services with doctors
    console.log('\n📋 Test 2: Loading services with assigned doctors...');
    const servicesWithDoctors = await firebaseHospitalServices.getServicesWithDoctors();
    console.log(`✅ Found ${servicesWithDoctors.length} services`);
    
    servicesWithDoctors.forEach(service => {
      const doctorCount = service.assignedDoctors ? service.assignedDoctors.length : 0;
      console.log(`- ${service.name}: ${doctorCount} assigned doctors`);
    });
    
    if (servicesWithDoctors.length === 0) {
      console.log('❌ No services found - please add some services in admin dashboard first');
    }
    
    console.log('\n🎉 Firebase integration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDoctorsIntegration();