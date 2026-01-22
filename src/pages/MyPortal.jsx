import React, { useState, useEffect, useCallback } from 'react';
import { User, Project, WorkLog, UserTrainingProgress, BusinessSettings, WorkdayConfirmation } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User as UserIcon, Clock, CheckSquare, History, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import ClockIn from '../components/portal/ClockIn';
import MyTasks from '../components/portal/MyTasks';
import MyTimeLogs from '../components/portal/MyTimeLogs';
import TrainingStatus from '../components/portal/TrainingStatus';
import SubcontractorAvailability from '../components/portal/SubcontractorAvailability';
import ProfileEditor from '../components/portal/ProfileEditor';
import HRFunctions from '../components/portal/HRFunctions';
import WorkdayETAConfirmation from '../components/portal/WorkdayETAConfirmation';
import { handleClockOut as handleClockOutFunc } from '@/api/functions';

export default function MyPortal() {
  const [currentUser, setCurrentUser] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [myLogs, setMyLogs] = useState([]);
  const [activeLog, setActiveLog] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  const loadPortalData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (!user.current_business_id) {
        setError("You are not yet associated with a business. If you have an invitation, please use the link in your email.");
        setIsLoading(false);
        return;
      }
      
      const todayStr = new Date().toISOString().split('T')[0];

      const [projectsData, rawLogsData, trainingData, settingsData, confirmationData] = await Promise.all([
        Project.filter({ assigned_to: user.email }, '-updated_date'),
        WorkLog.filter({ user_email: user.email }, '-created_date', 50),
        UserTrainingProgress.filter({ user_email: user.email }),
        BusinessSettings.filter({ business_id: user.current_business_id }),
        WorkdayConfirmation.filter({ user_email: user.email, workday_date: todayStr, status: 'pending_confirmation' })
      ]);
      
      if (settingsData.length > 0) setBusinessSettings(settingsData[0]);
      setPendingConfirmation(confirmationData.length > 0 ? confirmationData[0] : null);

      const now = new Date();
      let logsWereUpdated = false;
      for (const log of rawLogsData) {
        if (!log.end_time && new Date(log.start_time).toDateString() !== now.toDateString()) {
          const startTime = new Date(log.start_time);
          const endTime = new Date(startTime);
          endTime.setHours(23, 59, 59, 999);
          await WorkLog.update(log.id, {
            end_time: endTime.toISOString(),
            duration_hours: Math.max(0, (endTime - startTime) / (1000 * 60 * 60)),
            notes: (log.notes || '') + ' [Auto-clocked out by system]'
          });
          logsWereUpdated = true;
        }
      }
      
      const logsData = logsWereUpdated 
        ? await WorkLog.filter({ user_email: user.email }, '-created_date', 50)
        : rawLogsData;

      setMyProjects(projectsData);
      setMyLogs(logsData);
      setTrainingProgress(trainingData);
      setActiveLog(logsData.find(log => !log.end_time));

    } catch (error) {
      console.error("Error loading user portal data:", error);
      // The main Layout component will handle login redirects for auth errors.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  const handleClockIn = async (projectId, notes, location) => {
    if (!currentUser) return;
    try {
      const clockInData = {
        business_id: currentUser.current_business_id,
        user_email: currentUser.email,
        project_id: projectId,
        start_time: new Date().toISOString(),
        notes: notes,
      };
      if (location) clockInData.start_location = location;
      
      await WorkLog.create(clockInData);
      toast.success("Successfully clocked in!");
      loadPortalData();
    } catch (error) {
      console.error("Error clocking in:", error);
      toast.error("Failed to clock in. Please try again.");
    }
  };

  const handleClockOut = async (location, mileage, notes) => {
    if (!activeLog) return;
    try {
        await handleClockOutFunc({
            workLogId: activeLog.id,
            location,
            mileage,
            notes
        });
        toast.success("You have been clocked out successfully!");
        loadPortalData();
    } catch (error) {
      console.error("Error clocking out:", error);
      toast.error(error.message || "Failed to clock out.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
        <div className="p-8">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <UserIcon className="w-8 h-8 text-slate-700" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Portal</h1>
            <p className="text-slate-600">Welcome, {currentUser?.display_name || currentUser?.full_name}! Here's your workspace.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {pendingConfirmation && businessSettings && (
              <WorkdayETAConfirmation 
                confirmation={pendingConfirmation}
                businessSettings={businessSettings}
                onConfirm={loadPortalData}
              />
            )}
            {currentUser?.user_type === 'subcontractor' && (
                <SubcontractorAvailability currentUser={currentUser} onUpdate={loadPortalData} />
            )}
            <ClockIn 
              activeLog={activeLog}
              projects={myProjects.filter(p => p.status === 'active' || p.status === 'service')}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <MyTasks projects={myProjects} currentUser={currentUser} />
            <HRFunctions currentUser={currentUser} onUpdate={loadPortalData} /> 
          </div>

          <div className="space-y-6">
            <TrainingStatus progress={trainingProgress} />
            <MyTimeLogs logs={myLogs} projects={myProjects} />
          </div>
        </div>
        
        <div className="mt-6">
            <ProfileEditor currentUser={currentUser} onUpdate={loadPortalData} />
        </div>
      </div>
    </div>
  );
}