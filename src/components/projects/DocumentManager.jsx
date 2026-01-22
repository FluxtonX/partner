
import React, { useState, useEffect, useRef } from 'react';
import { ProjectDocument, User, ActivityLog } from '@/api/entities';
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';
import ReceiptScannerConfirmation from './ReceiptScannerConfirmation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Upload,
  FileText,
  Image,
  Download,
  Eye,
  Trash2,
  Edit, // Keep for potential future use or if outline implies it elsewhere
  Users,
  Lock,
  Unlock,
  Tag,
  Calendar,
  User as UserIcon,
  Loader2,
  EyeOff, // New
  MoreVertical, // New
  Edit2 // New for dropdown
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner'; // Assuming sonner for toasts based on UI components

const FILE_CATEGORIES = [
  { value: 'contract', label: 'Contract', icon: FileText },
  { value: 'permit', label: 'Permit', icon: FileText },
  { value: 'photo', label: 'Photo', icon: Image },
  { value: 'drawing', label: 'Drawing/Plan', icon: FileText },
  { value: 'invoice', label: 'Invoice', icon: FileText },
  { value: 'receipt', label: 'Receipt', icon: FileText },
  { value: 'warranty', label: 'Warranty', icon: FileText },
  { value: 'manual', label: 'Manual', icon: FileText },
  { value: 'certificate', label: 'Certificate', icon: FileText },
  { value: 'other', label: 'Other', icon: FileText }
];

