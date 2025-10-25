// Test script to verify AdmitPatientModal Firebase integration
import { FirebaseDoctorService, FirebaseRoomService } from './src/services/firebaseHospitalServices';

const testFirebaseServices = async () => {
  console.log('🧪 Testing Firebase services for AdmitPatientModal...');
  
  try {
    // Test fetching doctors
    console.log('\n📋 Testing getDoctors...');
    const doctorsResult = await FirebaseDoctorService.getDoctors();
    console.log('Doctors result:', doctorsResult);
    
    if (doctorsResult.success && doctorsResult.data.length === 0) {
      console.log('⚠️ No doctors found. Creating sample doctors...');
      
      const sampleDoctors = [
        {
          name: 'Dr. K. Ramesh',
          specialty: 'Cardiology',
          department: 'Cardiology',
          qualification: 'MD, DM Cardiology',
          experience: 15,
          phone: '+91 98765 43210',
          email: 'dr.ramesh@kbrlifecare.com',
          consultationFee: 800,
          available: true
        },
        {
          name: 'Dr. K. Divyasri',
          specialty: 'Gynecology',
          department: 'Gynecology',
          qualification: 'MD, MS Gynecology',
          experience: 12,
          phone: '+91 98765 43211',
          email: 'dr.divyasri@kbrlifecare.com',
          consultationFee: 600,
          available: true
        },
        {
          name: 'Dr. Rajesh Kumar',
          specialty: 'Orthopedics',
          department: 'Orthopedics',
          qualification: 'MS Orthopedics',
          experience: 10,
          phone: '+91 98765 43212',
          email: 'dr.rajesh@kbrlifecare.com',
          consultationFee: 700,
          available: true
        }
      ];
      
      for (const doctor of sampleDoctors) {
        try {
          const result = await FirebaseDoctorService.createDoctor(doctor);
          console.log(`✅ Created doctor: ${doctor.name}`);
        } catch (error) {
          console.log(`❌ Failed to create doctor ${doctor.name}:`, error.message);
        }
      }
    }
    
    // Test fetching rooms
    console.log('\n🏠 Testing getRooms...');
    const roomsResult = await FirebaseRoomService.getRooms();
    console.log('Rooms result:', roomsResult);
    
    if (roomsResult.success && roomsResult.data.length === 0) {
      console.log('⚠️ No rooms found. Creating sample rooms...');
      
      const sampleRooms = [
        {
          roomNumber: '101',
          roomType: 'General',
          capacity: 4,
          status: 'Available',
          statusColor: '#10B981',
          floor: 1,
          beds: ['A1', 'A2', 'B1', 'B2'],
          amenities: ['AC', 'TV', 'Bathroom'],
          dailyRate: 1500
        },
        {
          roomNumber: '102',
          roomType: 'General',
          capacity: 2,
          status: 'Available',
          statusColor: '#10B981',
          floor: 1,
          beds: ['A1', 'A2'],
          amenities: ['AC', 'TV', 'Bathroom'],
          dailyRate: 1500
        },
        {
          roomNumber: '201',
          roomType: 'Private',
          capacity: 1,
          status: 'Available',
          statusColor: '#10B981',
          floor: 2,
          beds: ['A1'],
          amenities: ['AC', 'TV', 'Bathroom', 'Refrigerator', 'Sofa'],
          dailyRate: 3000
        },
        {
          roomNumber: '301',
          roomType: 'ICU',
          capacity: 3,
          status: 'Available',
          statusColor: '#10B981',
          floor: 3,
          beds: ['ICU1', 'ICU2', 'ICU3'],
          amenities: ['Ventilator', 'Monitor', 'Emergency Support'],
          dailyRate: 5000
        }
      ];
      
      for (const room of sampleRooms) {
        try {
          const result = await FirebaseRoomService.createRoom(room);
          console.log(`✅ Created room: ${room.roomNumber}`);
        } catch (error) {
          console.log(`❌ Failed to create room ${room.roomNumber}:`, error.message);
        }
      }
    }
    
    console.log('\n✅ Firebase services test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Firebase services:', error);
  }
};

// Run the test
testFirebaseServices();