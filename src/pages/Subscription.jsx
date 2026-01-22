
import React, { useState, useEffect } from 'react';
import { BusinessSettings, User, UserBusiness } from '@/api/entities';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format, addDays, differenceInDays, subDays } from 'date-fns';

import StripeSubscriptionManager from '../components/subscriptions/StripeSubscriptionManager';

export default function SubscriptionPage() {
  const [settings, setSettings] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Check if user is admin in their current business
      const userBusinessLinks = await UserBusiness.filter({ 
        user_email: user.email, 
        business_id: user.current_business_id 
      });
      
      const isAdmin = userBusinessLinks.length > 0 && 
        (userBusinessLinks[0].role === 'admin' || userBusinessLinks[0].role === 'owner');

      if (!isAdmin) {
        setIsLoading(false);
        // Optionally, redirect or show a message for non-admin users
        return;
      }
      
      let businessSettings = await BusinessSettings.filter({ business_id: user.current_business_id });
      if (businessSettings.length === 0) {
        // First time setup: create trial settings
        const newSettings = await BusinessSettings.create({
          business_id: user.current_business_id,
          business_name: 'My Business',
          subscription_type: 'Trial',
          subscription_start_date: new Date().toISOString(),
          subscription_status: 'active'
        });
        setSettings(newSettings);
      } else {
        const currentSettings = businessSettings[0];
        setSettings(currentSettings);
        
        // Check if subscription is locked
        const isInactive = currentSettings.subscription_status === 'inactive' || 
                          currentSettings.subscription_status === 'expired' ||
                          currentSettings.subscription_type === 'Inactive';

        if (currentSettings.subscription_type === 'Trial' && currentSettings.subscription_start_date) {
          const startDate = new Date(currentSettings.subscription_start_date);
          const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          const daysLeft = Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)));
          setTrialDaysLeft(daysLeft);
          
          if (daysLeft <= 0 && currentSettings.subscription_status !== 'expired') {
            setIsLocked(true);
            // Auto-update trial to expired if time is up
            await BusinessSettings.update(currentSettings.id, { 
              subscription_status: 'expired' 
            });
            setSettings(prev => ({ ...prev, subscription_status: 'expired' }));
          } else if (daysLeft <= 0) {
            setIsLocked(true);
          }
        } else if (isInactive) {
          setIsLocked(true);
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      // Handle error gracefully, e.g., show an error message
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" />
          <p>Loading Subscription Details...</p>
        </div>
      </div>
    );
  }

  // Check if currentUser or current_business_id is missing after loading
  if (!currentUser || !currentUser.current_business_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Error</AlertTitle>
            <AlertDescription>Unable to load business information or you do not have permission to view this page. Please ensure you are logged in and are an admin of a business, or contact support.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const isTrialExpired = settings?.subscription_type === 'Trial' && trialDaysLeft <= 0;
  const showLockoutMessage = isLocked || isTrialExpired || 
                            settings?.subscription_status === 'inactive' || 
                            settings?.subscription_status === 'expired';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Manage Subscription</h1>
          <p className="text-slate-600">Choose the plan that's right for your business.</p>
        </div>
        
        {showLockoutMessage && (
          <Alert className="mb-8 border-red-300 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">
              {isTrialExpired ? 'Trial Expired - Account Locked' : 'Subscription Inactive - Account Locked'}
            </AlertTitle>
            <AlertDescription className="text-red-700">
              {isTrialExpired 
                ? 'Your 7-day trial has expired. Please select a paid plan below to regain access to your account and data.'
                : 'Your subscription is inactive due to non-payment. Please select a plan below to reactivate your account and regain access to your data.'
              }
            </AlertDescription>
          </Alert>
        )}

        {settings?.subscription_type === 'Trial' && !isTrialExpired && (
          <Alert className="mb-8 border-blue-300 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Trial Account</AlertTitle>
            <AlertDescription className="text-blue-700">
              You have {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left in your trial. Upgrade to a paid plan to continue using Partner after your trial expires.
            </AlertDescription>
          </Alert>
        )}

        <StripeSubscriptionManager />
        
        {showLockoutMessage && (
          <div className="mt-8 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Account Access Restricted</h3>
              <p className="text-yellow-700 mb-4">
                While your subscription is inactive, you cannot access your projects, clients, or other data. 
                All your information is safely stored and will be restored immediately upon reactivation.
              </p>
              <p className="text-sm text-yellow-600">
                Select any paid plan above to instantly reactivate your account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
