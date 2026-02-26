# Admin Panel API Integration Documentation

This document provides all the necessary details for integrating the Admin Panel frontend with the backend API.

## Base URL
The API base URL is configured via your environment variables.
**Base Path:** `http://localhost:5000/admin` (Update based on your environment, e.g., `VITE_API_BASE_URL`)

---

## 1. Global Response Format
All endpoints return a standardized JSON response:

```json
{
  "success": boolean,
  "data": object | null,
  "message": "Descriptive message string"
}
```

---

## 2. Authentication Module

### Login
**Endpoint:** `POST /login`  
**Description:** Authenticates user and returns tokens.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your_secure_password"
}
```

**Successful Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "admin@example.com",
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  },
  "message": "Login successful"
}
```

### Logout
**Endpoint:** `POST /auth/logout`  
**Description:** Invalidates the current session.  
**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 3. Password Management

### Forgot Password
**Endpoint:** `POST /forgot-password`  
**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

### Change Password (Logged In)
**Endpoint:** `POST /change-password`  
**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## 4. Profile Module (Standardized)

### Get Profile
**Endpoint:** `GET /admin-profile`  
**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "avatar": "https://your-bucket.s3.region.amazonaws.com/avatars/unique-id.jpg"
  }
}
```

### Update Profile
**Endpoint:** `PUT /admin-profile`  
**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### Upload Avatar
**Endpoint:** `POST /admin-profile/avatar`  
**Content-Type:** `multipart/form-data`  
**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
- `file`: (Binary File) The image to be uploaded.

**Response:**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://your-bucket.s3.region.amazonaws.com/avatars/new-image-id.jpg"
  },
  "message": "Avatar uploaded successfully"
}
```

---

## 5. Implementation Tips (Frontend)

### Axios Interceptor for Authorization
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/admin',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Handling Avatar Upload
```javascript
const handleAvatarUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/admin-profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Upload failed', error);
  }
};
```
