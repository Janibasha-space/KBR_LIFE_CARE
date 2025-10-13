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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';

const RoomManagementScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [selectedRoomType, setSelectedRoomType] = useState('All');
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  // Mock data for room statistics
  const roomStats = {
    totalRooms: 120,
    occupiedRooms: 85,
    availableRooms: 35,
    underMaintenance: 5,
    occupancyRate: 71
  };

  // Mock data for rooms
  const rooms = [
    {
      id: 'R001',
      roomNumber: '101',
      floor: 1,
      type: 'General Ward',
      category: 'AC',
      status: 'Occupied',
      statusColor: '#EF4444',
      patientName: 'Rajesh Kumar',
      patientId: 'KBR-IP-2024-001',
      admissionDate: '2024-01-10',
      dailyRate: 2500,
      amenities: ['AC', 'TV', 'WiFi', 'Bathroom'],
      bed: 'A',
      totalBeds: 4
    },
    {
      id: 'R002',
      roomNumber: '102',
      floor: 1,
      type: 'General Ward',
      category: 'Non-AC',
      status: 'Available',
      statusColor: '#10B981',
      patientName: null,
      patientId: null,
      admissionDate: null,
      dailyRate: 1500,
      amenities: ['Fan', 'TV', 'Bathroom'],
      bed: null,
      totalBeds: 6
    },
    {
      id: 'R003',
      roomNumber: '201',
      floor: 2,
      type: 'Private Room',
      category: 'Deluxe',
      status: 'Occupied',
      statusColor: '#EF4444',
      patientName: 'Priya Sharma',
      patientId: 'KBR-IP-2024-002',
      admissionDate: '2024-01-12',
      dailyRate: 4500,
      amenities: ['AC', 'TV', 'WiFi', 'Fridge', 'Sofa', 'Bathroom'],
      bed: 'Single',
      totalBeds: 1
    },
    {
      id: 'R004',
      roomNumber: '301',
      floor: 3,
      type: 'ICU',
      category: 'Critical Care',
      status: 'Under Maintenance',
      statusColor: '#F59E0B',
      patientName: null,
      patientId: null,
      admissionDate: null,
      dailyRate: 8000,
      amenities: ['Ventilator', 'Monitor', 'AC', 'Oxygen'],
      bed: 'ICU Bed',
      totalBeds: 1
    },
  ];

  const floors = ['All', '1st Floor', '2nd Floor', '3rd Floor'];
  const roomTypes = ['All', 'General Ward', 'Private Room', 'ICU', 'VIP Suite'];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (room.patientName && room.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (room.patientId && room.patientId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFloor = selectedFloor === 'All' || selectedFloor === `${room.floor}st Floor` || 
                        selectedFloor === `${room.floor}nd Floor` || selectedFloor === `${room.floor}rd Floor`;
    const matchesType = selectedRoomType === 'All' || room.type === selectedRoomType;
    return matchesSearch && matchesFloor && matchesType;
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

  const RoomCard = ({ room }) => (
    <View style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View style={styles.roomInfo}>
          <View style={styles.roomNumberSection}>
            <View style={[styles.roomNumberBadge, { backgroundColor: room.statusColor + '20' }]}>
              <Text style={[styles.roomNumber, { color: room.statusColor }]}>
                {room.roomNumber}
              </Text>
            </View>
            <View style={styles.roomDetails}>
              <Text style={styles.roomType}>{room.type}</Text>
              <Text style={styles.roomCategory}>{room.category} • Floor {room.floor}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: room.statusColor }]}>
            <Text style={styles.statusText}>{room.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.roomContent}>
        {room.patientName ? (
          <View style={styles.patientInfo}>
            <View style={styles.patientHeader}>
              <Ionicons name="person" size={16} color={Colors.textSecondary} />
              <Text style={styles.patientLabel}>Current Patient</Text>
            </View>
            <Text style={styles.patientName}>{room.patientName}</Text>
            <Text style={styles.patientId}>{room.patientId}</Text>
            <Text style={styles.admissionDate}>Admitted: {room.admissionDate}</Text>
          </View>
        ) : (
          <View style={styles.availableInfo}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.kbrGreen} />
            <Text style={styles.availableText}>
              {room.status === 'Available' ? 'Ready for admission' : 'Under maintenance'}
            </Text>
          </View>
        )}

        <View style={styles.roomSpecs}>
          <View style={styles.specItem}>
            <Ionicons name="bed" size={16} color={Colors.textSecondary} />
            <Text style={styles.specText}>
              {room.bed || room.totalBeds + ' beds'}
            </Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="cash" size={16} color={Colors.textSecondary} />
            <Text style={styles.specText}>₹{room.dailyRate}/day</Text>
          </View>
        </View>

        <View style={styles.amenitiesList}>
          {room.amenities.slice(0, 3).map((amenity, index) => (
            <View key={index} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
          {room.amenities.length > 3 && (
            <View style={styles.amenityTag}>
              <Text style={styles.amenityText}>+{room.amenities.length - 3} more</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.roomActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye" size={16} color={Colors.kbrBlue} />
          <Text style={styles.actionText}>View Details</Text>
        </TouchableOpacity>
        {room.status === 'Available' && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="person-add" size={16} color={Colors.kbrGreen} />
            <Text style={[styles.actionText, { color: Colors.kbrGreen }]}>Assign Patient</Text>
          </TouchableOpacity>
        )}
        {room.status === 'Occupied' && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="log-out" size={16} color={Colors.kbrRed} />
            <Text style={[styles.actionText, { color: Colors.kbrRed }]}>Discharge</Text>
          </TouchableOpacity>
        )}
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
          <Text style={styles.headerTitle}>Room Management</Text>
          <Text style={styles.headerSubtitle}>Monitor room occupancy and patient assignments</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddRoomModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatsCard
              title="Total Rooms"
              value={roomStats.totalRooms}
              icon="business"
              color={Colors.kbrBlue}
            />
            <StatsCard
              title="Occupied"
              value={roomStats.occupiedRooms}
              subtitle={`${roomStats.occupancyRate}% occupancy`}
              icon="people"
              color={Colors.kbrRed}
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard
              title="Available"
              value={roomStats.availableRooms}
              subtitle="Ready for admission"
              icon="checkmark-circle"
              color={Colors.kbrGreen}
            />
            <StatsCard
              title="Maintenance"
              value={roomStats.underMaintenance}
              subtitle="Under repair"
              icon="construct"
              color={Colors.kbrPurple}
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
                placeholder="Search rooms, patients..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
            {floors.map((floor) => (
              <TouchableOpacity
                key={floor}
                style={[
                  styles.filterTab,
                  selectedFloor === floor && styles.activeFilterTab
                ]}
                onPress={() => setSelectedFloor(floor)}
              >
                <Text style={[
                  styles.filterTabText,
                  selectedFloor === floor && styles.activeFilterTabText
                ]}>
                  {floor}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
            {roomTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterTab,
                  selectedRoomType === type && styles.activeFilterTab
                ]}
                onPress={() => setSelectedRoomType(type)}
              >
                <Text style={[
                  styles.filterTabText,
                  selectedRoomType === type && styles.activeFilterTabText
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Rooms List */}
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RoomCard room={item} />}
          contentContainerStyle={styles.roomsList}
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
  roomsList: {
    paddingBottom: 20,
  },
  roomCard: {
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
  roomHeader: {
    marginBottom: 12,
  },
  roomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roomNumberSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomNumberBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomDetails: {
    flex: 1,
  },
  roomType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  roomCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  roomContent: {
    marginBottom: 12,
  },
  patientInfo: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  patientLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  patientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  patientId: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  admissionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  availableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  availableText: {
    fontSize: 14,
    color: '#15803D',
    marginLeft: 8,
    fontWeight: '500',
  },
  roomSpecs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityTag: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '500',
  },
  roomActions: {
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

export default RoomManagementScreen;