import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UploadFile } from '@/api/integrations';
import { Send, Upload, MapPin, X, Image, FileText, Loader2 } from 'lucide-react';

export default function PostCreator({ projects, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    project_id: '',
    content: '',
    post_type: 'general',
    visibility: 'team',
    attachments: [],
    location: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await UploadFile({ file });
        
        // Determine file type based on MIME type
        const fileType = file.type.startsWith('image/') ? 'image' : 'document';
        
        return {
          url: file_url,
          filename: file.name,
          type: fileType,
          size: file.size,
          mimeType: file.type
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedFiles]
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploadingFiles(false);
      // Clear the input value so the same file can be selected again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Simple reverse geocoding (in real app, you'd use a proper service)
          const locationData = {
            latitude,
            longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            place_name: 'Current Location'
          };
          
          setFormData(prev => ({
            ...prev,
            location: locationData
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim() || !formData.project_id) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        project_id: '',
        content: '',
        post_type: 'general',
        visibility: 'team',
        attachments: [],
        location: null
      });
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Create New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={formData.project_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title} ({project.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={formData.post_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, post_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Update</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="issue">Issue/Problem</SelectItem>
                <SelectItem value="completion">Task Complete</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={formData.visibility}
              onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team">Team Only</SelectItem>
                <SelectItem value="client">Include Client</SelectItem>
                <SelectItem value="internal">Internal Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="What's happening with your project?"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={4}
            required
          />

          {/* Attachments */}
          {formData.attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {formData.attachments.map((attachment, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-2">
                    {attachment.type === 'image' ? <Image className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {attachment.filename}
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {formData.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4" />
              <span>{formData.location.place_name}</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, location: null }))}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Hidden input for all files */}
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFiles}
              >
                {uploadingFiles ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {uploadingFiles ? 'Uploading...' : 'Add Images or Files'}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={uploadingFiles}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.content.trim() || !formData.project_id || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? 'Posting...' : 'Post Update'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}