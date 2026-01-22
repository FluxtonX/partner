
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User as UserIcon, Building, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { subcontractorData } from '@/api/functions';

export default function SubcontractorSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const token = urlParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [profileData, setProfileData] = useState({
    full_name: '',
    display_name: '',
    phone: '',
    primary_labor_type: '',
    payment_type: 'hourly',
    hourly_rate: ''
  });

  const loadInvitationData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await subcontractorData({
        token,
        action: 'GET_INVITATION_DATA'
      });

      if (fetchError) {
        setError(fetchError);
        return;
      }

      setInvitation(data.invitation);
      // Pre-populate email from invitation
      setProfileData(prev => ({
        ...prev,
        email: data.invitation.invitee_email,
        full_name: data.invitation.invitee_name || ''
      }));
    } catch (err) {
      console.error('Error loading invitation data:', err);
      setError('Failed to load invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [token]); // token is a dependency for loadInvitationData

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation token. Please check your link.');
      return;
    }
    
    loadInvitationData();
  }, [token, loadInvitationData]); // loadInvitationData is now a dependency

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileData.full_name || !profileData.display_name) {
      toast.error('Please fill in your name and display name');
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await subcontractorData({
        token,
        action: 'SETUP_PROFILE',
        payload: profileData
      });

      if (error) {
        toast.error('Failed to setup profile: ' + error);
        return;
      }

      toast.success('Profile setup complete!');
      
      // Redirect to subcontractor portal with the same token
      navigate(`/SubcontractorPortal?token=${token}`);
      
    } catch (err) {
      console.error('Error setting up profile:', err);
      toast.error('Failed to setup profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SC';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6">
          <UserIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Setup Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <p className="text-sm text-slate-500">Please contact your project manager for a new invitation link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <Building className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Partner!</h1>
          <p className="text-slate-600">
            You've been invited to work with <strong>{invitation?.business_name}</strong>
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Please complete your profile to get started
          </p>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Complete Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture Preview */}
              <div className="flex justify-center">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl">
                    {getInitials(profileData.display_name || profileData.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Legal Name *</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter your full legal name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    value={profileData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="How you'd like to be called"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email || ''}
                    disabled
                    className="bg-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Professional Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_labor_type">Primary Skill/Trade</Label>
                    <Input
                      id="primary_labor_type"
                      value={profileData.primary_labor_type}
                      onChange={(e) => handleInputChange('primary_labor_type', e.target.value)}
                      placeholder="e.g. Plumber, Electrician, Carpenter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_type">Payment Type</Label>
                    <Select
                      value={profileData.payment_type}
                      onValueChange={(value) => handleInputChange('payment_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                        <SelectItem value="piece_rate">Piece Rate</SelectItem>
                        <SelectItem value="commission">Commission Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {profileData.payment_type === 'hourly' && (
                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-500">$</span>
                      <Input
                        id="hourly_rate"
                        type="number"
                        step="0.50"
                        min="0"
                        value={profileData.hourly_rate}
                        onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                        placeholder="25.00"
                        className="pl-8"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Setting up...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Setup
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
