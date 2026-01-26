import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, authHelpers } from "../utils/supabase";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
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
        // 1️⃣ Get current session with timeout
        const sessionPromise = supabase.auth.getSession({ signal });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session timeout")), 3000),
        );

        const {
          data: { session },
          error,
        } = await Promise.race([sessionPromise, timeoutPromise]);

        if (error && error.message !== "Session timeout") {
          console.warn("⚠️ Session error (continuing anyway):", error.message);
        }

        if (session?.user) {
          console.log("✅ User logged in:", session.user.email);
          setUser(session.user);
          // Try to load user data, but don't fail if tables don't exist yet
          await loadUserData(session.user.id);
        } else {
          console.log("ℹ️ No active session");
          setLoading(false);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("⚠️ Auth initialization aborted");
        } else {
          console.warn(
            "⚠️ Initialize auth error (continuing anyway):",
            err.message,
          );
        }
        setLoading(false);
      }
    };

    // Call init immediately
    init();

    // 3️⃣ Listen for auth state changes
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          console.log("Auth state changed:", _event);
          if (session?.user) {
            setUser(session.user);
            await loadUserData(session.user.id);
          } else {
            setUser(null);
            setBusinesses([]);
            setCurrentBusiness(null);
            setLoading(false);
          }
        },
      );
      subscription = data.subscription;
    } catch (err) {
      console.warn("⚠️ Could not set up auth listener:", err.message);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      controller.abort();
    };
  }, []);

  const loadUserData = async (userId) => {
    try {
      // Load user's businesses (optional - may not exist in early dev)
      const { data: userBusinesses, error: businessError } =
        await authHelpers.getUserBusinesses(userId);

      // Don't throw error if tables don't exist - just log it
      if (businessError) {
        console.warn(
          "⚠️ Could not load businesses (tables may not exist yet):",
          businessError.message,
        );
        setBusinesses([]);
        setCurrentBusiness(null);
      } else {
        setBusinesses(userBusinesses || []);
        // Set current business (first one if exists)
        if (userBusinesses && userBusinesses.length > 0) {
          setCurrentBusiness(userBusinesses[0].businesses);
        }
      }
    } catch (err) {
      console.warn("⚠️ Load user data error (continuing anyway):", err.message);
      setBusinesses([]);
      setCurrentBusiness(null);
    } finally {
      setLoading(false);
    }
  };

  const switchBusiness = async (businessId) => {
    try {
      const business = businesses.find((ub) => ub.business_id === businessId);
      setCurrentBusiness(business?.businesses || null);
    } catch (err) {
      console.error("Switch business error:", err);
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
    signOut: authHelpers.signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
