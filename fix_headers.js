// Utility script to fix headers across all screens
const fs = require('fs');
const path = require('path');

// Screen files that need header fixes
const screenFiles = [
  'src/screens/patient/BookAppointmentScreen.js',
  'src/screens/patient/AppointmentScreen.js',
  'src/screens/patient/MedicalReportsScreen.js',
  'src/screens/patient/PharmacyScreen.js',
  'src/screens/patient/ProfileScreen.js',
  'src/screens/admin/PaymentManagementScreen.js',
  'src/screens/admin/PatientManagementScreen.js',
  'src/screens/admin/DischargeManagementScreen.js',
  'src/screens/admin/AdminPharmacyScreen.js'
];

function fixScreenFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add StatusBar import if not present
  if (!content.includes('StatusBar')) {
    content = content.replace(
      /} from 'react-native';/,
      `  StatusBar,\n} from 'react-native';`
    );
  }
  
  // Fix return statement
  content = content.replace(
    /return \(\s*<SafeAreaView/,
    `return (\n    <View style={styles.outerContainer}>\n      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />\n      <SafeAreaView`
  );
  
  // Fix closing tags
  content = content.replace(
    /\s*<\/SafeAreaView>\s*\);/,
    `    </SafeAreaView>\n    </View>\n  );`
  );
  
  // Add outerContainer style
  content = content.replace(
    /const styles = StyleSheet\.create\(\{\s*container: \{/,
    `const styles = StyleSheet.create({\n  outerContainer: {\n    flex: 1,\n    backgroundColor: Colors.kbrBlue,\n  },\n  container: {`
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed: ${filePath}`);
}

// Fix all screen files
screenFiles.forEach(fixScreenFile);
console.log('Header fix completed for all screens!');