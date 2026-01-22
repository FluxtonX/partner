import React, { useState, useEffect } from 'react';
import { TrainingFAQ } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  HelpCircle, 
  Plus, 
  Edit, 
  Trash2, 
  ThumbsUp, 
  ThumbsDown, 
  Search,
  MessageSquare,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrainingFAQManager({ trainings, currentUser, isTrainer }) {
  const [faqs, setFaqs] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [formData, setFormData] = useState({
    training_id: '',
    question: '',
    answer: '',
    category: 'general'
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const allFAQs = await TrainingFAQ.list('-helpful_count');
      setFaqs(allFAQs);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const trainingMatch = selectedTraining === 'all' || faq.training_id === selectedTraining;
    const searchMatch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return trainingMatch && searchMatch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }

    try {
      const faqData = {
        ...formData,
        created_by: currentUser.email
      };

      if (editingFAQ) {
        await TrainingFAQ.update(editingFAQ.id, faqData);
        toast.success('FAQ updated successfully');
      } else {
        await TrainingFAQ.create(faqData);
        toast.success('FAQ created successfully');
      }

      setShowForm(false);
      setEditingFAQ(null);
      setFormData({
        training_id: '',
        question: '',
        answer: '',
        category: 'general'
      });
      loadFAQs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('Failed to save FAQ');
    }
  };

  const handleEdit = (faq) => {
    setEditingFAQ(faq);
    setFormData({
      training_id: faq.training_id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category
    });
    setShowForm(true);
  };

  const handleDelete = async (faqId) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await TrainingFAQ.delete(faqId);
        toast.success('FAQ deleted successfully');
        loadFAQs();
      } catch (error) {
        console.error('Error deleting FAQ:', error);
        toast.error('Failed to delete FAQ');
      }
    }
  };

  const handleHelpful = async (faqId, isHelpful) => {
    try {
      const faq = faqs.find(f => f.id === faqId);
      if (!faq) return;

      const updateData = isHelpful 
        ? { helpful_count: (faq.helpful_count || 0) + 1 }
        : { not_helpful_count: (faq.not_helpful_count || 0) + 1 };

      await TrainingFAQ.update(faqId, updateData);
      loadFAQs();
    } catch (error) {
      console.error('Error updating FAQ rating:', error);
    }
  };

  const getTrainingName = (trainingId) => {
    const training = trainings.find(t => t.id === trainingId);
    return training?.title || 'General';
  };

  const categoryColors = {
    general: 'bg-gray-100 text-gray-700',
    safety: 'bg-red-100 text-red-700',
    tools: 'bg-blue-100 text-blue-700',
    materials: 'bg-green-100 text-green-700',
    process: 'bg-purple-100 text-purple-700',
    troubleshooting: 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Training FAQ & Support</h3>
          <p className="text-slate-600">Find answers to common questions about training materials</p>
        </div>
        {isTrainer && (
          <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedTraining} onValueChange={setSelectedTraining}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by training" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainings</SelectItem>
                {trainings.map(training => (
                  <SelectItem key={training.id} value={training.id}>
                    {training.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No FAQs Found</h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || selectedTraining !== 'all' 
                  ? 'Try adjusting your search criteria'
                  : 'No FAQs have been created yet'
                }
              </p>
              {isTrainer && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First FAQ
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map(faq => (
            <Card key={faq.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={categoryColors[faq.category]}>
                        {faq.category}
                      </Badge>
                      <Badge variant="outline">
                        {getTrainingName(faq.training_id)}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-3">{faq.question}</h4>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-slate-700">{faq.answer}</p>
                    </div>
                  </div>
                  
                  {isTrainer && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(faq)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(faq.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Helpful ratings */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHelpful(faq.id, true)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {faq.helpful_count || 0}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHelpful(faq.id, false)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    {faq.not_helpful_count || 0}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* FAQ Form Modal */}
      {showForm && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="training_id">Training</Label>
                <Select
                  value={formData.training_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, training_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select training (or leave blank for general)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>General (All Trainings)</SelectItem>
                    {trainings.map(training => (
                      <SelectItem key={training.id} value={training.id}>
                        {training.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="process">Process</SelectItem>
                    <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="What is the question users frequently ask?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Provide a clear, detailed answer..."
                  rows={6}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}