
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle, Play, BookOpen, Eye } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  not_started: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700'
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700'
};

export default function TrainingCard({ training, progress, productServiceName, onStart }) {
  const status = progress?.status || 'not_started';
  const isCompleted = status === 'completed';
  const isUnderReview = status === 'under_review';
  
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'under_review':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-400" />;
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'completed':
        return 'Review';
      case 'in_progress':
        return 'Continue';
      case 'under_review':
        return 'Under Review';
      default:
        return 'Start Training';
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            {training.required && (
              <Badge className="bg-red-100 text-red-700 border-red-200">
                Required
              </Badge>
            )}
            <Badge className={`${difficultyColors[training.difficulty_level]} border`}>
              {training.difficulty_level}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
          </div>
        </div>
        
        <CardTitle className="text-lg mb-2">{training.title}</CardTitle>
        
        <div className="space-y-2">
          <p className="text-sm text-slate-600 font-medium">
            Product/Service: {productServiceName}
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>{training.estimated_duration_minutes || 30} minutes</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-slate-600 text-sm line-clamp-3">{training.description}</p>

        {/* Progress Bar for in-progress trainings */}
        {status === 'in_progress' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Progress</span>
              <span className="font-medium text-slate-900">In Progress</span>
            </div>
            <Progress value={50} className="h-2" />
          </div>
        )}

        {/* Completion info */}
        {isCompleted && progress.completed_date && (
          <div className="p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-700 font-medium">Completed</span>
              <span className="text-emerald-600">
                {format(new Date(progress.completed_date), 'MMM d, yyyy')}
              </span>
            </div>
            {progress.score && (
              <div className="mt-1">
                <span className="text-emerald-700 font-semibold">Score: {progress.score}%</span>
              </div>
            )}
          </div>
        )}

        {/* Under Review Info */}
        {isUnderReview && (
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <div className="flex items-center justify-center text-sm text-blue-700 font-medium">
              <Eye className="w-4 h-4 mr-2"/>
              <span>Submitted for review</span>
            </div>
          </div>
        )}

        <Button 
          onClick={onStart}
          disabled={isUnderReview}
          className={`w-full ${isCompleted ? 'bg-slate-600 hover:bg-slate-700' : isUnderReview ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          <Play className="w-4 h-4 mr-2" />
          {getButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
}
