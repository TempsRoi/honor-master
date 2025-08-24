"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { UserProfile } from '@/types';
import { useApp } from './AppContext';
import { getMockUser, mockOnAuthStateChanged } from '@/lib/mock-auth';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  updateMockUser: (updates: Partial<UserProfile>) => void;
  updateUserProfileState: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isMockMode } = useApp();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const updateMockUser = useCallback((updates: Partial<UserProfile>) => {
    if (!isMockMode || !user) return;
    setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
  }, [isMockMode, user]);

  const updateUserProfileState = useCallback((updates: Partial<UserProfile>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
  }, []);

  const updateUserProfileState = useCallback((updates: Partial<UserProfile>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
  }, []);

  useEffect(() => {
    const handleUser = async (fbUser: FirebaseUser | null) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userRef = doc(db, 'users', fbUser.uid);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUser(snapshot.data() as UserProfile);
          } else {
            const newUserProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              balance: 0,
              totalPaid: 0,
            };
            setDoc(userRef, newUserProfile);
            setUser(newUserProfile);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    if (isMockMode) {
      mockOnAuthStateChanged((fbUser) => {
        if (fbUser) {
          const mockUser = getMockUser(fbUser.uid);
          setUser(mockUser);
          setFirebaseUser(fbUser);
        } else {
          setUser(null);
          setFirebaseUser(null);
        }
        setLoading(false);
      });
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(handleUser);
    return () => unsubscribe();
  }, [isMockMode]);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, updateMockUser, updateUserProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
