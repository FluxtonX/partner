import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

export default function TrainingReviewList({ items, onApprove, onReject, users, trainings }) {

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const getUserDetails = (email) => {
    const user = users.find(u => u.email === email);
    return user;
  };
  
  const getTrainingTitle = (trainingId) => {
    const training = trainings.find(t => t.id === trainingId);
    return training?.title || 'Unknown Training';
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <p className="text-slate-500 text-lg">All caught up!</p>
        <p className="text-slate-400">No submissions are waiting for your review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map(item => {
        const submittingUser = getUserDetails(item.user_email);
        return (
          <Card key={item.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{getTrainingTitle(item.training_id)}</p>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  Submitted by: {getUserName(item.user_email)}
                  {submittingUser?.is_trainer && (
                    <GraduationCap className="w-4 h-4 text-emerald-600" title="Certified Trainer" />
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  On: {format(new Date(item.updated_date), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onReject(item.id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => onApprove(item.id)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}