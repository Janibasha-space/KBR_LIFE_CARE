// Temporary Authentication Service for Development
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebase.config';

export class TempAuthService {
  static async ensureAuthenticated() {
    try {
      if (!auth.currentUser) {
        console.log('🔑 Signing in anonymously for development...');
        await signInAnonymously(auth);
        console.log('✅ Anonymous authentication successful');
      }
      return true;
    } catch (error) {
      console.error('❌ Anonymous authentication failed:', error);
      return false;
    }
  }
}