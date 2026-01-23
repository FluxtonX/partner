import React, { useState } from 'react';
import { Mail, User, ArrowRight, Home } from 'lucide-react';
import { supabase } from '../utils/supabase';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Sign up with magic link
      const { data, error: signUpError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
      console.log('✅ Sign up initiated:', data);
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (err) {
      console.error('Google auth error:', err);
      setError('Google authentication failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <strong>{formData.email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Click the link in the email to complete your registration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Home button */}
      <div className="absolute top-8 left-8 z-10">
        <a
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-gray-700 font-semibold border border-gray-100"
        >
          <Home className="w-5 h-5 text-blue-500" />
          <span>Home</span>
        </a>
      </div>

      {/* Main content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-gray-100">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">P</span>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Create Account
              </h1>
              <p className="text-gray-600 text-lg">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                  Log in
                </a>
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Signup methods */}
            <div className="space-y-6">
              {/* Name inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Email input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Get Started Free</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-semibold">or</span>
                </div>
              </div>

              {/* Google signup */}
              <button
                onClick={handleGoogleAuth}
                className="w-full py-4 px-6 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:shadow-md transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;