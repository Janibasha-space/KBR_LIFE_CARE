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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';

const AddPaymentModal = ({ visible, onClose, onSave, patients = [], initialFormData = null, existingPayment = null }) => {
  const { addInvoice, addPatientPayment } = useApp();
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    fullAmount: '',
    actualAmountPaid: '',
    type: 'consultation',
    paymentMethod: 'cash',
    description: '',
    transactionId: '',
  });

  // Calculate remaining amount for existing payments
  const getRemainingAmount = () => {
    if (existingPayment) {
      const totalAmount = existingPayment.totalAmount || existingPayment.fullAmount || 0;
      const actualPaidAmount = getTotalPaidAmount(); // Use our corrected function
      
      const remaining = Math.max(0, totalAmount - actualPaidAmount);
      console.log('🔍 [AddPaymentModal] getRemainingAmount - Final remaining:', remaining);
      
      return remaining;
    }
    return 0;
  };

  const getTotalPaidAmount = () => {
    if (existingPayment) {
      console.log('🔍 [AddPaymentModal] getTotalPaidAmount - DEBUGGING:');
      console.log('🔍 existingPayment.totalAmount:', existingPayment.totalAmount);
      console.log('🔍 existingPayment.dueAmount:', existingPayment.dueAmount);
      console.log('🔍 existingPayment.paidAmount:', existingPayment.paidAmount);
      
      // The correct calculation should be: totalAmount - dueAmount = actualPaid
      const totalAmount = existingPayment.totalAmount || existingPayment.fullAmount || 0;
      const dueAmount = existingPayment.dueAmount || existingPayment.remainingAmount || 0;
      
      if (totalAmount > 0 && dueAmount >= 0) {
        const actualPaid = totalAmount - dueAmount;
        console.log('🔍 Calculated: totalAmount (', totalAmount, ') - dueAmount (', dueAmount, ') = actualPaid (', actualPaid, ')');
        return Math.max(0, actualPaid);
      }
      
      // Fallback to other calculations if the above doesn't work
      console.log('🔍 Using fallback calculation');
      return existingPayment.calculatedPaid || existingPayment.actualAmountPaid || 0;
    }
    return 0;
  };

  // Function to generate invoice for payment
  const generateInvoiceForPayment = async (paymentData) => {
    try {
      console.log('🧾 [AddPaymentModal] Generating invoice for payment:', paymentData.id);
      console.log('🧾 [AddPaymentModal] Payment data received:', paymentData);
      console.log('🧾 [AddPaymentModal] addInvoice function available:', !!addInvoice);

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      const currentDate = new Date().toISOString().split('T')[0];

      // Determine service type based on payment type
      const getServiceType = (paymentType) => {
        switch (paymentType) {
          case 'consultation':
          case 'tests':
            return 'OP';
          case 'admission':
          case 'surgery':
            return 'IP';
          case 'tests':
            return 'TEST';
          default:
            return 'General';
        }
      };

      // Create invoice data - Use actualAmountPaid for invoice amount, not fullAmount
      const actualPaid = paymentData.actualAmountPaid || paymentData.paidAmount || paymentData.amount || 0;
      const invoiceData = {
        invoiceNumber,
        patientId: paymentData.patientId,
        patientName: paymentData.patientName,
        issueDate: currentDate,
        dueDate: currentDate, // Same day since payment is created
        totalAmount: actualPaid, // Use actual paid amount for invoice total
        status: actualPaid > 0 ? 'paid' : 'draft',
        paymentStatus: actualPaid > 0 ? 'paid' : 'draft',
        description: paymentData.description || 'Medical Service Payment',
        serviceType: getServiceType(paymentData.type),
        items: [
          {
            name: paymentData.description || 'Medical Service',
            description: `${paymentData.type} - ${paymentData.description}${actualPaid < (paymentData.fullAmount || paymentData.totalAmount) ? ` (Partial Payment: ₹${actualPaid})` : ''}`,
            quantity: 1,
            amount: actualPaid, // Use actual paid amount
            unitPrice: actualPaid,
            totalPrice: actualPaid
          }
        ],
        paymentDetails: {
          paymentId: paymentData.id,
          paymentDate: paymentData.createdAt || new Date().toISOString(),
          paymentMethod: paymentData.paymentMethod || 'cash',
          transactionId: paymentData.transactionId,
          actualAmountPaid: actualPaid,
          fullAmount: paymentData.fullAmount || paymentData.totalAmount || actualPaid,
          remainingAmount: Math.max(0, (paymentData.fullAmount || paymentData.totalAmount || actualPaid) - actualPaid),
          dueAmount: paymentData.dueAmount || Math.max(0, (paymentData.fullAmount || paymentData.totalAmount || actualPaid) - actualPaid)
        },
        // Auto-generated invoice metadata
        isAutoGenerated: true,
        generatedFrom: 'payment',
        originalId: paymentData.id,
        generatedAt: new Date().toISOString(),
        notes: `Auto-generated invoice for payment ${paymentData.id}`,
        terms: 'Thank you for choosing KBR Life Care',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🧾 [AddPaymentModal] Final invoice data:', invoiceData);

      // Add invoice to database
      if (addInvoice) {
        console.log('🧾 [AddPaymentModal] Calling addInvoice function...');
        const newInvoice = await addInvoice(invoiceData);
        console.log('✅ [AddPaymentModal] Invoice generated successfully:', invoiceNumber);
        console.log('✅ [AddPaymentModal] New invoice result:', newInvoice);
        return newInvoice;
      } else {
        console.error('❌ [AddPaymentModal] addInvoice function not available');
      }
    } catch (error) {
      console.error('❌ [AddPaymentModal] Error generating invoice:', error);
      console.error('❌ [AddPaymentModal] Error stack:', error.stack);
      // Don't show error to user since this is automatic - just log it
    }
  };
  
  // Update form data when initialFormData changes
  useEffect(() => {
    if (initialFormData && initialFormData.patientId) {
      setFormData(prev => ({
        ...prev,
        ...initialFormData,
        // For existing payments, suggest the remaining amount
        fullAmount: existingPayment ? (existingPayment.totalAmount || existingPayment.fullAmount || '')?.toString() || '' : initialFormData.fullAmount || '',
        actualAmountPaid: existingPayment ? getRemainingAmount().toString() : initialFormData.actualAmountPaid || ''
      }));
    }
  }, [initialFormData, existingPayment]);

  // Debug log for existing payment data
  useEffect(() => {
    if (visible && existingPayment) {
      console.log('🔍 AddPaymentModal opened with existing payment:', {
        id: existingPayment.id,
        totalAmount: existingPayment.totalAmount,
        fullAmount: existingPayment.fullAmount,
        paidAmount: existingPayment.paidAmount,
        actualAmountPaid: existingPayment.actualAmountPaid,
        dueAmount: existingPayment.dueAmount,
        remainingAmount: existingPayment.remainingAmount,
        paymentHistory: existingPayment.paymentHistory?.length || 0,
        calculatedPaid: getTotalPaidAmount(),
        calculatedRemaining: getRemainingAmount()
      });
    }
  }, [visible, existingPayment]);

  const paymentTypes = [
    { value: 'consultation', label: 'Consultation', icon: 'medical' },
    { value: 'tests', label: 'Laboratory Tests', icon: 'flask' },
    { value: 'admission', label: 'Room/Admission', icon: 'bed' },
    { value: 'surgery', label: 'Surgery', icon: 'cut' },
    { value: 'medicine', label: 'Medicine', icon: 'medkit' },
    { value: 'emergency', label: 'Emergency', icon: 'warning' },
    { value: 'other', label: 'Other', icon: 'receipt' },
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: 'cash' },
    { value: 'card', label: 'Debit/Credit Card', icon: 'card' },
    { value: 'online', label: 'Online Payment', icon: 'phone-portrait' },
    { value: 'upi', label: 'UPI', icon: 'qr-code' },
    { value: 'bank', label: 'Bank Transfer', icon: 'business' },
  ];

  const validateForm = () => {
    if (!formData.patientId || !formData.patientName) {
      Alert.alert('Validation Error', 'Please select a patient');
      return false;
    }

    if (!formData.fullAmount || isNaN(parseFloat(formData.fullAmount)) || parseFloat(formData.fullAmount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid full amount');
      return false;
    }

    if (!formData.actualAmountPaid || isNaN(parseFloat(formData.actualAmountPaid)) || parseFloat(formData.actualAmountPaid) < 0) {
      Alert.alert('Validation Error', 'Please enter a valid actual amount paid');
      return false;
    }

    // For existing payments, check if new payment exceeds remaining amount
    if (existingPayment) {
      const remainingAmount = getRemainingAmount();
      const paymentAmount = parseFloat(formData.actualAmountPaid);
      
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        Alert.alert('Validation Error', 'Please enter a valid payment amount greater than 0');
        return false;
      }
      
      if (paymentAmount > remainingAmount) {
        Alert.alert(
          'Validation Error', 
          `Payment amount ₹${paymentAmount.toLocaleString()} exceeds remaining due amount ₹${remainingAmount.toLocaleString()}. Please enter a valid amount.`
        );
        return false;
      }
    } else {
      // For new payments, check if paid amount exceeds total amount
      const fullAmount = parseFloat(formData.fullAmount);
      const paymentAmount = parseFloat(formData.actualAmountPaid);
      
      if (isNaN(paymentAmount) || paymentAmount < 0) {
        Alert.alert('Validation Error', 'Please enter a valid payment amount');
        return false;
      }
      
      if (paymentAmount > fullAmount) {
        Alert.alert('Validation Error', 'Actual amount paid cannot be more than the full amount');
        return false;
      }
    }

    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter payment description');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    try {
      console.log('💰 HandleSave called with:', {
        formData,
        existingPayment: existingPayment ? {
          id: existingPayment.id,
          totalAmount: existingPayment.totalAmount,
          paidAmount: existingPayment.paidAmount,
          dueAmount: existingPayment.dueAmount
        } : null
      });

      if (!validateForm()) return;

      const fullAmount = parseFloat(formData.fullAmount);
      const actualAmountPaid = parseFloat(formData.actualAmountPaid);
      
      // Validate parsed amounts
      if (isNaN(fullAmount) || isNaN(actualAmountPaid)) {
        Alert.alert('Error', 'Invalid amount values. Please check your input.');
        return;
      }
      
      // If this is an additional payment to an existing record
      if (existingPayment) {
        const currentPaidAmount = getTotalPaidAmount();
        const newTotalPaid = currentPaidAmount + actualAmountPaid;
        const totalAmount = existingPayment.totalAmount || existingPayment.fullAmount || fullAmount;
        const newDueAmount = Math.max(0, totalAmount - newTotalPaid);

        console.log('💰 Payment calculation:', {
          currentPaid: currentPaidAmount,
          newPayment: actualAmountPaid,
          newTotalPaid,
          totalAmount,
          newDueAmount
        });
      
      // Determine payment status based on cumulative payments
      let status = 'pending';
      let paymentStatus = 'Pending';
      
      if (newTotalPaid === 0) {
        status = 'pending';
        paymentStatus = 'Pending';
      } else if (newTotalPaid >= totalAmount) {
        status = 'paid';
        paymentStatus = 'Fully Paid';
      } else {
        status = 'partial';
        paymentStatus = 'Partially Paid';
      }

      // Create payment history entry for this new payment
      const newPaymentEntry = {
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: actualAmountPaid,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId.trim() || null,
        paidDate: new Date().toISOString(),
        paidBy: 'admin',
        description: formData.description.trim(),
        paymentType: formData.type
      };

      const paymentData = {
        id: existingPayment.id,
        patientId: formData.patientId,
        patientName: formData.patientName,
        fullAmount: totalAmount,
        totalAmount: totalAmount,
        paidAmount: newTotalPaid,
        actualAmountPaid: newTotalPaid,
        amount: newTotalPaid,
        dueAmount: newDueAmount,
        remainingAmount: newDueAmount,
        type: existingPayment.type || formData.type,
        paymentMethod: formData.paymentMethod,
        description: `${existingPayment.description || ''} | Additional payment: ${formData.description.trim()}`.trim(),
        transactionId: formData.transactionId.trim() || existingPayment.transactionId || null,
        status: status,
        paymentStatus: paymentStatus,
        // Update payment history with all previous payments plus new one
        paymentHistory: [
          ...(existingPayment.paymentHistory || []),
          newPaymentEntry
        ],
        paymentCount: (existingPayment.paymentHistory?.length || 0) + 1,
        lastPaymentDate: new Date().toISOString(),
        lastPaymentAmount: actualAmountPaid,
        updatedAt: new Date().toISOString(),
        // Track that this is an update with additional payment
        isAdditionalPayment: true,
        additionalPaymentAmount: actualAmountPaid
      };

      console.log('💰 Adding payment to existing record:', {
        previousPaid: currentPaidAmount,
        newPayment: actualAmountPaid,
        totalPaid: newTotalPaid,
        totalAmount: totalAmount,
        remaining: newDueAmount,
        status: paymentStatus
      });
      
      // Save the payment first
      await onSave(paymentData, 'update');
      
      // Update patient payment details in context for real-time updates
      if (addPatientPayment && formData.patientId) {
        try {
          console.log('📝 Updating patient payment details for:', formData.patientId);
          addPatientPayment(formData.patientId, {
            amount: actualAmountPaid,
            type: formData.type,
            method: formData.paymentMethod,
            description: formData.description.trim(),
            transactionId: formData.transactionId.trim() || null
          });
          console.log('✅ Patient payment details updated successfully');
        } catch (error) {
          console.error('❌ Error updating patient payment details:', error);
        }
      }
      
      // Generate invoice for the additional payment amount
      if (actualAmountPaid > 0) {
        try {
          console.log('🧾 Attempting to generate invoice for additional payment:', actualAmountPaid);
          // Create a payment data object for the additional payment
          const additionalPaymentData = {
            ...paymentData,
            id: paymentData.id || `payment_${Date.now()}`,
            actualAmountPaid: actualAmountPaid, // Only the new payment amount
            fullAmount: actualAmountPaid, // For invoice, use the additional amount
            totalAmount: actualAmountPaid,
            description: `Additional payment: ${formData.description.trim()}`
          };
          console.log('🧾 Additional payment data for invoice:', additionalPaymentData);
          await generateInvoiceForPayment(additionalPaymentData);
          console.log('✅ Invoice generation completed for additional payment');
        } catch (error) {
          console.error('❌ Error generating invoice for additional payment:', error);
        }
      } else {
        console.log('⏭️ Skipping invoice generation - actualAmountPaid is 0 or negative');
      }
    } else {
      // New payment record
      const dueAmount = fullAmount - actualAmountPaid;

      // Determine payment status based on amount paid
      let status = 'pending';
      if (actualAmountPaid === 0) {
        status = 'pending';
      } else if (actualAmountPaid >= fullAmount) {
        status = 'paid';
      } else {
        status = 'partial';
      }

      const paymentData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        fullAmount: fullAmount,
        actualAmountPaid: actualAmountPaid,
        amount: actualAmountPaid, // Keep this for backwards compatibility
        totalAmount: fullAmount,
        paidAmount: actualAmountPaid,
        dueAmount: dueAmount,
        type: formData.type,
        paymentMethod: formData.paymentMethod,
        description: formData.description.trim(),
        transactionId: formData.transactionId.trim() || null,
        status: status,
        // Initialize payment history
        paymentHistory: actualAmountPaid > 0 ? [{
          id: `payment_${Date.now()}`,
          amount: actualAmountPaid,
          paymentMethod: formData.paymentMethod,
          transactionId: formData.transactionId.trim() || null,
          paidDate: new Date().toISOString(),
          paidBy: 'admin',
          description: formData.description.trim()
        }] : [],
        createdAt: new Date().toISOString(),
        lastPaymentDate: actualAmountPaid > 0 ? new Date().toISOString() : null
      };

      console.log('Saving new payment with data:', paymentData);
      
      // Save the payment first
      await onSave(paymentData, 'create');
      
      // Update patient payment details in context for real-time updates
      if (addPatientPayment && formData.patientId && actualAmountPaid > 0) {
        try {
          console.log('📝 Updating patient payment details for new payment:', formData.patientId);
          addPatientPayment(formData.patientId, {
            amount: actualAmountPaid,
            type: formData.type,
            method: formData.paymentMethod,
            description: formData.description.trim(),
            transactionId: formData.transactionId.trim() || null
          });
          console.log('✅ Patient payment details updated successfully for new payment');
        } catch (error) {
          console.error('❌ Error updating patient payment details for new payment:', error);
        }
      }
      
      // Generate invoice for any payment amount > 0
      if (actualAmountPaid > 0) {
        try {
          console.log('🧾 Attempting to generate invoice for new payment:', actualAmountPaid);
          // Create payment data for invoice generation
          const paymentForInvoice = { ...paymentData, id: `payment_${Date.now()}` };
          console.log('🧾 New payment data for invoice:', paymentForInvoice);
          await generateInvoiceForPayment(paymentForInvoice);
          console.log('✅ Invoice generation completed for new payment');
        } catch (error) {
          console.error('❌ Error generating invoice for new payment:', error);
        }
      } else {
        console.log('⏭️ Skipping invoice generation - actualAmountPaid is 0 or negative');
      }
    }
    
    handleClose();
    } catch (error) {
      console.error('❌ Error in handleSave:', error);
      Alert.alert('Error', `Failed to save payment: ${error.message}`);
    }
  };

  const handleClose = () => {
    setFormData({
      patientId: '',
      patientName: '',
      fullAmount: '',
      actualAmountPaid: '',
      type: 'consultation',
      paymentMethod: 'cash',
      description: '',
      transactionId: '',
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
            <Text style={styles.headerTitle}>Add Payment Record</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Existing Payment Information (if updating) */}
            {existingPayment && (
              <View style={styles.existingPaymentInfo}>
                <Text style={styles.existingPaymentTitle}>Existing Payment Information</Text>
                <View style={styles.existingPaymentDetails}>
                  <View style={styles.existingPaymentRow}>
                    <Text style={styles.existingPaymentLabel}>Total Amount:</Text>
                    <Text style={styles.existingPaymentValue}>₹{(existingPayment.totalAmount || existingPayment.fullAmount || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.existingPaymentRow}>
                    <Text style={styles.existingPaymentLabel}>Already Paid:</Text>
                    <Text style={[styles.existingPaymentValue, { color: '#22C55E' }]}>₹{getTotalPaidAmount().toLocaleString()}</Text>
                  </View>
                  <View style={styles.existingPaymentRow}>
                    <Text style={styles.existingPaymentLabel}>Remaining:</Text>
                    <Text style={[styles.existingPaymentValue, { color: '#EF4444', fontWeight: 'bold' }]}>₹{getRemainingAmount().toLocaleString()}</Text>
                  </View>
                  <View style={styles.existingPaymentRow}>
                    <Text style={styles.existingPaymentLabel}>Payment History:</Text>
                    <Text style={styles.existingPaymentValue}>{existingPayment.paymentHistory?.length || 0} payments made</Text>
                  </View>
                </View>
              </View>
            )}

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
                      key={`payment-patient-${patient.firebaseDocId || patient._id || ''}-${patient.id}-${index}`}
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

            {/* Full Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Amount *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.fullAmount}
                onChangeText={(text) => setFormData(prev => ({ ...prev, fullAmount: text }))}
                placeholder="Enter total amount in ₹"
                keyboardType="numeric"
              />
            </View>

            {/* Actual Amount Paid */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Actual Amount Paid *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.actualAmountPaid}
                onChangeText={(text) => setFormData(prev => ({ ...prev, actualAmountPaid: text }))}
                placeholder="Enter amount actually paid in ₹"
                keyboardType="numeric"
              />
              {formData.fullAmount && formData.actualAmountPaid && (
                <View style={styles.amountSummary}>
                  <Text style={styles.summaryText}>
                    Due Amount: ₹{existingPayment 
                      ? getRemainingAmount().toLocaleString() 
                      : (parseFloat(formData.fullAmount || 0) - parseFloat(formData.actualAmountPaid || 0)).toLocaleString()}
                  </Text>
                  <Text style={[styles.statusText, {
                    color: parseFloat(formData.actualAmountPaid || 0) === parseFloat(formData.fullAmount || 0) ? '#22C55E' :
                          parseFloat(formData.actualAmountPaid || 0) === 0 ? '#EF4444' : '#F59E0B'
                  }]}>
                    Status: {parseFloat(formData.actualAmountPaid || 0) === parseFloat(formData.fullAmount || 0) ? 'Fully Paid' :
                             parseFloat(formData.actualAmountPaid || 0) === 0 ? 'Pending' : 'Partially Paid'}
                  </Text>
                </View>
              )}
            </View>

            {/* Payment Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Type</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.optionsContainer}
              >
                {paymentTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.optionButton,
                      formData.type === type.value && styles.selectedOption
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  >
                    <Ionicons 
                      name={type.icon} 
                      size={16} 
                      color={formData.type === type.value ? '#FFF' : '#666'} 
                      style={styles.optionIcon}
                    />
                    <Text style={[
                      styles.optionText,
                      formData.type === type.value && styles.selectedOptionText
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Payment Method */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Method</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.optionsContainer}
              >
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.value}
                    style={[
                      styles.optionButton,
                      formData.paymentMethod === method.value && styles.selectedOption
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                  >
                    <Ionicons 
                      name={method.icon} 
                      size={16} 
                      color={formData.paymentMethod === method.value ? '#FFF' : '#666'} 
                      style={styles.optionIcon}
                    />
                    <Text style={[
                      styles.optionText,
                      formData.paymentMethod === method.value && styles.selectedOptionText
                    ]}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Description *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="e.g., Consultation Fee - Dr. K. Ramesh"
                multiline
              />
            </View>

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
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="checkmark" size={20} color="#FFF" />
              <Text style={styles.saveText}>Add Payment</Text>
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
    minHeight: '70%',
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
    borderColor: '#3B82F6',
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
    backgroundColor: '#3B82F6',
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
    borderColor: '#3B82F6',
  },
  changeText: {
    fontSize: 12,
    color: '#3B82F6',
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
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
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
  amountSummary: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Existing Payment Info Styles
  existingPaymentInfo: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  existingPaymentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 12,
  },
  existingPaymentDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  existingPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  existingPaymentLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  existingPaymentValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
});

export default AddPaymentModal;