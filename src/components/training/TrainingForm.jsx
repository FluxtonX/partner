import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, Upload, Plus, Trash2, Video, FileText, Image } from "lucide-react";
import { User } from '@/api/entities';
import { UploadFile } from '@/api/integrations';

export default function TrainingForm({ productsServices, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    product_service_id: '',
    required: true,
    estimated_duration_minutes: 30,
    category: 'other',
    difficulty_level: 'beginner',
    designated_trainer_email: '',
    media_content: [],
    has_assessment: false,
    assessment_questions: [],
    passing_score_percentage: 80
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      const users = await User.list();
      setTrainers(users.filter(u => u.is_trainer));
    } catch (error) {
      console.error("Error loading trainers:", error);
    }
  };

  const handleMediaUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      const mediaType = file.type.includes('video') ? 'video' :
                       file.type.includes('presentation') || file.name.includes('.ppt') ? 'presentation' :
                       file.type.includes('image') ? 'image' : 'document';
      
      const newMedia = {
        type: mediaType,
        url: file_url,
        filename: file.name,
        duration_minutes: mediaType === 'video' ? 5 : 0, // Default, can be edited
        order: formData.media_content.length
      };

      setFormData(prev => ({
        ...prev,
        media_content: [...prev.media_content, newMedia]
      }));
    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media_content: prev.media_content.filter((_, i) => i !== index)
    }));
  };

  const addAssessmentQuestion = () => {
    const newQuestion = {
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1
    };

    setFormData(prev => ({
      ...prev,
      assessment_questions: [...prev.assessment_questions, newQuestion]
    }));
  };

  const updateAssessmentQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      assessment_questions: prev.assessment_questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeAssessmentQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      assessment_questions: prev.assessment_questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'presentation': return <FileText className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Training</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Training Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                    placeholder="Enter training title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_service_id">Product/Service *</Label>
                  <Select
                    value={formData.product_service_id}
                    onValueChange={(value) => setFormData(prev => ({...prev, product_service_id: value}))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product or service" />
                    </SelectTrigger>
                    <SelectContent>
                      {productsServices.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Brief description of the training"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designated_trainer_email">Designated Trainer</Label>
                  <Select
                    value={formData.designated_trainer_email}
                    onValueChange={(value) => setFormData(prev => ({...prev, designated_trainer_email: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a trainer for approvals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>No Specific Trainer</SelectItem>
                      {trainers.map(trainer => (
                        <SelectItem key={trainer.id} value={trainer.email}>
                          {trainer.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.estimated_duration_minutes}
                    onChange={(e) => setFormData(prev => ({...prev, estimated_duration_minutes: parseInt(e.target.value)}))}
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="product_knowledge">Product Knowledge</SelectItem>
                      <SelectItem value="process">Process</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty_level">Difficulty</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value) => setFormData(prev => ({...prev, difficulty_level: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={formData.required}
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, required: checked}))}
                />
                <Label htmlFor="required">Required Training</Label>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Training Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
                  placeholder="Enter the full training content (supports HTML formatting)"
                  rows={12}
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Multimedia Content</h3>
                <div>
                  <input
                    type="file"
                    accept="video/*,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf,image/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="media-upload"
                  />
                  <label htmlFor="media-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingMedia}
                      className="cursor-pointer"
                      asChild
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {uploadingMedia ? 'Uploading...' : 'Add Media'}
                      </div>
                    </Button>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                {formData.media_content.map((media, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getMediaIcon(media.type)}
                      <div>
                        <p className="font-medium">{media.filename}</p>
                        <p className="text-sm text-slate-500 capitalize">{media.type}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMedia(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {formData.media_content.length === 0 && (
                  <p className="text-slate-500 text-center py-8">No media content added yet</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has_assessment"
                    checked={formData.has_assessment}
                    onCheckedChange={(checked) => setFormData(prev => ({...prev, has_assessment: checked}))}
                  />
                  <Label htmlFor="has_assessment">Include Final Assessment</Label>
                </div>
                {formData.has_assessment && (
                  <Button type="button" onClick={addAssessmentQuestion} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                )}
              </div>

              {formData.has_assessment && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="passing_score">Passing Score (%)</Label>
                    <Input
                      id="passing_score"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.passing_score_percentage}
                      onChange={(e) => setFormData(prev => ({...prev, passing_score_percentage: parseInt(e.target.value)}))}
                    />
                  </div>

                  <div className="space-y-4">
                    {formData.assessment_questions.map((question, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAssessmentQuestion(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Question Text</Label>
                          <Textarea
                            value={question.question}
                            onChange={(e) => updateAssessmentQuestion(index, 'question', e.target.value)}
                            placeholder="Enter your question..."
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Question Type</Label>
                            <Select
                              value={question.type}
                              onValueChange={(value) => updateAssessmentQuestion(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                <SelectItem value="true_false">True/False</SelectItem>
                                <SelectItem value="short_answer">Short Answer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Points</Label>
                            <Input
                              type="number"
                              min="1"
                              value={question.points}
                              onChange={(e) => updateAssessmentQuestion(index, 'points', parseInt(e.target.value))}
                            />
                          </div>
                        </div>

                        {question.type === 'multiple_choice' && (
                          <div className="space-y-2">
                            <Label>Answer Options</Label>
                            {question.options.map((option, optionIndex) => (
                              <Input
                                key={optionIndex}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = e.target.value;
                                  updateAssessmentQuestion(index, 'options', newOptions);
                                }}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            ))}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          {question.type === 'true_false' ? (
                            <Select
                              value={question.correct_answer}
                              onValueChange={(value) => updateAssessmentQuestion(index, 'correct_answer', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select correct answer" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">True</SelectItem>
                                <SelectItem value="false">False</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={question.correct_answer}
                              onChange={(e) => updateAssessmentQuestion(index, 'correct_answer', e.target.value)}
                              placeholder="Enter the correct answer..."
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Creating...' : 'Create Training'}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}