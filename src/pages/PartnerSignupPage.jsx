import React, { useState } from 'react';
import { Mail, User, ArrowRight, Home } from 'lucide-react';
import { supabase } from '../../utils/supabase';

const PartnerSignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [acceptSMS, setAcceptSMS] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Sign up user with magic link (no password)
      const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/onboarding`
        }
      });

      if (authError) {
        alert(authError.message);
        return;
      }

      alert('Check your email for the verification link!');
      console.log('✅ Sign up initiated for:', email);
      
      // Optionally redirect or show success message
      // window.location.href = '/verify-email';
    } catch (err) {
      console.error('Sign up error:', err);
      alert('An error occurred during sign up');
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

      if (error) {
        console.error('Google auth error:', error);
        alert('Google authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Enhanced Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary-200 rounded-full opacity-20 blur-3xl" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Home Button */}
      <div className="absolute top-8 left-8 z-10">
        <a
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 text-neutral-700 font-semibold border border-neutral-100 hover:border-primary-200 group"
        >
          <Home className="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform" />
          <span>Home</span>
        </a>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-large p-8 lg:p-12 border border-neutral-100 relative backdrop-blur-sm">
            {/* Animated Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
            
            <div className="relative">
              {/* Logo */}
              <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity"></div>
                  <img 
                    src="/logo.png" 
                    alt="Partner Logo" 
                    className="w-full h-full object-contain rounded-2xl relative z-10 transform group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              {/* Header */}
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-neutral-900 mb-3 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text">
                  Create your account
                </h1>
                <p className="text-neutral-600 text-lg">
                  Already have an account?{' '}
                  <a href="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors relative group">
                    Log in
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-neutral-800 mb-3">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-4 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-neutral-900 placeholder-neutral-400 font-medium hover:border-neutral-300"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-neutral-800 mb-3">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full pl-12 pr-4 py-4 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-neutral-900 placeholder-neutral-400 font-medium hover:border-neutral-300"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-xl shadow-primary hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <span>{loading ? 'Creating Account...' : 'Get Started Free'}</span>
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>

                <p className="text-center text-sm text-neutral-600 font-semibold">
                  No credit card required! 🎉
                </p>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-neutral-500 font-semibold">or</span>
                  </div>
                </div>

                {/* Google Sign Up */}
                <button
                  onClick={handleGoogleAuth}
                  className="w-full py-4 px-6 bg-white border-2 border-neutral-200 hover:border-neutral-300 rounded-xl font-semibold text-neutral-700 transition-all duration-300 hover:shadow-medium flex items-center justify-center gap-3 group hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Checkboxes */}
                <div className="space-y-4 pt-4 border-t border-neutral-200">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={acceptSMS}
                        onChange={(e) => setAcceptSMS(e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-neutral-300 text-primary-500 focus:ring-2 focus:ring-primary-200 transition-all cursor-pointer"
                      />
                    </div>
                    <span className="text-xs text-neutral-600 leading-relaxed">
                      By signing up, you consent to receive SMS and Email from Partner. Message & data rates may apply. Unsubscribe by replying STOP.{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">Privacy Policy</a>
                      {' & '}
                      <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">Terms</a>.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={acceptMarketing}
                        onChange={(e) => setAcceptMarketing(e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-neutral-300 text-primary-500 focus:ring-2 focus:ring-primary-200 transition-all cursor-pointer"
                      />
                    </div>
                    <span className="text-xs text-neutral-600">
                      I agree to receive marketing communications from Partner.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerSignupPage;