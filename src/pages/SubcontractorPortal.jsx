import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import SubcontractorAvailability from '../components/portal/SubcontractorAvailability';
import AssignmentStatusCard from '../components/subcontractor/AssignmentStatusCard';
import ContractSigningForm from '../components/subcontractor/ContractSigningForm';
import BidSubmissionForm from '../components/subcontractor/BidSubmissionForm';
import { subcontractorData } from '@/api/functions';

export default function SubcontractorPortal() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const token = urlParams.get('token');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [calendarBlocks, setCalendarBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPortalData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    if (!token) {
      setError('An access token is required. Please use the link provided in your invitation.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: portalError } = await subcontractorData({
        token,
        action: 'GET_PORTAL_DATA'
      });

      if (portalError) {
        throw new Error(portalError);
      }

      setCurrentUser(data.user);
      setAssignments(data.assignments || []);
      setContracts(data.contracts || []);
      setProjects(data.projects || []);
      setCalendarBlocks(data.calendarBlocks || []);
      
    } catch (err) {
      console.error('Error loading subcontractor portal:', err);
      setError('Invalid or expired access token. Please contact your project manager for a new link.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  const handleUpdateAvailability = async (newDate) => {
    try {
      await subcontractorData({
          token: token,
          action: 'UPDATE_AVAILABILITY',
          payload: { next_available_date: newDate }
      });
      toast.success('Availability updated!');
      loadPortalData();
    } catch (err) {
      toast.error('Failed to update availability.');
    }
  };

  const handleAssignmentStatusUpdate = (assignmentId, status) => {
    // This is a placeholder for future functionality
    console.log(`Updating assignment ${assignmentId} to ${status}`);
    toast.info('Status update functionality coming soon.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading Your Portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Subcontractor Portal</h1>
          <p className="text-slate-600">Welcome, {currentUser?.display_name || currentUser?.full_name}!</p>
        </header>

        <div className="space-y-6">
          <SubcontractorAvailability
            currentUser={currentUser}
            onUpdate={handleUpdateAvailability}
          />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Active Assignments & Bids</h2>
            {assignments.length > 0 ? (
              assignments.map(assignment => (
                <AssignmentStatusCard 
                  key={assignment.id} 
                  assignment={assignment} 
                  onUpdateStatus={handleAssignmentStatusUpdate}
                />
              ))
            ) : (
              <div className="text-center py-8 px-4 bg-white rounded-lg shadow-sm border">
                <p className="text-slate-500">You have no active assignments or open bids.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Contracts Pending Signature</h2>
            {contracts.filter(c => c.status === 'pending_signature').length > 0 ? (
              contracts.filter(c => c.status === 'pending_signature').map(contract => (
                <ContractSigningForm 
                  key={contract.id} 
                  contract={contract} 
                  onSigned={loadPortalData}
                />
              ))
            ) : (
              <div className="text-center py-8 px-4 bg-white rounded-lg shadow-sm border">
                <p className="text-slate-500">You have no contracts awaiting your signature.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}