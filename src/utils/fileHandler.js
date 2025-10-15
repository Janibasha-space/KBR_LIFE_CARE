import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alert, Platform } from 'react-native';

// File Upload Handler for Reports
export class FileHandler {
  
  // Request permissions
  static async requestPermissions() {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Sorry, we need camera roll permissions to upload files.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.log('Permission error:', error);
      return false;
    }
  }

  // Pick image files (JPG, PNG, etc.)
  static async pickImage() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          type: 'image',
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          mimeType: asset.type || 'image/jpeg',
        };
      }
      return null;
    } catch (error) {
      console.log('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      return null;
    }
  }

  // Pick document files (PDF, DOC, etc.)
  static async pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          type: 'document',
          name: asset.name,
          size: asset.size || 0,
          mimeType: asset.mimeType || 'application/pdf',
        };
      }
      return null;
    } catch (error) {
      console.log('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
      return null;
    }
  }

  // Take photo with camera
  static async takePhoto() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      // Request camera permissions
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera permissions to take photos.',
          [{ text: 'OK' }]
        );
        return false;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          type: 'image',
          name: `camera_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          mimeType: 'image/jpeg',
        };
      }
      return null;
    } catch (error) {
      console.log('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  }

  // Validate file size (in bytes)
  static validateFileSize(file, maxSizeInMB = 10) {
    const maxSize = maxSizeInMB * 1024 * 1024; // Convert to bytes
    if (file.size > maxSize) {
      Alert.alert(
        'File Too Large',
        `File size should not exceed ${maxSizeInMB}MB. Please choose a smaller file.`,
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }

  // Get file type icon based on file extension or type
  static getFileIcon(fileName, mimeType) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
      return 'image';
    } else if (mimeType?.includes('pdf') || extension === 'pdf') {
      return 'document-text';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'document';
    } else if (['txt'].includes(extension)) {
      return 'document-text';
    } else {
      return 'attach';
    }
  }

  // Format file size for display
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate unique file ID
  static generateFileId() {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Notification Handler for Reports
export class NotificationHandler {
  
  // Send report to patient via phone number
  static async sendReportToPatient(phoneNumber, reportData, patientList) {
    try {
      // Find patient by phone number
      const patient = patientList.find(p => p.phone === phoneNumber || p.phone.includes(phoneNumber.replace(/\D/g, '')));
      
      if (!patient) {
        Alert.alert(
          'Patient Not Found',
          'No patient found with this phone number. Please verify the number and try again.',
          [{ text: 'OK' }]
        );
        return { success: false, error: 'Patient not found' };
      }

      // Simulate sending notification (In real app, this would integrate with SMS/Push notification service)
      const notification = {
        id: `notif_${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        phoneNumber: phoneNumber,
        reportId: reportData.id,
        reportType: reportData.type,
        message: `New ${reportData.type} report is available. Please check your patient portal.`,
        sentAt: new Date().toISOString(),
        status: 'sent',
        deliveryMethod: 'sms', // In real implementation: 'sms', 'push', 'email'
      };

      Alert.alert(
        'Report Sent Successfully!',
        `${reportData.type} has been sent to ${patient.name} at ${phoneNumber}.\n\nThe patient will receive a notification and can access the report in their account.`,
        [{ text: 'OK' }]
      );

      return { 
        success: true, 
        notification,
        patient: {
          id: patient.id,
          name: patient.name,
          phone: phoneNumber
        }
      };

    } catch (error) {
      console.log('Send report error:', error);
      Alert.alert('Error', 'Failed to send report. Please try again.');
      return { success: false, error: error.message };
    }
  }

  // Validate phone number format
  static validatePhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid Indian mobile number
    const indianMobilePattern = /^[6-9]\d{9}$/;
    const internationalPattern = /^91[6-9]\d{9}$/;
    
    if (cleanNumber.length === 10 && indianMobilePattern.test(cleanNumber)) {
      return { isValid: true, formattedNumber: `+91 ${cleanNumber}` };
    } else if (cleanNumber.length === 12 && internationalPattern.test(cleanNumber)) {
      return { isValid: true, formattedNumber: `+${cleanNumber}` };
    } else {
      return { 
        isValid: false, 
        error: 'Please enter a valid 10-digit mobile number (e.g., 9876543210)' 
      };
    }
  }
}

export default { FileHandler, NotificationHandler };