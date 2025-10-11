import React, { createContext, useContext, useState } from 'react';

// Initial services data - matching UI screenshots exactly
const initialServices = {
  medical: [
    {
      id: 'general-medicine',
      name: 'General Medicine',
      description: 'Primary healthcare and comprehensive medical consultation for all age groups',
      duration: '20 mins',
      doctors: ['Dr. K. Ramesh', 'Dr. Rajender Katroth'],
      tags: ['Health Check-ups', 'Chronic Disease Management', 'Preventive Care', 'Emergency Medicine'],
    },
  ],
  specialized: [
    {
      id: 'diabetology',
      name: 'Diabetology',
      description: 'Specialized care for diabetes management and metabolic disorders',
      duration: '30 mins',
      doctors: ['Dr. Garcia', 'Dr. Martinez'],
      tags: ['Blood Sugar Monitoring', 'Insulin Therapy', 'Diet Counseling', 'Complications Prevention'],
    },
    {
      id: 'gynecology',
      name: 'Obstetrics & Gynecology',
      description: "Complete women's health services and reproductive care",
      duration: '30 mins',
      doctors: ['Dr. Thompson', 'Dr. White'],
      tags: ['Prenatal Care', 'Normal & C-Section Delivery', 'Menstrual Disorders', 'Family Planning'],
    },
  ],
  surgical: [
    {
      id: 'trauma-maxillofacial',
      name: 'Trauma & Maxillofacial Surgery',
      description: 'Emergency trauma care and facial reconstruction surgery',
      duration: '45 mins',
      doctors: ['Dr. Davis', 'Dr. Miller'],
      tags: ['Trauma Care', 'Facial Surgery', 'Emergency Surgery', 'Reconstruction'],
    },
  ],
};

// Create the context
const ServicesContext = createContext();

// Provider component
export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState(initialServices);
  const [doctors, setDoctors] = useState([
    'Dr. K. Ramesh', 'Dr. Rajender Katroth', 'Dr. Garcia', 'Dr. Martinez',
    'Dr. Thompson', 'Dr. White', 'Dr. Davis', 'Dr. Miller', 'Dr. Vijay Shankar'
  ]);

  // Add a new service
  const addService = (categoryId, serviceData) => {
    const newService = {
      id: serviceData.name.toLowerCase().replace(/\s+/g, '-'),
      ...serviceData,
    };

    setServices(prev => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), newService],
    }));
  };

  // Update a service
  const updateService = (categoryId, serviceId, updatedData) => {
    setServices(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].map(service =>
        service.id === serviceId ? { ...service, ...updatedData } : service
      ),
    }));
  };

  // Delete a service
  const deleteService = (categoryId, serviceId) => {
    setServices(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].filter(service => service.id !== serviceId),
    }));
  };

  // Add a new doctor
  const addDoctor = (doctorName) => {
    if (!doctors.includes(doctorName)) {
      setDoctors(prev => [...prev, doctorName]);
    }
  };

  // Get all services for user appointment booking
  const getAllServices = () => {
    const allServices = [];
    try {
      if (services && typeof services === 'object') {
        Object.keys(services).forEach(category => {
          if (services[category] && Array.isArray(services[category])) {
            services[category].forEach(service => {
              if (service && service.id && service.name) {
                allServices.push({
                  ...service,
                  category,
                  icon: getServiceIcon(service.name || ''),
                  color: '#4285F4', // Default blue color
                });
              }
            });
          }
        });
      }
      // Only log in dev mode and occasionally to avoid spam
      if (__DEV__ && Math.random() < 0.05) {
        console.log(`📋 ${allServices.length} services loaded`);
      }
    } catch (error) {
      console.error('Error in getAllServices:', error);
      // Return empty array as fallback
    }
    return allServices;
  };

  // Get services by category
  const getServicesByCategory = (categoryId) => {
    return services[categoryId] || [];
  };

  // Get service counts by category
  const getServiceCounts = () => {
    try {
      return {
        medical: (services && services.medical && Array.isArray(services.medical)) ? services.medical.length : 0,
        surgical: (services && services.surgical && Array.isArray(services.surgical)) ? services.surgical.length : 0,
        specialized: (services && services.specialized && Array.isArray(services.specialized)) ? services.specialized.length : 0,
      };
    } catch (error) {
      if (__DEV__) {
        console.error('Error in getServiceCounts:', error);
      }
      return { medical: 0, surgical: 0, specialized: 0 };
    }
  };

  // Helper function to get appropriate icon for service
  const getServiceIcon = (serviceName) => {
    try {
      if (!serviceName || typeof serviceName !== 'string') {
        return 'medical-outline';
      }
      const name = serviceName.toLowerCase();
      if (name.includes('general') || name.includes('medicine')) return 'medical-outline';
      if (name.includes('cardiology') || name.includes('heart')) return 'heart-outline';
      if (name.includes('surgery') || name.includes('surgical')) return 'cut-outline';
      if (name.includes('orthopedics') || name.includes('bone')) return 'fitness-outline';
      if (name.includes('diabetes') || name.includes('diabetology')) return 'pulse-outline';  
      if (name.includes('gynecology') || name.includes('obstetrics')) return 'person-outline';
      if (name.includes('trauma')) return 'medical';
      return 'medical-outline'; // Default icon
    } catch (error) {
      console.error('Error in getServiceIcon:', error);
      return 'medical-outline';
    }
  };

  const value = {
    services,
    doctors,
    addService,
    updateService,
    deleteService,
    addDoctor,
    getAllServices,
    getServicesByCategory,
    getServiceCounts,
  };

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
};

// Hook to use the services context
export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};

export default ServicesContext;