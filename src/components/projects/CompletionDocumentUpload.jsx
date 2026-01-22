import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Image, Award, FileCheck, BookOpen, X, Loader2 } from 'lucide-react';
import { UploadFile } from '@/api/integrations';

const documentTypes = [
  { value: 'photo', label: 'Progress/Completion Photos', icon: Image },
  { value: 'document', label: 'Project Documents', icon: FileText },
  { value: 'certificate', label: 'Certificates/Permits', icon: Award },
  { value: 'warranty', label: 'Warranty Information', icon: FileCheck },
  { value: 'manual', label: 'User Manuals', icon: BookOpen }
];

export default function CompletionDocumentUpload({ project, onComplete, onCancel }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentUpload, setCurrentUpload] = useState({
    file: null,
    type: 'photo',
    description: ''
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentUpload(prev => ({ ...prev, file }));
    }
  };

  const handleAddDocument = async () => {
    if (!currentUpload.file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file: currentUpload.file });
      
      const newDocument = {
        url: file_url,
        filename: currentUpload.file.name,
        type: currentUpload.type,
        description: currentUpload.description,
        upload_date: new Date().toISOString()
      };

      setDocuments(prev => [...prev, newDocument]);
      setCurrentUpload({ file: null, type: 'photo', description: '' });
      
      // Clear file input
      const fileInput = document.getElementById('completion-file-input');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    onComplete(documents);
  };

  const getTypeIcon = (type) => {
    const docType = documentTypes.find(dt => dt.value === type);
    const IconComponent = docType?.icon || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Upload Project Completion Documents
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Upload photos, certificates, warranties, and other completion documentation for: <strong>{project.title}</strong>
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Form */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Add Document</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="completion-file-input">File</Label>
                <Input
                  id="completion-file-input"
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <Select
                  value={currentUpload.type}
                  onValueChange={(value) => setCurrentUpload(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-description">Description</Label>
              <Textarea
                id="document-description"
                value={currentUpload.description}
                onChange={(e) => setCurrentUpload(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this document..."
                rows={2}
              />
            </div>

            <Button
              onClick={handleAddDocument}
              disabled={!currentUpload.file || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Add Document
                </>
              )}
            </Button>
          </div>

          {/* Uploaded Documents */}
          {documents.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Uploaded Documents ({documents.length})</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(doc.type)}
                      <div>
                        <p className="font-medium text-sm">{doc.filename}</p>
                        <p className="text-xs text-slate-600">{doc.description || 'No description'}</p>
                        <p className="text-xs text-slate-500">
                          {documentTypes.find(dt => dt.value === doc.type)?.label}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDocument(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Skip for Now
          </Button>
          <Button onClick={handleComplete} disabled={documents.length === 0}>
            Complete Project ({documents.length} documents)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}