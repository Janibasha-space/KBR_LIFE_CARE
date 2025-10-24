import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { FirebaseHospitalService } from '../services/firebaseHospitalServices';

const TokenLookupModal = ({ visible, onClose }) => {
  const [tokenNumber, setTokenNumber] = useState('');
  const [appointmentData, setAppointmentData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!tokenNumber.trim()) {
      Alert.alert('Error', 'Please enter a token number');
      return;
    }

    setLoading(true);
    try {
      const result = await FirebaseHospitalService.getAppointmentByToken(tokenNumber.trim());
      
      if (result.success) {
        setAppointmentData(result.data);
      } else {
        Alert.alert('Not Found', 'No appointment found with this token number');
        setAppointmentData(null);
      }
    } catch (error) {
      console.error('Error looking up token:', error);
      Alert.alert('Error', 'Failed to lookup token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleClear = () => {
    setTokenNumber('');
    setAppointmentData(null);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Token Lookup</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.searchSection}>
            <Text style={styles.label}>Enter Token Number</Text>
            <TextInput
              style={styles.input}
              value={tokenNumber}
              onChangeText={setTokenNumber}
              placeholder="e.g., KBR-001"
              autoCapitalize="characters"
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.lookupButton} 
                onPress={handleLookup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Lookup</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={handleClear}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {appointmentData && (
            <View style={styles.resultSection}>
              <Text style={styles.resultTitle}>Appointment Details</Text>
              
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Token Number:</Text>
                  <Text style={styles.detailValue}>{appointmentData.token?.tokenNumber}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Patient Name:</Text>
                  <Text style={styles.detailValue}>{appointmentData.appointment?.patientName || appointmentData.token?.patientName}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Contact:</Text>
                  <Text style={styles.detailValue}>{appointmentData.appointment?.contactNumber || appointmentData.token?.contactNumber}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[styles.detailValue, styles.statusText]}>{appointmentData.appointment?.status || appointmentData.token?.status}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Appointment Date:</Text>
                  <Text style={styles.detailValue}>{formatDate(appointmentData.appointment?.appointmentDate || appointmentData.token?.appointmentDate)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Created:</Text>
                  <Text style={styles.detailValue}>{formatDate(appointmentData.appointment?.createdAt || appointmentData.token?.createdAt)}</Text>
                </View>
                
                {appointmentData.appointment?.doctorName && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Doctor:</Text>
                    <Text style={styles.detailValue}>{appointmentData.appointment.doctorName}</Text>
                  </View>
                )}
                
                {appointmentData.appointment?.serviceName && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service:</Text>
                    <Text style={styles.detailValue}>{appointmentData.appointment.serviceName}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  lookupButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  resultSection: {
    marginTop: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  detailCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  statusText: {
    fontWeight: 'bold',
    color: '#28A745',
  },
});

export default TokenLookupModal;