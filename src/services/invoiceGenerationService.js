// Invoice Generation Service
// Handles automatic invoice generation when payment status changes from Pending to Paid

import { firebaseHospitalServices } from './firebaseHospitalServices';

export class InvoiceGenerationService {
  
  /**
   * Generates an invoice for a paid appointment
   * @param {Object} appointment - The appointment object
   * @param {Object} options - Additional options for invoice generation
   * @returns {Promise<Object>} - Generated invoice data
   */
  static async generateInvoiceForAppointment(appointment, options = {}) {
    try {
      console.log('📄 Generating invoice for appointment:', appointment.id);
      
      // Generate unique invoice number
      const invoiceNumber = this.generateInvoiceNumber();
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Determine if it's a service or test
      const isTest = await this.isTestService(appointment.service || appointment.serviceName);
      
      // Create invoice items based on appointment type
      const items = this.createInvoiceItems(appointment, isTest);
      
      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const totalAmount = subtotal; // Add taxes if needed in the future
      
      // Create invoice data
      const invoiceData = {
        invoiceNumber,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        patientPhone: appointment.patientPhone || appointment.contactNumber,
        doctorName: appointment.doctorName,
        department: appointment.department,
        issueDate: currentDate,
        dueDate: currentDate, // Paid immediately
        subtotal,
        totalAmount,
        status: 'paid',
        paymentStatus: 'paid',
        paymentMode: appointment.paymentMode || 'Cash',
        paymentDate: currentDate,
        appointmentDate: appointment.appointmentDate || appointment.date,
        appointmentTime: appointment.appointmentTime || appointment.time,
        serviceType: isTest ? 'Test' : 'Service',
        description: this.generateInvoiceDescription(appointment, isTest),
        items,
        notes: `Invoice auto-generated for appointment ${appointment.id}`,
        generatedBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save invoice to Firebase
      const result = await firebaseHospitalServices.createInvoice(invoiceData);
      
      if (result.success) {
        console.log('✅ Invoice generated successfully:', result.data.invoiceNumber);
        return {
          success: true,
          invoice: result.data,
          message: `Invoice ${result.data.invoiceNumber} generated successfully`
        };
      } else {
        throw new Error('Failed to save invoice to database');
      }
      
    } catch (error) {
      console.error('❌ Error generating invoice:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate invoice'
      };
    }
  }
  
  /**
   * Generates a unique invoice number
   * @returns {string} - Unique invoice number
   */
  static generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `KBR-INV-${year}${month}-${timestamp}`;
  }
  
  /**
   * Checks if a service is a test
   * @param {string} serviceName - Name of the service
   * @returns {Promise<boolean>} - True if it's a test service
   */
  static async isTestService(serviceName) {
    try {
      // Check if the service exists in tests collection
      const testsResult = await firebaseHospitalServices.getTests();
      if (testsResult.success && testsResult.data) {
        return testsResult.data.some(test => 
          test.name.toLowerCase() === serviceName.toLowerCase()
        );
      }
      return false;
    } catch (error) {
      console.error('Error checking if service is test:', error);
      return false;
    }
  }
  
  /**
   * Creates invoice items from appointment data
   * @param {Object} appointment - Appointment data
   * @param {boolean} isTest - Whether the service is a test
   * @returns {Array} - Array of invoice items
   */
  static createInvoiceItems(appointment, isTest) {
    const serviceName = appointment.service || appointment.serviceName || 'Medical Service';
    const amount = appointment.fees || appointment.amount || appointment.totalAmount || appointment.consultationFee || 0;
    
    return [
      {
        name: serviceName,
        description: isTest ? 
          `Medical Test - ${serviceName}` : 
          `Medical Consultation - ${serviceName}`,
        category: isTest ? 'Test' : 'Service',
        quantity: 1,
        unitPrice: amount,
        amount: amount,
        doctorName: appointment.doctorName,
        department: appointment.department
      }
    ];
  }
  
