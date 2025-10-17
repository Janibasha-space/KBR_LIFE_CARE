import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';

const TreatmentDetailsScreen = ({ navigation, route }) => {
  // Extract treatment data from route params
  const { patientStatus } = route.params || {};
  
  useEffect(() => {
    // Set navigation options with dynamic title
    navigation.setOptions({
      title: 'Treatment Details',
      headerShown: true,
      headerTintColor: Colors.white,
      headerStyle: {
        backgroundColor: Colors.kbrBlue,
      },
    });
  }, [navigation]);

  // If no treatment data was passed, show error state
  if (!patientStatus) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Treatment information not available</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Treatment Header */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View style={styles.admissionBadge}>
                <Ionicons name="medical" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>Current Treatment</Text>
                <Text style={styles.headerSubtitle}>Room {patientStatus.roomNumber} • {patientStatus.roomType}</Text>
                <Text style={styles.admissionType}>{patientStatus.admissionType}</Text>
              </View>
            </View>
          </View>
          
          {/* Doctor & Department Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Provider Information</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="person" size={16} color={Colors.kbrBlue} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Doctor</Text>
                  <Text style={styles.infoValue}>{patientStatus.currentDoctor}</Text>
                </View>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="medical" size={16} color={Colors.kbrBlue} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Department</Text>
                  <Text style={styles.infoValue}>{patientStatus.department}</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Admission Details Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Admission Information</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={16} color={Colors.kbrGreen} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Admission Date</Text>
                  <Text style={styles.infoValue}>{patientStatus.admissionDate}</Text>
                </View>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color={Colors.kbrPurple} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Estimated Discharge</Text>
                  <Text style={styles.infoValue}>{patientStatus.estimatedDischargeDate}</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Treatments Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Scheduled Treatments</Text>
            {patientStatus.treatments.map((treatment) => (
              <View key={treatment.id} style={styles.treatmentItem}>
                <View style={styles.treatmentRow}>
                  <View style={[styles.statusDot, { 
                    backgroundColor: treatment.status === 'Ongoing' ? Colors.kbrGreen : 
                                   treatment.status === 'Scheduled' ? Colors.kbrBlue : Colors.kbrPurple 
                  }]} />
                  <View style={styles.treatmentContent}>
                    <Text style={styles.treatmentName}>{treatment.name}</Text>
                    <Text style={styles.treatmentStatus}>{treatment.status}</Text>
                  </View>
                </View>
                <Text style={styles.treatmentTime}>{treatment.time}</Text>
                <View style={styles.separator} />
              </View>
            ))}
          </View>
          
          {/* Tests Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Scheduled Tests</Text>
            {patientStatus.upcomingTests.map((test) => (
              <View key={test.id} style={styles.testItem}>
                <View style={styles.testRow}>
                  <View style={[styles.statusDot, { backgroundColor: Colors.kbrGreen }]} />
                  <View style={styles.testContent}>
                    <Text style={styles.testName}>{test.name}</Text>
                    <View style={styles.testDetails}>
                      <Text style={styles.testDepartment}>{test.department}</Text>
                      <Text style={styles.testTime}>{test.scheduledTime}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.separator} />
              </View>
            ))}
          </View>
          
          {/* Emergency Contact Section */}
          <View style={[styles.sectionCard, styles.emergencyCard]}>
            <Text style={[styles.sectionTitle, {color: Colors.kbrRed}]}>Emergency Contact</Text>
            <TouchableOpacity 
              style={styles.emergencyButton}
              onPress={() => {
                Alert.alert(
                  "Emergency Contact",
                  "Call hospital emergency line?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Call Now", onPress: () => Linking.openURL('tel:+919876543210') }
                  ]
                );
              }}
            >
              <Ionicons name="call" size={20} color={Colors.white} />
              <Text style={styles.emergencyButtonText}>Contact Emergency Services</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.kbrBlue,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.kbrBlue,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  admissionBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.kbrBlue,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  admissionType: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.kbrBlue,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  treatmentItem: {
    marginBottom: 12,
  },
  treatmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  treatmentContent: {
    flex: 1,
  },
  treatmentName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  treatmentStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  treatmentTime: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 20,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
  },
  testItem: {
    marginBottom: 12,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  testContent: {
    flex: 1,
  },
  testName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  testDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  testDepartment: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.kbrGreen,
  },
  testTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  emergencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.kbrRed,
    marginBottom: 32,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.kbrRed,
    padding: 12,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  }
});

export default TreatmentDetailsScreen;