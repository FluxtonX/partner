import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  DollarSign, 
  Calendar, 
  FileText, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  Eye 
} from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';

export default function AssignmentStatusCard({ assignment, project, onBidSubmit, onStatusUpdate }) {
  const getStatusColor = (status) => {
    const colors = {
      'pending_bid': 'bg-yellow-100 text-yellow-800',
      'bid_submitted': 'bg-blue-100 text-blue-800',
      'contract_pending': 'bg-purple-100 text-purple-800',
      'contract_signed': 'bg-emerald-100 text-emerald-800',
      'in_progress': 'bg-indigo-100 text-indigo-800',
      'completed': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAssignmentDescription = () => {
    const details = assignment.assignment_details;
    switch (assignment.assignment_type) {
      case 'project':
        return `Full project: ${project?.title || 'Unknown Project'}`;
      case 'category':
        return `Category: ${details.category} - ${details.description || 'Multiple items'}`;
      case 'task':
        return `Task: ${details.description}`;
      default:
        return 'Assignment details';
    }
  };

  const isOverdue = () => {
    if (!assignment.committed_completion_date) return false;
    return isPast(new Date(assignment.committed_completion_date)) && assignment.status !== 'completed';
  };

  const getDaysUntilDeadline = () => {
    if (!assignment.committed_completion_date) return null;
    const days = differenceInDays(new Date(assignment.committed_completion_date), new Date());
    return days;
  };

  const getActionButton = () => {
    switch (assignment.status) {
      case 'pending_bid':
        return (
          <Button onClick={onBidSubmit} className="bg-emerald-600 hover:bg-emerald-700">
            <DollarSign className="w-4 h-4 mr-2" />
            Submit Bid
          </Button>
        );
      
      case 'contract_signed':
        return (
          <Button onClick={() => onStatusUpdate('in_progress')} className="bg-blue-600 hover:bg-blue-700">
            <Play className="w-4 h-4 mr-2" />
            Start Work
          </Button>
        );
      
      case 'in_progress':
        return (
          <Button onClick={() => onStatusUpdate('completed')} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm ${isOverdue() ? 'border-l-4 border-l-red-500' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 mb-2">
              {getAssignmentDescription()}
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(assignment.status)}>
                {assignment.status.replace('_', ' ')}
              </Badge>
              {isOverdue() && (
                <Badge className="bg-red-100 text-red-800">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
          </div>
          
          <div className="ml-4">
            {getActionButton()}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
          <div>
            <span className="font-medium">Assigned by:</span>
            <p>{assignment.assigned_by}</p>
          </div>
          
          {assignment.final_amount && (
            <div>
              <span className="font-medium">Amount:</span>
              <p className="text-green-600 font-bold">${assignment.final_amount.toLocaleString()}</p>
            </div>
          )}
          
          {assignment.committed_start_date && (
            <div>
              <span className="font-medium">Start Date:</span>
              <p>{format(new Date(assignment.committed_start_date), 'MMM d, yyyy')}</p>
            </div>
          )}
          
          {assignment.committed_completion_date && (
            <div>
              <span className="font-medium">Due Date:</span>
              <p className={isOverdue() ? 'text-red-600 font-semibold' : ''}>
                {format(new Date(assignment.committed_completion_date), 'MMM d, yyyy')}
              </p>
              {getDaysUntilDeadline() !== null && !isOverdue() && (
                <p className="text-xs text-slate-500">
                  {getDaysUntilDeadline()} days remaining
                </p>
              )}
            </div>
          )}
        </div>

        {/* Timeline Progress */}
        {assignment.status === 'in_progress' && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>
                Started: {assignment.actual_start_date ? format(new Date(assignment.actual_start_date), 'MMM d, yyyy') : 'Not started'}
              </span>
            </div>
          </div>
        )}

        {/* Penalties Information */}
        {(assignment.penalty_amount > 0 || assignment.holdback_amount > 0) && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {assignment.penalty_amount > 0 && (
                <div>
                  <span className="font-medium text-red-600">Penalties Applied:</span>
                  <p className="text-red-600">${assignment.penalty_amount.toFixed(2)}</p>
                </div>
              )}
              {assignment.holdback_amount > 0 && (
                <div>
                  <span className="font-medium text-yellow-600">Holdback Amount:</span>
                  <p className="text-yellow-600">${assignment.holdback_amount.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}