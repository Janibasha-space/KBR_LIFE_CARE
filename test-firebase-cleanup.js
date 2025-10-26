// Test Firebase data cleaning function
console.log('🧪 Testing Firebase data cleaning function...');

// Simulate the cleanDataForFirebase function
const cleanDataForFirebase = (data) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Recursively clean nested objects
        const cleanedNested = cleanDataForFirebase(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else if (Array.isArray(value)) {
        // Clean arrays
        const cleanedArray = value.filter(item => item !== undefined && item !== null);
        if (cleanedArray.length > 0) {
          cleaned[key] = cleanedArray;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
};

// Test data with undefined values (like what was causing the Firebase error)
const testPaymentData = {
  id: "admission-KBR-OP-2025-4229369290",
  totalAmount: 1000,
  paidAmount: 1800,
  dueAmount: 0,
  actualAmountPaid: undefined,
  calculatedPaid: 1000,
  calculatedRemaining: undefined,
  fullAmount: undefined,
  remainingAmount: undefined,
  paymentHistory: [
    { amount: 800, description: "Hi", paymentMethod: "cash" },
    { amount: undefined, description: null, paymentMethod: "cash" }
  ],
  nestedData: {
    validField: "test",
    undefinedField: undefined,
    nullField: null,
    deepNested: {
      good: "value",
      bad: undefined
    }
  }
};

console.log('📊 Original data:');
console.log(JSON.stringify(testPaymentData, null, 2));

console.log('\n🧹 Cleaned data:');
const cleanedData = cleanDataForFirebase(testPaymentData);
console.log(JSON.stringify(cleanedData, null, 2));

console.log('\n✅ Test completed - no undefined values should remain in cleaned data');
console.log('🔍 Checking for undefined values in cleaned data...');

const hasUndefined = JSON.stringify(cleanedData).includes('undefined');
console.log(hasUndefined ? '❌ Still has undefined values!' : '✅ No undefined values found');