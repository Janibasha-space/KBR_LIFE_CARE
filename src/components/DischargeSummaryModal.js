import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DischargeSummaryModal = ({ 
  visible, 
  onClose, 
  patient
}) => {
  const { 
    useBackend,
    getPatientMedicalHistory,
    getReportsByPatient,
    getRoomsByPatient,
    getPaymentsByPatient
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [comprehensiveData, setComprehensiveData] = useState(null);
  const [summaryNotes, setSummaryNotes] = useState('');
  const [doctorRecommendations, setDoctorRecommendations] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');
  const [medications, setMedications] = useState('');

  useEffect(() => {
    if (visible && patient) {
      fetchComprehensivePatientData();
    }
  }, [visible, patient]);

  const fetchComprehensivePatientData = async () => {
    if (!patient) return;
    
    try {
      setLoading(true);
      
      // Fetch all patient-related data
      const [
        medicalHistory,
        reports,
        rooms,
        payments
      ] = await Promise.all([
        getPatientMedicalHistory?.(patient.id) || [],
        getReportsByPatient?.(patient.id) || [],
        getRoomsByPatient?.(patient.id) || [],
        getPaymentsByPatient?.(patient.id) || []
      ]);

      // Calculate comprehensive data
      const totalCosts = calculateTotalCosts(patient, rooms, payments);
      const treatmentTimeline = generateTreatmentTimeline(patient, medicalHistory, reports);
      
      const comprehensive = {
        patient: patient,
        medicalHistory: medicalHistory,
        reports: reports,
        rooms: rooms,
        payments: payments,
        totalCosts: totalCosts,
        treatmentTimeline: treatmentTimeline,
        admissionDuration: calculateAdmissionDuration(patient.admissionDate),
        vitalSigns: patient.vitalSigns || [],
        allergies: patient.allergies || [],
        emergencyContact: patient.emergencyContact || {}
      };

      setComprehensiveData(comprehensive);
      
      // Set default summary content
      setSummaryNotes(generateDefaultSummary(comprehensive));
      setDoctorRecommendations(generateDefaultRecommendations(patient));
      setFollowUpInstructions(generateDefaultFollowUp(patient));
      setMedications(generateMedicationsList(patient));
      
    } catch (error) {
      console.error('Error fetching comprehensive patient data:', error);
      Alert.alert('Error', 'Failed to load patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCosts = (patient, rooms, payments) => {
    let totalCost = 0;
    let breakdown = {
      roomCharges: 0,
      medicationCharges: 0,
      testCharges: 0,
      consultationCharges: 0,
      miscellaneous: 0
    };

    // Room charges
    if (rooms && rooms.length > 0) {
      rooms.forEach(room => {
        const cost = parseFloat(room.cost || room.dailyRate || 0);
        breakdown.roomCharges += cost;
        totalCost += cost;
      });
    }

    // Medication charges
    if (patient.medications) {
      patient.medications.forEach(med => {
        const cost = parseFloat(med.cost || 0);
        breakdown.medicationCharges += cost;
        totalCost += cost;
      });
    }

    // Test charges
    if (patient.tests) {
      patient.tests.forEach(test => {
        const cost = parseFloat(test.cost || test.fee || 0);
        breakdown.testCharges += cost;
        totalCost += cost;
      });
    }

    // Consultation charges
    if (patient.consultations) {
      patient.consultations.forEach(consultation => {
        const cost = parseFloat(consultation.fee || consultation.cost || 0);
        breakdown.consultationCharges += cost;
        totalCost += cost;
      });
    }

    // Payment records
    if (payments && payments.length > 0) {
      payments.forEach(payment => {
        if (payment.type === 'charge') {
          const cost = parseFloat(payment.amount || 0);
          breakdown.miscellaneous += cost;
          totalCost += cost;
        }
      });
    }

    return {
      total: totalCost,
      breakdown: breakdown
    };
  };

  const generateTreatmentTimeline = (patient, medicalHistory, reports) => {
    const timeline = [];
    
    // Add admission
    timeline.push({
      date: patient.admissionDate,
      type: 'admission',
      description: `Patient admitted with ${patient.condition || 'medical condition'}`,
      doctor: patient.doctor
    });

    // Add medical history events
    if (medicalHistory && medicalHistory.length > 0) {
      medicalHistory.forEach(record => {
        timeline.push({
          date: record.date || record.createdAt,
          type: 'treatment',
          description: record.diagnosis || record.notes || record.description,
          doctor: record.doctor || patient.doctor
        });
      });
    }

    // Add test results
    if (reports && reports.length > 0) {
      reports.forEach(report => {
        timeline.push({
          date: report.date || report.createdAt,
          type: 'test',
          description: `${report.testType || report.title || 'Medical Test'} - ${report.result || 'Report generated'}`,
          doctor: report.doctor || patient.doctor
        });
      });
    }

    // Add medications
    if (patient.medications) {
      patient.medications.forEach(med => {
        timeline.push({
          date: med.startDate || patient.admissionDate,
          type: 'medication',
          description: `Prescribed ${med.name} - ${med.dosage || med.instructions}`,
          doctor: med.doctor || patient.doctor
        });
      });
    }

    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return timeline;
  };

  const calculateAdmissionDuration = (admissionDate) => {
    if (!admissionDate) return 'Unknown';
    
    const admission = new Date(admissionDate);
    const now = new Date();
    const diffTime = Math.abs(now - admission);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const generateDefaultSummary = (data) => {
    const patient = data?.patient || {};
    const patientName = patient.name || 'Unknown Patient';
    const patientAge = patient.age || 'Unknown';
    const patientGender = patient.gender || 'Unknown';
    const admissionDate = patient.admissionDate || new Date().toISOString();
    const condition = patient.condition || 'medical condition';
    const duration = data?.admissionDuration || 'Unknown duration';
    const reportsCount = data?.reports?.length || 0;
    const medicationsCount = patient.medications?.length || 0;
    
    return `Patient ${patientName} (${patientAge} years, ${patientGender}) was admitted on ${formatDate(admissionDate)} with ${condition}. 

During the ${duration} admission period, the patient received comprehensive medical care including:
- Medical monitoring and treatment
- ${reportsCount} diagnostic test(s)
- ${medicationsCount} prescribed medication(s)
- Regular vital signs monitoring

The patient has shown satisfactory progress and is ready for discharge with appropriate follow-up care.`;
  };

  const generateDefaultRecommendations = (patient) => {
    const doctorName = patient?.doctor || 'attending physician';
    return `1. Continue prescribed medications as directed
2. Follow up with ${doctorName} in 1-2 weeks
3. Monitor symptoms and report any concerns immediately
4. Maintain adequate rest and hydration
5. Gradual return to normal activities as tolerated`;
  };

  const generateDefaultFollowUp = (patient) => {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 14); // 2 weeks from now
    const department = patient?.department || 'General Medicine';
    const doctor = patient?.doctor || 'Attending Physician';
    const emergencyContact = patient?.emergencyContact?.phone || 'On file';
    
    return `Follow-up appointment recommended within 1-2 weeks.
Suggested date: ${formatDate(followUpDate.toISOString())}
Department: ${department}
Doctor: ${doctor}

Emergency contact if complications arise:
Hospital Emergency: [Emergency Number]
Patient Emergency Contact: ${emergencyContact}`;
  };

  const generateMedicationsList = (patient) => {
    if (!patient?.medications || patient.medications.length === 0) {
      return 'No medications prescribed at discharge.';
    }
    
    return patient.medications.map((med, index) => 
      `${index + 1}. ${med?.name || 'Medication'} - ${med?.dosage || 'As prescribed'}\n   Instructions: ${med?.instructions || 'Take as directed by physician'}`
    ).join('\n\n');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const renderPatientInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Patient Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{patient?.name || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Patient ID:</Text>
          <Text style={styles.infoValue}>{patient?.id || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Age:</Text>
          <Text style={styles.infoValue}>{patient?.age || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Gender:</Text>
          <Text style={styles.infoValue}>{patient?.gender || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Admission Date:</Text>
          <Text style={styles.infoValue}>{formatDate(patient?.admissionDate)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Duration:</Text>
          <Text style={styles.infoValue}>{comprehensiveData?.admissionDuration || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Doctor:</Text>
          <Text style={styles.infoValue}>{patient?.doctor || 'N/A'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Department:</Text>
          <Text style={styles.infoValue}>{patient?.department || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );

  const renderTreatmentTimeline = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Treatment Timeline</Text>
      {comprehensiveData?.treatmentTimeline?.length > 0 ? (
        <View style={styles.timeline}>
          {comprehensiveData.treatmentTimeline.map((event, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={[styles.timelineIcon, { backgroundColor: getTimelineColor(event.type) }]}>
                <Ionicons 
                  name={getTimelineIcon(event.type)} 
                  size={12} 
                  color="white" 
                />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDate}>{formatDate(event.date)}</Text>
                <Text style={styles.timelineDescription}>{event.description}</Text>
                <Text style={styles.timelineDoctor}>Dr. {event.doctor}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>No treatment timeline available</Text>
      )}
    </View>
  );

  const renderFinancialSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Financial Summary</Text>
      {comprehensiveData?.totalCosts ? (
        <View style={styles.financialBreakdown}>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Room Charges:</Text>
            <Text style={styles.costValue}>{formatCurrency(comprehensiveData.totalCosts.breakdown.roomCharges)}</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Medication Charges:</Text>
            <Text style={styles.costValue}>{formatCurrency(comprehensiveData.totalCosts.breakdown.medicationCharges)}</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Test Charges:</Text>
            <Text style={styles.costValue}>{formatCurrency(comprehensiveData.totalCosts.breakdown.testCharges)}</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Consultation Charges:</Text>
            <Text style={styles.costValue}>{formatCurrency(comprehensiveData.totalCosts.breakdown.consultationCharges)}</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Miscellaneous:</Text>
            <Text style={styles.costValue}>{formatCurrency(comprehensiveData.totalCosts.breakdown.miscellaneous)}</Text>
          </View>
          <View style={[styles.costItem, styles.totalCost]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>{formatCurrency(comprehensiveData.totalCosts.total)}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>No financial data available</Text>
      )}
    </View>
  );

  const getTimelineColor = (type) => {
    switch (type) {
      case 'admission': return '#4A90E2';
      case 'treatment': return '#10B981';
      case 'test': return '#F59E0B';
      case 'medication': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getTimelineIcon = (type) => {
    switch (type) {
      case 'admission': return 'enter-outline';
      case 'treatment': return 'medical-outline';
      case 'test': return 'flask-outline';
      case 'medication': return 'pill-outline';
      default: return 'information-circle-outline';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Discharge Summary</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading patient data...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Patient Information */}
            {renderPatientInfo()}

            {/* Treatment Timeline */}
            {renderTreatmentTimeline()}

            {/* Financial Summary */}
            {renderFinancialSummary()}

            {/* Summary Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary Notes</Text>
              <TextInput
                style={styles.textArea}
                value={summaryNotes}
                onChangeText={setSummaryNotes}
                placeholder="Enter discharge summary notes..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Doctor Recommendations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Doctor Recommendations</Text>
              <TextInput
                style={styles.textArea}
                value={doctorRecommendations}
                onChangeText={setDoctorRecommendations}
                placeholder="Enter doctor recommendations..."
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            {/* Follow-up Instructions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Follow-up Instructions</Text>
              <TextInput
                style={styles.textArea}
                value={followUpInstructions}
                onChangeText={setFollowUpInstructions}
                placeholder="Enter follow-up instructions..."
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            {/* Medications at Discharge */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medications at Discharge</Text>
              <TextInput
                style={styles.textArea}
                value={medications}
                onChangeText={setMedications}
                placeholder="Enter discharge medications..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 50,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40, // Same width as close button to maintain balance
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '48%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  timelineIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  timelineDoctor: {
    fontSize: 12,
    color: '#4A90E2',
    fontStyle: 'italic',
  },
  financialBreakdown: {
    gap: 8,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  costLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  costValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  totalCost: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    minHeight: 100,
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default DischargeSummaryModal;