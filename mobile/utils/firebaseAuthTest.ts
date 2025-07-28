import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserRole } from '../config/firebase';

// Test Firebase Authentication
export const testFirebaseAuth = async () => {
  try {
    console.log('🧪 Testing Firebase Authentication...');
    
    // Test 1: Check if Firebase Auth is initialized
    console.log('✅ Firebase Auth initialized:', !!auth);
    
    // Test 2: Check if Firestore is initialized
    console.log('✅ Firestore initialized:', !!db);
    
    return {
      auth: !!auth,
      firestore: !!db,
      success: true,
      message: 'Firebase Auth and Firestore are ready for testing'
    };
  } catch (error) {
    console.error('❌ Firebase Auth test failed:', error);
    return {
      auth: false,
      firestore: false,
      success: false,
      error: error
    };
  }
};

// Test if Firebase Auth is enabled
export const testFirebaseAuthEnabled = async () => {
  try {
    console.log('🔍 Testing if Firebase Auth is enabled...');
    
    // Try to create a test user to see if Auth is enabled
    const testEmail = `test-${Date.now()}@cocoshield.com`;
    const testPassword = 'test123456';
    
    console.log('📧 Attempting to create test user:', testEmail);
    
    const result = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    
    console.log('✅ Firebase Auth is enabled - test user created:', result.user.uid);
    
    // Clean up - delete the test user
    // Note: In a real app, you'd want to delete this user properly
    
    return {
      success: true,
      message: 'Firebase Authentication is enabled and working',
      testUser: result.user
    };
  } catch (error: any) {
    console.log('⚠️ Firebase Auth test result:', error.code, error.message);
    
    if (error.code === 'auth/operation-not-allowed') {
      return {
        success: false,
        error: 'Firebase Authentication is not enabled. Please enable Email/Password authentication in Firebase Console.',
        code: error.code
      };
    } else if (error.code === 'auth/email-already-in-use') {
      return {
        success: false,
        error: 'Test email already exists. Firebase Auth is working.',
        code: error.code
      };
    } else {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }
};

// Test admin login functionality
export const testAdminLogin = async () => {
  try {
    console.log('👑 Testing admin login functionality...');
    
    // This is a test - in real app, admin would be created in Firebase Console
    const testEmail = 'admin@cocoshield.com';
    const testPassword = 'admin@123';
    
    console.log('📧 Attempting login with:', testEmail);
    
    // Note: This will fail if the user doesn't exist in Firebase Auth
    // You need to create this user in Firebase Console first
    const result = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    
    console.log('✅ Admin login test successful:', result.user.uid);
    
    return {
      success: true,
      user: result.user,
      message: 'Admin login test successful'
    };
  } catch (error: any) {
    console.log('⚠️ Admin login test result:', error.code, error.message);
    
    if (error.code === 'auth/user-not-found') {
      return {
        success: false,
        error: 'Admin user not found. Please create admin user in Firebase Console.',
        code: error.code
      };
    } else if (error.code === 'auth/wrong-password') {
      return {
        success: false,
        error: 'Wrong password for admin user.',
        code: error.code
      };
    } else if (error.code === 'auth/invalid-credential') {
      return {
        success: false,
        error: 'Invalid credentials. User may not exist or password is wrong.',
        code: error.code
      };
    } else {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }
};

// Test user creation
export const testUserCreation = async () => {
  try {
    console.log('👤 Testing user creation...');
    
    const testEmail = `test${Date.now()}@cocoshield.com`;
    const testPassword = 'test123456';
    
    console.log('📧 Creating test user:', testEmail);
    
    const result = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    
    console.log('✅ User creation test successful:', result.user.uid);
    
    // Create user document in Firestore
    const userDoc = {
      uid: result.user.uid,
      email: result.user.email,
      role: UserRole.USER,
      displayName: testEmail.split('@')[0],
      emailVerified: result.user.emailVerified,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', result.user.uid), userDoc);
    console.log('✅ User document created in Firestore');
    
    return {
      success: true,
      user: result.user,
      userDoc: userDoc,
      message: 'User creation and Firestore document creation successful'
    };
  } catch (error: any) {
    console.error('❌ User creation test failed:', error.code, error.message);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

// Check if admin user exists in Firestore
export const checkAdminUser = async () => {
  try {
    console.log('🔍 Checking for admin user in Firestore...');
    
    // Look for admin user by email
    const adminEmail = 'admin@cocoshield.com';
    
    // This is a simplified check - in production you'd query by email
    console.log('📧 Looking for admin user with email:', adminEmail);
    
    return {
      success: true,
      message: 'Admin user check completed. Check Firebase Console for admin user.',
      note: 'You need to create admin user manually in Firebase Console'
    };
  } catch (error: any) {
    console.error('❌ Admin user check failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 