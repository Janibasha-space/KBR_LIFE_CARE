# Backend Connection Guide for KBR Life Care App

## Overview
This guide explains how to connect your React Native app with different backend technologies.

## Prerequisites
- Backend server running and accessible
- API endpoints documented
- Authentication mechanism decided
- Database configured (if applicable)

## Supported Backend Types

### 1. Node.js/Express Backend

#### Backend Setup Requirements:
```javascript
// Example Express server structure
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

#### Required API Endpoints:
- POST /api/auth/login
- POST /api/auth/register  
- POST /api/auth/logout
- GET /api/auth/verify
- GET /api/patients/:id
- POST /api/appointments
- GET /api/appointments
- GET /api/doctors

### 2. Django/Python Backend

#### Update API Configuration:
```javascript
// In src/config/api.config.js
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8000/api', // Django default port
    timeout: 10000,
  }
};
```

#### Required Django URLs:
```python
# urls.py
urlpatterns = [
    path('api/auth/', include('authentication.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/doctors/', include('doctors.urls')),
]
```

### 3. Spring Boot/Java Backend

#### Update API Configuration:
```javascript
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8080/api', // Spring Boot default port
    timeout: 10000,
  }
};
```

#### Required Controller Endpoints:
```java
@RestController
@RequestMapping("/api")
public class HospitalController {
    
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) { }
    
    @GetMapping("/patients/{id}")
    public ResponseEntity<?> getPatient(@PathVariable Long id) { }
    
    @PostMapping("/appointments")
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) { }
}
```

### 4. PHP/Laravel Backend

#### Update API Configuration:
```javascript
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8000/api', // Laravel Artisan serve port
    timeout: 10000,
  }
};
```

#### Required Laravel Routes:
```php
// routes/api.php
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('logout', [AuthController::class, 'logout']);
});

Route::middleware('auth:api')->group(function () {
    Route::apiResource('patients', PatientController::class);
    Route::apiResource('appointments', AppointmentController::class);
    Route::apiResource('doctors', DoctorController::class);
});
```

## API Response Format

### Standardized Response Structure:
```javascript
// Success Response
{
  "success": true,
  "data": {
    // Actual data here
  },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Authentication Response:
```javascript
// Login Success
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient"
    }
  }
}
```

## Backend Security Requirements

### 1. CORS Configuration
Your backend must allow requests from your app:
```javascript
// Express.js
app.use(cors({
  origin: ['http://localhost:19006', 'exp://192.168.1.100:19000'], // Expo dev URLs
  credentials: true
}));
```

### 2. JWT Token Authentication
```javascript
// Backend JWT middleware example
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

### 3. Input Validation
```javascript
// Example validation middleware
const validateAppointment = (req, res, next) => {
  const { doctorId, patientId, dateTime } = req.body;
  
  if (!doctorId || !patientId || !dateTime) {
    return res.status(400).json({
      error: 'Missing required fields'
    });
  }
  
  next();
};
```

## Testing Your Backend Connection

### 1. Test API Endpoints
Use the example screen we created (`ExampleApiUsageScreen.js`) to test your endpoints.

### 2. Network Debugging
Enable network debugging in your app:
```javascript
// In development, log all API requests
if (__DEV__) {
  console.log('API Request:', method, url, data);
}
```

### 3. Common Issues & Solutions

#### Issue: CORS Error
**Solution:** Configure CORS on your backend to allow requests from your app's domain.

#### Issue: Network Request Failed
**Solutions:**
- Check if backend server is running
- Verify the correct IP address and port
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For iOS simulator, `localhost` should work

#### Issue: 401 Unauthorized
**Solutions:**
- Check if token is being sent correctly
- Verify token format (Bearer token)
- Check token expiration

#### Issue: Timeout Errors
**Solutions:**
- Increase timeout in API config
- Optimize backend response time
- Check network connectivity

## Database Integration

### Required Tables Structure:
```sql
-- Users/Patients table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role ENUM('patient', 'doctor', 'admin') DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  specialty VARCHAR(100),
  license_number VARCHAR(50),
  experience_years INT
);

-- Appointments table
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES users(id),
  doctor_id INT REFERENCES doctors(id),
  appointment_date DATETIME,
  status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment Considerations

### 1. Environment Variables
Update your production API URL in the config:
```javascript
production: {
  baseURL: 'https://your-production-api.com/api',
  timeout: 15000,
}
```

### 2. SSL/HTTPS
Ensure your production backend uses HTTPS for security.

### 3. Rate Limiting
Implement rate limiting on your backend to prevent abuse.

### 4. Error Logging
Set up proper error logging on both frontend and backend.

## Next Steps

1. **Set up your backend server** using one of the supported technologies
2. **Configure the API endpoints** according to the specifications above
3. **Update the API configuration** in your app to point to your backend
4. **Test the connection** using the example screen
5. **Implement proper error handling** and user feedback
6. **Set up authentication flow** in your app screens
7. **Deploy and configure production environment**

For any specific backend technology setup, refer to the respective documentation and ensure all security best practices are followed.