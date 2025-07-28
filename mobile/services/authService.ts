import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, ADMIN_CREDENTIALS } from '../config/firebase';

// Mock Firebase Auth Service (replace with actual Firebase when configured)
export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        return true;
      }
      return false;
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
        const adminUser: User = {
          uid: 'admin-uid',
          email: 'admin@cocoshield.com',
          role: UserRole.ADMIN,
          displayName: 'Administrator',
          emailVerified: true,
        };

        this.currentUser = adminUser;
        await AsyncStorage.setItem('user', JSON.stringify(adminUser));
        
        return { success: true, user: adminUser };
      } else {
        return { success: false, error: 'Invalid admin credentials' };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  // User login with email
  async userLogin(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Mock user validation (replace with actual Firebase auth)
      if (email && password.length >= 6) {
        const user: User = {
          uid: `user-${Date.now()}`,
          email: email,
          role: UserRole.USER,
          displayName: email.split('@')[0],
          emailVerified: true, // Mock verified for demo
        };

        this.currentUser = user;
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, user };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('User login error:', error);
      return { success: false, error: 'Login failed' };
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

      // Check if user already exists (mock)
      const existingUser = await AsyncStorage.getItem(`user_${email}`);
      if (existingUser) {
        return { success: false, error: 'User already exists with this email' };
      }

      // Create new user
      const newUser: User = {
        uid: `user-${Date.now()}`,
        email: email,
        role: UserRole.USER,
        displayName: email.split('@')[0],
        emailVerified: false, // Would be false initially, need email verification
      };

      // Store user data
      await AsyncStorage.setItem(`user_${email}`, JSON.stringify(newUser));
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      this.currentUser = newUser;
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed' };
    }
  }

  // Logout
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      this.currentUser = null;
      await AsyncStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
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
      this.currentUser = updatedUser;
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      await AsyncStorage.setItem(`user_${updatedUser.email}`, JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    }
  }
}

export default AuthService.getInstance(); 