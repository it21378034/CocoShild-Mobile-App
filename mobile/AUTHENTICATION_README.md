# CocoShield Authentication System

## Overview
CocoShield now includes a comprehensive authentication system with support for both admin and regular user accounts. The system uses a mock Firebase-like authentication service that can be easily replaced with actual Firebase when needed.

## Features

### 🔐 **Authentication Types**
- **Admin Login**: Username/password authentication for administrators
- **User Login**: Email/password authentication for regular users
- **User Signup**: Email-based registration with validation

### 👤 **User Roles**
- **Admin**: Full access to all features
- **User**: Standard access to app features

### 🛡️ **Security Features**
- Password validation (minimum 6 characters)
- Email format validation
- Password confirmation for signup
- Session persistence using AsyncStorage
- Secure logout functionality

## Admin Credentials
```
Username: admin
Password: admin@123
```

## User Authentication
- Users can sign up with any valid email address
- Password must be at least 6 characters long
- Email verification is simulated (set to true for demo)

## File Structure

```
mobile/
├── config/
│   └── firebase.ts          # Firebase configuration and types
├── services/
│   └── authService.ts       # Authentication service logic
├── contexts/
│   └── AuthContext.tsx      # React context for auth state
├── app/
│   ├── _layout.tsx          # Root layout with auth flow
│   └── auth/
│       ├── login.tsx        # Login screen
│       └── signup.tsx       # Signup screen
└── (tabs)/
    └── index.tsx            # Dashboard with logout functionality
```

## Usage

### Login Screen
- Toggle between "User Login" and "Admin Login"
- Admin login uses username/password
- User login uses email/password
- Includes demo credentials display

### Signup Screen
- Email and password registration
- Password confirmation
- Form validation
- Terms and privacy notice

### Dashboard
- Logout button in header
- Confirmation dialog before logout
- Automatic redirect to login after logout

## Technical Implementation

### AuthService
- Singleton pattern for service management
- AsyncStorage for session persistence
- Mock user validation (replace with Firebase)
- Error handling and validation

### AuthContext
- React Context for global auth state
- Automatic auth status checking
- User state management
- Loading states

### Navigation Flow
1. App starts with splash screen
2. Checks authentication status
3. Routes to login if not authenticated
4. Routes to main app if authenticated

## Firebase Integration (Future)

To integrate with actual Firebase:

1. **Update Firebase Config** (`config/firebase.ts`):
```typescript
export const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

2. **Install Firebase Dependencies**:
```bash
npm install firebase @react-native-firebase/app @react-native-firebase/auth
```

3. **Update AuthService** to use actual Firebase methods:
- Replace mock validation with Firebase Auth
- Implement real email verification
- Add password reset functionality
- Enable social login options

## Demo Mode

The current implementation includes a demo mode that:
- Allows any valid email/password combination for user login
- Uses hardcoded admin credentials
- Simulates email verification
- Stores user data in AsyncStorage

## Security Notes

⚠️ **Important**: This is a demo implementation. For production:
- Replace mock authentication with real Firebase Auth
- Implement proper email verification
- Add password strength requirements
- Enable two-factor authentication
- Use secure storage for sensitive data
- Implement proper session management

## Testing

### Admin Login
1. Open the app
2. Select "Admin Login"
3. Enter: `admin` / `admin@123`
4. Should redirect to dashboard

### User Signup/Login
1. Open the app
2. Select "User Login"
3. Click "Sign Up"
4. Enter valid email and password
5. Complete signup
6. Login with same credentials

### Logout
1. From dashboard, tap logout icon
2. Confirm logout
3. Should redirect to login screen 