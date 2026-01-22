
import React, { useState, useEffect } from 'react';
import { Business, UserInvitation } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, UserPlus, Building2 } from 'lucide-react';
// Removed: toast and Navigate as success messages and direct routing are handled by external login now

export default function YourPartnerPage() {
  const [isProcessing, setIsProcessing] = useState(false); // Used for button during redirect
  const [error, setError] = useState('');
  const [invitationData, setInvitationData] = useState(null); // Stores processed invitation data for display
  const [isLoading, setIsLoading] = useState(true); // For initial lookup
  const [invitationCode, setInvitationCode] = useState(''); // State to store the code from URL

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('code');
    const token = urlParams.get('token'); // Keep for backward compatibility with old links

    // Prefer 'code' over 'token' if both exist, otherwise use whichever is present
    const codeToUse = inviteCode || token;
    
    if (codeToUse) {
      setInvitationCode(codeToUse);
      handleInvitationLookup(codeToUse);
    } else {
      setError('No invitation code provided in the URL.');
      setIsLoading(false);
    }
  }, []);

  const handleInvitationLookup = async (code) => {
    if (!code) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(''); // Clear previous errors

    try {
      // Look up invitation by code (invitation_token acts as the code)
      const invitations = await UserInvitation.filter({ invitation_token: code });
      
      if (invitations.length === 0) {
        setError('Invalid or expired invitation code.');
        setInvitationData(null); // Ensure no old data is shown
        return;
      }

      const invitation = invitations[0];
      
      // Check if expired
      const expirationDate = new Date(invitation.expires_date);
      if (expirationDate < new Date()) {
        setError('This invitation has expired. Please contact your administrator for a new invitation.');
        setInvitationData(null);
        return;
      }

      // Check if already accepted
      if (invitation.status === 'accepted') {
        setError('This invitation has already been used. Please contact your administrator.');
        setInvitationData(null);
        return;
      }

      // Get business info to display (assuming Business entity has a get method by ID)
      let businessName = 'a business';
      try {
        const business = await Business.get(invitation.business_id);
        businessName = business ? business.name : 'a business';
      } catch (bizError) {
        console.warn('Could not fetch business details:', bizError);
        // Continue without business name if fetch fails
      }
      
      // Populate invitationData with necessary fields for display and redirect
      setInvitationData({
        business_name: businessName,
        inviter_name: invitation.invited_by || 'Someone', // Fallback for inviter name
        role: invitation.role,
        is_trainer: invitation.is_trainer, // Assume invitation entity has this field
        message: invitation.message, // Assume invitation entity has this field
        invitation_id: invitation.id,
        invitation_token: invitation.invitation_token // Pass token for redirect
      });

    } catch (lookupError) {
      console.error('Error looking up invitation:', lookupError);
      setError('Failed to load invitation details. Please check the link or try again.');
      setInvitationData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the button click - now redirects to login/signup
  const handleJoinClick = () => {
    if (invitationData?.invitation_token) {
      setIsProcessing(true); // Indicate processing for the button
      // Redirect to a sign-in/sign-up page, passing the invitation token
      // The authentication page will then handle the invitation acceptance after login
      window.location.href = `/auth/login?inviteToken=${invitationData.invitation_token}`;
    } else {
      setError('No valid invitation to accept.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  // Display error card if invitation data is null and an error occurred during lookup
  if (!invitationData && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Invitation Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If no invitation data and no error (e.g., no code in URL), show a generic "not found"
  if (!invitationData && !error) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Invitation Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No invitation code was found in the URL. Please ensure you are using the correct invitation link.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
     );
  }

  // Success screen is removed as acceptance is handled on login page

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-emerald-600" />
              </div>
              {/* Updated CardTitle to use business_name */}
              <CardTitle className="text-2xl">You're Invited to Join {invitationData.business_name}!</CardTitle>
              {/* Updated CardDescription to reflect new invitationData structure */}
              <CardDescription>
                {invitationData.inviter_name} has invited you to join their team
                {invitationData.is_trainer ? ' as a certified trainer' : ''}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Invitation Details */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-slate-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-800">Business Details</h3>
                    <p className="text-slate-600 text-sm">
                      Role: {invitationData.role.charAt(0).toUpperCase() + invitationData.role.slice(1)}
                      {invitationData.is_trainer ? ' • Certified Trainer' : ''}
                    </p>
                    <p className="text-slate-600 text-sm">
                      Business: {invitationData.business_name}
                    </p>
                  </div>
                </div>
              </div>

              {invitationData.message && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">{invitationData.message}</p>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Action Button */}
              <Button
                onClick={handleJoinClick}
                disabled={isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting to Sign In...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign In to Join Team
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                By clicking "Sign In to Join Team", you agree to Partner's terms of service and privacy policy.
                You'll be redirected to sign in or sign up.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
