import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';

const DoctorManagementScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  // Mock data for doctor statistics
  const doctorStats = {
    totalDoctors: 15,
    activeDoctors: 12,
    onDuty: 8,
    onLeave: 3,
    consultations: 45
  };

  // Mock data for doctors - synced with user dashboard
  const doctors = [
    {
      id: 'doc001',
      name: 'Dr. K. Ramesh',
      credentials: 'M.B.B.S., M.D',
      specialization: 'General Physician',
      department: 'General Medicine',
      fellowship: 'Fellowship in Echocardiography',
      experience: '20+ years',
      rating: 4.9,
      consultationFee: 600,
      status: 'Active',
      statusColor: '#10B981',
      availability: '6 days/week',
      phone: '+91 98765 43210',
      email: 'dr.ramesh@kbrhospital.com',
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      timeSlots: '9:00 AM - 6:00 PM',
      expertise: [
        'Infectious diseases (Dengue, Malaria, RTIs, COVID-19)',
        'Sepsis & Critical Care management',
        'Chronic illnesses: Diabetes, Hypertension, Hypothyroidism',
        'Medical emergencies: Poisonings, Snake bites, DKA',
        'Preventive medicine & health screening'
      ],
      todayAppointments: 8,
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80'
    },
    {
      id: 'doc002',
      name: 'Dr. K. Divyavani',
      credentials: 'M.B.B.S., M.S',
      specialization: 'Obstetrics & Gynecology',
      department: 'Gynecology',
      fellowship: 'Fellowship in Fetal Medicine',
      experience: '15+ years',
      rating: 4.8,
      consultationFee: 800,
      status: 'Active',
      statusColor: '#10B981',
      availability: '5 days/week',
      phone: '+91 98765 43211',
      email: 'dr.divyavani@kbrhospital.com',
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      timeSlots: '10:00 AM - 5:00 PM',
      expertise: [
        'High-risk pregnancy management',
        'Minimally invasive gynecological surgery',
        'Reproductive endocrinology',
        'Maternal-fetal medicine',
        'Gynecological oncology'
      ],
      todayAppointments: 6,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80'
    },
    {
      id: 'doc003',
      name: 'Dr. Mahesh Kumar',
      credentials: 'M.B.B.S., M.D., D.M',
      specialization: 'Cardiologist',
      department: 'Cardiology',
      fellowship: 'Fellowship in Interventional Cardiology',
      experience: '18+ years',
      rating: 4.9,
      consultationFee: 1200,
      status: 'On Leave',
      statusColor: '#F59E0B',
      availability: '6 days/week',
      phone: '+91 98765 43212',
      email: 'dr.mahesh@kbrhospital.com',
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      timeSlots: '8:00 AM - 4:00 PM',
      expertise: [
        'Interventional cardiology procedures',
        'Heart failure management',
        'Coronary artery disease',
        'Arrhythmia management',
        'Preventive cardiology'
      ],
      todayAppointments: 0,
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=80'
    },
    {
      id: 'doc004',
      name: 'Dr. K. Thukaram',
      credentials: 'B.D.S, M.D.S',
      specialization: 'Orthodontics & Dentofacial Orthopaedics',
      department: 'Dentistry',
      fellowship: 'Fellowship in Aesthetic Dentistry',
      experience: '12+ years',
      rating: 4.7,
      consultationFee: 500,
      status: 'Active',
      statusColor: '#10B981',
      availability: '6 days/week',
      phone: '+91 98765 43213',
      email: 'dr.thukaram@kbrhospital.com',
      schedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      timeSlots: '9:00 AM - 6:00 PM',
      expertise: [
        'Orthodontic treatment planning',
        'Invisalign and clear aligners',
        'Pediatric orthodontics',
        'Surgical orthodontics',
        'TMJ disorders'
      ],
      todayAppointments: 5,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80'
    }
  ];

  const departments = ['All', 'General Medicine', 'Gynecology', 'Cardiology', 'Dentistry', 'Pediatrics', 'Orthopedics'];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All' || doctor.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const StatsCard = ({ title, value, subtitle, icon, color }) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statsContent}>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
        {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const DoctorCard = ({ doctor }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <View style={styles.doctorImageContainer}>
          <Image 
            source={{ uri: doctor.avatar }}
            style={styles.doctorImage}
            resizeMode="cover"
          />
          <View style={[styles.statusDot, { backgroundColor: doctor.statusColor }]} />
        </View>
        
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorCredentials}>{doctor.credentials}</Text>
          <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
          <Text style={styles.doctorDepartment}>{doctor.department}</Text>
        </View>
        
        <View style={styles.doctorMeta}>
          <View style={[styles.statusBadge, { backgroundColor: doctor.statusColor }]}>
            <Text style={styles.statusText}>{doctor.status}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{doctor.rating}</Text>
          </View>
        </View>
      </View>

      <View style={styles.doctorDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="school" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{doctor.experience}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>₹{doctor.consultationFee}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{doctor.availability}</Text>
          </View>
        </View>

        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleLabel}>Schedule:</Text>
          <View style={styles.scheduleItems}>
            {doctor.schedule.map((day, index) => (
              <View key={index} style={styles.scheduleDay}>
                <Text style={styles.scheduleDayText}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.appointmentInfo}>
          <View style={styles.appointmentItem}>
            <Ionicons name="time" size={16} color={Colors.kbrBlue} />
            <Text style={styles.appointmentText}>{doctor.timeSlots}</Text>
          </View>
          <View style={styles.appointmentItem}>
            <Ionicons name="people" size={16} color={Colors.kbrGreen} />
            <Text style={styles.appointmentText}>{doctor.todayAppointments} appointments today</Text>
          </View>
        </View>

        <View style={styles.expertisePreview}>
          <Text style={styles.expertiseLabel}>Expertise:</Text>
          <Text style={styles.expertiseText} numberOfLines={2}>
            {doctor.expertise.slice(0, 2).join(' • ')}
          </Text>
        </View>
      </View>

      <View style={styles.doctorActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye" size={16} color={Colors.kbrBlue} />
          <Text style={styles.actionText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="calendar" size={16} color={Colors.kbrGreen} />
          <Text style={[styles.actionText, { color: Colors.kbrGreen }]}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="call" size={16} color={Colors.kbrPurple} />
          <Text style={[styles.actionText, { color: Colors.kbrPurple }]}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="settings" size={16} color={Colors.textSecondary} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Doctor Management</Text>
          <Text style={styles.headerSubtitle}>Manage doctors, schedules and availability</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddDoctorModal(true)}
        >
          <Ionicons name="person-add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatsCard
              title="Total Doctors"
              value={doctorStats.totalDoctors}
              icon="people"
              color={Colors.kbrBlue}
            />
            <StatsCard
              title="Active"
              value={doctorStats.activeDoctors}
              subtitle="Available"
              icon="checkmark-circle"
              color={Colors.kbrGreen}
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard
              title="On Duty"
              value={doctorStats.onDuty}
              subtitle="Currently working"
              icon="time"
              color={Colors.kbrPurple}
            />
            <StatsCard
              title="Consultations"
              value={doctorStats.consultations}
              subtitle="Today"
              icon="medical"
              color={Colors.kbrRed}
            />
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search doctors, specializations..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
            {departments.map((dept) => (
              <TouchableOpacity
                key={dept}
                style={[
                  styles.filterTab,
                  selectedDepartment === dept && styles.activeFilterTab
                ]}
                onPress={() => setSelectedDepartment(dept)}
              >
                <Text style={[
                  styles.filterTabText,
                  selectedDepartment === dept && styles.activeFilterTabText
                ]}>
                  {dept}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Doctors List */}
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DoctorCard doctor={item} />}
          contentContainerStyle={styles.doctorsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsIcon: {
    marginRight: 12,
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statsTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statsSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  filterTabs: {
    marginBottom: 8,
  },
  filterTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterTab: {
    backgroundColor: Colors.kbrBlue,
    borderColor: Colors.kbrBlue,
  },
  filterTabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  doctorsList: {
    paddingBottom: 20,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  doctorImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  doctorCredentials: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: Colors.kbrBlue,
    fontWeight: '500',
    marginTop: 2,
  },
  doctorDepartment: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  doctorMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#1F2937',
    marginLeft: 4,
    fontWeight: '500',
  },
  doctorDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  scheduleContainer: {
    marginBottom: 12,
  },
  scheduleLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  scheduleItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scheduleDay: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  scheduleDayText: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '500',
  },
  appointmentInfo: {
    marginBottom: 12,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  appointmentText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  expertisePreview: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
  },
  expertiseLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  expertiseText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
  doctorActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: Colors.kbrBlue,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default DoctorManagementScreen;