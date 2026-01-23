import React, { useState, useEffect } from 'react';
import { Building2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authHelpers } from '../utils/supabase.js';

const OnboardingPage = () => {
  const { user, refreshUserData } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingBusiness, setIsCheckingBusiness] = useState(true);

  useEffect(() => {
    if (user) {
      checkBusinessStatus();
    }
  }, [user]);

  const checkBusinessStatus = async () => {
    if (!user) {
      setIsCheckingBusiness(false);
      return;
    }

    try {
      console.log('🔍 Checking business for user:', user.id);
      
      const { data: userBusinesses, error } = await authHelpers.getUserBusinesses(user.id);
      
      console.log('📊 Business check result:', { userBusinesses, error });
      




      if (error) {
        console.error('❌ Business check error:', error);
        setError(`Database error: ${error.message}`);
        setIsCheckingBusiness(false);
        return;
      }
      
      if (userBusinesses && userBusinesses.length > 0) {
        console.log('✅ User already has business, redirecting to dashboard');
        window.location.href = '/dashboard';
        return;
      }

      setIsCheckingBusiness(false);
    } catch (err) {
      console.error('💥 Business check error:', err);
      setError(`Error: ${err.message}`);
      setIsCheckingBusiness(false);
    }
  };

  

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!businessName.trim()) {
    setError('Please enter your business name');
    return;
  }

  setIsSubmitting(true);

  try {
    console.log('🚀 Starting business creation for user:', user.id);

    // ✅ Step 0: Ensure user exists in your app's users table


    // ✅ Step 1: Create the business
  // 0️⃣ Ensure user exists in app users table
const { error: appUserError } = await authHelpers.createAppUser(user);
if (appUserError) throw appUserError;

// 1️⃣ Create business
const { data: business, error: businessError } = await authHelpers.createBusiness(
  { name: businessName.trim() },
  user.id
);
if (businessError) throw businessError;

// 2️⃣ Link user to business
const { error: linkError } = await authHelpers.linkUserToBusiness(user.id, business.id, 'owner');
if (linkError) throw linkError;

// 3️⃣ Set as current business
await authHelpers.setCurrentBusiness(user.id, business.id);

// 4️⃣ Refresh auth context
await refreshUserData();


    console.log('✅ Setup complete, redirecting to dashboard...');
    window.location.href = '/dashboard';
  } catch (err) {
    console.error('💥 Onboarding error:', err);
    setError(err.message || 'Failed to set up business. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};


  if (isCheckingBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4 animate-pulse mx-auto bg-white">
            <Building2 className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium">Checking business status...</p>
        </div>
      </div>
    );
  }

  const benefits = [
    'AI-powered project estimates',
    'Professional proposals in seconds',
    'Complete project management',
    'Built-in client communication',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-600">Step 1 of 1</span>
                  <span className="text-sm font-medium text-gray-600">Almost there!</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-full"></div>
                </div>
              </div>

              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 font-semibold text-sm mb-4">
                  <Sparkles className="w-4 h-4" />
                  Welcome to Partner
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Lets set up your business
                </h1>
                <p className="text-gray-600 text-lg">
                  Tell us about your company to get started with AI-powered project management.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="businessName"
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      setError('');
                    }}
                    placeholder="e.g., ABC Construction LLC"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    disabled={isSubmitting}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This will be displayed on your proposals and invoices
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Setting up your workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <h2 className="text-5xl font-bold text-gray-900 mb-4">
                Everything you need to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                  grow your business
                </span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Join thousands of contractors who are closing more deals and saving time with AI-powered tools.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-gray-800 font-semibold text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;