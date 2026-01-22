
import React, { useState, useEffect } from 'react';
import { ActivityLog, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity,
  FileText,
  Upload,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  DollarSign,
  MessageSquare,
  Clock,
  User as UserIcon,
  Eye,
  EyeOff,
  Settings,
  History
} from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

const ACTION_ICONS = {
  project_created: Settings,
  project_updated: Settings,
  status_changed: Activity,
  document_uploaded: Upload,
  document_deleted: Trash2,
  document_updated: FileText,
  estimate_sent: Send,
  estimate_approved: CheckCircle,
  estimate_declined: XCircle,
  invoice_created: FileText,
  invoice_sent: Send,
  payment_received: DollarSign,
  communication_sent: MessageSquare,
  task_created: Clock,
  task_completed: CheckCircle,
  work_logged: Clock,
  expense_added: DollarSign,
  change_order_created: FileText,
  contract_signed: FileText,
  project_completed: CheckCircle,
  client_created: UserIcon,
  client_updated: UserIcon,
  other: Activity
};

const ACTION_COLORS = {
  project_created: 'bg-blue-100 text-blue-700',
  project_updated: 'bg-blue-100 text-blue-700',
  status_changed: 'bg-purple-100 text-purple-700',
  document_uploaded: 'bg-green-100 text-green-700',
  document_deleted: 'bg-red-100 text-red-700',
  document_updated: 'bg-yellow-100 text-yellow-700',
  estimate_sent: 'bg-orange-100 text-orange-700',
  estimate_approved: 'bg-green-100 text-green-700',
  estimate_declined: 'bg-red-100 text-red-700',
  invoice_created: 'bg-blue-100 text-blue-700',
  invoice_sent: 'bg-orange-100 text-orange-700',
  payment_received: 'bg-green-100 text-green-700',
  communication_sent: 'bg-blue-100 text-blue-700',
  task_created: 'bg-yellow-100 text-yellow-700',
  task_completed: 'bg-green-100 text-green-700',
  work_logged: 'bg-purple-100 text-purple-700',
  expense_added: 'bg-red-100 text-red-700',
  change_order_created: 'bg-orange-100 text-orange-700',
  contract_signed: 'bg-green-100 text-green-700',
  project_completed: 'bg-green-100 text-green-700',
  client_created: 'bg-blue-100 text-blue-700',
  client_updated: 'bg-blue-100 text-blue-700',
  other: 'bg-gray-100 text-gray-700'
};

export default function ActivityFeed({ project, client, currentUser, showClientView = false }) {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [viewMode, setViewMode] = useState(showClientView ? 'client' : 'internal');
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadActivities();
    loadUsers();
  }, [project?.id, client?.id]);

  useEffect(() => {
    applyFilters();
  }, [activities, filterType, filterUser, viewMode]);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      let allActivities = [];
      
      if (project?.id) {
        const projectActivities = await ActivityLog.filter(
          { project_id: project.id },
          '-created_date'
        );
        allActivities = [...allActivities, ...projectActivities];
      }
      
      if (client?.id) {
        const clientActivities = await ActivityLog.filter(
          { client_id: client.id },
          '-created_date'
        );
        allActivities = [...allActivities, ...clientActivities];
      }

      // Remove duplicates and sort
      const uniqueActivities = allActivities.filter((activity, index, self) =>
        index === self.findIndex(a => a.id === activity.id)
      );
      
      setActivities(uniqueActivities.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      ));
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await User.list();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Filter by client visibility
    if (viewMode === 'client') {
      filtered = filtered.filter(activity => activity.visible_to_client);
    } else if (viewMode === 'internal') {
      filtered = filtered.filter(activity => !activity.visible_to_client);
    }

    // Filter by action type
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.action_type === filterType);
    }

    // Filter by user
    if (filterUser !== 'all') {
      filtered = filtered.filter(activity => activity.user_email === filterUser);
    }

    setFilteredActivities(filtered);
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || user?.display_name || email;
  };

  const getUserInitials = (email) => {
    const name = getUserName(email);
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatActivityDate = (dateString) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy \'at\' h:mm a');
    }
  };

  const getActionIcon = (actionType) => {
    const IconComponent = ACTION_ICONS[actionType] || Activity;
    return <IconComponent className="w-4 h-4" />;
  };

  const groupActivitiesByDate = (activities) => {
    const groups = {};
    
    activities.forEach(activity => {
      const date = parseISO(activity.created_date);
      let groupKey;
      
      if (isToday(date)) {
        groupKey = 'Today';
      } else if (isYesterday(date)) {
        groupKey = 'Yesterday';
      } else {
        groupKey = format(date, 'MMMM d, yyyy');
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });
    
    return groups;
  };

  const uniqueActionTypes = [...new Set(activities.map(a => a.action_type))];
  const uniqueUsers = [...new Set(activities.map(a => a.user_email))];
  const groupedActivities = groupActivitiesByDate(filteredActivities);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {filteredActivities.length} activities
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          {!showClientView && (
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList>
                <TabsTrigger value="all">All Activities</TabsTrigger>
                <TabsTrigger value="client" className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Client View
                </TabsTrigger>
                <TabsTrigger value="internal" className="flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  Internal Only
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActionTypes.map(actionType => (
                <SelectItem key={actionType} value={actionType}>
                  {actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {uniqueUsers.map(userEmail => (
                <SelectItem key={userEmail} value={userEmail}>
                  {getUserName(userEmail)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500">Loading activities...</p>
            </div>
          ) : Object.keys(groupedActivities).length > 0 ? (
            Object.entries(groupedActivities).map(([dateGroup, dayActivities]) => (
              <div key={dateGroup}>
                <h4 className="text-sm font-semibold text-slate-700 mb-4 sticky top-0 bg-white py-2">
                  {dateGroup}
                </h4>
                <div className="space-y-4 relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200"></div>
                  
                  {dayActivities.map((activity, index) => (
                    <div key={activity.id} className="ml-16 relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-12 top-4 w-8 h-8 rounded-full flex items-center justify-center ${ACTION_COLORS[activity.action_type] || ACTION_COLORS.other}`}>
                        {getActionIcon(activity.action_type)}
                      </div>
                      
                      <div className="p-4 bg-white/80 rounded-lg border hover:bg-white transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {getUserInitials(activity.user_email)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {activity.user_name || getUserName(activity.user_email)}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {activity.action_type.replace(/_/g, ' ')}
                                </Badge>
                                {!activity.visible_to_client && !showClientView && (
                                  <Badge variant="outline" className="text-xs text-slate-500">
                                    <EyeOff className="w-2 h-2 mr-1" />
                                    Internal
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-slate-700 mb-2">
                                {activity.action_description}
                              </p>
                              
                              {/* Metadata */}
                              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                <div className="text-xs text-slate-500 space-y-1">
                                  {activity.metadata.filename && (
                                    <div>File: {activity.metadata.filename}</div>
                                  )}
                                  {activity.metadata.old_status && activity.metadata.new_status && (
                                    <div>
                                      Status: {activity.metadata.old_status} → {activity.metadata.new_status}
                                    </div>
                                  )}
                                  {activity.metadata.amount && (
                                    <div>Amount: ${activity.metadata.amount}</div>
                                  )}
                                </div>
                              )}
                              
                              <p className="text-xs text-slate-400 mt-2">
                                {formatActivityDate(activity.created_date)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No activities found</p>
              <p className="text-sm text-slate-400">
                Activities will appear here as actions are performed
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
