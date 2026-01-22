import React, { useState, useEffect } from 'react';
import { Alert, User } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Archive, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const alertsData = await Alert.filter({ user_email: user.email }, '-created_date');
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Failed to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await Alert.update(alertId, { read: true });
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to update notification.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadAlerts = alerts.filter(a => !a.read);
      await Promise.all(unreadAlerts.map(a => Alert.update(a.id, { read: true })));
      setAlerts(prev => prev.map(a => ({ ...a, read: true })));
      toast.success('All notifications marked as read.');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read.');
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'border-l-red-500 bg-red-50/50';
      case 'medium':
        return 'border-l-amber-500 bg-amber-50/50';
      default:
        return 'border-l-slate-300 bg-white/80';
    }
  };
  
  const getRelatedLink = (alert) => {
      if (!alert.related_type || !alert.related_id) return null;
      switch (alert.related_type) {
          case 'project':
              return createPageUrl(`ProjectDetail?id=${alert.related_id}`);
          case 'estimate':
              return createPageUrl(`Estimates?id=${alert.related_id}`);
          case 'accreditation':
              return createPageUrl('Accreditations');
          case 'insurance':
                return createPageUrl('Insurance');
          case 'workday_confirmation':
                return createPageUrl('MyPortal');
          default:
              return null;
      }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-slate-700" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
              <p className="text-slate-600">All your alerts and updates in one place.</p>
            </div>
          </div>
          <Button onClick={handleMarkAllAsRead} disabled={alerts.filter(a => !a.read).length === 0}>
            <Archive className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p>Loading notifications...</p>
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map(alert => {
              const relatedLink = getRelatedLink(alert);
              const AlertCard = ({ children }) => relatedLink ? 
                <Link to={relatedLink}>{children}</Link> : 
                <div>{children}</div>;

              return (
                <AlertCard key={alert.id}>
                    <Card className={`border-0 shadow-lg backdrop-blur-sm border-l-4 transition-all hover:shadow-xl ${getPriorityStyles(alert.priority)} ${alert.read ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4 flex items-start gap-4">
                        <div className="flex-1">
                        <p className="font-semibold text-slate-800">{alert.title}</p>
                        <p className="text-sm text-slate-600">{alert.message}</p>
                        <p className="text-xs text-slate-400 mt-2">
                            {formatDistanceToNow(new Date(alert.created_date), { addSuffix: true })}
                        </p>
                        </div>
                        {!alert.read && (
                        <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkAsRead(alert.id); }}>
                            <Check className="w-4 h-4 mr-2" />
                            Mark as read
                        </Button>
                        )}
                    </CardContent>
                    </Card>
                </AlertCard>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed rounded-lg bg-white/50">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-500">No notifications</h3>
            <p className="text-slate-400">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}