import ApiService from './api';
import { 
  FirebaseAppointmentService,
  FirebasePatientService, 
  FirebaseDoctorService,
  FirebaseServiceApiService,
  FirebaseRoomService,
  FirebaseInvoiceService,
  FirebasePaymentService,
  FirebaseDischargeService,
  FirebaseReportsService
} from './firebaseHospitalServices';

// Appointment related API calls
export class AppointmentService {
  // Get all appointments
  static async getAppointments(patientId = null) {
    if (ApiService.useFirebase) {
      const result = await FirebaseAppointmentService.getAppointments(patientId);
      return result.data; // Return data directly for compatibility
    }
    
    const params = patientId ? { patientId } : {};
    return ApiService.get('/appointments', params);
  }

  // Book new appointment
  static async bookAppointment(appointmentData) {
    if (ApiService.useFirebase) {
      const result = await FirebaseAppointmentService.bookAppointment(appointmentData);
      return result.data;
    }
    
    return ApiService.post('/appointments', appointmentData);
  }

  // Cancel appointment
  static async cancelAppointment(appointmentId) {
    if (ApiService.useFirebase) {
      return await FirebaseAppointmentService.cancelAppointment(appointmentId);
    }
    
    return ApiService.delete(`/appointments/${appointmentId}`);
  }

  // Reschedule appointment
  static async rescheduleAppointment(appointmentId, newDateTime) {
    if (ApiService.useFirebase) {
      return await FirebaseAppointmentService.rescheduleAppointment(appointmentId, newDateTime);
    }
    
    return ApiService.put(`/appointments/${appointmentId}`, {
      dateTime: newDateTime,
    });
  }

  // Get available time slots
  static async getAvailableSlots(doctorId, date) {
    if (ApiService.useFirebase) {
      const result = await FirebaseAppointmentService.getAvailableSlots(doctorId, date);
      return result.data;
    }
    
    return ApiService.get('/appointments/available-slots', {
      doctorId,
      date,
    });
  }
}

// Patient related API calls
export class PatientService {
  // Get patient profile
  static async getProfile(patientId) {
    if (ApiService.useFirebase) {
      const result = await FirebasePatientService.getProfile(patientId);
      return result.data;
    }
    
    return ApiService.get(`/patients/${patientId}`);
  }

  // Update patient profile
  static async updateProfile(patientId, profileData) {
    if (ApiService.useFirebase) {
      return await FirebasePatientService.updateProfile(patientId, profileData);
    }
    
    return ApiService.put(`/patients/${patientId}`, profileData);
  }

  // Get patient medical history
  static async getMedicalHistory(patientId) {
    if (ApiService.useFirebase) {
      const result = await FirebasePatientService.getMedicalHistory(patientId);
      return result.data;
    }
    
    return ApiService.get(`/patients/${patientId}/medical-history`);
  }

  // Get patient reports
  static async getReports(patientId) {
    if (ApiService.useFirebase) {
      const result = await FirebasePatientService.getReports(patientId);
      return result.data;
    }
    
    return ApiService.get(`/patients/${patientId}/reports`);
  }
}

// Doctor related API calls
export class DoctorService {
  // Get all doctors
  static async getDoctors() {
    if (ApiService.useFirebase) {
      const result = await FirebaseDoctorService.getDoctors();
      return result.data;
    }
    
    return ApiService.get('/doctors');
  }

  // Get doctor by specialty
  static async getDoctorsBySpecialty(specialty) {
    if (ApiService.useFirebase) {
      const result = await FirebaseDoctorService.getDoctorsBySpecialty(specialty);
      return result.data;
    }
    
    return ApiService.get('/doctors', { specialty });
  }

  // Get doctor profile
  static async getDoctorProfile(doctorId) {
    if (ApiService.useFirebase) {
      const result = await FirebaseDoctorService.getDoctorProfile(doctorId);
      return result.data;
    }
    
    return ApiService.get(`/doctors/${doctorId}`);
  }
}

// Service related API calls
export class ServiceApiService {
  // Get all services
  static async getServices() {
    if (ApiService.useFirebase) {
      const result = await FirebaseServiceApiService.getServices();
      return result.data;
    }
    
    return ApiService.get('/services');
  }

  // Get services by category
  static async getServicesByCategory(category) {
    if (ApiService.useFirebase) {
      const result = await FirebaseServiceApiService.getServicesByCategory(category);
      return result.data;
    }
    
    return ApiService.get('/services', { category });
  }

  // Create new service (admin only)
  static async createService(serviceData) {
    if (ApiService.useFirebase) {
      const result = await FirebaseServiceApiService.createService(serviceData);
      return result.data;
    }
    
    return ApiService.post('/services', serviceData);
  }

  // Update service (admin only)
  static async updateService(serviceId, serviceData) {
    if (ApiService.useFirebase) {
      return await FirebaseServiceApiService.updateService(serviceId, serviceData);
    }
    
    return ApiService.put(`/services/${serviceId}`, serviceData);
  }

  // Delete service (admin only)
  static async deleteService(serviceId) {
    if (ApiService.useFirebase) {
      return await FirebaseServiceApiService.deleteService(serviceId);
    }
    
    return ApiService.delete(`/services/${serviceId}`);
  }
}