  /**
   * Generates invoice description
   * @param {Object} appointment - Appointment data
   * @param {boolean} isTest - Whether the service is a test
   * @returns {string} - Invoice description
   */
  static generateInvoiceDescription(appointment, isTest) {
    const serviceName = appointment.service || appointment.serviceName || 'Medical Service';
    const doctorName = appointment.doctorName || 'Doctor';
    const date = appointment.appointmentDate || appointment.date || 'today';
    
    if (isTest) {
      return `Medical Test: ${serviceName} - Appointment on ${date}`;
    } else {
      return `Medical Consultation: ${serviceName} with ${doctorName} - Appointment on ${date}`;
    }
  }
  
  /**
   * Updates appointment with invoice information
   * @param {string} appointmentId - Appointment ID
   * @param {Object} invoice - Generated invoice data
   * @returns {Promise<Object>} - Update result
   */
  static async linkInvoiceToAppointment(appointmentId, invoice) {
    try {
      // Update appointment with invoice details
      const updateData = {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceGenerated: true,
        invoiceGeneratedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = await firebaseHospitalServices.updateAppointment(appointmentId, updateData);
      
      if (result.success) {
        console.log('✅ Appointment updated with invoice information');
        return { success: true };
      } else {
        console.error('❌ Failed to update appointment with invoice info');
        return { success: false, error: 'Failed to update appointment' };
      }
      
    } catch (error) {
      console.error('❌ Error linking invoice to appointment:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Sends notification to patient about invoice generation
   * @param {Object} invoice - Generated invoice
   * @param {Object} appointment - Appointment data
   * @returns {Promise<Object>} - Notification result
   */
  static async sendInvoiceNotificationToPatient(invoice, appointment) {
    try {
      // Create notification data
      const notificationData = {
        type: 'invoice_generated',
        title: 'Invoice Generated',
        message: `Your invoice ${invoice.invoiceNumber} for ₹${invoice.totalAmount} has been generated and marked as paid.`,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        appointmentId: appointment.id,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.totalAmount,
        createdAt: new Date().toISOString(),
        read: false,
        priority: 'normal'
      };
      
      // Save notification (you can implement notification service later)
      console.log('📱 Notification to be sent:', notificationData);
      
      // TODO: Implement actual notification sending (SMS, email, push notification)
      // For now, just log the notification
      
      return {
        success: true,
        message: 'Notification prepared for patient'
      };
      
    } catch (error) {
      console.error('❌ Error sending invoice notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Complete workflow: Generate invoice, link to appointment, and notify patient
   * @param {Object} appointment - Appointment data
   * @returns {Promise<Object>} - Complete workflow result
   */
  static async processInvoiceGeneration(appointment) {
    try {
      console.log('🔄 Starting complete invoice generation workflow for appointment:', appointment.id);
      
      // Step 1: Generate invoice
      const invoiceResult = await this.generateInvoiceForAppointment(appointment);
      
      if (!invoiceResult.success) {
        throw new Error(invoiceResult.message || 'Failed to generate invoice');
      }
      
      // Step 2: Link invoice to appointment
      const linkResult = await this.linkInvoiceToAppointment(appointment.id, invoiceResult.invoice);
      
      if (!linkResult.success) {
        console.warn('⚠️ Invoice generated but failed to link to appointment');
      }
      
      // Step 3: Send notification to patient
      const notificationResult = await this.sendInvoiceNotificationToPatient(invoiceResult.invoice, appointment);
      
      if (!notificationResult.success) {
        console.warn('⚠️ Invoice generated but failed to send notification');
      }
      
      return {
        success: true,
        invoice: invoiceResult.invoice,
        invoiceNumber: invoiceResult.invoice.invoiceNumber,
        message: `Invoice ${invoiceResult.invoice.invoiceNumber} generated successfully for ₹${invoiceResult.invoice.totalAmount}`,
        linkedToAppointment: linkResult.success,
        notificationSent: notificationResult.success
      };
      
    } catch (error) {
      console.error('❌ Error in complete invoice generation workflow:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to complete invoice generation workflow'
      };
    }
  }
}

export default InvoiceGenerationService;