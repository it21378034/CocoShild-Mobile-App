# 🔥 Firebase Configuration Update Guide

## 🚨 Current Status: Placeholder Config Detected

Your Firebase configuration currently has placeholder values. You need to replace them with real Firebase project values.

## 📋 Step-by-Step Instructions:

### 1. Get Your Firebase Config

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your CocoShield project** (or create one if you haven't)
3. **Click the gear icon** ⚙️ next to "Project Overview"
4. **Select "Project settings"**
5. **Scroll down to "Your apps"** section
6. **Click the web app** (</>) or create one if none exists
7. **Copy the configuration object**

### 2. Update the Configuration File

Replace the values in `mobile/config/firebase.ts`:

**Current (Placeholder):**
```typescript
export const firebaseConfig: FirebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

**Replace with your real values:**
```typescript
export const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyC...", // Your actual API key
  authDomain: "cocoshield-xxxxx.firebaseapp.com", // Your actual auth domain
  projectId: "cocoshield-xxxxx", // Your actual project ID
  storageBucket: "cocoshield-xxxxx.appspot.com", // Your actual storage bucket
  messagingSenderId: "123456789012", // Your actual sender ID
  appId: "1:123456789012:web:abcdef123456" // Your actual app ID
};
```

### 3. Enable Firebase Services

After updating the config, you need to enable Firebase services:

#### **Authentication:**
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Create admin user: `admin@cocoshield.com` / `admin@123`

#### **Firestore Database:**
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode**
4. Select a location (choose closest to your users)

### 4. Test the Configuration

After updating the config:

1. **Restart your Expo development server**:
   ```bash
   npm start
   ```

2. **Check the Firebase status indicator** on the login screen:
   - 🟢 **Green dot**: Configuration is valid
   - 🔴 **Red dot**: Still has issues

3. **Check console logs** for:
   ```
   ✅ Firebase test result: { auth: true, firestore: true, success: true }
   🔧 Config check: { isValid: true, message: 'Firebase config is valid' }
   ```

## 🔧 Quick Update Commands:

If you want to quickly update the config file, you can:

1. **Open** `mobile/config/firebase.ts`
2. **Replace** the `firebaseConfig` object with your real values
3. **Save** the file
4. **Restart** the development server

## 🚨 Common Issues:

### "Invalid API key"
- **Solution**: Make sure you copied the entire API key from Firebase Console

### "Project not found"
- **Solution**: Verify your `projectId` matches exactly

### "Permission denied"
- **Solution**: Enable Authentication and Firestore in Firebase Console

### "Network request failed"
- **Solution**: Check your internet connection and Firebase project status

## 📞 Need Help?

1. **Double-check** all config values match exactly
2. **Ensure** Firebase services are enabled
3. **Verify** your project is active in Firebase Console
4. **Check** console logs for specific error messages

---

**Next Step**: Once you update the config, the Firebase status indicator should turn green! 🎉 