// Room Management API calls
export class RoomService {
  // Get all rooms
  static async getRooms() {
    if (ApiService.useFirebase) {
      const result = await FirebaseRoomService.getRooms();
      return result.data;
    }
    
    return ApiService.get('/rooms');
  }

  // Get all rooms (alias for consistency)
  static async getAllRooms() {
    return await this.getRooms();
  }

  // Create new room
  static async createRoom(roomData) {
    if (ApiService.useFirebase) {
      const result = await FirebaseRoomService.createRoom(roomData);
      return result.data;
    }
    
    return ApiService.post('/rooms', roomData);
  }

  // Update room
  static async updateRoom(roomId, roomData) {
    if (ApiService.useFirebase) {
      return await FirebaseRoomService.updateRoom(roomId, roomData);
    }
    
    return ApiService.put(`/rooms/${roomId}`, roomData);
  }

  // Delete room
  static async deleteRoom(roomId) {
    if (ApiService.useFirebase) {
      return await FirebaseRoomService.deleteRoom(roomId);
    }
    
    return ApiService.delete(`/rooms/${roomId}`);
  }

  // Assign patient to room
  static async assignPatient(roomId, patientData) {
    if (ApiService.useFirebase) {
      return await FirebaseRoomService.assignPatient(roomId, patientData);
    }
    
    return ApiService.post(`/rooms/${roomId}/assign`, patientData);
  }

  // Discharge patient from room
  static async dischargePatient(roomId) {
    if (ApiService.useFirebase) {
      return await FirebaseRoomService.dischargePatient(roomId);
    }
    
    return ApiService.post(`/rooms/${roomId}/discharge`);
  }

  // Get room statistics
  static async getRoomStats() {
    if (ApiService.useFirebase) {
      const result = await FirebaseRoomService.getRoomStats();
      return result.data;
    }
    
    return ApiService.get('/rooms/stats');
  }
}

// Invoice Management API calls
export class InvoiceService {
  // Get all invoices
  static async getInvoices() {
    if (ApiService.useFirebase) {
      const result = await FirebaseInvoiceService.getInvoices();
      return result.data;
    }
    
    return ApiService.get('/invoices');
  }

  // Get all invoices (alias for consistency)
  static async getAllInvoices() {
    return await this.getInvoices();
  }

  // Create new invoice
  static async createInvoice(invoiceData) {
    if (ApiService.useFirebase) {
      const result = await FirebaseInvoiceService.createInvoice(invoiceData);
      return result.data;
    }
    
    return ApiService.post('/invoices', invoiceData);
  }

  // Update invoice status
  static async updateInvoiceStatus(invoiceId, status) {
    if (ApiService.useFirebase) {
      return await FirebaseInvoiceService.updateInvoiceStatus(invoiceId, status);
    }
    
    return ApiService.put(`/invoices/${invoiceId}/status`, { status });
  }

  // Update invoice (general update)
  static async updateInvoice(invoiceId, invoiceData) {
    if (ApiService.useFirebase) {
      return await FirebaseInvoiceService.updateInvoice(invoiceId, invoiceData);
    }
    
    return ApiService.put(`/invoices/${invoiceId}`, invoiceData);
  }

  // Delete invoice
  static async deleteInvoice(invoiceId) {
    if (ApiService.useFirebase) {
      return await FirebaseInvoiceService.deleteInvoice(invoiceId);
    }
    
    return ApiService.delete(`/invoices/${invoiceId}`);
  }

  // Get invoices by patient
  static async getInvoicesByPatient(patientId) {
    if (ApiService.useFirebase) {
      const result = await FirebaseInvoiceService.getInvoicesByPatient(patientId);
      return result.data;
    }
    
    return ApiService.get(`/invoices/patient/${patientId}`);
  }

  // Get invoice statistics
  static async getInvoiceStats() {
    if (ApiService.useFirebase) {
      const result = await FirebaseInvoiceService.getInvoiceStats();
      return result.data;
    }
    
    return ApiService.get('/invoices/stats');
  }
}

// Payment Management API calls
export class PaymentService {
  // Get all payments
  static async getPayments() {
    if (ApiService.useFirebase) {
      const result = await FirebasePaymentService.getPayments();
      return result.data;
    }
    
    return ApiService.get('/payments');
  }

  // Get all payments (alias for consistency)
  static async getAllPayments() {
    return await this.getPayments();
  }

  // Add new payment
  static async addPayment(paymentData) {
    if (ApiService.useFirebase) {
      const result = await FirebasePaymentService.addPayment(paymentData);
      return result.data;
    }
    
    return ApiService.post('/payments', paymentData);
  }

  // Process payment (alias for addPayment)
  static async processPayment(paymentData) {
    return await this.addPayment(paymentData);
  }

  // Update payment status
  static async updatePaymentStatus(paymentId, status) {
    if (ApiService.useFirebase) {
      return await FirebasePaymentService.updatePaymentStatus(paymentId, status);
    }
    
    return ApiService.put(`/payments/${paymentId}/status`, { status });
  }

