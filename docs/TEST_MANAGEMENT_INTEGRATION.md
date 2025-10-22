# Test Management System Integration

This document explains how the test management system in KBR LIFE CARE is integrated between the admin and patient interfaces.

## Overview

The test management system allows hospital administrators to add, edit, and delete diagnostic tests in the admin dashboard. These tests are then displayed to patients in the Services screen, where they can view tests by category and book appointments for specific tests.

## Key Components

### 1. Admin Interface (TestManagementScreen.js)

The admin interface allows hospital staff to:
- Add new diagnostic tests with detailed information
- Edit existing tests
- Delete tests
- View test statistics

Tests are stored in the Firebase 'tests' collection with the following key fields:
- `name`: The name of the test
- `price`: The cost of the test
- `category`: The test category (Blood Test, Imaging, Cardiac, etc.)
- `description`: Detailed description of the test
- `sampleRequired`: Type of sample needed (Blood, Urine, etc.)
- `testDuration`: How long the test takes
- `reportTime`: Time taken for results to be available
- `isActive`: Whether the test is currently offered

### 2. Patient Interface

#### ServicesScreen.js
- Displays test categories with count of available tests
- Fetches tests from Firebase using `FirebaseTestService.getTests()`
- Groups tests by category and displays count
- When a user clicks on a test category, navigates to DiagnosticTestsScreen with category info

#### DiagnosticTestsScreen.js
- Displays all tests for the selected category
- Receives category and test data from ServicesScreen
- Allows patients to book appointments for specific tests

## Data Flow

1. **Admin adds/updates a test:**
   - Admin enters test details in TestManagementScreen
   - Test is saved to Firebase 'tests' collection via FirebaseTestService.createTest()

2. **Patient views available tests:**
   - ServicesScreen loads tests from Firebase using FirebaseTestService.getTests()
   - Tests are counted by category and displayed in test category cards
   - Patient clicks on a category (e.g., "Blood Tests")

3. **Patient sees tests in selected category:**
   - Navigation to DiagnosticTestsScreen with category and test data
   - DiagnosticTestsScreen displays filtered tests
   - Patient can select a test and book an appointment

## Firebase Structure

The tests are stored in the 'tests' collection in Firebase with the following structure:

```json
{
  "tests": {
    "testId1": {
      "name": "Complete Blood Count",
      "price": 500,
      "category": "Blood Test",
      "description": "...",
      "sampleRequired": "Blood",
      "testDuration": "15 minutes",
      "reportTime": "24 hours",
      "isActive": true
    },
    "testId2": {
      ...
    }
  }
}
```

## Implementation Details

### Test Category Mapping

The system maps test categories between admin and patient interfaces:

- **Admin categories** are entered as free text fields in the test form
- **Patient interface** groups these tests by filtering on common category terms:
  - "Blood Test" → Shows in "Blood Tests" category
  - "Imaging" → Shows in "Imaging Tests" category
  - "Cardiac" → Shows in "Cardiac Tests" category

### Test Counts

Test counts in the Services screen are dynamically calculated by:
1. Fetching all tests from Firebase
2. Filtering tests by category keywords
3. Counting the number of tests in each category
4. Displaying the count on the category card

## How to Add a New Test Category

To add a new test category:

1. Update the `testCategories` array in ServicesScreen.js to include the new category
2. Add a matching filter in the `getTestCountsByCategory()` function in ServicesScreen.js
3. Update the `getCategoryFilter()` function in DiagnosticTestsScreen.js to handle the new category

## Troubleshooting

If tests aren't showing up in the patient interface:

1. Check if the test is marked as `isActive: true` in the admin interface
2. Verify the test's category matches one of the filtered categories
3. Check the Firebase database to ensure the test was saved correctly
4. Verify network connectivity and Firebase permissions

## Future Enhancements

Planned improvements for the test management system:

1. Add search functionality in DiagnosticTestsScreen
2. Implement test packages (combinations of tests at discounted rates)
3. Add test preparation instructions for patients
4. Implement test result upload and viewing functionality
5. Add notifications for test booking confirmations and result availability