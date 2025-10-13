import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const AddPaymentInvoiceModal = ({ 
  visible, 
  onClose, 
  onSave, 
  patientId, 
  patientName 
}) => {
  const [formData, setFormData] = useState({
    description: '',
    type: 'consultation',
    status: 'due',
    paymentMethod: 'cash',
    transactionId: '',
    items: [{ name: '', amount: '' }],
  });

  const invoiceTypes = [
    { value: 'consultation', label: 'Consultation', icon: 'medical' },
    { value: 'tests', label: 'Laboratory Tests', icon: 'flask' },
    { value: 'admission', label: 'Room/Admission', icon: 'bed' },
    { value: 'surgery', label: 'Surgery', icon: 'cut' },
    { value: 'medicine', label: 'Medicine', icon: 'pill' },
    { value: 'other', label: 'Other', icon: 'receipt' },
  ];

  const statusOptions = [
    { value: 'due', label: 'Due/Pending', color: '#F59E0B' },
    { value: 'partial', label: 'Partial Payment', color: '#FFA500' },
    { value: 'paid', label: 'Paid', color: '#10B981' },
    { value: 'failed', label: 'Failed', color: '#EF4444' },
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: 'cash' },
    { value: 'card', label: 'Debit/Credit Card', icon: 'card' },
    { value: 'online', label: 'Online Payment', icon: 'phone-portrait' },
    { value: 'upi', label: 'UPI', icon: 'qr-code' },
  ];

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', amount: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter invoice description');
      return false;
    }

    const validItems = formData.items.filter(item => 
      item.name.trim() && item.amount.trim() && !isNaN(parseFloat(item.amount))
    );

    if (validItems.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one valid item with name and amount');
      return false;
    }

    if (calculateTotal() <= 0) {
      Alert.alert('Validation Error', 'Total amount must be greater than 0');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const validItems = formData.items.filter(item => 
      item.name.trim() && item.amount.trim() && !isNaN(parseFloat(item.amount))
    ).map(item => ({
      name: item.name.trim(),
      amount: parseFloat(item.amount)
    }));

    const invoiceData = {
      patientId,
      patientName,
      description: formData.description.trim(),
      type: formData.type,
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      transactionId: formData.transactionId.trim() || null,
      items: validItems,
      amount: calculateTotal(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      }),
    };

    onSave(invoiceData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      description: '',
      type: 'consultation',
      status: 'due',
      paymentMethod: 'cash',
      transactionId: '',
      items: [{ name: '', amount: '' }],
    });
    onClose();
  };

  const DropdownSelector = ({ label, value, options, onSelect, icon = null }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.optionsContainer}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              value === option.value && styles.selectedOption
            ]}
            onPress={() => onSelect(option.value)}
          >
            {icon && option.icon && (
              <Ionicons 
                name={option.icon} 
                size={16} 
                color={value === option.value ? '#FFF' : '#666'} 
                style={styles.optionIcon}
              />
            )}
            <Text style={[
              styles.optionText,
              value === option.value && styles.selectedOptionText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Add Payment Invoice</Text>
              <Text style={styles.headerSubtitle}>{patientName}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Invoice Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Invoice Description *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="e.g., Consultation Fee - Dr. K. Ramesh"
                multiline
              />
            </View>

            {/* Invoice Type */}
            <DropdownSelector
              label="Invoice Type"
              value={formData.type}
              options={invoiceTypes}
              onSelect={(type) => setFormData(prev => ({ ...prev, type }))}
              icon
            />

            {/* Payment Status */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Status</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.optionsContainer}
              >
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.statusButton,
                      formData.status === status.value && { backgroundColor: status.color }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, status: status.value }))}
                  >
                    <Text style={[
                      styles.statusText,
                      formData.status === status.value && styles.selectedStatusText
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Payment Method */}
            <DropdownSelector
              label="Payment Method"
              value={formData.paymentMethod}
              options={paymentMethods}
              onSelect={(method) => setFormData(prev => ({ ...prev, paymentMethod: method }))}
              icon
            />

            {/* Transaction ID (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Transaction ID (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.transactionId}
                onChangeText={(text) => setFormData(prev => ({ ...prev, transactionId: text }))}
                placeholder="TXN123456789"
                autoCapitalize="characters"
              />
            </View>

            {/* Items Section */}
            <View style={styles.itemsSection}>
              <View style={styles.itemsHeader}>
                <Text style={styles.sectionTitle}>Invoice Items *</Text>
                <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
                  <Ionicons name="add-circle" size={24} color="#007AFF" />
                  <Text style={styles.addItemText}>Add Item</Text>
                </TouchableOpacity>
              </View>

              {formData.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInputs}>
                    <TextInput
                      style={[styles.textInput, styles.itemNameInput]}
                      value={item.name}
                      onChangeText={(text) => updateItem(index, 'name', text)}
                      placeholder="Item name"
                    />
                    <TextInput
                      style={[styles.textInput, styles.itemAmountInput]}
                      value={item.amount}
                      onChangeText={(text) => updateItem(index, 'amount', text)}
                      placeholder="₹ Amount"
                      keyboardType="numeric"
                    />
                  </View>
                  {formData.items.length > 1 && (
                    <TouchableOpacity 
                      style={styles.removeItemButton}
                      onPress={() => removeItem(index)}
                    >
                      <Ionicons name="trash" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {/* Total Display */}
              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>₹{calculateTotal().toLocaleString()}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="checkmark" size={20} color="#FFF" />
              <Text style={styles.saveText}>Save Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
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
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionIcon: {
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedStatusText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  itemsSection: {
    marginBottom: 20,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addItemText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInputs: {
    flex: 1,
    flexDirection: 'row',
  },
  itemNameInput: {
    flex: 2,
    marginRight: 8,
  },
  itemAmountInput: {
    flex: 1,
  },
  removeItemButton: {
    padding: 8,
    marginLeft: 8,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  saveText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default AddPaymentInvoiceModal;