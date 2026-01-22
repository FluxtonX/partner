
import React, { useState, useEffect } from 'react';
import { WorkLog, User, Project } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, User as UserIcon, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import WorkLogForm from '../components/worklogs/WorkLogForm';

export default function WorkLogDashboard() {
  const [workLogs, setWorkLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filteredUser, setFilteredUser] = useState('all');
  const [filteredProject, setFilteredProject] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (user.role !== 'admin') {
        // Non-admin users can only see their own logs
        const [userLogs, projectsData] = await Promise.all([
          WorkLog.filter({ user_email: user.email }, '-start_time'),
          Project.list()
        ]);
        setWorkLogs(userLogs);
        setProjects(projectsData);
        setUsers([user]);
      } else {
        // Admin can see all logs
        const [allLogs, usersData, projectsData] = await Promise.all([
          WorkLog.list('-start_time'),
          User.list(),
          Project.list()
        ]);
        setWorkLogs(allLogs);
        setUsers(usersData);
        setProjects(projectsData);
      }
    } catch (error) {
      console.error('Error loading work logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLog = async (logData, logId) => {
    if (!logId) return; // Ensure logId is present for update
    try {
      await WorkLog.update(logId, logData);
      setShowEditForm(false);
      setEditingLog(null);
      loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error updating work log:', error);
    }
  };

  const getFilteredLogs = () => {
    return workLogs.filter(log => {
      const userMatch = filteredUser === 'all' || log.user_email === filteredUser;
      const projectMatch = filteredProject === 'all' || log.project_id === filteredProject;
      return userMatch && projectMatch;
    });
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  const getLocationDisplay = (location) => {
    if (!location) return 'No location';
    return location.address || `${location.latitude?.toFixed(6)}, ${location.longitude?.toFixed(6)}`;
  };

  const filteredLogs = getFilteredLogs();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-8 h-8 text-slate-700" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Work Log Dashboard</h1>
            <p className="text-slate-600">Track time and location data for all work sessions</p>
          </div>
        </div>

        {/* Filters */}
        {currentUser?.role === 'admin' && (
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select value={filteredUser} onValueChange={setFilteredUser}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.email}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={filteredProject} onValueChange={setFilteredProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Work Logs */}
        <div className="space-y-4">
          {filteredLogs.map(log => (
            <Card key={log.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{getProjectName(log.project_id)}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        <span>{getUserName(log.user_email)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(log.start_time), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-100 text-blue-800">
                      {log.duration_hours ? `${log.duration_hours.toFixed(2)} hrs` : 'In Progress'}
                    </Badge>
                    {log.total_mileage && (
                      <Badge className="bg-green-100 text-green-800 ml-2">
                        {log.total_mileage.toFixed(1)} miles
                      </Badge>
                    )}
                    {currentUser?.role === 'admin' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-2"
                        onClick={() => {
                          setEditingLog(log);
                          setShowEditForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4 text-slate-500" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-1">Clock In</h4>
                      <p className="text-sm">{format(new Date(log.start_time), 'h:mm a')}</p>
                      {log.start_location && (
                        <div className="flex items-start gap-1 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{getLocationDisplay(log.start_location)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-1">Clock Out</h4>
                      <p className="text-sm">
                        {log.end_time ? format(new Date(log.end_time), 'h:mm a') : 'Still active'}
                      </p>
                      {log.end_location && (
                        <div className="flex items-start gap-1 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{getLocationDisplay(log.end_location)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {log.notes && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-slate-700 mb-1">Notes</h4>
                    <p className="text-sm text-slate-600">{log.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No work logs found</p>
              <p className="text-slate-400">Time entries will appear here once users start clocking in.</p>
            </div>
          )}
        </div>
      </div>
      {showEditForm && editingLog && (
        <WorkLogForm
          worklog={editingLog}
          users={users}
          projects={projects}
          onSubmit={handleUpdateLog}
          onCancel={() => {
            setShowEditForm(false);
            setEditingLog(null);
          }}
        />
      )}
    </div>
  );
}