export default function DocumentManager({ project, currentUser, onDocumentsUpdate }) {
  const [documents, setDocuments] = useState([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null); // Retain for potential future edit modal
  const [isUploading, setIsUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);
  const [showScannerConfirm, setShowScannerConfirm] = useState(false);
  const [extractedReceiptData, setExtractedReceiptData] = useState(null);
  const [scannedFileUrl, setScannedFileUrl] = useState(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    files: [],
    category: 'receipt', // Default category changed to 'receipt'
    description: '',
    visible_to_client: false,
    tags: '',
    scan_as_receipt: false, // New property for receipt scanning
  });

  useEffect(() => {
    loadDocuments();
  }, [project.id]);

  const loadDocuments = async () => {
    try {
      const docs = await ProjectDocument.filter({ project_id: project.id }, '-created_date');
      setDocuments(docs);
      if (onDocumentsUpdate) {
        onDocumentsUpdate(docs); // Notify parent of document update
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents.');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setUploadForm(prev => ({ ...prev, files: selectedFiles }));
  };

  // Helper function for logging activities
  const logActivity = async (type, description, metadata = {}) => {
    try {
      await ActivityLog.create({
        project_id: project.id,
        user_email: currentUser.email,
        user_name: currentUser.full_name || currentUser.email,
        action_type: type,
        action_description: description,
        metadata: metadata,
        visible_to_client: type === 'document_uploaded' || type === 'expense_added', // Activity visible to client
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Helper function for creating document records
  const createDocumentRecord = async (file, file_url, category, description, visible_to_client_override = null) => {
    return ProjectDocument.create({
      project_id: project.id,
      file_url,
      filename: file.name,
      file_size: file.size,
      file_type: file.type,
      category: category,
      description: description,
      uploaded_by: currentUser.email,
      visible_to_client: visible_to_client_override !== null ? visible_to_client_override : uploadForm.visible_to_client,
      tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(Boolean) // Filter out empty strings
    });
  };

  // Helper function to reset upload form and reload documents
  const resetUploadForm = () => {
    setShowUploadDialog(false);
    setUploadForm({
      files: [],
      category: 'receipt',
      description: '',
      visible_to_client: false,
      tags: '',
      scan_as_receipt: false
    });
    loadDocuments();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (uploadForm.files.length === 0) {
      toast.error('Please select files to upload.');
      return;
    }

    setIsUploading(true);

    try {
      if (uploadForm.scan_as_receipt && uploadForm.files.length > 0) {
        // If scanning as receipt, process only the first file
        const file = uploadForm.files[0];
        const { file_url } = await UploadFile({ file });

        const result = await ExtractDataFromUploadedFile({
          file_url: file_url,
          json_schema: {
            type: "object",
            properties: {
              total: { type: "number", description: "The final total amount on the receipt, including tax and tip." },
              date: { type: "string", format: "date", description: "The date of the transaction." },
              vendor_name: { type: "string", description: "The name of the vendor, store, or merchant." }
            },
            required: ["total", "date", "vendor_name"] // Ensure these fields are extracted
          }
        });

        if (result.status === 'success' && result.output) {
          setExtractedReceiptData(result.output);
          setScannedFileUrl(file_url);
          setShowScannerConfirm(true);
        } else {
          toast.warning(`Could not read receipt data for ${file.name}. It will be uploaded as a regular document.`);
          await createDocumentRecord(file, file_url, 'receipt', `Scanned receipt (data extraction failed): ${result.details || 'unknown error'}`, false); // Force internal
          await logActivity('document_uploaded', `Uploaded receipt (scan failed): ${file.name}`, { filename: file.name, category: 'receipt', file_size: file.size, visible_to_client: false });
          resetUploadForm();
        }
      } else {
        // Existing multi-file upload logic for general documents
        for (const file of uploadForm.files) {
          const { file_url } = await UploadFile({ file });
          await createDocumentRecord(file, file_url, uploadForm.category, uploadForm.description);
          await logActivity('document_uploaded', `Uploaded document: ${file.name}`, { filename: file.name, category: uploadForm.category, file_size: file.size, visible_to_client: uploadForm.visible_to_client });
        }
        toast.success('Documents uploaded successfully!');
        resetUploadForm();
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error('Failed to upload documents. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Function called after a receipt scan is confirmed and an expense is created
  const handleExpenseCreationSuccess = async () => {
    const file = uploadForm.files[0]; // Assuming only one file for receipt scanning
    await createDocumentRecord(file, scannedFileUrl, 'receipt', `Scanned receipt from ${extractedReceiptData.vendor_name || 'unknown vendor'}`, true); // Force visible to client if expense created
    await logActivity('expense_added', `Added expense of $${extractedReceiptData.total} from scanned receipt: ${file.name}`, {
      filename: file.name,
      category: 'receipt',
      amount: extractedReceiptData.total,
      vendor: extractedReceiptData.vendor_name,
      date: extractedReceiptData.date
    });
    toast.success('Receipt scanned and expense created!');
    setShowScannerConfirm(false);
    setExtractedReceiptData(null);
    setScannedFileUrl(null);
    resetUploadForm();
  };

  const handleDelete = async (documentId) => {
    const docToDelete = documents.find(d => d.id === documentId);
    if (!docToDelete) return;

    if (!window.confirm(`Are you sure you want to delete ${docToDelete.filename}? This action cannot be undone.`)) return;

    try {
      await ProjectDocument.delete(documentId);

      // Log the activity
      await logActivity('document_deleted', `Deleted document: ${docToDelete.filename}`, {
        filename: docToDelete.filename,
        category: docToDelete.category
      });

      toast.success('Document deleted successfully!');
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document. Please try again.');
    }
  };

  const handleEdit = (document) => {
    // This function can be expanded to open an edit modal for the document
    toast.info(`Edit functionality for ${document.filename} is coming soon!`);
    console.log('Editing document:', document);
    // setSelectedDocument(document);
    // setShowEditDialog(true); // Assuming an edit dialog state
  };

  const handlePublishToClientPortal = async (document) => {
    try {
      await ProjectDocument.update(document.id, {
        visible_to_client: true
      });

      toast.success('Document published to client portal');

      // Log the activity
      await logActivity('document_updated', `Published document to client portal: ${document.filename}`, {
        filename: document.filename,
        visible_to_client: true
      });

      // Reload documents to show updated status
      loadDocuments();
    } catch (error) {
      console.error('Error publishing document:', error);
      toast.error('Failed to publish document');
    }
  };

  const handleUnpublishFromClientPortal = async (document) => {
    try {
      await ProjectDocument.update(document.id, {
        visible_to_client: false
      });

      toast.success('Document removed from client portal');

      // Log the activity
      await logActivity('document_updated', `Removed document from client portal: ${document.filename}`, {
        filename: document.filename,
        visible_to_client: false
      });

      loadDocuments();
    } catch (error) {
      console.error('Error unpublishing document:', error);
      toast.error('Failed to unpublish document');
    }
  };


  const getCategoryIcon = (category) => {
    const cat = FILE_CATEGORIES.find(c => c.value === category);
    const IconComponent = cat?.icon || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesSearch = !searchTerm ||
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Project Documents
        </CardTitle>
        <CardDescription>
          Upload and manage project documents. Published documents will be visible to the client in their portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Upload section */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Document Actions</h3>
              <p className="text-sm text-slate-600">
                Upload new documents or manage existing ones.
              </p>
            </div>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {FILE_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Documents List */}
          {filteredDocuments.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-medium">Documents ({filteredDocuments.length})</h4>
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border ${
                  doc.visible_to_client ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-start gap-3 flex-grow mb-2 sm:mb-0">
                    <div className={`p-2 rounded ${
                      doc.visible_to_client ? 'bg-emerald-100' : 'bg-slate-100'
                    }`}>
                      {getCategoryIcon(doc.category)}
                    </div>
                    <div>
                      <h5 className="font-medium">{doc.filename}</h5>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                        <span>Category: <span className="capitalize">{doc.category.replace('_', ' ')}</span></span>
                        <span>Size: {formatFileSize(doc.file_size)}</span>
                        <span>Uploaded: {format(new Date(doc.created_date), 'MMM d, yyyy')}</span>
                        {doc.uploaded_by && (
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" /> {doc.uploaded_by}
                          </span>
                        )}
                        {doc.visible_to_client && (
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs py-0.5 px-2">
                            Published to Client Portal
                          </Badge>
                        )}
                        {!doc.visible_to_client && (
                          <Badge variant="outline" className="text-slate-600 bg-slate-100 text-xs py-0.5 px-2">
                            Internal Only
                          </Badge>
                        )}
                      </div>
                      {doc.description && (
                        <p className="text-sm text-slate-600 mt-1">{doc.description}</p>
                      )}
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {doc.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Tag className="w-2.5 h-2.5 mr-1" />{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={doc.file_url} download={doc.filename}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    </Button>

                    {doc.visible_to_client ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnpublishFromClientPortal(doc)}
                        className="border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        <EyeOff className="w-4 h-4 mr-1" />
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishToClientPortal(doc)}
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Publish to Client
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(doc)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 focus:bg-red-50 focus:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg">No documents found</p>
              <p className="text-sm">Upload documents to manage them here.</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <Dialog open={true} onOpenChange={() => { if (!isUploading) setShowUploadDialog(false); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Files</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={!uploadForm.scan_as_receipt} // Allow multiple files for general upload, single for receipt scanning
                  onChange={handleFileSelect}
                  className="hidden"
                  accept={uploadForm.scan_as_receipt ? "image/*" : "*/*"} // Restrict to images for scanning
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                {uploadForm.files.length > 0 && (
                  <div className="space-y-1">
                    {uploadForm.files.map((file, index) => (
                      <div key={index} className="text-sm text-slate-600 flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        {file.name} ({formatFileSize(file.size)})
                      </div>
                    ))}
                  </div>
                )}
                {uploadForm.scan_as_receipt && uploadForm.files.length > 1 && (
                  <p className="text-red-500 text-xs">Note: Only the first image will be scanned for receipt data. Other files will be ignored for scanning.</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
                    disabled={uploadForm.scan_as_receipt || isUploading} // Disable category selection if scanning as receipt
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FILE_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="important, review, final"
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description of the documents"
                  rows={3}
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Checkbox
                    id="scan_as_receipt"
                    checked={uploadForm.scan_as_receipt}
                    onCheckedChange={(checked) => {
                      setUploadForm(prev => {
                        const newFiles = checked && prev.files.length > 1 ? [prev.files[0]] : prev.files; // Limit to 1 file if changing to scan_as_receipt
                        if (checked && prev.files.length > 1) {
                          toast.info('Only the first file will be used for receipt scanning.');
                        }
                        return {
                          ...prev,
                          scan_as_receipt: checked,
                          category: checked ? 'receipt' : prev.category, // Auto-set category to 'receipt'
                          files: newFiles
                        };
                      });
                    }}
                    disabled={isUploading}
                  />
                  <div>
                    <Label htmlFor="scan_as_receipt" className="text-sm font-medium">
                      Scan as Receipt & Create Expense
                    </Label>
                    <p className="text-xs text-slate-500">Upload one receipt image at a time for scanning and automated expense creation.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visible_to_client"
                    checked={uploadForm.visible_to_client}
                    onCheckedChange={(checked) => setUploadForm(prev => ({ ...prev, visible_to_client: checked }))}
                    disabled={isUploading || uploadForm.scan_as_receipt} // Disable if scanning as receipt (it will be set to client visible upon expense creation)
                  />
                  <Label htmlFor="visible_to_client" className="text-sm">
                    Make visible to client
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { if (!isUploading) setShowUploadDialog(false); }} disabled={isUploading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || uploadForm.files.length === 0 || (uploadForm.scan_as_receipt && !uploadForm.files[0]?.type?.startsWith('image'))}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isUploading ? 'Uploading...' : `Upload ${uploadForm.files.length} File(s)`}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {showScannerConfirm && (
        <ReceiptScannerConfirmation
          projectId={project.id}
          extractedData={extractedReceiptData}
          fileUrl={scannedFileUrl}
          onClose={() => {
            setShowScannerConfirm(false);
            setExtractedReceiptData(null);
            setScannedFileUrl(null);
            setIsUploading(false); // Make sure to stop uploading state if dialog is closed without success
            // Optionally, if the user cancels, delete the uploaded file from temp storage (advanced)
          }}
          onSuccess={handleExpenseCreationSuccess}
        />
      )}
    </Card>
  );
}
