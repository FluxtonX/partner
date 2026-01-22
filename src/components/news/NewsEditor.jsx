import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Save, X, Calendar as CalendarIcon, Upload, Image } from "lucide-react";
import { UploadFile } from '@/api/integrations';

export default function NewsEditor({ news, onSave, onCancel }) {
  const [formData, setFormData] = useState(news || {
    title: '',
    summary: '',
    content: '',
    image_url: '',
    category: 'announcement',
    priority: 'medium',
    published: false,
    featured: false,
    target_audience: 'all',
    expires_date: '',
    tags: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const newTags = [...(formData.tags || []), tagInput.trim()];
    setFormData(prev => ({ ...prev, tags: newTags }));
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = formData.tags.filter(tag => tag !== tagToRemove);
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await onSave(formData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{news ? 'Edit' : 'Create'} News Article</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => handleInputChange('title', e.target.value)} 
                required 
                placeholder="Enter news title..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="summary">Summary *</Label>
              <Textarea 
                id="summary" 
                value={formData.summary} 
                onChange={(e) => handleInputChange('summary', e.target.value)} 
                required 
                rows={3}
                placeholder="Brief summary for the news feed..."
              />
            </div>
          </div>

          {/* Category and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature_update">Feature Update</SelectItem>
                  <SelectItem value="bug_fix">Bug Fix</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="tips">Tips</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Select value={formData.target_audience} onValueChange={(value) => handleInputChange('target_audience', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admins">Admins Only</SelectItem>
                  <SelectItem value="new_users">New Users</SelectItem>
                  <SelectItem value="power_users">Power Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured Image */}
          <div className="space-y-2">
            <Label>Featured Image</Label>
            <div className="flex items-center gap-4">
              {formData.image_url && (
                <img 
                  src={formData.image_url} 
                  alt="Featured" 
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingImage}
                    className="cursor-pointer"
                    asChild
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </div>
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea 
              id="content" 
              value={formData.content} 
              onChange={(e) => handleInputChange('content', e.target.value)} 
              required 
              rows={10}
              placeholder="Full article content (HTML supported)..."
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={tagInput} 
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.tags || []).map((tag, index) => (
                <div key={index} className="bg-slate-100 px-2 py-1 rounded text-sm flex items-center gap-1">
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) => handleInputChange('published', checked)}
                />
                <Label>Published</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
                <Label>Featured</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Expiration Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expires_date ? format(new Date(formData.expires_date), 'PPP') : 'No expiration'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={formData.expires_date ? new Date(formData.expires_date) : undefined} 
                    onSelect={(date) => handleInputChange('expires_date', date)} 
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Saving...' : 'Save Article'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}