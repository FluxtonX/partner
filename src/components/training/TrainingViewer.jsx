import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, X, Play, FileText, Video, Image, ChevronRight, ChevronLeft } from "lucide-react";
import { UserTrainingProgress } from '@/api/entities';

export default function TrainingViewer({ training, productServiceName, onComplete, onClose }) {
  const [currentStep, setCurrentStep] = useState(0); // 0 = content, 1+ = media, last = assessment
  const [mediaProgress, setMediaProgress] = useState([]);
  const [assessmentAnswers, setAssessmentAnswers] = useState([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessmentScore, setAssessmentScore] = useState(0);

  const totalSteps = 1 + (training.media_content?.length || 0) + (training.has_assessment ? 1 : 0);
  const isAssessmentStep = training.has_assessment && currentStep === totalSteps - 1;
  const isMediaStep = currentStep > 0 && currentStep <= (training.media_content?.length || 0);

  useEffect(() => {
    // Initialize assessment answers
    if (training.assessment_questions) {
      setAssessmentAnswers(training.assessment_questions.map(() => ''));
    }
    // Initialize media progress
    if (training.media_content) {
      setMediaProgress(training.media_content.map(() => ({ completed: false, time_spent: 0 })));
    }
  }, [training]);

  const handleNext = () => {
    if (isMediaStep) {
      // Mark current media as completed
      const mediaIndex = currentStep - 1;
      setMediaProgress(prev => 
        prev.map((item, index) => 
          index === mediaIndex ? { ...item, completed: true } : item
        )
      );
    }
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteTraining();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAssessmentAnswer = (questionIndex, answer) => {
    setAssessmentAnswers(prev => 
      prev.map((a, index) => index === questionIndex ? answer : a)
    );
  };

  const calculateAssessmentScore = () => {
    if (!training.assessment_questions) return 0;

    let totalPoints = 0;
    let earnedPoints = 0;

    training.assessment_questions.forEach((question, index) => {
      totalPoints += question.points;
      const userAnswer = assessmentAnswers[index]?.toLowerCase().trim();
      const correctAnswer = question.correct_answer?.toLowerCase().trim();
      
      if (userAnswer === correctAnswer) {
        earnedPoints += question.points;
      }
    });

    return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  };

  const handleCompleteTraining = async () => {
    setIsCompleting(true);
    
    let finalScore = 0;
    let passed = true;

    if (training.has_assessment) {
      finalScore = calculateAssessmentScore();
      passed = finalScore >= training.passing_score_percentage;
      setAssessmentScore(finalScore);
      setShowResults(true);
      
      if (!passed) {
        setIsCompleting(false);
        return;
      }
    }

    try {
      await onComplete(finalScore, mediaProgress, assessmentAnswers);
      setIsCompleting(false);
      onClose();
    } catch (error) {
      console.error('Error completing training:', error);
      setIsCompleting(false);
    }
  };

  const getCurrentStepContent = () => {
    if (currentStep === 0) {
      // Training content step
      return (
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: training.content.replace(/\n/g, '<br>') }} />
        </div>
      );
    } else if (isMediaStep) {
      // Media content step
      const mediaIndex = currentStep - 1;
      const media = training.media_content[mediaIndex];
      
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            {media.type === 'video' && <Video className="w-5 h-5" />}
            {media.type === 'presentation' && <FileText className="w-5 h-5" />}
            {media.type === 'image' && <Image className="w-5 h-5" />}
            <h3 className="text-lg font-semibold">{media.filename}</h3>
          </div>
          
          {media.type === 'video' ? (
            <video 
              controls 
              className="w-full rounded-lg"
              onEnded={() => {
                const newProgress = [...mediaProgress];
                newProgress[mediaIndex] = { ...newProgress[mediaIndex], completed: true };
                setMediaProgress(newProgress);
              }}
            >
              <source src={media.url} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="border rounded-lg p-4 text-center">
              <a 
                href={media.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                <Play className="w-6 h-6 mx-auto mb-2" />
                Open {media.filename}
              </a>
              <p className="text-sm text-slate-500 mt-2">
                Click to view this {media.type} in a new tab
              </p>
            </div>
          )}
        </div>
      );
    } else if (isAssessmentStep && !showResults) {
      // Assessment step
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">Final Assessment</h3>
            <p className="text-slate-600">
              You need {training.passing_score_percentage}% to pass this assessment.
            </p>
          </div>
          
          {training.assessment_questions.map((question, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base">
                  Question {index + 1} ({question.points} point{question.points !== 1 ? 's' : ''})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium">{question.question}</p>
                
                {question.type === 'multiple_choice' && (
                  <RadioGroup 
                    value={assessmentAnswers[index]} 
                    onValueChange={(value) => handleAssessmentAnswer(index, value)}
                  >
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`q${index}-${optionIndex}`} />
                        <Label htmlFor={`q${index}-${optionIndex}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {question.type === 'true_false' && (
                  <RadioGroup 
                    value={assessmentAnswers[index]} 
                    onValueChange={(value) => handleAssessmentAnswer(index, value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id={`q${index}-true`} />
                      <Label htmlFor={`q${index}-true`}>True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id={`q${index}-false`} />
                      <Label htmlFor={`q${index}-false`}>False</Label>
                    </div>
                  </RadioGroup>
                )}
                
                {question.type === 'short_answer' && (
                  <Textarea
                    value={assessmentAnswers[index]}
                    onChange={(e) => handleAssessmentAnswer(index, e.target.value)}
                    placeholder="Enter your answer..."
                    rows={3}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      );
    } else if (showResults) {
      // Assessment results
      const passed = assessmentScore >= training.passing_score_percentage;
      return (
        <div className="text-center space-y-6">
          <div className={`p-6 rounded-lg ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {passed ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <X className="w-8 h-8 text-red-600" />
              )}
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-800' : 'text-red-800'}`}>
              {passed ? 'Congratulations!' : 'Try Again'}
            </h3>
            <p className={`text-lg ${passed ? 'text-green-700' : 'text-red-700'}`}>
              Your Score: {assessmentScore}%
            </p>
            <p className={`text-sm ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed 
                ? 'You have successfully completed this training!' 
                : `You need ${training.passing_score_percentage}% to pass. Please review the material and try again.`
              }
            </p>
          </div>
        </div>
      );
    }
  };

  const progress = ((currentStep) / totalSteps) * 100;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{training.title}</DialogTitle>
            <div className="flex gap-2">
              {training.required && (
                <Badge className="bg-red-100 text-red-700">Required</Badge>
              )}
              <Badge variant="outline">{training.difficulty_level}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Product/Service: {productServiceName}</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{training.estimated_duration_minutes} minutes</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Progress</span>
              <span>Step {currentStep + 1} of {totalSteps}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="py-6 min-h-[400px]">
          {getCurrentStepContent()}
        </div>

        <DialogFooter className="pt-4 border-t flex justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isCompleting}
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            {currentStep > 0 && !showResults && (
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={isCompleting}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {!showResults ? (
              <Button 
                onClick={handleNext} 
                disabled={isCompleting || (isAssessmentStep && assessmentAnswers.some(a => !a))}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isCompleting ? 'Submitting...' : 
                 currentStep === totalSteps - 1 ? 'Submit for Review' : 'Next'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : assessmentScore >= training.passing_score_percentage ? (
              <Button 
                onClick={() => handleCompleteTraining()} 
                disabled={isCompleting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isCompleting ? 'Submitting...' : 'Complete Training'}
              </Button>
            ) : (
              <Button onClick={onClose} variant="outline">
                Review Material
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}