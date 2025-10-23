// Token Generation Service for KBR Life Care
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase.config';

export class TokenService {
  static collectionName = 'tokenCounters';
  static appointmentTokensCollection = 'appointmentTokens';

  // Generate appointment token (KBR-001, KBR-002, etc.)
  static async generateAppointmentToken() {
    try {
      const counterRef = doc(db, this.collectionName, 'appointmentCounter');
      const counterDoc = await getDoc(counterRef);
      
      let nextNumber = 1;
      
      if (counterDoc.exists()) {
        const currentCount = counterDoc.data().count || 0;
        nextNumber = currentCount + 1;
        
        // Update counter
        await updateDoc(counterRef, {
          count: nextNumber,
          lastUpdated: new Date().toISOString()
        });
      } else {
        // Initialize counter for first time
        await setDoc(counterRef, {
          count: nextNumber,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
      
      // Format token with leading zeros (KBR-001, KBR-002, etc.)
      const tokenNumber = `KBR-${nextNumber.toString().padStart(3, '0')}`;
      
      console.log(`✅ Generated appointment token: ${tokenNumber}`);
      return tokenNumber;
      
    } catch (error) {
      console.error('❌ Error generating appointment token:', error);
      throw new Error('Failed to generate appointment token');
    }
  }

  // Save appointment token with details
  static async saveAppointmentToken(tokenData) {
    try {
      const tokenRef = doc(db, this.appointmentTokensCollection, tokenData.tokenNumber);
      
      const tokenDoc = {
        ...tokenData,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      await setDoc(tokenRef, tokenDoc);
      
      console.log(`✅ Saved appointment token: ${tokenData.tokenNumber}`);
      return {
        success: true,
        data: tokenDoc
      };
      
    } catch (error) {
      console.error('❌ Error saving appointment token:', error);
      throw new Error('Failed to save appointment token');
    }
  }

  // Get appointment by token
  static async getAppointmentByToken(tokenNumber) {
    try {
      const tokenRef = doc(db, this.appointmentTokensCollection, tokenNumber);
      const tokenDoc = await getDoc(tokenRef);
      
      if (tokenDoc.exists()) {
        return {
          success: true,
          data: {
            id: tokenDoc.id,
            ...tokenDoc.data()
          }
        };
      } else {
        return {
          success: false,
          message: 'Token not found'
        };
      }
      
    } catch (error) {
      console.error('❌ Error fetching appointment by token:', error);
      throw new Error('Failed to fetch appointment by token');
    }
  }

  // Get all appointment tokens (for admin)
  static async getAllAppointmentTokens() {
    try {
      const tokensRef = collection(db, this.appointmentTokensCollection);
      const q = query(tokensRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const tokens = [];
      querySnapshot.forEach((doc) => {
        tokens.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: tokens
      };
      
    } catch (error) {
      console.error('❌ Error fetching appointment tokens:', error);
      throw new Error('Failed to fetch appointment tokens');
    }
  }

  // Get current counter value (for admin dashboard)
  static async getCurrentTokenCount() {
    try {
      const counterRef = doc(db, this.collectionName, 'appointmentCounter');
      const counterDoc = await getDoc(counterRef);
      
      if (counterDoc.exists()) {
        return {
          success: true,
          data: {
            count: counterDoc.data().count || 0,
            lastToken: `KBR-${(counterDoc.data().count || 0).toString().padStart(3, '0')}`,
            nextToken: `KBR-${((counterDoc.data().count || 0) + 1).toString().padStart(3, '0')}`
          }
        };
      } else {
        return {
          success: true,
          data: {
            count: 0,
            lastToken: 'None',
            nextToken: 'KBR-001'
          }
        };
      }
      
    } catch (error) {
      console.error('❌ Error fetching token count:', error);
      throw new Error('Failed to fetch token count');
    }
  }

  // Reset token counter (admin only - use with caution)
  static async resetTokenCounter() {
    try {
      const counterRef = doc(db, this.collectionName, 'appointmentCounter');
      await setDoc(counterRef, {
        count: 0,
        resetAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
      
      console.log('⚠️ Token counter has been reset');
      return {
        success: true,
        message: 'Token counter reset successfully'
      };
      
    } catch (error) {
      console.error('❌ Error resetting token counter:', error);
      throw new Error('Failed to reset token counter');
    }
  }
}

export default TokenService;