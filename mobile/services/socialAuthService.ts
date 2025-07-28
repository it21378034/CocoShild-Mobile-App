import { 
  signInWithCredential, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, UserRole, User, googleProvider, facebookProvider } from '../config/firebase';

// OAuth Configuration - Replace with your actual credentials
const GOOGLE_CLIENT_ID = '662719214117-pvo4a1fpjl1ogk30t395hn5h18n2t8su.apps.googleusercontent.com'; // Replace with your actual Google Client ID
const GOOGLE_CLIENT_SECRET = 'desHI@123'; // Replace with your actual Google Client Secret
const FACEBOOK_APP_ID = 'your-facebook-app-id'; // Replace with your actual Facebook App ID
const FACEBOOK_APP_SECRET = 'your-facebook-app-secret'; // Replace with your actual Facebook App Secret

export class SocialAuthService {
  private static instance: SocialAuthService;

  static getInstance(): SocialAuthService {
    if (!SocialAuthService.instance) {
      SocialAuthService.instance = new SocialAuthService();
    }
    return SocialAuthService.instance;
  }

  // Google Sign In
  async signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('🔐 Attempting Google sign in...');
      
      // Check if OAuth is properly configured
      if (GOOGLE_CLIENT_ID.includes('662719214117-pvo4a1fpjl1ogk30t395hn5h18n2t8su.apps.googleusercontent.com') || GOOGLE_CLIENT_SECRET === 'desHI@123') {
        return { 
          success: false, 
          error: 'Google OAuth not configured. Please update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in socialAuthService.ts with your actual credentials.' 
        };
      }
      
      // Use Firebase's built-in Google sign-in
      const result = await signInWithRedirect(auth, googleProvider);
      
      // Get the redirect result
      const redirectResult = await getRedirectResult(auth);
      
      if (redirectResult) {
        const userCredential = redirectResult;
        return await this.handleSocialAuthResult(userCredential);
      } else {
        return { success: false, error: 'Google sign in was cancelled or failed' };
      }
      
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message || 'Google sign in failed' };
    }
  }

  // Facebook Sign In
  async signInWithFacebook(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('🔐 Attempting Facebook sign in...');
      
      // Check if OAuth is properly configured
      if (FACEBOOK_APP_ID === 'your-facebook-app-id' || FACEBOOK_APP_SECRET === 'your-facebook-app-secret') {
        return { 
          success: false, 
          error: 'Facebook OAuth not configured. Please update FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in socialAuthService.ts with your actual credentials.' 
        };
      }
      
      // Use Firebase's built-in Facebook sign-in
      const result = await signInWithRedirect(auth, facebookProvider);
      
      // Get the redirect result
      const redirectResult = await getRedirectResult(auth);
      
      if (redirectResult) {
        const userCredential = redirectResult;
        return await this.handleSocialAuthResult(userCredential);
      } else {
        return { success: false, error: 'Facebook sign in was cancelled or failed' };
      }
      
    } catch (error: any) {
      console.error('Facebook sign in error:', error);
      return { success: false, error: error.message || 'Facebook sign in failed' };
    }
  }

  // Handle social authentication result
  private async handleSocialAuthResult(userCredential: any): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const firebaseUser = userCredential.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        // User exists, return existing data
        const userData = userDoc.data() as User;
        return { success: true, user: userData };
      } else {
        // Create new user document
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: UserRole.USER,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          emailVerified: firebaseUser.emailVerified,
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        return { success: true, user: newUser };
      }
    } catch (error: any) {
      console.error('Error handling social auth result:', error);
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  // Setup instructions for OAuth configuration
  getSetupInstructions(): string {
    return `
To enable Google and Facebook authentication:

1. GOOGLE SETUP:
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable Google provider
   - Add your OAuth 2.0 client ID and client secret
   - Configure authorized domains

2. FACEBOOK SETUP:
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable Facebook provider
   - Add your Facebook App ID and App Secret
   - Configure OAuth redirect URI

3. UPDATE CONFIGURATION:
   - Add your OAuth credentials to the socialAuthService.ts file
   - Update the client IDs and secrets in the configuration

4. TEST AUTHENTICATION:
   - Test both Google and Facebook sign-in flows
   - Verify user data is saved to Firestore

For detailed setup instructions, refer to Firebase documentation.
    `;
  }
}

export default SocialAuthService.getInstance(); 