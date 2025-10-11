import React, { createContext, useContext, useState } from 'react';

// Initial services data
const initialServices = {
  medical: [
    {
      id: 'general-medicine',
      name: 'General Medicine',
      description: 'Primary healthcare and comprehensive medical consultation for all age groups',
      duration: '20 mins',
      doctors: ['Dr. Smith', 'Dr. Johnson'],
      tags: ['Health Check-ups', 'Chronic Disease Management', 'Preventive Care', 'Emergency Medicine'],
    },
    {
      id: 'cardiology',
      name: 'Cardiology',
      description: 'Heart and cardiovascular system care',
      duration: '30 mins',
      doctors: ['Dr. Wilson', 'Dr. Brown'],
      tags: ['Heart Health', 'ECG', 'Blood Pressure', 'Cardiac Surgery'],
    },
  ],
  surgical: [
    {
      id: 'general-surgery',
      name: 'General Surgery',
      description: 'Comprehensive surgical procedures and care',
      duration: '45 mins',
      doctors: ['Dr. Davis', 'Dr. Miller'],
      tags: ['Surgical Procedures', 'Post-Op Care', 'Emergency Surgery', 'Minimally Invasive'],
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics',
      description: 'Bone, joint, and muscle care',
      duration: '35 mins',
      doctors: ['Dr. Anderson', 'Dr. Taylor'],
      tags: ['Bone Health', 'Joint Replacement', 'Sports Medicine', 'Fractures'],
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
};

// Create the context
const ServicesContext = createContext();

// Provider component
export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState(initialServices);
  const [doctors, setDoctors] = useState([
    'Dr. Smith', 'Dr. Johnson', 'Dr. Wilson', 'Dr. Brown', 'Dr. Davis', 
    'Dr. Miller', 'Dr. Anderson', 'Dr. Taylor', 'Dr. Garcia', 'Dr. Martinez',
    'Dr. Thompson', 'Dr. White'
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
    } catch (error) {
      console.error('Error in getAllServices:', error);
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
      console.error('Error in getServiceCounts:', error);
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