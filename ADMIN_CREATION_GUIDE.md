# 🔐 Secure Admin User Creation Guide

## 🚨 Security Notice

The admin signup toggle has been removed from the signup screen for security reasons. Admin users should only be created through Firebase Console by authorized administrators.

## 📋 How to Create Admin Users Securely:

### **Method 1: Firebase Console (Recommended)**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your "cocoshield" project**
3. **Go to Authentication** → **Users**
4. **Click "Add user"**
5. **Enter admin credentials**:
   - Email: `admin@cocoshield.com` (or your admin email)
   - Password: `admin@123`
6. **Click "Add user"**

### **Method 2: Update User Role in Firestore**

1. **Go to Firestore Database** → **Data**
2. **Find the user document** in the `users` collection
3. **Edit the document** and change:
   ```json
   {
     "role": "admin"
   }
   ```

### **Method 3: Programmatic Admin Creation (For Developers)**

If you need to create admin users programmatically, you can:

1. **Use Firebase Admin SDK** (server-side only)
2. **Create a secure admin creation endpoint**
3. **Use Firebase Functions** with proper authentication

## 🔒 Security Best Practices:

### **✅ Do's:**
- Create admin users only through Firebase Console
- Use strong, unique passwords for admin accounts
- Limit the number of admin users
- Regularly audit admin user list
- Use email verification for admin accounts

### **❌ Don'ts:**
- Don't expose admin creation in the app UI
- Don't use predictable admin passwords
- Don't share admin credentials
- Don't create admin accounts from client-side code

## 🎯 Current Admin Access:

### **Admin Login Credentials:**
- **Username**: `admin` or `admin@cocoshield.com`
- **Password**: `admin@123`

### **Admin Features Available:**
- ✅ **Disease Map**: Edit disease case counts
- ✅ **Support Screen**: Manage district agriculture officers
- ✅ **Admin Settings**: Additional admin-only options

## 📞 Need Help?

1. **Contact your system administrator** for admin account creation
2. **Use Firebase Console** to manage admin users
3. **Check Firestore security rules** to ensure proper access control

---

**Status**: Admin signup toggle removed ✅, Secure admin creation guide provided ✅ 