
import React, { useState, useEffect } from 'react';
import { WorkLog, User, Project } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import LiveMapView from '../components/maps/LiveMapView';

export default function LiveMapPage() {
  const [activeLogs, setActiveLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Removed admin role check for data loading
      const [logs, usersData, projectsData] = await Promise.all([
        WorkLog.filter({ end_time: null }),
        User.list(),
        Project.list()
      ]);

      setActiveLogs(logs);
      setUsers(usersData);
      setProjects(projectsData);

    } catch (error) {
      console.error('Error loading live map data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const combinedData = activeLogs.map(log => {
    const user = users.find(u => u.email === log.user_email);
    const project = projects.find(p => p.id === log.project_id);
    return { ...log, user, project };
  }).filter(item => item.user && item.project && item.start_location);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
            <p className="ml-2 text-slate-600">Loading Live Map...</p>
          </div>
        </div>
      </div>
    );
  }

  // Removed admin role check for page access
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <style>{`
        @import url("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
        .map-container .leaflet-container {
          height: 600px;
          width: 100%;
          border-radius: 12px;
        }
      `}</style>
      
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <MapPin className="w-8 h-8 text-slate-700" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Live User Map</h1>
            <p className="text-slate-600">Real-time locations of clocked-in users and project sites</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Active Work Sessions ({combinedData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="map-container">
              <LiveMapView data={combinedData} />
            </div>
          </CardContent>
        </Card>
        
        {combinedData.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-500 mb-2">No active work sessions</h3>
            <p className="text-slate-400">When users clock in, their locations will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
