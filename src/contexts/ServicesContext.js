import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseHospitalServices } from '../services/firebaseHospitalServices';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase.config';

// Services will be loaded exclusively from Firebase - no dummy data

// Create the context
const ServicesContext = createContext();

// Provider component
export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState({ medical: [], surgical: [], specialized: [] });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up real-time listener for services
  useEffect(() => {
    console.log('🔄 ServicesContext: Setting up real-time listener for services...');
    
    const servicesRef = collection(db, 'hospitalServices');
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(
      servicesRef,
      (snapshot) => {
        try {
          console.log('🔄 ServicesContext: Real-time update received');
          setLoading(true);
          setError(null);
          
          const servicesData = [];
          snapshot.forEach((doc) => {
            const serviceData = doc.data();
            servicesData.push({
              id: doc.id,
              ...serviceData,
              assignedDoctors: serviceData.assignedDoctors || [],
              doctorDetails: serviceData.doctorDetails || [],
              doctorCount: serviceData.assignedDoctors ? serviceData.assignedDoctors.length : 0
            });
          });
          
          // Organize services by category
          const organizedServices = {
            medical: [],
            surgical: [],
            specialized: []
          };
          
          servicesData.forEach(service => {
            const category = service.category?.toLowerCase();
            if (organizedServices[category]) {
              organizedServices[category].push({
                ...service,
                icon: getServiceIcon(service.name || ''),
                color: '#4285F4'
              });
            } else {
              // Default to medical if category is not recognized
              organizedServices.medical.push({
                ...service,
                icon: getServiceIcon(service.name || ''),
                color: '#4285F4'
              });
            }
          });

          setServices(organizedServices);
          console.log('✅ ServicesContext: Real-time services updated:', {
            medical: organizedServices.medical.length,
            surgical: organizedServices.surgical.length,
            specialized: organizedServices.specialized.length
          });
          
          setLoading(false);
        } catch (error) {
          console.error('❌ ServicesContext: Error processing real-time update:', error);
          setError(error.message);
          setLoading(false);
        }
      },
      (error) => {
        console.error('❌ ServicesContext: Real-time listener error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log('🔄 ServicesContext: Cleaning up real-time listener');
      unsubscribe();
    };
  }, []);

  // Load services from Firebase
  const loadServicesFromFirebase = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 ServicesContext: Loading services from Firebase...');
      
      const result = await firebaseHospitalServices.getServicesWithDoctors();
      
      if (result.success && result.data) {
        // Organize services by category
        const organizedServices = {
          medical: [],
          surgical: [],
          specialized: []
        };
        
        result.data.forEach(service => {
          const category = service.category?.toLowerCase();
          if (organizedServices[category]) {
            organizedServices[category].push({
              ...service,
              icon: getServiceIcon(service.name || ''),
              color: '#4285F4'
            });
          } else {
            // Default to medical if category is not recognized
            organizedServices.medical.push({
              ...service,
              icon: getServiceIcon(service.name || ''),
              color: '#4285F4'
            });
          }
        });

        setServices(organizedServices);
        console.log('✅ ServicesContext: Successfully loaded services:', {
          medical: organizedServices.medical.length,
          surgical: organizedServices.surgical.length,
          specialized: organizedServices.specialized.length
        });
      } else {
        console.warn('⚠️ ServicesContext: No services found in Firebase');
        setServices({ medical: [], surgical: [], specialized: [] });
      }
    } catch (error) {
      console.error('❌ ServicesContext: Error loading services from Firebase:', error);
      setError(error.message);
      setServices({ medical: [], surgical: [], specialized: [] });
    } finally {
      setLoading(false);
    }
  };

  // Refresh services data
  const refreshServices = () => {
    loadServicesFromFirebase();
  };

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
    loading,
    error,
    addService,
    updateService,
    deleteService,
    addDoctor,
    getAllServices,
    getServicesByCategory,
    getServiceCounts,
    refreshServices,
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