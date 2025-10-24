import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../constants/theme';

const AppointmentCard = ({ 
  appointment, 
  onPress, 
  onCancel, 
  onReschedule,
  showActions = true,
  type = 'upcoming' // 'upcoming' or 'past'
}) => {
  const isUpcoming = type === 'upcoming';
  const isPast = type === 'past';
  
  // Status color mapping
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'scheduled':
        return '#10B981';
      case 'completed':
        return '#059669';
      case 'cancelled':
        return '#EF4444';
      case 'rescheduled':
        return '#F59E0B';
      case 'pending':
        return '#F97316';
      default:
        return '#6B7280';
    }
  };

  // Enhanced date formatting with better parsing
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      let date;
      
      // Handle different date formats
      if (dateString.includes('T')) {
        // ISO format: 2025-10-24T10:00:00.000Z
        date = new Date(dateString);
      } else if (dateString.includes(' ') && dateString.includes('-')) {
        // Format: "2025-10-24 10:00 AM" or "2025-10-24"
        const datePart = dateString.split(' ')[0];
        date = new Date(datePart);
      } else if (dateString.includes('-')) {
        // Simple date: "2025-10-24"
        date = new Date(dateString);
      } else {
        // Try direct parsing
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date format:', dateString);
        return dateString; // Return original if can't parse
      }
      
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.warn('⚠️ Date parsing error:', dateString, error);
      return dateString;
    }
  };

  // Enhanced time formatting
  const formatTime = (timeString) => {
    if (!timeString) return 'No time';
    
    try {
      let time;
      
      if (timeString.includes('T')) {
        // ISO format
        time = new Date(timeString);
        return time.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        });
      } else if (timeString.includes(' ') && (timeString.includes('AM') || timeString.includes('PM'))) {
        // Already formatted time like "10:00 AM"
        return timeString.split(' ').slice(-2).join(' '); // Get last two parts (time + AM/PM)
      } else if (timeString.includes(':')) {
        // Time format like "10:00"
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
      } else {
        return timeString;
      }
    } catch (error) {
      console.warn('⚠️ Time parsing error:', timeString, error);
      return timeString;
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => onCancel?.(appointment.id)
        }
      ]
    );
  };

  const handleReschedule = () => {
    if (onReschedule) {
      onReschedule(appointment.id);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        isPast && styles.pastCard,
        isUpcoming && styles.upcomingCard
      ]} 
      onPress={() => onPress?.(appointment)}
      activeOpacity={0.7}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {appointment.serviceName || appointment.service || 'General Consultation'}
          </Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(appointment.status) }
          ]}>
            <Text style={styles.statusText}>
              {isPast ? 'Completed' : (appointment.status || 'Scheduled').charAt(0).toUpperCase() + (appointment.status || 'Scheduled').slice(1)}
            </Text>
          </View>
        </View>
        
        {appointment.tokenNumber && (
          <Text style={styles.tokenNumber}>
            #{appointment.tokenNumber}
          </Text>
        )}
      </View>

      {/* Doctor Information */}
      <View style={styles.doctorSection}>
        <Ionicons name="medical" size={16} color={Colors.primary} />
        <Text style={styles.doctorName}>
          {appointment.doctorName || appointment.doctor || 'Dr. Not Assigned'}
        </Text>
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeItem}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.dateTimeText}>
            {formatDate(appointment.date || appointment.appointmentDate)}
          </Text>
        </View>
        <View style={styles.dateTimeItem}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.dateTimeText}>
            {appointment.time || formatTime(appointment.appointmentDate) || 'No time'}
          </Text>
        </View>
      </View>

      {/* Payment Information */}
      {appointment.amount && (
        <View style={styles.paymentSection}>
          <Ionicons name="card-outline" size={16} color="#6B7280" />
          <Text style={styles.paymentText}>
            ₹{appointment.amount} • {appointment.paymentMethod || 'Cash/Card at Hospital'}
          </Text>
          {appointment.paymentStatus && (
            <View style={[
              styles.paymentBadge,
              { 
                backgroundColor: appointment.paymentStatus === 'Paid' ? '#D1FAE5' : '#FEF3C7',
              }
            ]}>
              <Text style={[
                styles.paymentStatusText,
                { 
                  color: appointment.paymentStatus === 'Paid' ? '#065F46' : '#92400E',
                }
              ]}>
                {appointment.paymentStatus}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons for Upcoming Appointments */}
      {isUpcoming && showActions && (appointment.status !== 'cancelled') && (
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleReschedule}
          >
            <Ionicons name="calendar" size={16} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Reschedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Ionicons name="close-circle" size={16} color="#EF4444" />
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* View Details Footer */}
      <View style={styles.footer}>
        <Text style={styles.viewDetailsText}>Tap to view details</Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
  },
  upcomingCard: {
    borderLeftColor: Colors.primary,
  },
  pastCard: {
    borderLeftColor: '#10B981',
    backgroundColor: '#F9FAFB',
  },
  header: {
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  tokenNumber: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  doctorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
  },
  dateTimeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateTimeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 5,
  },
  paymentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  paymentText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  paymentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  cancelButtonText: {
    color: '#EF4444',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 4,
  },
});

export default AppointmentCard;