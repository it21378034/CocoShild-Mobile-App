# Firebase Report System Setup Guide

This guide will help you set up the Firebase-based report system with email notifications for the CocoShield app.

## 🚀 **Quick Setup Steps**

### 1. **Firebase Project Setup**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Firestore Database
4. Set up Authentication (Email/Password, Google, Facebook)

### 2. **Firebase Configuration**

Update your `mobile/config/firebase.ts` with your project credentials:

```typescript
// Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. **Firestore Security Rules**

Set up Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own reports
    match /reportCases/{reportId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.role == 'admin');
    }
    
    // Admins can read all reports
    match /reportCases/{reportId} {
      allow read: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
  }
}
```

### 4. **Email Configuration**

#### Option A: Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update Firebase Functions Config**:

```bash
firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password"
firebase functions:config:set admin.email="admin@cocoshield.com"
```

#### Option B: Other Email Services

Update the transporter configuration in `functions/src/index.ts`:

```typescript
const transporter = nodemailer.createTransporter({
  host: 'smtp.your-email-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@domain.com',
    pass: 'your-password'
  }
});
```

### 5. **Deploy Firebase Functions**

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Initialize Firebase Functions** (in project root):
```bash
firebase init functions
```

4. **Install Dependencies**:
```bash
cd functions
npm install
```

5. **Deploy Functions**:
```bash
firebase deploy --only functions
```

### 6. **Update App Configuration**

Update the Firebase function URL in `mobile/app/admin-reports.tsx`:

```typescript
// Replace with your actual Firebase function URL
const response = await fetch('https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/sendEmailNotification', {
  // ... rest of the code
});
```

## 📧 **Email Notification Features**

### **Automatic Notifications**

1. **New Report Alert**: Admins receive email when users submit new reports
2. **Admin Reply Notification**: Users receive email when admins reply to their reports
3. **Status Updates**: Users can be notified when report status changes

### **Email Templates**

The system includes beautiful HTML email templates with:
- CocoShield branding
- Responsive design
- Clear call-to-action buttons
- Professional formatting

## 🔧 **Testing the System**

### 1. **Test Report Submission**

1. Open the app and navigate to Report screen
2. Fill out the form and submit
3. Check Firestore Database for new document
4. Verify admin receives email notification

### 2. **Test Admin Reply**

1. Open admin reports screen
2. Select a report and send reply
3. Check user receives email notification
4. Verify reply appears in user's report list

### 3. **Test Status Updates**

1. Update report status in admin panel
2. Verify changes are saved to Firebase
3. Check real-time updates in user interface

## 🛠 **Troubleshooting**

### **Common Issues**

1. **Email Not Sending**:
   - Check Gmail app password is correct
   - Verify 2FA is enabled
   - Check Firebase function logs

2. **Firebase Connection Errors**:
   - Verify Firebase config is correct
   - Check internet connection
   - Ensure Firestore rules allow access

3. **Function Deployment Issues**:
   - Check Node.js version (should be 18)
   - Verify all dependencies are installed
   - Check Firebase CLI is logged in

### **Debug Commands**

```bash
# View function logs
firebase functions:log

# Test function locally
firebase emulators:start --only functions

# Check function status
firebase functions:list
```

## 📱 **App Integration**

### **User Flow**

1. User submits report → Saved to Firestore
2. Admin receives email notification
3. Admin reviews and replies → Email sent to user
4. User receives notification and can view reply in app

### **Admin Flow**

1. Admin opens admin reports screen
2. Views all reports with filtering options
3. Can update status and send replies
4. All actions trigger email notifications

## 🔒 **Security Considerations**

1. **Firestore Rules**: Ensure proper access control
2. **Email Security**: Use app passwords, not regular passwords
3. **User Authentication**: Verify user identity before allowing actions
4. **Data Validation**: Validate all input data

## 📊 **Monitoring**

### **Firebase Console**

- Monitor function execution in Functions tab
- View Firestore data in Database tab
- Check authentication in Auth tab

### **Email Delivery**

- Monitor email delivery rates
- Check spam folder if emails not received
- Verify email configuration

## 🚀 **Production Deployment**

1. **Update Environment Variables**:
   - Set production email credentials
   - Configure admin email addresses
   - Update Firebase project settings

2. **Test Thoroughly**:
   - Test all user flows
   - Verify email delivery
   - Check error handling

3. **Monitor Performance**:
   - Monitor function execution times
   - Check Firestore usage
   - Monitor email delivery rates

## 📞 **Support**

If you encounter issues:

1. Check Firebase Console logs
2. Verify all configuration steps
3. Test with simple email first
4. Check network connectivity

The system is now ready for production use with full Firebase integration and email notifications! 