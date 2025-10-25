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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CreateInvoiceModal = ({ visible, onClose, onSave, patients = [] }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    description: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ name: '', description: '', quantity: '', rate: '', amount: '' }],
    notes: '',
    terms: '',
  });

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', quantity: '', rate: '', amount: '' }]
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
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // Calculate amount if quantity and rate are provided
          if (field === 'quantity' || field === 'rate') {
            const quantity = parseFloat(field === 'quantity' ? value : updatedItem.quantity) || 0;
            const rate = parseFloat(field === 'rate' ? value : updatedItem.rate) || 0;
            updatedItem.amount = (quantity * rate).toFixed(2);
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    return `INV-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`;
  };

  const calculateDueDate = (days = 30) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const validateForm = () => {
    if (!formData.patientId || !formData.patientName) {
      Alert.alert('Validation Error', 'Please select a patient');
      return false;
    }

    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter invoice description');
      return false;
    }

    if (!formData.dueDate) {
      Alert.alert('Validation Error', 'Please select due date');
      return false;
    }

    const validItems = formData.items.filter(item => 
      item.name.trim() && item.amount && !isNaN(parseFloat(item.amount))
    );

    if (validItems.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one valid item');
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
      item.name.trim() && item.amount && !isNaN(parseFloat(item.amount))
    ).map(item => ({
      name: item.name.trim(),
      description: item.description.trim(),
      quantity: parseFloat(item.quantity) || 1,
      rate: parseFloat(item.rate) || 0,
      amount: parseFloat(item.amount)
    }));

    const invoiceData = {
      invoiceNumber: generateInvoiceNumber(),
      patientId: formData.patientId,
      patientName: formData.patientName,
      description: formData.description.trim(),
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      items: validItems,
      totalAmount: calculateTotal(),
      status: 'draft',
      notes: formData.notes.trim(),
      terms: formData.terms.trim(),
      createdAt: new Date().toISOString(),
    };

    onSave(invoiceData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      patientId: '',
      patientName: '',
      description: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [{ name: '', description: '', quantity: '', rate: '', amount: '' }],
      notes: '',
      terms: '',
    });
    onClose();
  };

  const selectPatient = (patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Invoice</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Patient Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Patient *</Text>
              {formData.patientName ? (
                <View style={styles.selectedPatient}>
                  <View style={styles.patientInfo}>
                    <View style={styles.patientAvatar}>
                      <Text style={styles.avatarText}>{formData.patientName.charAt(0)}</Text>
                    </View>
                    <View style={styles.patientDetails}>
                      <Text style={styles.patientName}>{formData.patientName}</Text>
                      <Text style={styles.patientId}>{formData.patientId}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.changeButton}
                    onPress={() => setFormData(prev => ({ ...prev, patientId: '', patientName: '' }))}
                  >
                    <Text style={styles.changeText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.patientsScroll}
                >
                  {patients
                    .filter((patient, index, self) => index === self.findIndex(p => p.id === patient.id))
                    .map((patient, index) => (
                    <TouchableOpacity
                      key={`invoice-patient-${patient.firebaseDocId || patient._id || ''}-${patient.id}-${index}`}
                      style={styles.patientCard}
                      onPress={() => selectPatient(patient)}
                    >
                      <View style={styles.patientAvatar}>
                        <Text style={styles.avatarText}>{patient.name.charAt(0)}</Text>
                      </View>
                      <Text style={styles.patientCardName}>{patient.name}</Text>
                      <Text style={styles.patientCardId}>{patient.id}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Invoice Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Invoice Description *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="e.g., Medical Consultation & Treatment"
                multiline
              />
            </View>

            {/* Dates */}
            <View style={styles.dateRow}>
              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>Issue Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.issueDate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, issueDate: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>Due Date *</Text>
                <View style={styles.dueDateContainer}>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    value={formData.dueDate}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, dueDate: text }))}
                    placeholder="YYYY-MM-DD"
                  />
                  <TouchableOpacity
                    style={styles.quickDateButton}
                    onPress={() => setFormData(prev => ({ ...prev, dueDate: calculateDueDate(30) }))}
                  >
                    <Text style={styles.quickDateText}>+30d</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Items Section */}
            <View style={styles.itemsSection}>
              <View style={styles.itemsHeader}>
                <Text style={styles.sectionTitle}>Invoice Items *</Text>
                <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
                  <Ionicons name="add-circle" size={24} color="#8B5CF6" />
                  <Text style={styles.addItemText}>Add Item</Text>
                </TouchableOpacity>
              </View>

              {formData.items.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemNumber}>Item {index + 1}</Text>
                    {formData.items.length > 1 && (
                      <TouchableOpacity 
                        style={styles.removeItemButton}
                        onPress={() => removeItem(index)}
                      >
                        <Ionicons name="trash" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <TextInput
                    style={styles.textInput}
                    value={item.name}
                    onChangeText={(text) => updateItem(index, 'name', text)}
                    placeholder="Item name *"
                  />
                  
                  <TextInput
                    style={styles.textInput}
                    value={item.description}
                    onChangeText={(text) => updateItem(index, 'description', text)}
                    placeholder="Item description (optional)"
                    multiline
                  />
                  
                  <View style={styles.itemCalculation}>
                    <TextInput
                      style={[styles.textInput, styles.calcInput]}
                      value={item.quantity}
                      onChangeText={(text) => updateItem(index, 'quantity', text)}
                      placeholder="Qty"
                      keyboardType="numeric"
                    />
                    <Text style={styles.calcOperator}>×</Text>
                    <TextInput
                      style={[styles.textInput, styles.calcInput]}
                      value={item.rate}
                      onChangeText={(text) => updateItem(index, 'rate', text)}
                      placeholder="Rate"
                      keyboardType="numeric"
                    />
                    <Text style={styles.calcOperator}>=</Text>
                    <TextInput
                      style={[styles.textInput, styles.calcInput]}
                      value={item.amount}
                      onChangeText={(text) => updateItem(index, 'amount', text)}
                      placeholder="Amount"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ))}

              {/* Total Display */}
              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>₹{calculateTotal().toLocaleString()}</Text>
              </View>
            </View>

            {/* Additional Fields */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Additional notes for the patient"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Terms & Conditions (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.terms}
                onChangeText={(text) => setFormData(prev => ({ ...prev, terms: text }))}
                placeholder="Payment terms and conditions"
                multiline
              />
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="document" size={20} color="#FFF" />
              <Text style={styles.saveText}>Create Invoice</Text>
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
    maxHeight: '95%',
    minHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
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
  selectedPatient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  patientId: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  changeText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  patientsScroll: {
    flexDirection: 'row',
  },
  patientCard: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 80,
  },
  patientCardName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 6,
    textAlign: 'center',
  },
  patientCardId: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateInput: {
    flex: 0.48,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickDateButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  quickDateText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  itemsSection: {
    marginBottom: 20,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    color: '#8B5CF6',
    marginLeft: 4,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  removeItemButton: {
    padding: 4,
  },
  itemCalculation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  calcInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  calcOperator: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
    paddingHorizontal: 8,
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
    color: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
  },
  saveText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default CreateInvoiceModal;