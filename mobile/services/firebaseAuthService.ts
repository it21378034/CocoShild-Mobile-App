import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, UserRole, User, ADMIN_CREDENTIALS, googleProvider, facebookProvider } from '../config/firebase';

// Firebase Auth Service (Real implementation)
export class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private currentUser: User | null = null;

  static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    try {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            if (firebaseUser) {
              // Get user data from Firestore
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                this.currentUser = userDoc.data() as User;
              } else {
                // Create user document if it doesn't exist
                const newUser: User = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  role: UserRole.USER,
                  displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
                  emailVerified: firebaseUser.emailVerified,
                };
                await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
                this.currentUser = newUser;
              }
              resolve(true);
            } else {
              this.currentUser = null;
              resolve(false);
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            this.currentUser = null;
            resolve(false);
          }
          unsubscribe();
        });
      });
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Admin login
  async adminLogin(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // For admin login, we'll use a special admin email
        const adminEmail = 'admin@cocoshield.com';
        
        // Try to sign in with admin credentials
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, password);
        
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (userData.role === UserRole.ADMIN) {
            this.currentUser = userData;
            return { success: true, user: userData };
          }
        }
        
        return { success: false, error: 'Invalid admin credentials' };
      } else {
        return { success: false, error: 'Invalid admin credentials' };
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      return { success: false, error: error.message || 'Admin login failed' };
    }
  }

  // User login with email
  async userLogin(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        this.currentUser = userData;
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'User data not found' };
      }
    } catch (error: any) {
      console.error('User login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  // User signup
  async userSignup(email: string, password: string, confirmPassword: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validation
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      if (password !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const newUser: User = {
        uid: userCredential.user.uid,
        email: email,
        role: UserRole.USER,
        displayName: email.split('@')[0],
        emailVerified: false,
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      
      // Update Firebase Auth display name
      await updateProfile(userCredential.user, {
        displayName: newUser.displayName
      });
      
      this.currentUser = newUser;
      return { success: true, user: newUser };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'Signup failed' };
    }
  }

  // Logout
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut(auth);
      this.currentUser = null;
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false, error: error.message || 'Logout failed' };
    }
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  // Check if user is verified
  isEmailVerified(): boolean {
    return this.currentUser?.emailVerified || false;
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'No user logged in' };
      }

      const updatedUser = { ...this.currentUser, ...updates };
      
      // Update in Firestore
      await updateDoc(doc(db, 'users', this.currentUser.uid), updates);
      
      // Update Firebase Auth display name if provided
      if (updates.displayName) {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          await updateProfile(firebaseUser, {
            displayName: updates.displayName
          });
        }
      }
      
      this.currentUser = updatedUser;
      return { success: true, user: updatedUser };
    } catch (error: any) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message || 'Profile update failed' };
    }
  }

  // Google Sign In
  async signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('🔐 Attempting Google sign in...');
      
      // Import and use the SocialAuthService
      const { default: socialAuthService } = await import('./socialAuthService');
      const result = await socialAuthService.signInWithGoogle();
      
      if (result.success && result.user) {
        this.currentUser = result.user;
      }
      
      return result;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message || 'Google sign in failed' };
    }
  }

  // Facebook Sign In
  async signInWithFacebook(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('🔐 Attempting Facebook sign in...');
      
      // Import and use the SocialAuthService
      const { default: socialAuthService } = await import('./socialAuthService');
      const result = await socialAuthService.signInWithFacebook();
      
      if (result.success && result.user) {
        this.currentUser = result.user;
      }
      
      return result;
    } catch (error: any) {
      console.error('Facebook sign in error:', error);
      return { success: false, error: error.message || 'Facebook sign in failed' };
    }
  }
}

export default FirebaseAuthService.getInstance(); 