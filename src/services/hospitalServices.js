import ApiService from './api';

// Appointment related API calls
export class AppointmentService {
  // Get all appointments
  static async getAppointments(patientId = null) {
    const params = patientId ? { patientId } : {};
    return ApiService.get('/appointments', params);
  }

  // Book new appointment
  static async bookAppointment(appointmentData) {
    return ApiService.post('/appointments', appointmentData);
  }

  // Cancel appointment
  static async cancelAppointment(appointmentId) {
    return ApiService.delete(`/appointments/${appointmentId}`);
  }

  // Reschedule appointment
  static async rescheduleAppointment(appointmentId, newDateTime) {
    return ApiService.put(`/appointments/${appointmentId}`, {
      dateTime: newDateTime,
    });
  }

  // Get available time slots
  static async getAvailableSlots(doctorId, date) {
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
    return ApiService.get(`/patients/${patientId}`);
  }

  // Update patient profile
  static async updateProfile(patientId, profileData) {
    return ApiService.put(`/patients/${patientId}`, profileData);
  }

  // Get patient medical history
  static async getMedicalHistory(patientId) {
    return ApiService.get(`/patients/${patientId}/medical-history`);
  }

  // Get patient reports
  static async getReports(patientId) {
    return ApiService.get(`/patients/${patientId}/reports`);
  }
}

// Doctor related API calls
export class DoctorService {
  // Get all doctors
  static async getDoctors() {
    return ApiService.get('/doctors');
  }

  // Get doctor by specialty
  static async getDoctorsBySpecialty(specialty) {
    return ApiService.get('/doctors', { specialty });
  }

  // Get doctor profile
  static async getDoctorProfile(doctorId) {
    return ApiService.get(`/doctors/${doctorId}`);
  }
}

// Service related API calls
export class ServiceApiService {
  // Get all services
  static async getServices() {
    return ApiService.get('/services');
  }

  // Get services by category
  static async getServicesByCategory(category) {
    return ApiService.get('/services', { category });
  }

  // Create new service (admin only)
  static async createService(serviceData) {
    return ApiService.post('/services', serviceData);
  }

  // Update service (admin only)
  static async updateService(serviceId, serviceData) {
    return ApiService.put(`/services/${serviceId}`, serviceData);
  }

  // Delete service (admin only)
  static async deleteService(serviceId) {
    return ApiService.delete(`/services/${serviceId}`);
  }
}

