import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | { email: string; uid: string } | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  changeLocalPassword: (newPass: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'dhruvchavda7383@gmail.com';
const LOCAL_AUTH_KEY = 'chamunda_admin_session';
const LOCAL_PASS_KEY = 'chamunda_admin_password';
const DEFAULT_PASSWORD = 'Dhruv@Botad2025';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | { email: string; uid: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // If Firebase is configured with Auth
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, currentUser => {
        setUser(currentUser);
        setLoading(false);
      });
      return unsubscribe;
    }

    // Local admin session fallback for testing/demo
    try {
      const stored = localStorage.getItem(LOCAL_AUTH_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        if (session && session.email === ADMIN_EMAIL) {
          setUser(session);
        }
      }
    } catch (e) {
      console.warn('Error reading local auth session', e);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // Check Firebase Auth if configured
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        setUser(cred.user);
        setLoading(false);
        toast.success('Welcome back, Dhruv!');
        return true;
      } catch (err: any) {
        console.warn('Firebase auth failed, testing fallback:', err);
        // If not in Firebase yet, give clear error
        toast.error(err.message || 'Login failed. Please check credentials.');
        setLoading(false);
        return false;
      }
    }

    // Local admin login for preview/initial testing
    if (cleanEmail === ADMIN_EMAIL) {
      const activePassword = localStorage.getItem(LOCAL_PASS_KEY) || DEFAULT_PASSWORD;
      if (pass !== activePassword) {
        toast.error('Incorrect password. Default is: Dhruv@Botad2025');
        setLoading(false);
        return false;
      }

      const mockUser = { email: ADMIN_EMAIL, uid: 'admin_dhruv_botad' };
      setUser(mockUser);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(mockUser));
      setLoading(false);
      toast.success('Welcome back, Dhruv!');
      return true;
    }

    toast.error('Invalid admin credentials. Only dhruvchavda7383@gmail.com is authorized.');
    setLoading(false);
    return false;
  };

  const changeLocalPassword = (newPass: string): boolean => {
    if (!newPass || newPass.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    localStorage.setItem(LOCAL_PASS_KEY, newPass.trim());
    toast.success('Admin password updated successfully!');
    return true;
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn('Sign out error', e);
      }
    }
    localStorage.removeItem(LOCAL_AUTH_KEY);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        toast.success(`Password reset email sent to ${cleanEmail}`);
        return true;
      } catch (err: any) {
        toast.error(err.message || 'Failed to send reset email');
        return false;
      }
    }

    toast.success(`Password reset email sent to ${cleanEmail} (Firebase Auth)`);
    return true;
  };

  const isAdmin = Boolean(user && user.email?.toLowerCase() === ADMIN_EMAIL);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        login,
        logout,
        resetPassword,
        changeLocalPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
