
import React, { useState, useEffect } from 'react';
import { TimeOffRequest, CalendarBlock, HRComplaint, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar as CalendarIcon,
  Clock,
  FileText,
  AlertTriangle,
  Shield,
  Plus,
  Eye,
  EyeOff,
  Upload,
  X,
  Trash2 // Added Trash2 icon
} from 'lucide-react';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import { UploadFile } from '@/api/integrations';
import { useToast } from '@/components/ui/use-toast'; // Added useToast for notifications

export default function HRFunctions({ currentUser, onUpdate }) {
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [calendarBlocks, setCalendarBlocks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);

  // Dialog states
  const [showTimeOffDialog, setShowTimeOffDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);

  // New states for delete confirmations
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'timeoff', 'block', 'complaint'
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [timeOffForm, setTimeOffForm] = useState({
    request_type: 'vacation',
    start_date: '',
    end_date: '',
    reason: '',
    is_paid: true,
    emergency_contact: '',
    work_coverage: '',
    attachments: []
  });

  const [blockForm, setBlockForm] = useState({
    title: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    all_day: true,
    block_type: 'unavailable',
    reason: '',
    recurring: false,
    recurrence_pattern: 'weekly',
    recurrence_end: '',
    visible_to_team: true
  });

  const [complaintForm, setComplaintForm] = useState({
    subject_email: '',
    complaint_type: 'policy_violation',
    severity: 'medium',
    incident_date: '',
    incident_location: '',
    description: '',
    witnesses: [],
    evidence: [],
    confidential: true,
    anonymous: false
  });

  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast(); // Initialize toast

  useEffect(() => {
    loadHRData();
    loadUsers();
  }, []);

  const loadHRData = async () => {
    if (!currentUser) return;

    try {
      const [timeOffData, blocksData, complaintsData] = await Promise.all([
        TimeOffRequest.filter({ user_email: currentUser.email }, '-created_date'),
        CalendarBlock.filter({ user_email: currentUser.email }, '-created_date'),
        HRComplaint.filter({ complainant_email: currentUser.email }, '-created_date')
      ]);

      setTimeOffRequests(timeOffData);
      setCalendarBlocks(blocksData);
      setComplaints(complaintsData);
    } catch (error) {
      console.error('Error loading HR data:', error);
      toast({
        title: "Error",
        description: "Failed to load HR data.",
        variant: "destructive",
      });
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await User.list();
      setUsers(usersData.filter(u => u.email !== currentUser?.email));
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load user list.",
        variant: "destructive",
      });
    }
  };

  const handleTimeOffSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const totalDays = differenceInDays(
        parseISO(timeOffForm.end_date),
        parseISO(timeOffForm.start_date)
      ) + 1;

      await TimeOffRequest.create({
        ...timeOffForm,
        user_email: currentUser.email,
        total_days: totalDays
      });

      setShowTimeOffDialog(false);
      setTimeOffForm({
        request_type: 'vacation',
        start_date: '',
        end_date: '',
        reason: '',
        is_paid: true,
        emergency_contact: '',
        work_coverage: '',
        attachments: []
      });
      loadHRData();
      toast({
        title: "Success",
        description: "Time off request submitted successfully.",
      });
    } catch (error) {
      console.error('Error submitting time off request:', error);
      toast({
        title: "Error",
        description: "Failed to submit time off request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await CalendarBlock.create({
        ...blockForm,
        user_email: currentUser.email
      });

      setShowBlockDialog(false);
      setBlockForm({
        title: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        all_day: true,
        block_type: 'unavailable',
        reason: '',
        recurring: false,
        recurrence_pattern: 'weekly',
        recurrence_end: '',
        visible_to_team: true
      });
      loadHRData();
      toast({
        title: "Success",
        description: "Calendar block created successfully.",
      });
    } catch (error) {
      console.error('Error creating calendar block:', error);
      toast({
        title: "Error",
        description: "Failed to create calendar block. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await HRComplaint.create({
        ...complaintForm,
        complainant_email: currentUser.email
      });

      setShowComplaintDialog(false);
      setComplaintForm({
        subject_email: '',
        complaint_type: 'policy_violation',
        severity: 'medium',
        incident_date: '',
        incident_location: '',
        description: '',
        witnesses: [],
        evidence: [],
        confidential: true,
        anonymous: false
      });
      loadHRData();
      toast({
        title: "Success",
        description: "HR complaint filed successfully.",
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: "Error",
        description: "Failed to file complaint. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e, formType) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      const attachment = {
        url: file_url,
        filename: file.name,
        type: file.type,
        description: ''
      };

      if (formType === 'timeoff') {
        setTimeOffForm(prev => ({
          ...prev,
          attachments: [...prev.attachments, attachment]
        }));
      } else if (formType === 'complaint') {
        setComplaintForm(prev => ({
          ...prev,
          evidence: [...prev.evidence, attachment]
        }));
      }
      toast({
        title: "Success",
        description: "File uploaded successfully.",
      });
    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: "Error",
        description: "File upload failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // New delete functionality
  const handleDelete = (item, type) => {
    setDeleteItem(item);
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem || !deleteType) return;

    setIsDeleting(true);
    try {
      let entityName = '';
      switch (deleteType) {
        case 'timeoff':
          await TimeOffRequest.delete(deleteItem.id);
          entityName = 'Time off request';
          break;
        case 'block':
          await CalendarBlock.delete(deleteItem.id);
          entityName = 'Calendar block';
          break;
        case 'complaint':
          await HRComplaint.delete(deleteItem.id);
          entityName = 'HR complaint';
          break;
        default:
          throw new Error('Unknown delete type');
      }

      toast({
        title: "Success",
        description: `${entityName} deleted successfully.`,
      });
      loadHRData(); // Refresh data

    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: 'Failed to delete item. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeleteItem(null);
      setDeleteType(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteItem(null);
    setDeleteType(null);
  };

  const canDelete = (item) => {
    // Users can only delete their own items
    if (item.user_email && item.user_email !== currentUser?.email) return false;
    if (item.complainant_email && item.complainant_email !== currentUser?.email) return false;

    // For time off requests and complaints, only allow deletion if pending or submitted.
    // If there's a status field, check it. Calendar blocks generally don't have statuses.
    if (item.status && !['pending', 'submitted'].includes(item.status.toLowerCase())) {
      return false;
    }

    return true;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          HR Functions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeoff" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeoff">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Time Off
            </TabsTrigger>
            <TabsTrigger value="blocks">
              <Clock className="w-4 h-4 mr-2" />
              Calendar Blocks
            </TabsTrigger>
            <TabsTrigger value="complaints">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Complaints
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeoff" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Time Off Requests</h3>
              <Button onClick={() => setShowTimeOffDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Request Time Off
              </Button>
            </div>

            <div className="space-y-3">
              {timeOffRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1"> {/* Added flex-1 for better spacing with new button */}
                      <h4 className="font-medium">{request.request_type.replace('_', ' ').toUpperCase()}</h4>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(request.start_date), 'MMM d, yyyy')} - {format(parseISO(request.end_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600">{request.total_days} days</p>
                      <p className="text-sm mt-1">{request.reason}</p>
                    </div>
                    <div className="flex items-center gap-2"> {/* Container for badge and delete button */}
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      {canDelete(request) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(request, 'timeoff')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {request.approval_notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <p className="text-sm"><strong>Admin Notes:</strong> {request.approval_notes}</p>
                    </div>
                  )}
                </Card>
              ))}

              {timeOffRequests.length === 0 && (
                <p className="text-center text-gray-500 py-4">No time off requests found</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="blocks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Calendar Blocks</h3>
              <Button onClick={() => setShowBlockDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Block Time
              </Button>
            </div>

            <div className="space-y-3">
              {calendarBlocks.map((block) => (
                <Card key={block.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1"> {/* Added flex-1 for better spacing with new button */}
                      <h4 className="font-medium">{block.title}</h4>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(block.start_date), 'MMM d, yyyy')} - {format(parseISO(block.end_date), 'MMM d, yyyy')}
                      </p>
                      {!block.all_day && (
                        <p className="text-sm text-gray-600">{block.start_time} - {block.end_time}</p>
                      )}
                      <p className="text-sm mt-1">{block.reason}</p>
                    </div>
                    <div className="flex items-center gap-2"> {/* Container for badge, icons and delete button */}
                      <Badge variant="outline">{block.block_type}</Badge>
                      {block.visible_to_team ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                      {canDelete(block) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(block, 'block')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {calendarBlocks.length === 0 && (
                <p className="text-center text-gray-500 py-4">No calendar blocks found</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="complaints" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">HR Complaints</h3>
              <Button onClick={() => setShowComplaintDialog(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                File Complaint
              </Button>
            </div>

            <div className="space-y-3">
              {complaints.map((complaint) => (
                <Card key={complaint.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1"> {/* Added flex-1 for better spacing with new button */}
                      <h4 className="font-medium">{complaint.complaint_type.replace('_', ' ').toUpperCase()}</h4>
                      <p className="text-sm text-gray-600">
                        Filed: {format(parseISO(complaint.created_date), 'MMM d, yyyy')}
                      </p>
                      {complaint.incident_date && (
                        <p className="text-sm text-gray-600">
                          Incident: {format(parseISO(complaint.incident_date), 'MMM d, yyyy')}
                        </p>
                      )}
                      <p className="text-sm mt-1">{complaint.description.substring(0, 100)}...</p>
                    </div>
                    <div className="flex items-center gap-2"> {/* Container for badges and delete button */}
                      <div className="text-right space-y-1">
                        <Badge className={getSeverityColor(complaint.severity)}>
                          {complaint.severity}
                        </Badge>
                        <Badge variant="outline">
                          {complaint.status}
                        </Badge>
                        {complaint.confidential && (
                          <div className="text-xs text-gray-500">Confidential</div>
                        )}
                      </div>
                      {canDelete(complaint) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(complaint, 'complaint')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {complaints.length === 0 && (
                <p className="text-center text-gray-500 py-4">No complaints filed</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Time Off Request Dialog */}
        {showTimeOffDialog && (
          <Dialog open={showTimeOffDialog} onOpenChange={setShowTimeOffDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request Time Off</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTimeOffSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Request Type</Label>
                    <Select
                      value={timeOffForm.request_type}
                      onValueChange={(value) => setTimeOffForm(prev => ({ ...prev, request_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="sick_leave">Sick Leave</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="bereavement">Bereavement</SelectItem>
                        <SelectItem value="jury_duty">Jury Duty</SelectItem>
                        <SelectItem value="military">Military</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={timeOffForm.start_date}
                      onChange={(e) => setTimeOffForm(prev => ({ ...prev, start_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={timeOffForm.end_date}
                      onChange={(e) => setTimeOffForm(prev => ({ ...prev, end_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="paid"
                      checked={timeOffForm.is_paid}
                      onCheckedChange={(checked) => setTimeOffForm(prev => ({ ...prev, is_paid: checked }))}
                    />
                    <Label htmlFor="paid">Paid Time Off</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    value={timeOffForm.reason}
                    onChange={(e) => setTimeOffForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Explain the reason for your time off request..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Emergency Contact</Label>
                    <Input
                      value={timeOffForm.emergency_contact}
                      onChange={(e) => setTimeOffForm(prev => ({ ...prev, emergency_contact: e.target.value }))}
                      placeholder="Name and phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Work Coverage</Label>
                    <Input
                      value={timeOffForm.work_coverage}
                      onChange={(e) => setTimeOffForm(prev => ({ ...prev, work_coverage: e.target.value }))}
                      placeholder="Who will cover your responsibilities"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Attachments (Optional)</Label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'timeoff')}
                    className="hidden"
                    id="timeoff-file"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('timeoff-file').click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Add Document'}
                  </Button>

                  {timeOffForm.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.filename}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setTimeOffForm(prev => ({
                          ...prev,
                          attachments: prev.attachments.filter((_, i) => i !== index)
                        }))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowTimeOffDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Calendar Block Dialog */}
        {showBlockDialog && (
          <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Block Calendar Time</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBlockSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={blockForm.title}
                    onChange={(e) => setBlockForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Personal appointment, Training, etc."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Block Type</Label>
                    <Select
                      value={blockForm.block_type}
                      onValueChange={(value) => setBlockForm(prev => ({ ...prev, block_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="all-day"
                      checked={blockForm.all_day}
                      onCheckedChange={(checked) => setBlockForm(prev => ({ ...prev, all_day: checked }))}
                    />
                    <Label htmlFor="all-day">All Day</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={blockForm.start_date}
                      onChange={(e) => setBlockForm(prev => ({ ...prev, start_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={blockForm.end_date}
                      onChange={(e) => setBlockForm(prev => ({ ...prev, end_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {!blockForm.all_day && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={blockForm.start_time}
                        onChange={(e) => setBlockForm(prev => ({ ...prev, start_time: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={blockForm.end_time}
                        onChange={(e) => setBlockForm(prev => ({ ...prev, end_time: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    value={blockForm.reason}
                    onChange={(e) => setBlockForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Optional reason for blocking this time..."
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="visible"
                      checked={blockForm.visible_to_team}
                      onCheckedChange={(checked) => setBlockForm(prev => ({ ...prev, visible_to_team: checked }))}
                    />
                    <Label htmlFor="visible">Visible to Team</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recurring"
                      checked={blockForm.recurring}
                      onCheckedChange={(checked) => setBlockForm(prev => ({ ...prev, recurring: checked }))}
                    />
                    <Label htmlFor="recurring">Recurring</Label>
                  </div>
                </div>

                {blockForm.recurring && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Repeat Pattern</Label>
                      <Select
                        value={blockForm.recurrence_pattern}
                        onValueChange={(value) => setBlockForm(prev => ({ ...prev, recurrence_pattern: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Repeat Until</Label>
                      <Input
                        type="date"
                        value={blockForm.recurrence_end}
                        onChange={(e) => setBlockForm(prev => ({ ...prev, recurrence_end: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowBlockDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Block</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* HR Complaint Dialog */}
        {showComplaintDialog && (
          <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>File HR Complaint</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Complaint Against</Label>
                    <Select
                      value={complaintForm.subject_email}
                      onValueChange={(value) => setComplaintForm(prev => ({ ...prev, subject_email: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.email}>
                            {user.full_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Complaint Type</Label>
                    <Select
                      value={complaintForm.complaint_type}
                      onValueChange={(value) => setComplaintForm(prev => ({ ...prev, complaint_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="harassment">Harassment</SelectItem>
                        <SelectItem value="discrimination">Discrimination</SelectItem>
                        <SelectItem value="workplace_safety">Workplace Safety</SelectItem>
                        <SelectItem value="policy_violation">Policy Violation</SelectItem>
                        <SelectItem value="misconduct">Misconduct</SelectItem>
                        <SelectItem value="bullying">Bullying</SelectItem>
                        <SelectItem value="retaliation">Retaliation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select
                      value={complaintForm.severity}
                      onValueChange={(value) => setComplaintForm(prev => ({ ...prev, severity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Incident Date</Label>
                    <Input
                      type="date"
                      value={complaintForm.incident_date}
                      onChange={(e) => setComplaintForm(prev => ({ ...prev, incident_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Incident Location</Label>
                  <Input
                    value={complaintForm.incident_location}
                    onChange={(e) => setComplaintForm(prev => ({ ...prev, incident_location: e.target.value }))}
                    placeholder="Where did this incident occur?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={complaintForm.description}
                    onChange={(e) => setComplaintForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide a detailed description of the incident..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Witnesses (Optional)</Label>
                  <Input
                    value={complaintForm.witnesses.join(', ')}
                    onChange={(e) => setComplaintForm(prev => ({ ...prev, witnesses: e.target.value.split(', ').filter(w => w.trim()) }))}
                    placeholder="Names or emails of witnesses, separated by commas"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Evidence (Optional)</Label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'complaint')}
                    className="hidden"
                    id="complaint-file"
                    multiple
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('complaint-file').click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Add Evidence'}
                  </Button>

                  {complaintForm.evidence.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.filename}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setComplaintForm(prev => ({
                          ...prev,
                          evidence: prev.evidence.filter((_, i) => i !== index)
                        }))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="confidential"
                      checked={complaintForm.confidential}
                      onCheckedChange={(checked) => setComplaintForm(prev => ({ ...prev, confidential: checked }))}
                    />
                    <Label htmlFor="confidential">Keep Confidential</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={complaintForm.anonymous}
                      onCheckedChange={(checked) => setComplaintForm(prev => ({ ...prev, anonymous: checked }))}
                    />
                    <Label htmlFor="anonymous">File Anonymously</Label>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> This complaint will be reviewed by HR and handled according to company policy.
                    Retaliation against anyone filing a complaint is strictly prohibited.
                  </p>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowComplaintDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Complaint</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete this {deleteType === 'timeoff' ? 'time off request' :
                deleteType === 'block' ? 'calendar block' : 'HR complaint'}?
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={cancelDelete} disabled={isDeleting}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
