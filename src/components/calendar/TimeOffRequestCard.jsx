
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar, Clock, User, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function TimeOffRequestCard({ request, users, onApproval, onDelete, currentUser }) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const user = users.find(u => u.email === request.user_email);
  const userName = user?.full_name || request.user_email;

  const getRequestTypeColor = (type) => {
    const colors = {
      vacation: 'bg-blue-100 text-blue-800',
      sick_leave: 'bg-red-100 text-red-800',
      personal: 'bg-purple-100 text-purple-800',
      bereavement: 'bg-gray-100 text-gray-800',
      jury_duty: 'bg-yellow-100 text-yellow-800',
      military: 'bg-green-100 text-green-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[type] || colors.other;
  };

  const handleApproval = (status) => {
    onApproval(request.id, status, notes);
    setShowNotes(false);
    setNotes('');
  };

  const handleDenyWithNotes = () => {
    if (!showNotes) {
      setShowNotes(true);
      return;
    }
    handleApproval('denied');
  };

  const canDelete = () => {
    // Users can delete their own pending requests, admins can delete any pending requests
    if (request.status !== 'pending') return false;
    
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner');
    const isOwner = request.user_email === currentUser?.email;
    
    return isAdmin || isOwner;
  };

  return (
    <Card className="border-l-4 border-l-yellow-400">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-600" />
              <span className="font-semibold">{userName}</span>
            </div>
            <Badge className={getRequestTypeColor(request.request_type)}>
              {request.request_type.replace('_', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(request.start_date), 'MMM d')}</span>
                {request.start_date !== request.end_date && (
                  <>
                    <span>-</span>
                    <span>{format(new Date(request.end_date), 'MMM d')}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                <span>{request.total_days} day{request.total_days !== 1 ? 's' : ''}</span>
              </div>
            </div>
            {canDelete() && onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(request.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {request.reason && (
          <div>
            <p className="text-sm text-slate-600 font-medium">Reason:</p>
            <p className="text-sm">{request.reason}</p>
          </div>
        )}

        {showNotes && (
          <div>
            <label className="text-sm text-slate-600 font-medium">Notes (optional):</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for denial reason..."
              rows={2}
              className="mt-1"
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleApproval('approved')}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDenyWithNotes}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-1" />
            {showNotes ? 'Confirm Deny' : 'Deny'}
          </Button>
        </div>

        {showNotes && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowNotes(false);
              setNotes('');
            }}
            className="w-full"
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
