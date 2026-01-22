import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Play, Square, MapPin, AlertCircle } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function ClockIn({ activeLog, projects, onClockIn, onClockOut }) {
  const [selectedProject, setSelectedProject] = useState('');
  const [notes, setNotes] = useState('');
  const [mileage, setMileage] = useState('');
  const [clockOutNotes, setClockOutNotes] = useState('');
  const [timer, setTimer] = useState('');
  const [locationPermission, setLocationPermission] = useState('unknown');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);

  useEffect(() => {
    let interval;
    if (activeLog) {
      setClockOutNotes(activeLog.notes || '');
      interval = setInterval(() => {
        setTimer(formatDistanceToNowStrict(new Date(activeLog.start_time)));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeLog]);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationPermission('not_supported');
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermission(permission.state);
      
      permission.onchange = () => {
        setLocationPermission(permission.state);
      };
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocationPermission('unknown');
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      setIsGettingLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          const location = {
            latitude,
            longitude,
            address,
            accuracy
          };
          
          setCurrentLocation(location);
          setIsGettingLocation(false);
          resolve(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  };

  const handleClockIn = async () => {
    if (!selectedProject) {
      toast.error('Please select a project to work on.');
      return;
    }
    
    setIsClockingIn(true);
    
    try {
      let location = null;
      try {
        location = await getCurrentLocation();
      } catch (error) {
        console.warn('Location error, clocking in without GPS:', error);
        toast.warning('Could not get your location, but clocking you in anyway.');
      }
      
      await onClockIn(selectedProject, notes, location);
      setSelectedProject('');
      setNotes('');
      toast.success('Successfully clocked in!');
    } catch (error) {
      console.error('Error clocking in:', error);
      toast.error('Failed to clock in. Please try again.');
    } finally {
      setIsClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    setIsClockingOut(true);
    
    try {
      let location = null;
      try {
        location = await getCurrentLocation();
      } catch (error) {
        console.warn('Location error, clocking out without GPS:', error);
        toast.warning('Could not get your location, but clocking you out anyway.');
      }
      
      const mileageValue = mileage ? parseFloat(mileage) : 0;
      await onClockOut(location, mileageValue, clockOutNotes);
      setMileage('');
      setClockOutNotes('');
      toast.success('Successfully clocked out!');
    } catch (error) {
      console.error('Error clocking out:', error);
      toast.error('Failed to clock out. Please try again.');
    } finally {
      setIsClockingOut(false);
    }
  };

  const activeProjectDetails = activeLog ? projects.find(p => p.id === activeLog.project_id) : null;

  const getLocationStatusMessage = () => {
    switch (locationPermission) {
      case 'granted':
        return { type: 'success', message: 'Location tracking enabled' };
      case 'denied':
        return { type: 'warning', message: 'Location access denied. GPS tracking unavailable.' };
      case 'prompt':
        return { type: 'info', message: 'Location permission required for GPS tracking' };
      case 'not_supported':
        return { type: 'warning', message: 'Location not supported by this browser' };
      default:
        return { type: 'info', message: 'Checking location permissions...' };
    }
  };

  const locationStatus = getLocationStatusMessage();

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Clock className="w-5 h-5" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={`border ${
          locationStatus.type === 'success' ? 'border-green-200 bg-green-50' :
          locationStatus.type === 'warning' ? 'border-amber-200 bg-amber-50' :
          'border-blue-200 bg-blue-50'
        }`}>
          <MapPin className="h-4 w-4" />
          <AlertDescription className={
            locationStatus.type === 'success' ? 'text-green-700' :
            locationStatus.type === 'warning' ? 'text-amber-700' :
            'text-blue-700'
          }>
            {locationStatus.message}
          </AlertDescription>
        </Alert>

        {activeLog ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-emerald-50 rounded-lg">
              <div className="text-center md:text-left">
                <p className="text-slate-600">You are clocked in on:</p>
                <p className="font-bold text-lg text-emerald-800">{activeProjectDetails?.title || 'Loading...'}</p>
                {activeLog.start_location && (
                  <p className="text-xs text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    Started at: {activeLog.start_location.address}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <p className="text-2xl font-bold font-mono text-slate-800">{timer}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage (optional)</Label>
              <Input
                id="mileage"
                type="number"
                step="0.1"
                min="0"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="Enter miles driven"
              />
              <p className="text-xs text-slate-500">
                Enter total miles driven for this work session (for mileage-based pay)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clockOutNotes">Notes</Label>
              <Textarea
                id="clockOutNotes"
                value={clockOutNotes}
                onChange={(e) => setClockOutNotes(e.target.value)}
                placeholder="Add notes for this work session..."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleClockOut} 
              disabled={isGettingLocation || isClockingOut}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Square className="w-4 h-4 mr-2" />
              {isClockingOut ? 'Clocking out...' : isGettingLocation ? 'Getting Location...' : 'Clock Out'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Select onValueChange={setSelectedProject} value={selectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project to work on..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What are you working on?"
              />
            </div>

            <Button 
              onClick={handleClockIn} 
              disabled={!selectedProject || isGettingLocation || isClockingIn}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              {isClockingIn ? 'Clocking in...' : isGettingLocation ? 'Getting Location...' : 'Clock In'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}