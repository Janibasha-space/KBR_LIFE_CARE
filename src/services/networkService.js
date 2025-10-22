import NetInfo from '@react-native-community/netinfo';

class NetworkService {
  constructor() {
    this.isConnected = true;
    this.netInfoUnsubscribe = null;
    this.listeners = [];
  }

  // Initialize network monitoring
  init() {
    this.netInfoUnsubscribe = NetInfo.addEventListener(state => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected;
      
      // Notify listeners about connectivity changes
      if (wasConnected !== this.isConnected) {
        this.notifyListeners(this.isConnected);
      }
    });
  }

  // Clean up network monitoring
  cleanup() {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
    }
  }

  // Check current network status
  async checkConnection() {
    const state = await NetInfo.fetch();
    this.isConnected = state.isConnected;
    return this.isConnected;
  }

  // Add connectivity change listener
  addListener(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  notifyListeners(isConnected) {
    this.listeners.forEach(callback => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  // Get current connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new NetworkService();