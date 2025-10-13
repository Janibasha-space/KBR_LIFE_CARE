import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';

const AdminProfileScreen = ({ navigation }) => {
  const [adminData, setAdminData] = useState({
    name: 'Admin King',
    email: 'admin@kbrhospital.com',
    phone: '+91 98765 43210',
    role: 'Administrator',
    department: 'Hospital Management',
    joinDate: '2020-01-15',
    permissions: ['Full Access', 'User Management', 'System Configuration']
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(adminData);

  const handleSave = () => {
    setAdminData(editData);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleCancel = () => {
    setEditData(adminData);
    setIsEditing(false);
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Admin Profile</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons 
              name={isEditing ? "close" : "create"} 
              size={24} 
              color={Colors.white} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Picture Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={require('../../../assets/hospital-logo.jpeg')}
                style={styles.profileImage}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.cameraButton}>
                <Ionicons name="camera" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>{adminData.name}</Text>
            <Text style={styles.profileRole}>{adminData.role}</Text>
          </View>

          {/* Profile Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editData.name}
                    onChangeText={(text) => setEditData({...editData, name: text})}
                  />
                ) : (
                  <Text style={styles.infoValue}>{adminData.name}</Text>
                )}
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email Address</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editData.email}
                    onChangeText={(text) => setEditData({...editData, email: text})}
                    keyboardType="email-address"
                  />
                ) : (
                  <Text style={styles.infoValue}>{adminData.email}</Text>
                )}
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editData.phone}
                    onChangeText={(text) => setEditData({...editData, phone: text})}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.infoValue}>{adminData.phone}</Text>
                )}
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Department</Text>
                <Text style={styles.infoValue}>{adminData.department}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Join Date</Text>
                <Text style={styles.infoValue}>{adminData.joinDate}</Text>
              </View>
            </View>
          </View>

          {/* Permissions Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Permissions</Text>
            <View style={styles.infoCard}>
              {adminData.permissions.map((permission, index) => (
                <View key={index} style={styles.permissionItem}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.kbrGreen} />
                  <Text style={styles.permissionText}>{permission}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.kbrBlue,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Sizes.xl,
    backgroundColor: Colors.white,
    marginBottom: Sizes.md,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: Sizes.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.kbrBlue,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.kbrRed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileName: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  profileRole: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  infoSection: {
    paddingHorizontal: Sizes.screenPadding,
    marginBottom: Sizes.md,
  },
  sectionTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    marginBottom: Sizes.md,
  },
  infoLabel: {
    fontSize: Sizes.medium,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  infoValue: {
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
  },
  infoInput: {
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  permissionText: {
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xl,
    gap: Sizes.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.kbrRed,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: Sizes.medium,
    color: Colors.white,
    fontWeight: '500',
  },
});

export default AdminProfileScreen;