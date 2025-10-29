// Comprehensive test to debug the exact issue in BookAppointmentScreen
console.log('🔍 Comprehensive Test Debug for BookAppointmentScreen');
console.log('==================================================');

// Simulate the exact Firebase data structure from the logs
const simulatedFirebaseResponse = {
  success: true,
  data: [
    { id: '0keQj7SzR3dTHSZ4vmmf', name: 'Pk', category: 'CARDIAC' },
    { id: '2007UjWhCeYbAykb38wq', name: 'Jani ', category: 'Blood Test' },
    { id: '3ymZ0LhQmYN76J8COYBW', name: 'Sneha', category: 'CARDIAC' },
    { id: '6SuiskkPkibPQ3iK9gWt', name: 'Kidney Test', category: 'Blood Test' },
    { id: 'B2pvLM0ABNf24f54od1d', name: 'Nishanth ', category: 'Blood' },
    { id: 'CkupLf7TSDrvkBkGPeCj', name: 'Gsjsksjs', category: 'Blood Test' },
    { id: 'D2RegwAJH21EZO44hvQd', name: 'Preethi ', category: 'IMAGING' },
    { id: 'TaLtT7peoRlC9NARfBJG', name: 'Rani', category: 'BLOOD TEST' },
    { id: 'WKKMfEdZhbFUDDlcNVQY', name: 'Priya ', category: 'CARDIAC' },
    { id: 'gPpgYc9iOfAMDeyQlgzt', name: 'Sheshu', category: 'Imaging' },
    { id: 'kmi9757teCKMeovZ5fQa', name: 'CT Scan', category: 'Specialized' },
    { id: 'lcYD66rEB2NYHCG6AhZF', name: 'Kidney Test', category: 'Blood Test' },
    { id: 'luEqcUT0lLLqoLySpPaA', name: 'Jani ', category: 'Blood Test' },
    { id: 'poWuyge9kPAL71sFIEHg', name: 'Nishant test', category: 'Blood Test' }
  ]
};

console.log(`📊 Simulated Firebase Response:`, {
  success: simulatedFirebaseResponse.success,
  testCount: simulatedFirebaseResponse.data.length
});

// Simulate the loadFirebaseData logic
async function simulateLoadFirebaseData() {
  let loadedTests = [];
  
  try {
    console.log('🔄 Loading all tests directly from Firebase database...');
    const testsResponse = simulatedFirebaseResponse; // This would be await firebaseHospitalServices.getTests()
    
    if (testsResponse.success && testsResponse.data) {
      loadedTests = testsResponse.data;
      console.log('✅ Successfully loaded tests from Firebase:', loadedTests.length);
      console.log('🧪 Test categories found:', loadedTests.map(test => test.category).filter((cat, index, arr) => arr.indexOf(cat) === index));
    } else {
      console.error('❌ Failed to load tests from Firebase:', testsResponse.message);
      loadedTests = [];
    }
  } catch (error) {
    console.error('❌ Error loading tests from Firebase:', error);
    loadedTests = [];
  }
  
  return loadedTests;
}

// Simulate the filtering logic
function simulateTestFiltering(firebaseTests, testCategory) {
  console.log(`\n🔍 Testing category filtering for: "${testCategory}"`);
  console.log(`📋 Total tests to filter: ${firebaseTests.length}`);
  
  const categoryTests = firebaseTests.filter(test => {
    if (!test.category) {
      console.log('⚠️ Test without category found:', test.name);
      return false;
    }
    
    const testCat = test.category.toLowerCase().trim();
    const selectedCat = testCategory?.toLowerCase();
    
    console.log(`🔍 Checking test "${test.name}" (category: "${test.category}") against selected category: "${testCategory}"`);
    
    // Match blood tests
    if (selectedCat === 'blood-tests') {
      const matches = testCat.includes('blood') || testCat === 'blood test' || testCat === 'blood';
      if (matches) console.log(`✅ "${test.name}" matches blood-tests`);
      return matches;
    }
    // Match cardiac tests  
    else if (selectedCat === 'cardiac-tests') {
      const matches = testCat.includes('cardiac') || testCat.includes('heart') || testCat === 'cardiac';
      if (matches) console.log(`✅ "${test.name}" matches cardiac-tests`);
      return matches;
    }
    // Match imaging tests
    else if (selectedCat === 'imaging-tests') {
      const matches = testCat.includes('imaging') || testCat.includes('x-ray') || testCat.includes('scan') || testCat === 'imaging';
      if (matches) console.log(`✅ "${test.name}" matches imaging-tests`);
      return matches;
    }
    // Match specialized tests
    else if (selectedCat === 'specialized-tests') {
      const matches = testCat.includes('specialized') || testCat === 'specialized' || testCat === 'specialized test';
      if (matches) console.log(`✅ "${test.name}" matches specialized-tests`);
      return matches;
    }
    
    console.log(`❌ "${test.name}" (${test.category}) does not match any category for ${testCategory}`);
    return false;
  });
  
  console.log(`📊 Filtered results: ${categoryTests.length} tests found for "${testCategory}"`);
  categoryTests.forEach(test => console.log(`  - ${test.name} (${test.category})`));
  
  return categoryTests;
}

// Run the simulation
async function runDebugTest() {
  console.log('\n🚀 Starting debug simulation...\n');
  
  // Simulate data loading
  const firebaseTests = await simulateLoadFirebaseData();
  
  // Test each category
  const testCategories = ['blood-tests', 'cardiac-tests', 'imaging-tests', 'specialized-tests'];
  
  for (const category of testCategories) {
    const results = simulateTestFiltering(firebaseTests, category);
    console.log(`\n📈 Summary for ${category}: ${results.length} tests\n`);
  }
  
  // Show all available categories for reference
  const availableCategories = [...new Set(firebaseTests.map(test => test.category))];
  console.log('📋 All available categories in data:', availableCategories);
  
  console.log('\n✅ Debug simulation complete!');
  console.log('If this shows the correct data but the app doesn\'t, the issue is in data loading or state management.');
}

runDebugTest();