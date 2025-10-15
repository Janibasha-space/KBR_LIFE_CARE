import React, { useState, useContext } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useApp } from '../../contexts/AppContext';

const RoomManagementScreen = ({ navigation }) => {
  const { rooms, addRoom, updateRoom, deleteRoom, dischargePatient } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Rooms');
  const [activeQuickFilters, setActiveQuickFilters] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [selectedRoomType, setSelectedRoomType] = useState('All');
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  // Room form state
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    floor: 1,
    type: 'General Ward',
    category: 'AC',
    dailyRate: '',
    totalBeds: 1,
    amenities: [],
    description: '',
    status: 'Available',
    statusColor: '#10B981'
  });

  // Available amenities
  const availableAmenities = [
    'AC', 'TV', 'WiFi', 'Bathroom', 'Fridge', 'Sofa', 'Telephone', 
    'Wardrobe', 'Study Table', 'Microwave', 'Balcony', 'Ventilator',
    'Monitor', 'Oxygen', 'Suction', 'Defibrillator', 'ECG Machine'
  ];

  const resetForm = () => {
    setRoomForm({
      roomNumber: '',
      floor: 1,
      type: 'General Ward',
      category: 'AC',
      dailyRate: '',
      totalBeds: 1,
      amenities: [],
      description: '',
      status: 'Available',
      statusColor: '#10B981'
    });
  };

  // Handle amenity toggle
  const toggleAmenity = (amenity) => {
    const updatedAmenities = roomForm.amenities.includes(amenity)
      ? roomForm.amenities.filter(item => item !== amenity)
      : [...roomForm.amenities, amenity];
    
    setRoomForm(prev => ({ ...prev, amenities: updatedAmenities }));
  };

  // Handle add room
  const handleAddRoom = async () => {
    try {
      if (!roomForm.roomNumber || !roomForm.dailyRate) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setLoading(true);
      
      const newRoom = {
        id: `R${Date.now()}`,
        roomNumber: roomForm.roomNumber,
        floor: roomForm.floor,
        type: roomForm.type,
        category: roomForm.category,
        status: roomForm.status,
        statusColor: roomForm.statusColor,
        patientName: null,
        patientId: null,
        admissionDate: null,
        dailyRate: parseInt(roomForm.dailyRate),
        amenities: roomForm.amenities,
        description: roomForm.description,
        totalBeds: roomForm.totalBeds,
        createdAt: new Date().toISOString()
      };

      await addRoom(newRoom);
      setShowAddRoomModal(false);
      resetForm();
      Alert.alert('Success', 'Room added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit room
  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setRoomForm({
      roomNumber: room.roomNumber,
      floor: room.floor,
      type: room.type,
      category: room.category,
      dailyRate: room.dailyRate.toString(),
      totalBeds: room.totalBeds,
      amenities: room.amenities || [],
      description: room.description || '',
      status: room.status || 'Available',
      statusColor: room.statusColor || '#10B981'
    });
    setShowEditModal(true);
  };

  // Handle update room
  const handleUpdateRoom = async () => {
    try {
      if (!roomForm.roomNumber || !roomForm.dailyRate) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setLoading(true);
      
      const updatedRoom = {
        ...selectedRoom,
        roomNumber: roomForm.roomNumber,
        floor: roomForm.floor,
        type: roomForm.type,
        category: roomForm.category,
        dailyRate: parseInt(roomForm.dailyRate),
        amenities: roomForm.amenities,
        description: roomForm.description,
        totalBeds: roomForm.totalBeds,
        status: roomForm.status,
        statusColor: roomForm.statusColor,
        updatedAt: new Date().toISOString()
      };

      await updateRoom(selectedRoom.id, updatedRoom);
      setShowEditModal(false);
      setSelectedRoom(null);
      resetForm();
      Alert.alert('Success', 'Room updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete room
  const handleDeleteRoom = (room) => {
    if (room.status === 'Occupied') {
      Alert.alert('Cannot Delete', 'Cannot delete room with current patient. Please discharge first.');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete room ${room.roomNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoom(room.id);
              Alert.alert('Success', 'Room deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete room. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Handle discharge patient
  const handleDischarge = (room) => {
    Alert.alert(
      'Discharge Patient',
      `Discharge ${room.patientName} from room ${room.roomNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Discharge', 
          onPress: async () => {
            try {
              await dischargePatient(room.id);
              Alert.alert('Success', 'Patient discharged successfully! Room is now available.');
            } catch (error) {
              Alert.alert('Error', 'Failed to discharge patient. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Handle view room details
  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setShowViewModal(true);
  };

  // Mock data for room statistics
  const roomStats = {
    totalRooms: 120,
    occupiedRooms: 85,
    availableRooms: 35,
    underMaintenance: 5,
    occupancyRate: 71
  };

  // Mock data for rooms (will be replaced with context data)
  const mockRooms = [
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

  // Filter options
  const statusFilters = [
    { label: 'All Rooms', value: 'All Rooms', color: '#6B7280' },
    { label: 'Available', value: 'Available', color: '#10B981' },
    { label: 'Occupied', value: 'Occupied', color: '#EF4444' },
    { label: 'Under Maintenance', value: 'Under Maintenance', color: '#F59E0B' },
    { label: 'Reserved', value: 'Reserved', color: '#8B5CF6' },
    { label: 'Out of Order', value: 'Out of Order', color: '#6B7280' }
  ];

  const quickFilters = [
    { label: 'Ready for Admission', value: 'ready_admission', color: '#10B981' },
    { label: 'Needs Attention', value: 'needs_attention', color: '#F59E0B' },
    { label: 'Revenue Generating', value: 'revenue_generating', color: '#3B82F6' }
  ];

  const floors = ['All', '1st Floor', '2nd Floor', '3rd Floor'];
  const roomTypes = ['All', 'General Ward', 'Private Room', 'ICU', 'VIP Suite'];

  // Use context rooms if available, otherwise fallback to mock data
  const allRooms = (rooms && rooms.length > 0) ? rooms : mockRooms;
  
  // Toggle quick filter
  const toggleQuickFilter = (filterValue) => {
    setActiveQuickFilters(prev => 
      prev.includes(filterValue) 
        ? prev.filter(f => f !== filterValue)
        : [...prev, filterValue]
    );
  };

  // Apply filters
  const filteredRooms = allRooms.filter(room => {
    // Search filter
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (room.patientName && room.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (room.patientId && room.patientId.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    const matchesStatus = selectedStatus === 'All Rooms' || room.status === selectedStatus;

    // Quick filters
    let matchesQuickFilter = true;
    if (activeQuickFilters.length > 0) {
      matchesQuickFilter = activeQuickFilters.some(filter => {
        switch (filter) {
          case 'ready_admission':
            return room.status === 'Available' || room.status === 'Reserved';
          case 'needs_attention':
            return room.status === 'Under Maintenance' || room.status === 'Out of Order';
          case 'revenue_generating':
            return room.status === 'Occupied' || room.status === 'Reserved';
          default:
            return true;
        }
      });
    }

    // Floor filter
    const matchesFloor = selectedFloor === 'All' || selectedFloor === `${room.floor}st Floor` || 
                        selectedFloor === `${room.floor}nd Floor` || selectedFloor === `${room.floor}rd Floor`;
    
    // Room type filter
    const matchesType = selectedRoomType === 'All' || room.type === selectedRoomType;
    
    return matchesSearch && matchesStatus && matchesQuickFilter && matchesFloor && matchesType;
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
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewRoom(room)}
        >
          <Ionicons name="eye" size={16} color={Colors.kbrBlue} />
          <Text style={styles.actionText}>View Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditRoom(room)}
        >
          <Ionicons name="create" size={16} color={Colors.kbrPurple} />
          <Text style={[styles.actionText, { color: Colors.kbrPurple }]}>Edit</Text>
        </TouchableOpacity>

        {room.status === 'Occupied' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDischarge(room)}
          >
            <Ionicons name="log-out" size={16} color={Colors.kbrRed} />
            <Text style={[styles.actionText, { color: Colors.kbrRed }]}>Discharge</Text>
          </TouchableOpacity>
        )}

        {room.status === 'Available' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteRoom(room)}
          >
            <Ionicons name="trash" size={16} color={Colors.kbrRed} />
            <Text style={[styles.actionText, { color: Colors.kbrRed }]}>Delete</Text>
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

          {/* Status Filters - Primary */}
          <Text style={styles.filterSectionTitle}>Room Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFiltersContainer}>
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.statusFilterChip,
                  { borderColor: filter.color },
                  selectedStatus === filter.value && { backgroundColor: filter.color }
                ]}
                onPress={() => setSelectedStatus(filter.value)}
              >
                <View style={[
                  styles.statusIndicator, 
                  { backgroundColor: selectedStatus === filter.value ? '#FFF' : filter.color }
                ]} />
                <Text style={[
                  styles.statusFilterText,
                  { color: selectedStatus === filter.value ? '#FFF' : filter.color }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick Filters - Secondary */}
          <Text style={styles.filterSectionTitle}>Quick Filters</Text>
          <View style={styles.quickFiltersContainer}>
            {quickFilters.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.quickFilterChip,
                  activeQuickFilters.includes(filter.value) && { 
                    backgroundColor: filter.color,
                    borderColor: filter.color 
                  }
                ]}
                onPress={() => toggleQuickFilter(filter.value)}
              >
                <Text style={[
                  styles.quickFilterText,
                  activeQuickFilters.includes(filter.value) && styles.activeQuickFilterText
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Floor & Room Type Filters - Tertiary */}
          <View style={styles.secondaryFiltersContainer}>
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

      {/* Add Room Modal */}
      <Modal
        visible={showAddRoomModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddRoomModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowAddRoomModal(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Room</Text>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleAddRoom}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                  <Text style={styles.saveButtonText}>Add Room</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Basic Room Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Room Number *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="101, 201A, ICU-01"
                  value={roomForm.roomNumber}
                  onChangeText={(text) => setRoomForm(prev => ({ ...prev, roomNumber: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Floor *</Text>
                <View style={styles.floorSelector}>
                  {[1, 2, 3, 4, 5].map((floor) => (
                    <TouchableOpacity
                      key={floor}
                      style={[
                        styles.floorOption,
                        roomForm.floor === floor && styles.selectedFloor
                      ]}
                      onPress={() => setRoomForm(prev => ({ ...prev, floor }))}
                    >
                      <Text style={[
                        styles.floorText,
                        roomForm.floor === floor && styles.selectedFloorText
                      ]}>
                        {floor}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Room Type *</Text>
                <View style={styles.roomTypeSelector}>
                  {['General Ward', 'Private Room', 'ICU', 'VIP Suite', 'Emergency', 'Operation Theater'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.roomTypeOption,
                        roomForm.type === type && styles.selectedRoomType
                      ]}
                      onPress={() => setRoomForm(prev => ({ ...prev, type }))}
                    >
                      <Text style={[
                        styles.roomTypeText,
                        roomForm.type === type && styles.selectedRoomTypeText
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category *</Text>
                <View style={styles.categorySelector}>
                  {['AC', 'Non-AC', 'Deluxe', 'Premium', 'Standard'].map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        roomForm.category === category && styles.selectedCategory
                      ]}
                      onPress={() => setRoomForm(prev => ({ ...prev, category }))}
                    >
                      <Text style={[
                        styles.categoryText,
                        roomForm.category === category && styles.selectedCategoryText
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Number of Beds *</Text>
                <View style={styles.bedSelector}>
                  {[1, 2, 3, 4, 6, 8].map((beds) => (
                    <TouchableOpacity
                      key={beds}
                      style={[
                        styles.bedOption,
                        roomForm.totalBeds === beds && styles.selectedBed
                      ]}
                      onPress={() => setRoomForm(prev => ({ ...prev, totalBeds: beds }))}
                    >
                      <Text style={[
                        styles.bedText,
                        roomForm.totalBeds === beds && styles.selectedBedText
                      ]}>
                        {beds}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Daily Rate (₹) *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="2500"
                  value={roomForm.dailyRate}
                  onChangeText={(text) => setRoomForm(prev => ({ ...prev, dailyRate: text }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Room Status *</Text>
                <View style={styles.statusSelector}>
                  {[
                    { label: 'Available', value: 'Available', color: '#10B981' },
                    { label: 'Occupied', value: 'Occupied', color: '#EF4444' },
                    { label: 'Under Maintenance', value: 'Under Maintenance', color: '#F59E0B' },
                    { label: 'Reserved', value: 'Reserved', color: '#8B5CF6' },
                    { label: 'Out of Order', value: 'Out of Order', color: '#6B7280' }
                  ].map((status) => (
                    <TouchableOpacity
                      key={status.value}
                      style={[
                        styles.statusOption,
                        roomForm.status === status.value && { backgroundColor: status.color }
                      ]}
                      onPress={() => setRoomForm(prev => ({ 
                        ...prev, 
                        status: status.value,
                        statusColor: status.color 
                      }))}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        roomForm.status === status.value && { color: '#FFF' }
                      ]}>
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Room description, special features, etc."
                  value={roomForm.description}
                  onChangeText={(text) => setRoomForm(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Facilities & Amenities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Facilities & Amenities</Text>
              <Text style={styles.sectionSubtitle}>Select all available amenities in this room</Text>
              
              <View style={styles.amenitiesGrid}>
                {availableAmenities.map((amenity) => (
                  <TouchableOpacity
                    key={amenity}
                    style={[
                      styles.amenityOption,
                      roomForm.amenities.includes(amenity) && styles.selectedAmenity
                    ]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <Ionicons 
                      name={roomForm.amenities.includes(amenity) ? "checkmark-circle" : "ellipse-outline"}
                      size={18} 
                      color={roomForm.amenities.includes(amenity) ? Colors.kbrGreen : "#9CA3AF"} 
                    />
                    <Text style={[
                      styles.amenityOptionText,
                      roomForm.amenities.includes(amenity) && styles.selectedAmenityText
                    ]}>
                      {amenity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ height: 50 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowEditModal(false);
                setSelectedRoom(null);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Room</Text>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleUpdateRoom}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                  <Text style={styles.saveButtonText}>Update</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Editing Room: {selectedRoom?.roomNumber}</Text>
              <Text style={styles.sectionSubtitle}>Make changes to room information below</Text>
            </View>

            {/* Same form fields as Add Room */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Room Number *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="101, 201A, ICU-01"
                  value={roomForm.roomNumber}
                  onChangeText={(text) => setRoomForm(prev => ({ ...prev, roomNumber: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Floor *</Text>
                <View style={styles.floorSelector}>
                  {[1, 2, 3, 4, 5].map((floor) => (
                    <TouchableOpacity
                      key={floor}
                      style={[
                        styles.floorOption,
                        roomForm.floor === floor && styles.selectedFloor
                      ]}
                      onPress={() => setRoomForm(prev => ({ ...prev, floor }))}
                    >
                      <Text style={[
                        styles.floorText,
                        roomForm.floor === floor && styles.selectedFloorText
                      ]}>
                        {floor}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Room Type *</Text>
                <View style={styles.roomTypeSelector}>
                  {['General Ward', 'Private Room', 'ICU', 'VIP Suite', 'Emergency', 'Operation Theater'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.roomTypeOption,
                        roomForm.type === type && styles.selectedRoomType
                      ]}
                      onPress={() => setRoomForm(prev => ({ ...prev, type }))}
                    >
                      <Text style={[
                        styles.roomTypeText,
                        roomForm.type === type && styles.selectedRoomTypeText
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category *</Text>
                <View style={styles.categorySelector}>
                  {['AC', 'Non-AC', 'Deluxe', 'Premium', 'Standard'].map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        roomForm.category === category && styles.selectedCategory
                      ]}
                      onPress={() => setRoomForm(prev => ({ ...prev, category }))}
                    >
                      <Text style={[
                        styles.categoryText,
                        roomForm.category === category && styles.selectedCategoryText
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Number of Beds *</Text>
                <View style={styles.bedSelector}>
                  {[1, 2, 3, 4, 6, 8].map((beds) => (
                    <TouchableOpacity
                      key={beds}
                      style={[
                        styles.bedOption,
                        roomForm.totalBeds === beds && styles.selectedBed
                      ]}
                      onPress={() => setRoomForm(prev => ({ ...prev, totalBeds: beds }))}
                    >
                      <Text style={[
                        styles.bedText,
                        roomForm.totalBeds === beds && styles.selectedBedText
                      ]}>
                        {beds}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Daily Rate (₹) *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="2500"
                  value={roomForm.dailyRate}
                  onChangeText={(text) => setRoomForm(prev => ({ ...prev, dailyRate: text }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Room Status *</Text>
                <View style={styles.statusSelector}>
                  {[
                    { label: 'Available', value: 'Available', color: '#10B981' },
                    { label: 'Occupied', value: 'Occupied', color: '#EF4444' },
                    { label: 'Under Maintenance', value: 'Under Maintenance', color: '#F59E0B' },
                    { label: 'Reserved', value: 'Reserved', color: '#8B5CF6' },
                    { label: 'Out of Order', value: 'Out of Order', color: '#6B7280' }
                  ].map((status) => (
                    <TouchableOpacity
                      key={status.value}
                      style={[
                        styles.statusOption,
                        roomForm.status === status.value && { backgroundColor: status.color }
                      ]}
                      onPress={() => setRoomForm(prev => ({ 
                        ...prev, 
                        status: status.value,
                        statusColor: status.color 
                      }))}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        roomForm.status === status.value && { color: '#FFF' }
                      ]}>
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Room description, special features, etc."
                  value={roomForm.description}
                  onChangeText={(text) => setRoomForm(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Facilities & Amenities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Facilities & Amenities</Text>
              
              <View style={styles.amenitiesGrid}>
                {availableAmenities.map((amenity) => (
                  <TouchableOpacity
                    key={amenity}
                    style={[
                      styles.amenityOption,
                      roomForm.amenities.includes(amenity) && styles.selectedAmenity
                    ]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <Ionicons 
                      name={roomForm.amenities.includes(amenity) ? "checkmark-circle" : "ellipse-outline"}
                      size={18} 
                      color={roomForm.amenities.includes(amenity) ? Colors.kbrGreen : "#9CA3AF"} 
                    />
                    <Text style={[
                      styles.amenityOptionText,
                      roomForm.amenities.includes(amenity) && styles.selectedAmenityText
                    ]}>
                      {amenity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ height: 50 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* View Room Modal */}
      <Modal
        visible={showViewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowViewModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowViewModal(false);
                setSelectedRoom(null);
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Room Details</Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                setShowViewModal(false);
                handleEditRoom(selectedRoom);
              }}
            >
              <Ionicons name="create" size={16} color="#FFF" />
              <Text style={styles.saveButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {selectedRoom && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Room Header */}
              <View style={styles.viewRoomHeader}>
                <View style={[styles.roomNumberBadge, { backgroundColor: selectedRoom.statusColor + '20' }]}>
                  <Text style={[styles.roomNumber, { color: selectedRoom.statusColor, fontSize: 24 }]}>
                    {selectedRoom.roomNumber}
                  </Text>
                </View>
                <View style={styles.viewRoomInfo}>
                  <Text style={styles.viewRoomType}>{selectedRoom.type}</Text>
                  <Text style={styles.viewRoomCategory}>{selectedRoom.category} • Floor {selectedRoom.floor}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: selectedRoom.statusColor }]}>
                    <Text style={styles.statusText}>{selectedRoom.status}</Text>
                  </View>
                </View>
              </View>

              {/* Patient Information */}
              {selectedRoom.patientName ? (
                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>Current Patient</Text>
                  <View style={styles.viewPatientCard}>
                    <Ionicons name="person" size={24} color={Colors.kbrBlue} />
                    <View style={styles.viewPatientInfo}>
                      <Text style={styles.viewPatientName}>{selectedRoom.patientName}</Text>
                      <Text style={styles.viewPatientId}>{selectedRoom.patientId}</Text>
                      <Text style={styles.viewAdmissionDate}>Admitted: {selectedRoom.admissionDate}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>Room Status</Text>
                  <View style={styles.viewAvailableCard}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.kbrGreen} />
                    <Text style={styles.viewAvailableText}>Room is available for new admissions</Text>
                  </View>
                </View>
              )}

              {/* Room Specifications */}
              <View style={styles.viewSection}>
                <Text style={styles.viewSectionTitle}>Room Specifications</Text>
                
                <View style={styles.viewSpecGrid}>
                  <View style={styles.viewSpecItem}>
                    <Ionicons name="bed" size={20} color="#6B7280" />
                    <View>
                      <Text style={styles.viewSpecLabel}>Beds</Text>
                      <Text style={styles.viewSpecValue}>{selectedRoom.totalBeds} beds</Text>
                    </View>
                  </View>
                  
                  <View style={styles.viewSpecItem}>
                    <Ionicons name="cash" size={20} color="#6B7280" />
                    <View>
                      <Text style={styles.viewSpecLabel}>Daily Rate</Text>
                      <Text style={styles.viewSpecValue}>₹{selectedRoom.dailyRate}/day</Text>
                    </View>
                  </View>

                  <View style={styles.viewSpecItem}>
                    <Ionicons name="business" size={20} color="#6B7280" />
                    <View>
                      <Text style={styles.viewSpecLabel}>Floor</Text>
                      <Text style={styles.viewSpecValue}>{selectedRoom.floor}{"st nd rd th".split(' ')[selectedRoom.floor-1] || 'th'} Floor</Text>
                    </View>
                  </View>

                  <View style={styles.viewSpecItem}>
                    <Ionicons name="pricetag" size={20} color="#6B7280" />
                    <View>
                      <Text style={styles.viewSpecLabel}>Category</Text>
                      <Text style={styles.viewSpecValue}>{selectedRoom.category}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Facilities & Amenities */}
              <View style={styles.viewSection}>
                <Text style={styles.viewSectionTitle}>Facilities & Amenities</Text>
                
                <View style={styles.viewAmenitiesGrid}>
                  {(selectedRoom.amenities || []).map((amenity, index) => (
                    <View key={index} style={styles.viewAmenityItem}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.kbrGreen} />
                      <Text style={styles.viewAmenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>

                {(!selectedRoom.amenities || selectedRoom.amenities.length === 0) && (
                  <Text style={styles.noAmenities}>No amenities specified</Text>
                )}
              </View>

              {/* Description */}
              {selectedRoom.description && (
                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>Description</Text>
                  <Text style={styles.viewDescription}>{selectedRoom.description}</Text>
                </View>
              )}

              <View style={{ height: 50 }} />
            </ScrollView>
          )}
        </View>
      </Modal>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  // New enhanced filter styles
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  statusFiltersContainer: {
    marginBottom: 16,
  },
  statusFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    minWidth: 90,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  quickFilterChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickFilterText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeQuickFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryFiltersContainer: {
    marginTop: 8,
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

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },

  // Form Styles
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 44,
  },

  // Category Selector
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  selectedCategory: {
    backgroundColor: Colors.kbrBlue,
    borderColor: Colors.kbrBlue,
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },

  // Status Selector
  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  statusOptionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Floor Selector
  floorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  floorOption: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedFloor: {
    backgroundColor: Colors.kbrBlue,
    borderColor: Colors.kbrBlue,
  },
  floorText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  selectedFloorText: {
    color: '#FFFFFF',
  },

  // Room Type Selector
  roomTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roomTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  selectedRoomType: {
    backgroundColor: Colors.kbrBlue,
    borderColor: Colors.kbrBlue,
  },
  roomTypeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedRoomTypeText: {
    color: '#FFFFFF',
  },

  // Bed Selector
  bedSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bedOption: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBed: {
    backgroundColor: Colors.kbrBlue,
    borderColor: Colors.kbrBlue,
  },
  bedText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  selectedBedText: {
    color: '#FFFFFF',
  },

  // Amenities Grid
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    gap: 6,
    minWidth: '45%',
  },
  selectedAmenity: {
    backgroundColor: '#F0FDF4',
    borderColor: Colors.kbrGreen,
  },
  amenityOptionText: {
    fontSize: 13,
    color: '#6B7280',
  },
  selectedAmenityText: {
    color: Colors.kbrGreen,
    fontWeight: '500',
  },

  // View Room Styles
  viewRoomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 20,
  },
  viewRoomInfo: {
    flex: 1,
    marginLeft: 15,
  },
  viewRoomType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  viewRoomCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  viewSection: {
    marginBottom: 24,
  },
  viewSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  viewPatientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.kbrBlue,
  },
  viewPatientInfo: {
    marginLeft: 12,
  },
  viewPatientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  viewPatientId: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAdmissionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAvailableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.kbrGreen,
  },
  viewAvailableText: {
    fontSize: 14,
    color: '#15803D',
    marginLeft: 12,
    fontWeight: '500',
  },
  viewSpecGrid: {
    gap: 16,
  },
  viewSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  viewSpecLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  viewSpecValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  viewAmenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  viewAmenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  viewAmenityText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '500',
  },
  noAmenities: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  viewDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default RoomManagementScreen;