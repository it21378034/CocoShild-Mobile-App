# 🔥 Firebase Services Setup Guide

## 🎯 Current Status: Firebase Config ✅ Ready, Services ⚠️ Need Setup

Your Firebase configuration is now working, but you need to enable Firebase services to make authentication work.

## 📋 Required Firebase Services Setup:

### 1. Enable Firebase Authentication

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your "cocoshield" project**
3. **Click "Authentication"** in the left sidebar
4. **Click "Get started"**
5. **Go to "Sign-in method" tab**
6. **Enable "Email/Password"**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### 2. Create Admin User

1. **In Authentication section**, go to "Users" tab
2. **Click "Add user"**
3. **Enter admin credentials**:
   - Email: `admin@cocoshield.com`
   - Password: `admin@123`
4. **Click "Add user"**

### 3. Create Firestore Database

1. **Go to "Firestore Database"** in the left sidebar
2. **Click "Create database"**
3. **Choose "Start in test mode"** (for development)
4. **Select a location** (choose closest to your users)
5. **Click "Done"**

### 4. Set Up Firestore Security Rules

1. **In Firestore Database**, go to "Rules" tab
2. **Replace the rules with**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
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

3. **Click "Publish"**

### 5. Create Admin User Document in Firestore

1. **In Firestore Database**, go to "Data" tab
2. **Click "Start collection"**
3. **Collection ID**: `users`
4. **Document ID**: Use the UID from the admin user you created
5. **Add fields**:
   ```
   uid: "admin-uid-from-auth"
   email: "admin@cocoshield.com"
   role: "admin"
   displayName: "Administrator"
   emailVerified: true
   createdAt: [current timestamp]
   ```

## 🧪 Testing the Setup

### Automatic Tests (Already Running):
- ✅ Firebase connection test
- ✅ Configuration validation
- ✅ Firebase Auth initialization test

### Manual Tests (Use the "Test Firebase Auth" button):
1. **Click "Test Firebase Auth"** button on login screen
2. **Check console logs** for detailed results
3. **Expected results**:
   - Auth: ✅ (Firebase Auth initialized)
   - Admin: ✅ (Admin login successful) - after creating admin user

### Console Logs to Look For:
```
🧪 Testing Firebase connection...
✅ Firebase test result: { auth: true, firestore: true, success: true }
🔧 Config check: { isValid: true, message: 'Firebase config is valid' }
🔐 Testing Firebase Auth...
📊 Firebase Auth test: { auth: true, firestore: true, success: true }
👑 Checking admin user...
📊 Admin user check: { success: true, message: 'Admin user check completed' }
```

## 🚨 Common Issues & Solutions:

### "Admin user not found"
- **Solution**: Create admin user in Firebase Authentication
- **Steps**: Authentication → Users → Add user

### "Permission denied"
- **Solution**: Set up Firestore security rules
- **Steps**: Firestore → Rules → Update rules

### "Firebase Auth not initialized"
- **Solution**: Check Firebase config values
- **Steps**: Verify all config values are correct

### "Network request failed"
- **Solution**: Check internet connection and Firebase project status
- **Steps**: Verify project is active in Firebase Console

## 🎯 Expected Results After Setup:

1. **Firebase Status**: 🟢 Green dot with "Firebase Connected"
2. **Admin Login**: Should work with `admin` / `admin@123`
3. **User Registration**: Should work with email verification
4. **Data Storage**: Disease cases and officers stored in Firestore

## 📞 Need Help?

1. **Check Console Logs**: Look for specific error messages
2. **Verify Services**: Ensure Authentication and Firestore are enabled
3. **Test Step by Step**: Use the test button to verify each component
4. **Check Firebase Console**: Verify project status and services

---

**Next Step**: Once services are enabled, try logging in with admin credentials! 🚀 