  // Delete payment
  static async deletePayment(paymentId) {
    if (ApiService.useFirebase) {
      return await FirebasePaymentService.deletePayment(paymentId);
    }
    
    return ApiService.delete(`/payments/${paymentId}`);
  }

  // Get payments by patient
  static async getPaymentsByPatient(patientId) {
    if (ApiService.useFirebase) {
      const result = await FirebasePaymentService.getPaymentsByPatient(patientId);
      return result.data;
    }
    
    return ApiService.get(`/payments/patient/${patientId}`);
  }

  // Get payment statistics
  static async getPaymentStats() {
    if (ApiService.useFirebase) {
      const result = await FirebasePaymentService.getPaymentStats();
      return result.data;
    }
    
    return ApiService.get('/payments/stats');
  }
}

// Discharge Management API calls
export class DischargeService {
  // Get all discharge records
  static async getDischarges() {
    if (ApiService.useFirebase) {
      const result = await FirebaseDischargeService.getDischarges();
      return result.data;
    }
    
    return ApiService.get('/discharges');
  }

  // Create discharge summary
  static async createDischargeSummary(dischargeData) {
    if (ApiService.useFirebase) {
      const result = await FirebaseDischargeService.createDischargeSummary(dischargeData);
      return result.data;
    }
    
    return ApiService.post('/discharges', dischargeData);
  }

  // Update discharge summary
  static async updateDischargeSummary(dischargeId, dischargeData) {
    if (ApiService.useFirebase) {
      return await FirebaseDischargeService.updateDischargeSummary(dischargeId, dischargeData);
    }
    
    return ApiService.put(`/discharges/${dischargeId}`, dischargeData);
  }

  // Delete discharge summary
  static async deleteDischargeSummary(dischargeId) {
    if (ApiService.useFirebase) {
      return await FirebaseDischargeService.deleteDischargeSummary(dischargeId);
    }
    
    return ApiService.delete(`/discharges/${dischargeId}`);
  }

  // Get discharge summaries by patient
  static async getDischargesByPatient(patientId) {
    if (ApiService.useFirebase) {
      const result = await FirebaseDischargeService.getDischargesByPatient(patientId);
      return result.data;
    }
    
    return ApiService.get(`/discharges/patient/${patientId}`);
  }

  // Get specific discharge summary by ID
  static async getDischargeSummary(dischargeId) {
    if (ApiService.useFirebase) {
      const result = await FirebaseDischargeService.getDischargeSummary(dischargeId);
      return result.data;
    }
    
    return ApiService.get(`/discharges/${dischargeId}`);
  }

  // Get discharge statistics
  static async getDischargeStats() {
    if (ApiService.useFirebase) {
      const result = await FirebaseDischargeService.getDischargeStats();
      return result.data;
    }
    
    return ApiService.get('/discharges/stats');
  }

  // Get discharge statistics (alias for consistency)
  static async getDischargeStatistics() {
    return await this.getDischargeStats();
  }
}

// Medical Reports API calls
export class ReportService {
  // Get all reports
  static async getReports() {
    if (ApiService.useFirebase) {
      const result = await FirebaseReportsService.getReports();
      return result.data;
    }
    
    return ApiService.get('/reports');
  }

  // Get all reports (alias for consistency)
  static async getAllReports() {
    return await this.getReports();
  }

  // Create new report
  static async createReport(reportData) {
    if (ApiService.useFirebase) {
      const result = await FirebaseReportsService.createReport(reportData);
      return result.data;
    }
    
    return ApiService.post('/reports', reportData);
  }

  // Update report
  static async updateReport(reportId, reportData) {
    if (ApiService.useFirebase) {
      return await FirebaseReportsService.updateReport(reportId, reportData);
    }
    
    return ApiService.put(`/reports/${reportId}`, reportData);
  }

  // Delete report
  static async deleteReport(reportId) {
    if (ApiService.useFirebase) {
      return await FirebaseReportsService.deleteReport(reportId);
    }
    
    return ApiService.delete(`/reports/${reportId}`);
  }

  // Mark report as sent to patient
  static async markReportAsSent(reportId, phoneNumber) {
    if (ApiService.useFirebase) {
      return await FirebaseReportsService.markReportAsSent(reportId, phoneNumber);
    }
    
    return ApiService.post(`/reports/${reportId}/send`, { phoneNumber });
  }

  // Add file to report
  static async addFileToReport(reportId, fileData) {
    if (ApiService.useFirebase) {
      return await FirebaseReportsService.addFileToReport(reportId, fileData);
    }
    
    return ApiService.post(`/reports/${reportId}/files`, fileData);
  }

  // Get reports by patient
  static async getReportsByPatient(patientId) {
    if (ApiService.useFirebase) {
      const result = await FirebaseReportsService.getReportsByPatient(patientId);
      return result.data;
    }
    
    return ApiService.get(`/reports/patient/${patientId}`);
  }

  // Get report statistics
  static async getReportsStats() {
    if (ApiService.useFirebase) {
      const result = await FirebaseReportsService.getReportsStats();
      return result.data;
    }
    
    return ApiService.get('/reports/stats');
  }
}

