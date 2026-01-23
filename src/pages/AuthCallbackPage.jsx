import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthCallbackPage = () => {
  const { user, businesses, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (businesses.length > 0) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/onboarding', { replace: true });
    }
  }, [loading, user, businesses, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
