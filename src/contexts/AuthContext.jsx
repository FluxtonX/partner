import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, authHelpers } from '../utils/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const init = async () => {
      try {
        // 1️⃣ Get current session safely
        const { data: { session }, error } = await supabase.auth.getSession({ signal });
        if (error) throw error;

        if (session?.user) {
          // 2️⃣ Ensure user exists in your app users table
          const { error: appUserError } = await authHelpers.createAppUser(session.user);
          if (appUserError) throw appUserError;

          setUser(session.user);
          await loadUserData(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('⚠️ Auth initialization aborted');
        } else {
          console.error('Initialize auth error:', err);
          setLoading(false);
        }
      }
    };

    init();

    // 3️⃣ Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state changed:', _event);
        if (session?.user) {
          // Ensure app user exists before loading businesses
          try {
            const { error: appUserError } = await authHelpers.createAppUser(session.user);
            if (appUserError) throw appUserError;

            setUser(session.user);
            await loadUserData(session.user.id);
          } catch (err) {
            console.error('Auth state user setup error:', err);
          }
        } else {
          // User logged out
          setUser(null);
          setBusinesses([]);
          setCurrentBusiness(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      controller.abort();
    };
  }, []);

  const loadUserData = async (userId) => {
    try {
      // Load user's businesses
      const { data: userBusinesses, error: businessError } = await authHelpers.getUserBusinesses(userId);
      if (businessError) throw businessError;

      setBusinesses(userBusinesses || []);

      // Set current business (first one if exists)
      if (userBusinesses && userBusinesses.length > 0) {
        setCurrentBusiness(userBusinesses[0].businesses);
      }
    } catch (err) {
      console.error('Load user data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchBusiness = async (businessId) => {
    try {
      const business = businesses.find(ub => ub.business_id === businessId);
      setCurrentBusiness(business?.businesses || null);
    } catch (err) {
      console.error('Switch business error:', err);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  const value = {
    user, // Supabase Auth user object
    businesses,
    currentBusiness,
    loading,
    switchBusiness,
    refreshUserData,
    signOut: authHelpers.signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
