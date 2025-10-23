// Script to create test appointments for debugging
const testUserId = 'dkvlyCz70qaqDCy1XDdYJDAVRAt2';

const testAppointments = [
  {
    id: 'test-001',
    patientId: testUserId,
    serviceName: 'General Consultation', 
    doctorName: 'Dr. John Smith',
    appointmentDate: '2025-10-25 10:00 AM',
    date: '2025-10-25',
    time: '10:00 AM',
    tokenNumber: 'KBR-001',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    amount: 500,
    paymentType: 'hospital'
  },
  {
    id: 'test-002', 
    patientId: testUserId,
    serviceName: 'Cardiology Consultation',
    doctorName: 'Dr. Sarah Johnson',
    appointmentDate: '2025-10-27 02:00 PM', 
    date: '2025-10-27',
    time: '02:00 PM',
    tokenNumber: 'KBR-002',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    amount: 800,
    paymentType: 'online'
  },
  {
    id: 'test-003',
    patientId: testUserId, 
    serviceName: 'Blood Test',
    doctorName: 'Dr. Mike Wilson',
    appointmentDate: '2025-10-20 09:00 AM',
    date: '2025-10-20', 
    time: '09:00 AM',
    tokenNumber: 'KBR-003',
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    amount: 300,
    paymentType: 'hospital'
  }
];

console.log('Test appointments for user:', testUserId);
console.log(JSON.stringify(testAppointments, null, 2));

// Check if appointments would be filtered correctly
const now = new Date();
now.setHours(0, 0, 0, 0);

testAppointments.forEach(apt => {
  const appointmentDate = new Date(apt.date);
  const isUpcoming = appointmentDate >= now;
  const isActive = apt.status === 'scheduled' || apt.status === 'confirmed';
  
  console.log(`\nAppointment ${apt.tokenNumber}:`);
  console.log(`  Date: ${apt.date} (${appointmentDate.toDateString()})`);
  console.log(`  Today: ${now.toDateString()}`);
  console.log(`  Is Upcoming: ${isUpcoming}`);
  console.log(`  Is Active: ${isActive}`);
  console.log(`  Should show in upcoming: ${isUpcoming && isActive}`);
});