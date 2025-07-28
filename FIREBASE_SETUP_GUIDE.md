# 🔥 Firebase Setup Guide for CocoShield

## 📋 Prerequisites
- Google account
- Node.js and npm installed
- Firebase CLI (optional but recommended)

## 🚀 Step-by-Step Setup

### 1. Create Firebase Project

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create New Project**:
   - Click "Add project"
   - Project name: `CocoShield`
   - Enable Google Analytics (optional)
   - Click "Create project"

### 2. Enable Authentication

1. **In Firebase Console**:
   - Go to "Authentication" → "Sign-in method"
   - Enable "Email/Password"
   - Click "Save"

2. **Create Admin User**:
   - Go to "Authentication" → "Users"
   - Click "Add user"
   - Email: `admin@cocoshield.com`
   - Password: `admin@123`
   - Click "Add user"

### 3. Set Up Firestore Database

1. **Create Database**:
   - Go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select location closest to your users
   - Click "Done"

2. **Set Up Security Rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Admin can read/write all data
       match /{document=**} {
         allow read, write: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
     }
   }
   ```

### 4. Get Firebase Configuration

1. **Project Settings**:
   - Click gear icon → "Project settings"
   - Scroll to "Your apps"
   - Click "Add app" → "Web"
   - App nickname: `CocoShield Web`
   - Click "Register app"

2. **Copy Configuration**:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key-here",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

### 5. Update App Configuration

1. **Update `mobile/config/firebase.ts`**:
   - Replace the placeholder config with your actual Firebase config
   - The file is already set up with the correct structure

2. **Switch to Firebase Auth** (Optional):
   - Update `mobile/contexts/AuthContext.tsx` to use `firebaseAuthService` instead of `authService`
   - This enables real Firebase authentication

### 6. Initialize Database Data

1. **Create Admin User Document**:
   ```javascript
   // In Firestore, create a document in 'users' collection
   {
     uid: "admin-user-uid",
     email: "admin@cocoshield.com",
     role: "admin",
     displayName: "Administrator",
     emailVerified: true
   }
   ```

2. **Add Initial Disease Cases**:
   ```javascript
   // In Firestore, create documents in 'diseaseCases' collection
   {
     province: "Northern Province",
     count: 63,
     risk: "high",
     latitude: 9.7,
     longitude: 80.0,
     lastUpdated: new Date()
   }
   ```

3. **Add Initial Officers**:
   ```javascript
   // In Firestore, create documents in 'officers' collection
   {
     district: "Colombo",
     officer: "Mr. Kamal Perera",
     phone: "+94712345678",
     email: "kamal.perera@agri.gov.lk",
     createdAt: new Date()
   }
   ```

## 🔧 Configuration Files

### Firebase Config (`mobile/config/firebase.ts`)
```typescript
export const firebaseConfig: FirebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Environment Variables (Optional)
Create `.env` file in mobile directory:
```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

## 🧪 Testing Firebase Connection

1. **Test Authentication**:
   - Try logging in with admin credentials
   - Check Firebase Console → Authentication → Users

2. **Test Firestore**:
   - Add/edit disease cases or officers
   - Check Firebase Console → Firestore Database

3. **Check Console Logs**:
   - Look for Firebase connection errors
   - Verify data is being saved/retrieved

## 🔒 Security Considerations

1. **Firestore Rules**: Update security rules for production
2. **API Keys**: Never commit real API keys to version control
3. **Admin Access**: Limit admin functionality to authorized users
4. **Data Validation**: Validate all data before saving to Firestore

## 🚨 Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**:
   - Check if Firebase is initialized multiple times
   - Ensure single initialization in `firebase.ts`

2. **"Permission denied"**:
   - Check Firestore security rules
   - Verify user authentication status

3. **"Network request failed"**:
   - Check internet connection
   - Verify Firebase project settings
   - Check API key validity

4. **"User not found"**:
   - Verify user exists in Firebase Auth
   - Check if user document exists in Firestore

## 📱 Next Steps

1. **Enable Real-time Updates**: Use Firestore listeners for live data
2. **Add Image Storage**: Integrate Firebase Storage for profile images
3. **Push Notifications**: Add Firebase Cloud Messaging
4. **Analytics**: Enable Firebase Analytics for user insights
5. **Crashlytics**: Add Firebase Crashlytics for error tracking

## 📞 Support

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com/
- React Native Firebase: https://rnfirebase.io/

---

**Note**: This guide assumes you're using the web version of Firebase for React Native. For native Firebase integration, additional setup steps may be required. 