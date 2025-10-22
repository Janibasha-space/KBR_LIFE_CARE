import ApiService from './api';
import { 
  FirebaseAppointmentService,
  FirebasePatientService, 
  FirebaseDoctorService,
  FirebaseServiceApiService 
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

