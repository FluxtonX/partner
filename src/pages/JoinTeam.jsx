import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { User } from '@/api/entities';
import { getInvitationDetails } from '@/api/functions';
import { completeInvitationSetup } from '@/api/functions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinTeam() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const token = urlParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [invitationDetails, setInvitationDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState('Verifying your invitation...');

  // Step 1: Verify token and check for logged-in user
  useEffect(() => {
    async function initialize() {
      if (!token) {
        setError('No invitation token found. Please use the link from your invitation email.');
        setIsLoading(false);
        return;
      }

      try {
        const { data: inviteData, error: inviteError } = await getInvitationDetails({ token });
        if (inviteError) throw new Error(inviteError);
        setInvitationDetails(inviteData);
        setStatus(`You've been invited to join ${inviteData.business_name}.`);

        const user = await User.me();
        setCurrentUser(user);
        
      } catch (authError) {
        // User is not logged in, wait for them to click the login button
        setCurrentUser(null);
        setStatus('Please sign in to accept your invitation.');
        setIsLoading(false);
      }
    }
    initialize();
  }, [token]);

  // Step 2: Once user is logged in, automatically complete the setup
  useEffect(() => {
    async function completeSetup() {
      if (currentUser && invitationDetails) {
        if (currentUser.email.toLowerCase() !== invitationDetails.invitee_email.toLowerCase()) {
          setError(`This invitation is for ${invitationDetails.invitee_email}. Please sign in with the correct Google account.`);
          setIsLoading(false);
          setStatus('Authentication Mismatch');
          return;
        }

        setStatus('Finalizing your account setup...');
        setIsLoading(true);

        try {
          const { data: setupData, error: setupError } = await completeInvitationSetup({ 
            token, 
            full_name: currentUser.full_name // Use name from Google profile
          });
          if (setupError) throw new Error(setupError);

          toast.success("Welcome! Your account is ready.");

          if (setupData.role === 'subcontractor_member') {
            window.location.assign(`/SubcontractorPortal?token=${setupData.access_token}`);
          } else {
            window.location.assign('/MyPortal');
          }
        } catch (e) {
          setError(e.message || 'Failed to complete account setup.');
          setStatus('Error');
          setIsLoading(false);
        }
      }
    }
    completeSetup();
  }, [currentUser, invitationDetails, token]);

  const handleLogin = () => {
    setIsLoading(true);
    User.loginWithRedirect(window.location.href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0168145bd_PartnerLogo.png" alt="Partner Logo" className="w-16 h-16 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Join Your Team on Partner</CardTitle>
          <CardDescription>{status}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
          )}

          {!isLoading && error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && !currentUser && (
            <div className="text-center">
              <Button onClick={handleLogin} size="lg" className="w-full">
                Sign in with Google to Continue
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-slate-500 justify-center">
          <p>You will be redirected automatically after sign-in.</p>
        </CardFooter>
      </Card>
    </div>
  );
}