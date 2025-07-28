import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../config/firebase';
import firebaseAuthService from '../services/firebaseAuthService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signup: (email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; user?: User; error?: string }>;
  signInWithFacebook: () => Promise<{ success: boolean; user?: User; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking Firebase auth status...');
      const loggedIn = await firebaseAuthService.isLoggedIn();
      console.log('📊 Firebase auth status:', loggedIn);
      if (loggedIn) {
        const currentUser = firebaseAuthService.getCurrentUser();
        console.log('👤 Current user from Firebase:', currentUser);
        setUser(currentUser);
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting Firebase login for:', email);
      const result = await firebaseAuthService.userLogin(email, password);
      console.log('📊 Firebase login result:', result);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('❌ Firebase login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const adminLogin = async (username: string, password: string) => {
    try {
      console.log('👑 Attempting Firebase admin login for:', username);
      const result = await firebaseAuthService.adminLogin(username, password);
      console.log('📊 Firebase admin login result:', result);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('❌ Firebase admin login error:', error);
      return { success: false, error: 'Admin login failed' };
    }
  };

  const signup = async (email: string, password: string, confirmPassword: string) => {
    try {
      console.log('📝 Attempting Firebase signup for:', email);
      const result = await firebaseAuthService.userSignup(email, password, confirmPassword);
      console.log('📊 Firebase signup result:', result);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('❌ Firebase signup error:', error);
      return { success: false, error: 'Signup failed' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔐 Attempting Google sign in...');
      const result = await firebaseAuthService.signInWithGoogle();
      console.log('📊 Google sign in result:', result);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('❌ Google sign in error:', error);
      return { success: false, error: 'Google sign in failed' };
    }
  };

  const signInWithFacebook = async () => {
    try {
      console.log('🔐 Attempting Facebook sign in...');
      const result = await firebaseAuthService.signInWithFacebook();
      console.log('📊 Facebook sign in result:', result);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('❌ Facebook sign in error:', error);
      return { success: false, error: 'Facebook sign in failed' };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      console.log('🔄 Attempting Firebase profile update:', updates);
      const result = await firebaseAuthService.updateProfile(updates);
      console.log('📊 Firebase profile update result:', result);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('❌ Firebase profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Attempting Firebase logout...');
      const result = await firebaseAuthService.logout();
      console.log('📊 Firebase logout result:', result);
      if (result.success) {
        setUser(null);
      }
      return result;
    } catch (error) {
      console.error('❌ Firebase logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    adminLogin,
    signup,
    signInWithGoogle,
    signInWithFacebook,
    updateProfile,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 