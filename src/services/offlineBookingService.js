// Offline-Capable Booking Service
// This service works even when Firebase is temporarily unavailable

import { 
  collection, 
  addDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from '../config/firebase.config';

export class OfflineBookingService {
  static appointmentsCollection = 'appointments';
  static tokensCollection = 'appointmentTokens';
  static countersCollection = 'tokenCounters';

  // Check if we have internet connectivity
  static async checkConnectivity() {
    try {
      // Try a simple network request
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
      });
      return true;
    } catch (error) {
      console.warn('🌐 No internet connectivity detected');
      return false;
    }
  }

  // Generate token with offline fallback
  static async generateToken() {
    try {
      // Try Firebase first
      const counterRef = doc(db, this.countersCollection, 'appointmentCounter');
      const counterDoc = await getDoc(counterRef);
      
      let nextNumber = 1;
      
      if (counterDoc.exists()) {
        nextNumber = (counterDoc.data().count || 0) + 1;
        await updateDoc(counterRef, { 
          count: nextNumber,
          lastUpdated: new Date().toISOString() 
        });
      } else {
        await setDoc(counterRef, { 
          count: nextNumber,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
      
      return `KBR-${nextNumber.toString().padStart(3, '0')}`;
      
    } catch (error) {
      console.warn('⚠️ Firebase token generation failed, using offline method');
      
      // Offline fallback - use timestamp + random
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      return `KBR-${timestamp}${random}`;
    }
  }

  // Store booking offline if needed
  static storeOfflineBooking(appointmentData) {
    try {
      const offlineBookings = JSON.parse(localStorage.getItem('offlineBookings') || '[]');
      offlineBookings.push({
        ...appointmentData,
        offlineId: Date.now(),
        createdOffline: true,
        syncStatus: 'pending'
      });
      localStorage.setItem('offlineBookings', JSON.stringify(offlineBookings));
      console.log('💾 Stored booking offline for later sync');
      return true;
    } catch (error) {
      console.error('❌ Failed to store offline booking:', error);
      return false;
    }
  }

  // Main booking function with offline support
  static async bookAppointment(appointmentData) {
    try {
      console.log('🚀 OfflineBookingService: Starting booking...');
      console.log('📋 Appointment data:', appointmentData);

      // Check connectivity
      const isOnline = await this.checkConnectivity();
      console.log(`🌐 Connectivity status: ${isOnline ? 'Online' : 'Offline'}`);

      // Generate token (works offline)
      const tokenNumber = await this.generateToken();
      console.log(`🎫 Generated token: ${tokenNumber}`);

      // Create appointment object
      const appointment = {
        ...appointmentData,
        tokenNumber: tokenNumber,
        patientId: appointmentData.patientId || `patient-${Date.now()}`,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: isOnline ? 'synced' : 'pending'
      };

      if (isOnline) {
        try {
          console.log('☁️ Online: Saving to Firebase...');
          
          // Save to appointments collection
          const docRef = await addDoc(collection(db, this.appointmentsCollection), appointment);
          console.log(`✅ Appointment saved to Firebase with ID: ${docRef.id}`);

          // Save token data for lookup
          const tokenData = {
            tokenNumber: tokenNumber,
            appointmentId: docRef.id,
            patientName: appointment.patientName,
            contactNumber: appointment.contactNumber,
            appointmentDate: appointment.appointmentDate,
            status: 'scheduled',
            createdAt: new Date().toISOString()
          };

          await setDoc(doc(db, this.tokensCollection, tokenNumber), tokenData);
          console.log(`💾 Token data saved to Firebase: ${tokenNumber}`);

          return {
            success: true,
            data: {
              id: docRef.id,
              ...appointment
            },
            message: `Appointment booked successfully! Your token number is: ${tokenNumber}`,
            mode: 'online'
          };

        } catch (firebaseError) {
          console.warn('⚠️ Firebase save failed, storing offline:', firebaseError);
          
          // Store offline as fallback
          this.storeOfflineBooking(appointment);
          
          return {
            success: true,
            data: {
              id: `offline-${Date.now()}`,
              ...appointment
            },
            message: `Appointment booked offline! Your token number is: ${tokenNumber}\nYour booking will be synced when connection is restored.`,
            mode: 'offline'
          };
        }
      } else {
        console.log('📱 Offline mode: Storing locally...');
        
        // Store offline
        this.storeOfflineBooking(appointment);
        
        return {
          success: true,
          data: {
            id: `offline-${Date.now()}`,
            ...appointment
          },
          message: `Appointment booked offline! Your token number is: ${tokenNumber}\nYour booking will be synced when internet is available.`,
          mode: 'offline'
        };
      }

    } catch (error) {
      console.error('❌ OfflineBookingService error:', error);
      
      return {
        success: false,
        message: `Booking failed: ${error.message}`,
        error: error
      };
    }
  }

  // Sync offline bookings when online
  static async syncOfflineBookings() {
    try {
      const offlineBookings = JSON.parse(localStorage.getItem('offlineBookings') || '[]');
      const pendingBookings = offlineBookings.filter(booking => booking.syncStatus === 'pending');
      
      if (pendingBookings.length === 0) {
        console.log('📱 No offline bookings to sync');
        return { success: true, synced: 0 };
      }

      console.log(`🔄 Syncing ${pendingBookings.length} offline bookings...`);
      
      let syncedCount = 0;
      const updatedBookings = [];

      for (const booking of offlineBookings) {
        if (booking.syncStatus === 'pending') {
          try {
            // Remove offline-specific fields
            const { offlineId, createdOffline, syncStatus, ...cleanBooking } = booking;
            
            // Save to Firebase
            const docRef = await addDoc(collection(db, this.appointmentsCollection), cleanBooking);
            
            // Save token data
            const tokenData = {
              tokenNumber: booking.tokenNumber,
              appointmentId: docRef.id,
              patientName: booking.patientName,
              contactNumber: booking.contactNumber,
              appointmentDate: booking.appointmentDate,
              status: booking.status,
              createdAt: booking.createdAt
            };
            
            await setDoc(doc(db, this.tokensCollection, booking.tokenNumber), tokenData);
            
            // Mark as synced
            updatedBookings.push({
              ...booking,
              syncStatus: 'synced',
              firebaseId: docRef.id
            });
            
            syncedCount++;
            console.log(`✅ Synced booking: ${booking.tokenNumber}`);
            
          } catch (syncError) {
            console.error(`❌ Failed to sync booking ${booking.tokenNumber}:`, syncError);
            updatedBookings.push(booking); // Keep as pending
          }
        } else {
          updatedBookings.push(booking);
        }
      }

      // Update local storage
      localStorage.setItem('offlineBookings', JSON.stringify(updatedBookings));
      
      console.log(`🎉 Sync complete: ${syncedCount} bookings synced`);
      
      return {
        success: true,
        synced: syncedCount,
        pending: updatedBookings.filter(b => b.syncStatus === 'pending').length
      };
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
      return { success: false, error };
    }
  }
}

export default OfflineBookingService;