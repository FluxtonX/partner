import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // If still loading after 5 seconds, show the page anyway
    const timer = setInterval(() => {
      if (loading) {
        console.warn("⚠️ Auth loading timeout - showing page anyway");
        setTimedOut(true);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [loading]);

  if (loading && !timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !timedOut) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
