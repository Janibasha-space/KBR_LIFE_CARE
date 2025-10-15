/**
 * KBR LIFE CARE HOSPITALS - TEST MANAGEMENT SCREEN
 * Comprehensive test management system for hospital staff
 * Features: Add/Edit/Delete tests, Test packages, Categories, Results management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import AppHeader from '../../components/AppHeader';

const TestManagementScreen = ({ navigation }) => {
  const [tests, setTests] = useState([]);
  const [testPackages, setTestPackages] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentTab, setCurrentTab] = useState('tests'); // 'tests', 'packages', 'results'

  // Test form state
  const [testForm, setTestForm] = useState({
    name: '',
    price: '',
    category: 'Blood Test',
    department: 'Lab',
    description: '',
    sampleRequired: 'Blood',
    preparationInstructions: '',
    testDuration: '30 minutes',
    reportTime: '24 hours',
    isActive: true,
    requiresAppointment: false,
    isPackage: false
  });

  // Package form state
  const [packageForm, setPackageForm] = useState({
    name: '',
    originalPrice: '',
    discountedPrice: '',
    description: '',
    includedTests: [],
    category: 'Health Package',
    isActive: true
  });

  const testCategories = [
    'All', 'Blood Test', 'Imaging', 'Cardiac', 'Specialized', 
    'Urine Test', 'Stool Test', 'Health Package', 'Emergency'
  ];

  const departments = [
    'Lab', 'Radiology', 'Cardiology', 'Pathology', 
    'Microbiology', 'Biochemistry', 'General'
  ];

  const sampleTypes = [
    'Blood', 'Urine', 'Stool', 'Saliva', 'Tissue', 'None (Imaging)', 'Swab'
  ];

  // Initialize with comprehensive test data
  useEffect(() => {
    initializeTestData();
  }, []);

  const initializeTestData = () => {
    const initialTests = [
      // Blood Tests
      {
        id: '1',
        name: 'Complete Blood Count (CBC)',
        price: 350,
        category: 'Blood Test',
        department: 'Lab',
        description: 'Complete blood analysis including RBC, WBC, Platelets, Hemoglobin',
        sampleRequired: 'Blood',
        preparationInstructions: 'No special preparation required',
        testDuration: '15 minutes',
        reportTime: '4-6 hours',
        isActive: true,
        requiresAppointment: false,
        bookings: 156,
        lastUpdated: '2024-01-10'
      },
      {
        id: '2',
        name: 'Lipid Profile',
        price: 500,
        category: 'Blood Test',
        department: 'Biochemistry',
        description: 'Cholesterol, Triglycerides, HDL, LDL analysis',
        sampleRequired: 'Blood',
        preparationInstructions: '12-hour fasting required',
        testDuration: '20 minutes',
        reportTime: '8-12 hours',
        isActive: true,
        requiresAppointment: true,
        bookings: 134,
        lastUpdated: '2024-01-09'
      },
      {
        id: '3',
        name: 'Thyroid Profile (T3, T4, TSH)',
        price: 450,
        category: 'Blood Test',
        department: 'Biochemistry',
        description: 'Complete thyroid function assessment',
        sampleRequired: 'Blood',
        preparationInstructions: 'Morning sample preferred',
        testDuration: '15 minutes',
        reportTime: '24 hours',
        isActive: true,
        requiresAppointment: false,
        bookings: 98,
        lastUpdated: '2024-01-08'
      },
      {
        id: '4',
        name: 'HbA1c (Diabetes)',
        price: 400,
        category: 'Blood Test',
        department: 'Biochemistry',
        description: 'Average blood sugar levels over 3 months',
        sampleRequired: 'Blood',
        preparationInstructions: 'No fasting required',
        testDuration: '10 minutes',
        reportTime: '6-8 hours',
        isActive: true,
        requiresAppointment: false,
        bookings: 112,
        lastUpdated: '2024-01-07'
      },
      {
        id: '5',
        name: 'Liver Function Test (LFT)',
        price: 600,
        category: 'Blood Test',
        department: 'Biochemistry',
        description: 'Complete liver enzymes and protein analysis',
        sampleRequired: 'Blood',
        preparationInstructions: '8-hour fasting recommended',
        testDuration: '20 minutes',
        reportTime: '12-24 hours',
        isActive: true,
        requiresAppointment: true,
        bookings: 87,
        lastUpdated: '2024-01-06'
      },
      // Imaging Tests
      {
        id: '6',
        name: 'X-Ray Chest',
        price: 300,
        category: 'Imaging',
        department: 'Radiology',
        description: 'Chest X-ray for lung and heart examination',
        sampleRequired: 'None (Imaging)',
        preparationInstructions: 'Remove jewelry and metal objects',
        testDuration: '10 minutes',
        reportTime: '2-4 hours',
        isActive: true,
        requiresAppointment: true,
        bookings: 203,
        lastUpdated: '2024-01-10'
      },
      {
        id: '7',
        name: 'CT Scan Abdomen',
        price: 3500,
        category: 'Imaging',
        department: 'Radiology',
        description: 'Detailed abdominal organ imaging',
        sampleRequired: 'None (Imaging)',
        preparationInstructions: '6-hour fasting, contrast may be required',
        testDuration: '45 minutes',
        reportTime: '24-48 hours',
        isActive: true,
        requiresAppointment: true,
        bookings: 45,
        lastUpdated: '2024-01-09'
      },
      {
        id: '8',
        name: 'Ultrasound Abdomen',
        price: 800,
        category: 'Imaging',
        department: 'Radiology',
        description: 'Abdominal organs ultrasound examination',
        sampleRequired: 'None (Imaging)',
        preparationInstructions: '6-hour fasting, full bladder for pelvis',
        testDuration: '30 minutes',
        reportTime: '4-6 hours',
        isActive: true,
        requiresAppointment: true,
        bookings: 167,
        lastUpdated: '2024-01-08'
      },
      // Cardiac Tests
      {
        id: '9',
        name: 'ECG (Electrocardiogram)',
        price: 200,
        category: 'Cardiac',
        department: 'Cardiology',
        description: 'Heart rhythm and electrical activity analysis',
        sampleRequired: 'None (Imaging)',
        preparationInstructions: 'Wear loose clothing, avoid caffeine',
        testDuration: '15 minutes',
        reportTime: '1-2 hours',
        isActive: true,
        requiresAppointment: false,
        bookings: 189,
        lastUpdated: '2024-01-10'
      },
      {
        id: '10',
        name: '2D Echocardiogram',
        price: 1200,
        category: 'Cardiac',
        department: 'Cardiology',
        description: 'Detailed heart structure and function assessment',
        sampleRequired: 'None (Imaging)',
        preparationInstructions: 'Wear comfortable clothing',
        testDuration: '45 minutes',
        reportTime: '4-6 hours',
        isActive: true,
        requiresAppointment: true,
        bookings: 78,
        lastUpdated: '2024-01-09'
      },
      // Specialized Tests
      {
        id: '11',
        name: 'COVID-19 RT-PCR',
        price: 800,
        category: 'Specialized',
        department: 'Microbiology',
        description: 'COVID-19 virus detection test',
        sampleRequired: 'Swab',
        preparationInstructions: 'Avoid eating/drinking 30 minutes before',
        testDuration: '5 minutes',
        reportTime: '24-48 hours',
        isActive: true,
        requiresAppointment: true,
        bookings: 234,
        lastUpdated: '2024-01-10'
      },
      {
        id: '12',
        name: 'Vitamin D3',
        price: 900,
        category: 'Specialized',
        department: 'Biochemistry',
        description: 'Vitamin D deficiency assessment',
        sampleRequired: 'Blood',
        preparationInstructions: 'No special preparation required',
        testDuration: '15 minutes',
        reportTime: '24-48 hours',
        isActive: true,
        requiresAppointment: false,
        bookings: 92,
        lastUpdated: '2024-01-08'
      }
    ];

    const initialPackages = [
      {
        id: 'pkg1',
        name: 'Basic Health Checkup',
        originalPrice: 1500,
        discountedPrice: 1199,
        description: 'Essential health screening package',
        includedTests: ['1', '2', '4', '9'], // CBC, Lipid, HbA1c, ECG
        category: 'Health Package',
        isActive: true,
        bookings: 67,
        savings: 301
      },
      {
        id: 'pkg2',
        name: 'Comprehensive Health Package',
        originalPrice: 4500,
        discountedPrice: 3499,
        description: 'Complete health assessment with imaging',
        includedTests: ['1', '2', '3', '4', '5', '6', '8', '9'], 
        category: 'Health Package',
        isActive: true,
        bookings: 34,
        savings: 1001
      },
      {
        id: 'pkg3',
        name: 'Cardiac Screening Package',
        originalPrice: 2000,
        discountedPrice: 1599,
        description: 'Complete heart health assessment',
        includedTests: ['2', '9', '10'], // Lipid, ECG, Echo
        category: 'Health Package',
        isActive: true,
        bookings: 23,
        savings: 401
      }
    ];

    setTests(initialTests);
    setTestPackages(initialPackages);
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredPackages = testPackages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getTestStats = () => {
    const totalTests = tests.length;
    const activeTests = tests.filter(t => t.isActive).length;
    const totalBookings = tests.reduce((sum, test) => sum + (test.bookings || 0), 0);
    const totalRevenue = tests.reduce((sum, test) => sum + ((test.bookings || 0) * test.price), 0);
    const totalPackages = testPackages.length;
    const packageBookings = testPackages.reduce((sum, pkg) => sum + (pkg.bookings || 0), 0);
    
    return {
      totalTests,
      activeTests,
      totalBookings,
      totalRevenue,
      totalPackages,
      packageBookings
    };
  };

  const handleAddTest = () => {
    if (!testForm.name || !testForm.price) {
      Alert.alert('Error', 'Please fill in test name and price');
      return;
    }

    const newTest = {
      id: Date.now().toString(),
      ...testForm,
      price: parseFloat(testForm.price),
      bookings: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    if (editingTest) {
      setTests(tests.map(test => test.id === editingTest.id ? { ...newTest, id: editingTest.id } : test));
    } else {
      setTests([...tests, newTest]);
    }

    resetTestForm();
    setShowAddModal(false);
    Alert.alert('Success', editingTest ? 'Test updated successfully!' : 'Test added successfully!');
  };

  const handleDeleteTest = (testId) => {
    Alert.alert(
      'Delete Test',
      'Are you sure you want to delete this test?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setTests(tests.filter(test => test.id !== testId));
            Alert.alert('Success', 'Test deleted successfully!');
          }
        }
      ]
    );
  };

  const handleEditTest = (test) => {
    setTestForm({
      name: test.name,
      price: test.price.toString(),
      category: test.category,
      department: test.department,
      description: test.description,
      sampleRequired: test.sampleRequired,
      preparationInstructions: test.preparationInstructions,
      testDuration: test.testDuration,
      reportTime: test.reportTime,
      isActive: test.isActive,
      requiresAppointment: test.requiresAppointment,
      isPackage: false
    });
    setEditingTest(test);
    setShowAddModal(true);
  };

  const resetTestForm = () => {
    setTestForm({
      name: '',
      price: '',
      category: 'Blood Test',
      department: 'Lab',
      description: '',
      sampleRequired: 'Blood',
      preparationInstructions: '',
      testDuration: '30 minutes',
      reportTime: '24 hours',
      isActive: true,
      requiresAppointment: false,
      isPackage: false
    });
    setEditingTest(null);
  };

  const renderStatsCards = () => {
    const stats = getTestStats();
    
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.kbrBlue }]}>
            <Ionicons name="flask" size={24} color="#FFFFFF" />
            <Text style={styles.statValue}>{stats.totalTests}</Text>
            <Text style={styles.statLabel}>Total Tests</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.kbrGreen }]}>
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.statValue}>{stats.activeTests}</Text>
            <Text style={styles.statLabel}>Active Tests</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.kbrPurple }]}>
            <Ionicons name="calendar" size={24} color="#FFFFFF" />
            <Text style={styles.statValue}>{stats.totalBookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.kbrRed }]}>
            <Ionicons name="cash" size={24} color="#FFFFFF" />
            <Text style={styles.statValue}>₹{(stats.totalRevenue / 1000).toFixed(0)}K</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTestCard = (test) => (
    <View key={test.id} style={styles.testCard}>
      <View style={styles.testHeader}>
        <View style={styles.testInfo}>
          <Text style={styles.testName}>{test.name}</Text>
          <View style={styles.testMeta}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(test.category) }]}>
              <Text style={styles.categoryText}>{test.category}</Text>
            </View>
            <Text style={styles.departmentText}>{test.department}</Text>
          </View>
        </View>
        <View style={styles.testPrice}>
          <Text style={styles.priceText}>₹{test.price}</Text>
          <View style={styles.testActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditTest(test)}
            >
              <Ionicons name="create" size={18} color={Colors.kbrBlue} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteTest(test.id)}
            >
              <Ionicons name="trash" size={18} color={Colors.kbrRed} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <Text style={styles.testDescription}>{test.description}</Text>
      
      <View style={styles.testDetails}>
        <View style={styles.testDetailItem}>
          <Ionicons name="time" size={14} color="#666" />
          <Text style={styles.testDetailText}>{test.testDuration}</Text>
        </View>
        <View style={styles.testDetailItem}>
          <Ionicons name="document-text" size={14} color="#666" />
          <Text style={styles.testDetailText}>Report: {test.reportTime}</Text>
        </View>
        <View style={styles.testDetailItem}>
          <Ionicons name="water" size={14} color="#666" />
          <Text style={styles.testDetailText}>{test.sampleRequired}</Text>
        </View>
      </View>
      
      <View style={styles.testFooter}>
        <View style={styles.testStatus}>
          <View style={[styles.statusDot, { backgroundColor: test.isActive ? Colors.kbrGreen : '#ccc' }]} />
          <Text style={styles.statusText}>{test.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
        <View style={styles.testBookings}>
          <Ionicons name="people" size={14} color="#666" />
          <Text style={styles.bookingsText}>{test.bookings} bookings</Text>
        </View>
        <View style={styles.appointmentType}>
          <Ionicons name={test.requiresAppointment ? "calendar" : "flash"} size={14} color="#666" />
          <Text style={styles.appointmentText}>
            {test.requiresAppointment ? 'Scheduled' : 'Immediate'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPackageCard = (pkg) => (
    <View key={pkg.id} style={styles.packageCard}>
      <View style={styles.packageHeader}>
        <View style={styles.packageInfo}>
          <Text style={styles.packageName}>{pkg.name}</Text>
          <Text style={styles.packageDescription}>{pkg.description}</Text>
        </View>
        <View style={styles.packagePricing}>
          <Text style={styles.originalPrice}>₹{pkg.originalPrice}</Text>
          <Text style={styles.discountedPrice}>₹{pkg.discountedPrice}</Text>
          <Text style={styles.savings}>Save ₹{pkg.savings}</Text>
        </View>
      </View>
      
      <View style={styles.packageTests}>
        <Text style={styles.includedTestsTitle}>Included Tests ({pkg.includedTests.length}):</Text>
        {pkg.includedTests.map(testId => {
          const test = tests.find(t => t.id === testId);
          return test ? (
            <Text key={testId} style={styles.includedTestName}>• {test.name}</Text>
          ) : null;
        })}
      </View>
      
      <View style={styles.packageFooter}>
        <View style={styles.packageStats}>
          <Text style={styles.packageBookings}>{pkg.bookings} bookings</Text>
        </View>
        <View style={styles.packageActions}>
          <TouchableOpacity style={styles.editPackageButton}>
            <Ionicons name="create" size={16} color={Colors.kbrBlue} />
            <Text style={styles.editPackageText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const getCategoryColor = (category) => {
    const colors = {
      'Blood Test': '#E3F2FD',
      'Imaging': '#F3E5F5',
      'Cardiac': '#FFEBEE',
      'Specialized': '#E8F5E8',
      'Urine Test': '#FFF3E0',
      'Health Package': '#F1F8E9'
    };
    return colors[category] || '#F5F5F5';
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={true} />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <AppHeader 
          title="Test Management"
          showBackButton={true}
          useSimpleAdminHeader={true}
          navigation={navigation}
        />
        
        {/* Add Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Test</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'tests' && styles.activeTab]}
            onPress={() => setCurrentTab('tests')}
          >
            <Ionicons name="flask" size={20} color={currentTab === 'tests' ? Colors.kbrBlue : '#666'} />
            <Text style={[styles.tabText, currentTab === 'tests' && styles.activeTabText]}>
              Tests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'packages' && styles.activeTab]}
            onPress={() => setCurrentTab('packages')}
          >
            <Ionicons name="albums" size={20} color={currentTab === 'packages' ? Colors.kbrBlue : '#666'} />
            <Text style={[styles.tabText, currentTab === 'packages' && styles.activeTabText]}>
              Packages
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'results' && styles.activeTab]}
            onPress={() => setCurrentTab('results')}
          >
            <Ionicons name="document-text" size={20} color={currentTab === 'results' ? Colors.kbrBlue : '#666'} />
            <Text style={[styles.tabText, currentTab === 'results' && styles.activeTabText]}>
              Results
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tests..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
            {testCategories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.activeCategoryButton
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.activeCategoryButtonText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {currentTab === 'tests' && (
            <View style={styles.testsContainer}>
              {filteredTests.map(renderTestCard)}
            </View>
          )}
          
          {currentTab === 'packages' && (
            <View style={styles.packagesContainer}>
              {filteredPackages.map(renderPackageCard)}
            </View>
          )}
          
          {currentTab === 'results' && (
            <View style={styles.resultsContainer}>
              <Text style={styles.comingSoonText}>Test Results Management</Text>
              <Text style={styles.comingSoonSubtext}>Coming Soon...</Text>
            </View>
          )}
        </ScrollView>

        {/* Add Test Modal */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            resetTestForm();
            setShowAddModal(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingTest ? 'Edit Test' : 'Add New Test'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    resetTestForm();
                    setShowAddModal(false);
                  }}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Test Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Enter test name"
                    value={testForm.name}
                    onChangeText={(text) => setTestForm({ ...testForm, name: text })}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.formLabel}>Price (₹) *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0"
                      keyboardType="numeric"
                      value={testForm.price}
                      onChangeText={(text) => setTestForm({ ...testForm, price: text })}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.formLabel}>Category</Text>
                    <View style={styles.pickerContainer}>
                      <Text style={styles.pickerText}>{testForm.category}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.formLabel}>Department</Text>
                    <View style={styles.pickerContainer}>
                      <Text style={styles.pickerText}>{testForm.department}</Text>
                    </View>
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.formLabel}>Sample Required</Text>
                    <View style={styles.pickerContainer}>
                      <Text style={styles.pickerText}>{testForm.sampleRequired}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    placeholder="Enter test description"
                    multiline={true}
                    numberOfLines={3}
                    value={testForm.description}
                    onChangeText={(text) => setTestForm({ ...testForm, description: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Preparation Instructions</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    placeholder="Enter preparation instructions"
                    multiline={true}
                    numberOfLines={2}
                    value={testForm.preparationInstructions}
                    onChangeText={(text) => setTestForm({ ...testForm, preparationInstructions: text })}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.formLabel}>Test Duration</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g., 30 minutes"
                      value={testForm.testDuration}
                      onChangeText={(text) => setTestForm({ ...testForm, testDuration: text })}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.formLabel}>Report Time</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g., 24 hours"
                      value={testForm.reportTime}
                      onChangeText={(text) => setTestForm({ ...testForm, reportTime: text })}
                    />
                  </View>
                </View>

                <View style={styles.switchRow}>
                  <View style={styles.switchItem}>
                    <Text style={styles.switchLabel}>Test is Active</Text>
                    <Switch
                      value={testForm.isActive}
                      onValueChange={(value) => setTestForm({ ...testForm, isActive: value })}
                      trackColor={{ false: '#767577', true: Colors.kbrBlue }}
                      thumbColor={testForm.isActive ? '#FFFFFF' : '#f4f3f4'}
                    />
                  </View>
                  <View style={styles.switchItem}>
                    <Text style={styles.switchLabel}>Requires Appointment</Text>
                    <Switch
                      value={testForm.requiresAppointment}
                      onValueChange={(value) => setTestForm({ ...testForm, requiresAppointment: value })}
                      trackColor={{ false: '#767577', true: Colors.kbrBlue }}
                      thumbColor={testForm.requiresAppointment ? '#FFFFFF' : '#f4f3f4'}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    resetTestForm();
                    setShowAddModal(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddTest}
                >
                  <Text style={styles.saveButtonText}>
                    {editingTest ? 'Update Test' : 'Add Test'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  header: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButtonContainer: {
    padding: 16,
    alignItems: 'flex-end',
  },
  addButton: {
    backgroundColor: Colors.kbrBlue,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.kbrBlue,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.kbrBlue,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  activeTabText: {
    color: Colors.kbrBlue,
    fontWeight: '600',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  categoryFilter: {
    flexDirection: 'row',
  },
  categoryButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeCategoryButton: {
    backgroundColor: Colors.kbrBlue,
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeCategoryButtonText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  testsContainer: {
    paddingVertical: 8,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  testMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 10,
    color: '#333',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.kbrBlue,
    marginBottom: 4,
  },
  testActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  testDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  testDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  testDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  testFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  testStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  testBookings: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  appointmentType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  packagesContainer: {
    paddingVertical: 8,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.kbrGreen,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
  },
  packagePricing: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.kbrGreen,
  },
  savings: {
    fontSize: 12,
    color: Colors.kbrRed,
    fontWeight: '500',
  },
  packageTests: {
    marginBottom: 12,
  },
  includedTestsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  includedTestName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  packageStats: {
    flex: 1,
  },
  packageBookings: {
    fontSize: 12,
    color: '#666',
  },
  packageActions: {
    flexDirection: 'row',
  },
  editPackageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editPackageText: {
    fontSize: 12,
    color: Colors.kbrBlue,
    marginLeft: 4,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#999',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalForm: {
    padding: 16,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  pickerText: {
    fontSize: 16,
    color: '#374151',
  },
  switchRow: {
    marginBottom: 16,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: Colors.kbrBlue,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default TestManagementScreen;