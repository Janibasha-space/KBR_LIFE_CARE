import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { FirebaseDoctorService, FirebaseServiceApiService } from '../services/firebaseHospitalServices';

const AssignDoctorModal = ({ visible, onClose, service, onAssignmentChange }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigningDoctorId, setAssigningDoctorId] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchDoctors();
    }
  }, [visible]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const result = await FirebaseDoctorService.getDoctors();
      if (result.success) {
        setDoctors(result.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch doctors');
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDoctor = async (doctorId) => {
    try {
      setAssigningDoctorId(doctorId);
      
      const isCurrentlyAssigned = service.assignedDoctors?.includes(doctorId);
      let result;
      
      if (isCurrentlyAssigned) {
        // Unassign doctor
        result = await FirebaseServiceApiService.unassignDoctorFromService(service.id, doctorId);
      } else {
        // Assign doctor
        result = await FirebaseServiceApiService.assignDoctorToService(service.id, doctorId);
      }
      
      // Handle the result
      if (result.success) {
        Alert.alert('Success', result.message);
        
        // Notify parent component to refresh data
        if (onAssignmentChange) {
          onAssignmentChange();
        }
      } else {
        Alert.alert('Error', result.message || 'Operation failed');
      }
      
    } catch (error) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
      console.error('Error assigning/unassigning doctor:', error);
    } finally {
      setAssigningDoctorId(null);
    }
  };

  const isDocterAssigned = (doctorId) => {
    return service.assignedDoctors?.includes(doctorId) || false;
  };

  const renderDoctorItem = ({ item: doctor }) => {
    const isAssigned = isDocterAssigned(doctor.id);
    const isProcessing = assigningDoctorId === doctor.id;

    return (
      <TouchableOpacity
        style={[
          styles.doctorItem,
          isAssigned && styles.assignedDoctorItem
        ]}
        onPress={() => handleAssignDoctor(doctor.id)}
        disabled={isProcessing}
      >
        <View style={styles.doctorInfo}>
          <View style={styles.doctorAvatar}>
            {doctor.avatar && (doctor.avatar.startsWith('http') || doctor.avatar.startsWith('file://')) ? (
              <Image 
                source={{ uri: doctor.avatar }} 
                style={styles.doctorAvatar}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.doctorInitials}>
                {doctor.name?.charAt(0)?.toUpperCase() || 'D'}
              </Text>
            )}
          </View>
          <View style={styles.doctorDetails}>
            <Text style={[styles.doctorName, isAssigned && styles.assignedText]}>
              Dr. {doctor.name}
            </Text>
            <Text style={[styles.doctorSpecialty, isAssigned && styles.assignedSecondaryText]}>
              {doctor.specialty}
            </Text>
            <Text style={[styles.doctorExperience, isAssigned && styles.assignedSecondaryText]}>
              {doctor.experience} years experience
            </Text>
          </View>
        </View>
        
        <View style={styles.actionContainer}>
          {isProcessing ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <View style={[
              styles.assignButton,
              isAssigned ? styles.unassignButton : styles.assignButtonActive
            ]}>
              <Ionicons
                name={isAssigned ? 'checkmark-circle' : 'add-circle-outline'}
                size={24}
                color={isAssigned ? Colors.success : Colors.primary}
              />
              <Text style={[
                styles.buttonText,
                isAssigned ? styles.unassignButtonText : styles.assignButtonText
              ]}>
                {isAssigned ? 'Assigned' : 'Assign'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!service) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Assign Doctors</Text>
              <Text style={styles.serviceName}>{service.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Assigned Doctors Count */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{service.assignedDoctors?.length || 0}</Text>
              <Text style={styles.statLabel}>Assigned Doctors</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{doctors.length}</Text>
              <Text style={styles.statLabel}>Total Doctors</Text>
            </View>
          </View>

          {/* Doctors List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading doctors...</Text>
            </View>
          ) : (
            <FlatList
              data={doctors}
              keyExtractor={(item) => item.id}
              renderItem={renderDoctorItem}
              style={styles.doctorsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyText}>No doctors available</Text>
                  <Text style={styles.emptySubtext}>Add doctors first to assign them to services</Text>
                </View>
              )}
            />
          )}

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={onClose}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  closeButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  doctorsList: {
    flex: 1,
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  assignedDoctorItem: {
    backgroundColor: '#F0F9FF',
  },
  doctorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  doctorInitials: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  doctorExperience: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  assignedText: {
    color: Colors.primary,
  },
  assignedSecondaryText: {
    color: '#0369A1',
  },
  actionContainer: {
    minWidth: 80,
    alignItems: 'center',
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  assignButtonActive: {
    backgroundColor: '#F0F9FF',
  },
  unassignButton: {
    backgroundColor: '#F0FDF4',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  assignButtonText: {
    color: Colors.primary,
  },
  unassignButtonText: {
    color: Colors.success,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AssignDoctorModal;