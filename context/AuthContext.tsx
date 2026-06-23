// context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, BusinessWorkspace, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType>({
  user: null,
  business: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<BusinessWorkspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // 1. Get User Profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            email: userData.email || firebaseUser.email || '',
            activeBusinessId: userData.activeBusinessId || '',
            businesses: userData.businesses || [],
            createdAt: userData.createdAt?.toDate() || new Date(),
          };
          setUser(profile);

          // 2. Load the User's Active Workspace
          if (profile.activeBusinessId) {
            const bizDocRef = doc(db, 'businesses', profile.activeBusinessId);
            const bizDoc = await getDoc(bizDocRef);
            if (bizDoc.exists()) {
              const bizData = bizDoc.data();
              setBusiness({
                id: bizDoc.id,
                name: bizData.name,
                slug: bizData.slug,
                createdAt: bizData.createdAt?.toDate() || new Date(),
                stripeCustomerId: bizData.stripeCustomerId,
              });
            }
          }
        } else {
          // Fallback if auth exists but firestore profile creation is pending
          setUser(null);
          setBusiness(null);
        }
      } else {
        setUser(null);
        setBusiness(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, business, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);