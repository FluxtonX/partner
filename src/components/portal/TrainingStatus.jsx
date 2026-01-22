import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TrainingStatus({ progress }) {
  const completedCount = progress.filter(p => p.status === 'completed').length;
  const inProgressCount = progress.filter(p => p.status === 'in_progress').length;
  const totalCount = progress.length;
  
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="w-5 h-5" />
          Training Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(completionRate)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-sm text-slate-500">Total</p>
            <p className="font-bold text-slate-900">{totalCount}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Completed</p>
            <p className="font-bold text-emerald-600">{completedCount}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="font-bold text-amber-600">{inProgressCount}</p>
          </div>
        </div>

        <div className="space-y-2">
          {progress.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="truncate">{item.training_id}</span>
              <Badge 
                variant={item.status === 'completed' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {item.status === 'completed' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                {item.status}
              </Badge>
            </div>
          ))}
        </div>

        <Link to={createPageUrl('Training')}>
          <button className="w-full text-center text-emerald-600 hover:text-emerald-700 font-medium text-sm">
            View All Training →
          </button>
        </Link>
      </CardContent>
    </Card>
  );
}