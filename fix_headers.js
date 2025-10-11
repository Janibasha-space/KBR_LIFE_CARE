// KBR LIFE CARE HOSPITALS - Header Fix Utility
// This utility helps fix header imports and styling across screens

const fs = require('fs');
const path = require('path');

// Fix header imports and styling
function fixHeadersInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Ensure proper imports
    if (!content.includes('import { Colors, Sizes }')) {
      content = content.replace(
        "import { Ionicons } from '@expo/vector-icons';",
        `import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';`
      );
    }
    
    // Fix hospital logo path
    content = content.replace(
      /require\('\.\.\/\.\.\/\.\.\/assets\/hospital-logo\.png'\)/g,
      "require('../../../assets/hospital-logo.jpeg')"
    );
    
    // Ensure proper header styling
    if (!content.includes('backgroundColor: Colors.kbrBlue')) {
      content = content.replace(
        'backgroundColor: Colors.primary',
        'backgroundColor: Colors.kbrBlue || "#4AA3DF"'
      );
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed headers in: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing headers in ${filePath}:`, error.message);
  }
}

// Process all screen files
function fixAllHeaders() {
  const screenDirs = [
    './src/screens/patient',
    './src/screens/admin',
    './src/screens'
  ];
  
  screenDirs.forEach(dir => {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (file.endsWith('.js') && !file.includes('_backup') && !file.includes('_old')) {
          fixHeadersInFile(path.join(dir, file));
        }
      });
    } catch (error) {
      console.log(`Directory ${dir} not found or inaccessible`);
    }
  });
}

// Export functions
module.exports = {
  fixHeadersInFile,
  fixAllHeaders
};

// Run if called directly
if (require.main === module) {
  console.log('Fixing headers in all screens...');
  fixAllHeaders();
  console.log('Header fixes completed!');
}