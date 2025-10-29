// Debug script to test the filtering logic directly
const mockFirebaseTests = [
  { id: '1', name: 'Complete Blood Count', category: 'Blood Test', price: '500' },
  { id: '2', name: 'Lipid Profile', category: 'BLOOD TEST', price: '600' },
  { id: '3', name: 'ECG Test', category: 'CARDIAC', price: '400' },
  { id: '4', name: 'X-Ray Chest', category: 'IMAGING', price: '300' },
  { id: '5', name: 'CT Scan', category: 'Specialized', price: '2000' },
  { id: '6', name: 'Blood Sugar', category: 'Blood', price: '150' },
  { id: '7', name: 'Heart Echo', category: 'Cardiac', price: '800' },
  { id: '8', name: 'MRI Brain', category: 'Imaging', price: '3000' },
  { id: '9', name: 'Urine Test', category: 'Urine', price: '200' },
  { id: '10', name: 'Emergency Blood Work', category: 'Emergency', price: '1000' }
];

// Test the exact filtering logic from BookAppointmentScreen
function testCategoryFiltering(firebaseTests, testCategory) {
  const categoryTests = firebaseTests.filter(test => {
    if (!test.category) return false;
    
    const testCat = test.category.toLowerCase().trim();
    const selectedCat = testCategory?.toLowerCase();
    
    // Match blood tests
    if (selectedCat === 'blood-tests') {
      return testCat.includes('blood') || testCat === 'blood test' || testCat === 'blood';
    }
    // Match cardiac tests  
    else if (selectedCat === 'cardiac-tests') {
      return testCat.includes('cardiac') || testCat.includes('heart') || testCat === 'cardiac';
    }
    // Match imaging tests
    else if (selectedCat === 'imaging-tests') {
      return testCat.includes('imaging') || testCat.includes('x-ray') || testCat.includes('scan') || testCat === 'imaging';
    }
    // Match specialized tests
    else if (selectedCat === 'specialized-tests') {
      return testCat.includes('specialized') || testCat === 'specialized' || testCat === 'specialized test';
    }
    // Match urine tests
    else if (selectedCat === 'urine-tests') {
      return testCat.includes('urine') || testCat === 'urine test' || testCat === 'urine';
    }
    // Match stool tests
    else if (selectedCat === 'stool-tests') {
      return testCat.includes('stool') || testCat === 'stool test' || testCat === 'stool';
    }
    // Match health packages
    else if (selectedCat === 'health-packages') {
      return testCat.includes('health package') || testCat === 'health package' || testCat.includes('package');
    }
    // Match emergency tests
    else if (selectedCat === 'emergency-tests') {
      return testCat.includes('emergency') || testCat === 'emergency';
    }
    
    return false;
  });

  console.log(`\n🧪 Testing category: ${testCategory}`);
  console.log(`📊 Found ${categoryTests.length} tests:`);
  categoryTests.forEach(test => {
    console.log(`  - ${test.name} (${test.category}) - ₹${test.price}`);
  });
  
  return categoryTests;
}

// Test all categories
const categories = [
  'blood-tests',
  'cardiac-tests', 
  'imaging-tests',
  'specialized-tests',
  'urine-tests',
  'stool-tests',
  'health-packages',
  'emergency-tests'
];

console.log('🔍 Testing Category Filtering Logic');
console.log('==================================');

categories.forEach(category => {
  testCategoryFiltering(mockFirebaseTests, category);
});

console.log('\n✅ Test completed - check if filtering matches expected results');