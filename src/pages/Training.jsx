import React, { useState, useEffect } from 'react';
import { Training, UserTrainingProgress, ProductOrService, User, UserTask, TrainingFAQ } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Clock, CheckCircle, AlertCircle, BookOpen, Plus, Eye, HelpCircle, MessageSquare } from 'lucide-react';

import TrainingCard from '../components/training/TrainingCard';
import TrainingForm from '../components/training/TrainingForm';
import TrainingViewer from '../components/training/TrainingViewer';
import TrainingReviewList from '../components/training/TrainingReviewList';
import TrainingFAQManager from '../components/training/TrainingFAQManager';

export default function TrainingPage() {
  const [trainings, setTrainings] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [productsServices, setProductsServices] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTrainer, setIsTrainer] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [redirectTask, setRedirectTask] = useState(null);

  useEffect(() => {
    loadData();
    checkForTaskRedirect();
  }, []);

  const checkForTaskRedirect = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('task_id');
    const trainingId = urlParams.get('training_id');
    
    if (taskId && trainingId) {
      // User was redirected from a task, show specific training
      setRedirectTask(taskId);
      // Find and show the training
      loadData().then(() => {
        const training = trainings.find(t => t.id === trainingId);
        if (training) {
          handleStartTraining(training);
        }
      });
    }
  };

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setIsAdmin(user.role === 'admin');
      setIsTrainer(user.is_trainer);

      const [trainingsData, progressData, productsData, usersData] = await Promise.all([
        Training.list('-created_date'),
        UserTrainingProgress.filter({ user_email: user.email }),
        ProductOrService.list(),
        user.is_trainer ? User.list() : Promise.resolve([]) // Only fetch all users if current user is a trainer
      ]);
      
      setTrainings(trainingsData);
      setUserProgress(progressData);
      setProductsServices(productsData);
      setAllUsers(usersData);

      // If trainer, load items for review
      if (user.is_trainer) {
        const reviewItems = await UserTrainingProgress.filter({ status: 'under_review' });
        // Filter reviews where the trainer is the designated approver for that training
        const assignedReviews = reviewItems.filter(review => {
          const training = trainingsData.find(t => t.id === review.training_id);
          return training && training.designated_trainer_email === user.email;
        });
        setReviews(assignedReviews);
      }

    } catch (error) {
      console.error('Error loading training data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressForTraining = (trainingId) => {
    return userProgress.find(p => p.training_id === trainingId);
  };

  const getProductServiceName = (productServiceId) => {
    const item = productsServices.find(p => p.id === productServiceId);
    return item?.name || 'Unknown Product/Service';
  };

  const handleStartTraining = async (training) => {
    try {
      const existingProgress = getProgressForTraining(training.id);
      if (!existingProgress) {
        await UserTrainingProgress.create({
          user_email: currentUser.email,
          training_id: training.id,
          status: 'in_progress',
          started_date: new Date().toISOString()
        });
        loadData();
      }
      setSelectedTraining(training);
      setShowViewer(true);
    } catch (error) {
      console.error('Error starting training:', error);
    }
  };

  const handleCompleteTraining = async (trainingId, score = null, mediaProgress = [], assessmentAnswers = []) => {
    try {
      const progress = getProgressForTraining(trainingId);
      if (progress) {
        const updateData = {
          status: 'under_review',
          score: score,
          media_progress: mediaProgress,
          assessment_answers: assessmentAnswers
        };
        
        await UserTrainingProgress.update(progress.id, updateData);
        
        // If this was from a task redirect, update the task status
        if (redirectTask) {
          await UserTask.update(redirectTask, { status: 'in_progress' });
        }
        
        loadData();
      }
    } catch (error) {
      console.error('Error submitting training for review:', error);
    }
  };

  const handleCreateTraining = async (trainingData) => {
    try {
      await Training.create(trainingData);
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating training:', error);
    }
  };

  const handleApproveTraining = async (progressId) => {
    try {
      await UserTrainingProgress.update(progressId, {
        status: 'completed',
        completed_date: new Date().toISOString()
      });
      loadData();
    } catch (error) {
      console.error('Error approving training:', error);
    }
  };

  const handleRejectTraining = async (progressId) => {
    try {
      await UserTrainingProgress.update(progressId, {
        status: 'failed' // Or back to 'in_progress'
      });
      loadData();
    } catch (error) {
      console.error('Error rejecting training:', error);
    }
  };

  const requiredTrainings = trainings.filter(t => t.required);
  const optionalTrainings = trainings.filter(t => !t.required);
  const completedCount = userProgress.filter(p => p.status === 'completed').length;
  const inProgressCount = userProgress.filter(p => p.status === 'in_progress').length;

  const overallProgress = trainings.length > 0 ? (completedCount / trainings.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-slate-700" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Training Center</h1>
              <p className="text-slate-600">Complete required training for products and services</p>
              {redirectTask && (
                <p className="text-emerald-600 font-medium">Complete training to start your assigned task</p>
              )}
            </div>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Training
            </Button>
          )}
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{trainings.length}</p>
                  <p className="text-sm text-slate-600 font-medium">Total Trainings</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
                  <p className="text-sm text-slate-600 font-medium">Completed</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-600">{inProgressCount}</p>
                  <p className="text-sm text-slate-600 font-medium">In Progress</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{Math.round(overallProgress)}%</p>
                  <p className="text-sm text-slate-600 font-medium">Overall Progress</p>
                </div>
                <GraduationCap className="w-8 h-8 text-purple-500" />
              </div>
              <div className="mt-3">
                <Progress value={overallProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training Tabs */}
        <Tabs defaultValue="required" className="space-y-6">
          <TabsList className={`grid w-full ${isTrainer ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="required">
              <AlertCircle className="w-4 h-4 mr-2" />
              Required Training ({requiredTrainings.length})
            </TabsTrigger>
            <TabsTrigger value="optional">
              <BookOpen className="w-4 h-4 mr-2" />
              Optional Training ({optionalTrainings.length})
            </TabsTrigger>
            <TabsTrigger value="faq">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ & Support
            </TabsTrigger>
            {isTrainer && (
              <TabsTrigger value="review">
                <Eye className="w-4 h-4 mr-2" />
                Awaiting Review ({reviews.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="required" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {requiredTrainings.map(training => (
                <TrainingCard
                  key={training.id}
                  training={training}
                  progress={getProgressForTraining(training.id)}
                  productServiceName={getProductServiceName(training.product_service_id)}
                  onStart={() => handleStartTraining(training)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="optional" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {optionalTrainings.map(training => (
                <TrainingCard
                  key={training.id}
                  training={training}
                  progress={getProgressForTraining(training.id)}
                  productServiceName={getProductServiceName(training.product_service_id)}
                  onStart={() => handleStartTraining(training)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <TrainingFAQManager 
              trainings={trainings}
              currentUser={currentUser}
              isTrainer={isTrainer}
            />
          </TabsContent>
          
          {isTrainer && (
            <TabsContent value="review" className="space-y-4">
              <TrainingReviewList 
                items={reviews}
                onApprove={handleApproveTraining}
                onReject={handleRejectTraining}
                users={allUsers}
                trainings={trainings}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Training Form Modal */}
        {showForm && (
          <TrainingForm
            productsServices={productsServices}
            onSubmit={handleCreateTraining}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Training Viewer Modal */}
        {showViewer && selectedTraining && (
          <TrainingViewer
            training={selectedTraining}
            productServiceName={getProductServiceName(selectedTraining.product_service_id)}
            onComplete={(score, mediaProgress, assessmentAnswers) => 
              handleCompleteTraining(selectedTraining.id, score, mediaProgress, assessmentAnswers)
            }
            onClose={() => {
              setShowViewer(false);
              // If this was a task redirect and user closes without completing, redirect back
              if (redirectTask) {
                window.location.href = createPageUrl('UserPortal');
              }
            }}
          />
        )}
      </div>
    </div>
  );
}