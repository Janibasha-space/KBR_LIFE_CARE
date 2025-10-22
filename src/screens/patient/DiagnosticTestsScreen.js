import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import AppHeader from '../../components/AppHeader';
import { FirebaseTestService } from '../../services/firebaseHospitalServices';

const DiagnosticTestsScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  
  // Get category from navigation params
  const { category, testCategory, availableTests } = route.params || {};
  
  // Load tests from Firebase based on category
  useEffect(() => {
    const loadTests = async () => {
      try {
        setLoading(true);
        
        // If tests are already provided in the navigation params, use them
        if (availableTests && availableTests.length > 0) {
          setTests(availableTests);
          setLoading(false);
          return;
        }
        
        // Otherwise fetch from Firebase
        const result = await FirebaseTestService.getTests();
        if (result.success) {
          // Filter by category if category is provided
          let filteredTests = result.data;
          if (category) {
            filteredTests = result.data.filter(test => {
              // Match exact categories from admin form
              if (category === 'blood-tests' && test.category === 'Blood Test') return true;
              if (category === 'imaging-tests' && test.category === 'Imaging') return true;
              if (category === 'cardiac-tests' && test.category === 'Cardiac') return true;
              
              // Fallback to the old filtering method
              const categoryFilter = getCategoryFilter(category);
              return categoryFilter && test.category && test.category.toLowerCase().includes(categoryFilter);
            });
          }
          
          setTests(filteredTests);
        } else {
          setTests([]);
        }
      } catch (error) {
        console.error('Error loading tests:', error);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTests();
  }, [category, availableTests]);
  
  // Helper to get category filter string
  const getCategoryFilter = (categoryId) => {
    if (categoryId === 'blood-tests') return 'blood';
    if (categoryId === 'imaging-tests') return 'imaging';
    if (categoryId === 'cardiac-tests') return 'cardiac';
    return null;
  };
  
  // Helper to match admin-entered categories with user-facing categories
  const matchesAdminCategory = (testCategory, categoryId) => {
    if (categoryId === 'blood-tests' && testCategory === 'Blood Test') return true;
    if (categoryId === 'imaging-tests' && testCategory === 'Imaging') return true;
    if (categoryId === 'cardiac-tests' && testCategory === 'Cardiac') return true;
    return false;
  };
  
  // Render test item
  const renderTestItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.testCard}
      onPress={() => navigation.navigate('BookAppointment', {
        category: item.category,
        type: 'test',
        test: item
      })}
    >
      <View style={styles.testHeader}>
        <View style={styles.testInfo}>
          <Text style={styles.testName}>{item.name}</Text>
          <View style={styles.testMeta}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category || 'Test'}</Text>
            </View>
            <Text style={styles.departmentText}>{item.department || 'Lab'}</Text>
          </View>
        </View>
        <View style={styles.testPrice}>
          <Text style={styles.priceText}>₹{item.price}</Text>
        </View>
      </View>
      
      <Text style={styles.testDescription}>{item.description}</Text>
      
      <View style={styles.testDetails}>
        <View style={styles.testDetailItem}>
          <Ionicons name="time" size={14} color="#666" />
          <Text style={styles.testDetailText}>{item.testDuration || '30 minutes'}</Text>
        </View>
        <View style={styles.testDetailItem}>
          <Ionicons name="document-text" size={14} color="#666" />
          <Text style={styles.testDetailText}>Report: {item.reportTime || '24 hours'}</Text>
        </View>
        <View style={styles.testDetailItem}>
          <Ionicons name="water" size={14} color="#666" />
          <Text style={styles.testDetailText}>{item.sampleRequired || 'Blood'}</Text>
        </View>
      </View>
      
      <View style={styles.testFooter}>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookAppointment', {
            category: item.category,
            type: 'test',
            test: item
          })}
        >
          <Ionicons name="calendar" size={16} color="#FFFFFF" />
          <Text style={styles.bookButtonText}>Book Test</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={true} />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <AppHeader 
          title={testCategory || "Diagnostic Tests"}
          showBackButton={true}
          navigation={navigation}
        />
        
        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>{testCategory || "Diagnostic Tests"}</Text>
            <Text style={styles.headerSubtitle}>
              {tests.length} tests available
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.kbrBlue} />
              <Text style={styles.loadingText}>Loading tests...</Text>
            </View>
          ) : tests.length > 0 ? (
            <FlatList
              data={tests}
              renderItem={renderTestItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="flask-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>No Tests Available</Text>
              <Text style={styles.emptySubtitle}>No tests found for this category</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.kbrBlue,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerSection: {
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  testInfo: {
    flex: 1,
    paddingRight: 16,
  },
  testName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  testMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E6F4FB',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.kbrBlue,
    fontWeight: '500',
  },
  departmentText: {
    fontSize: 12,
    color: '#666',
  },
  testPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.kbrBlue,
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  testDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  testDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  testDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  testFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default DiagnosticTestsScreen;