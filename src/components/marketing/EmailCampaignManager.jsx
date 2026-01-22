
import React, { useState, useEffect } from 'react';
import { Client, CommunicationTemplate, EmailCampaign } from '@/api/entities';
import { emailCampaigns } from '@/api/functions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  Users, 
  Calendar, 
  Mail, 
  Eye, 
  BarChart3, 
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function EmailCampaignManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);
  const [previewRecipients, setPreviewRecipients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [totalRecipients, setTotalRecipients] = useState(0);

  const [campaignData, setCampaignData] = useState({
    name: '',
    template_id: '',
    subject: '',
    message_content: '',
    recipient_criteria: {
      status: [],
      specific_clients: [],
      exclude_clients: []
    },
    send_immediately: true,
    scheduled_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const calculateRecipients = () => {
      const { status, specific_clients } = campaignData.recipient_criteria;

      const clientsByStatus = clients.filter(c => status.includes(c.status));
      const clientsById = clients.filter(c => specific_clients.includes(c.id));
      
      const allSelectedClients = new Set([
          ...clientsByStatus.map(c => c.id),
          ...clientsById.map(c => c.id)
      ]);
      
      setTotalRecipients(allSelectedClients.size);
    };

    if (clients.length > 0) {
      calculateRecipients();
    } else {
      // If clients data is not yet loaded or empty, ensure totalRecipients is 0
      setTotalRecipients(0); 
    }
  }, [campaignData.recipient_criteria, clients]);

  const loadData = async () => {
    try {
      const [campaignsData, templatesData, clientsData] = await Promise.all([
        EmailCampaign.list('-created_date'),
        CommunicationTemplate.filter({ type: 'email' }),
        Client.list()
      ]);
      
      setCampaigns(campaignsData);
      setTemplates(templatesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading campaign data:', error);
      toast.error('Failed to load campaign data');
    }
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setCampaignData(prev => ({
        ...prev,
        template_id: templateId,
        subject: template.subject_template,
        message_content: template.message_template
      }));
    }
  };

  const handlePreviewRecipients = async () => {
    if (!campaignData.recipient_criteria.status.length && !campaignData.recipient_criteria.specific_clients.length) {
      toast.error('Please select recipient criteria first');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await emailCampaigns({
        action: 'preview_recipients',
        campaignData: campaignData
      });
      
      setPreviewRecipients(data.recipients);
      toast.success(`Found ${data.count} recipients`);
    } catch (error) {
      console.error('Error previewing recipients:', error);
      toast.error('Failed to preview recipients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignData.name || !campaignData.template_id || !campaignData.subject) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!campaignData.recipient_criteria.status.length && !campaignData.recipient_criteria.specific_clients.length) {
      toast.error('Please select recipients');
      return;
    }

    if (!campaignData.send_immediately && !campaignData.scheduled_date) {
      toast.error('Please select a scheduled date and time');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await emailCampaigns({
        action: 'create_campaign',
        campaignData: campaignData
      });
      
      toast.success(`Campaign "${campaignData.name}" ${campaignData.send_immediately ? 'sent' : 'scheduled'} to ${data.recipients_count} recipients`);
      setShowCampaignBuilder(false);
      setCampaignData({
        name: '',
        template_id: '',
        subject: '',
        message_content: '',
        recipient_criteria: { status: [], specific_clients: [], exclude_clients: [] },
        send_immediately: true,
        scheduled_date: ''
      });
      setPreviewRecipients([]); // Clear preview recipients on successful send
      setTotalRecipients(0); // Reset total recipients
      loadData();
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'sending': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  const clientStatuses = [
    { id: "new_lead", label: "New Lead" },
    { id: "attempted_contact", label: "Attempted Contact" },
    { id: "contacted", label: "Contacted" },
    { id: "estimate", label: "Estimate" },
    { id: "won", label: "Won" },
    { id: "lost", label: "Lost" },
    { id: "do_not_contact", label: "Do Not Contact" }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Email Campaigns</CardTitle>
            <CardDescription>Create and manage email marketing campaigns for your clients</CardDescription>
          </div>
          <Button onClick={() => setShowCampaignBuilder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length > 0 ? campaigns.map((campaign) => {
                const openRate = campaign.total_recipients > 0 
                  ? ((campaign.open_count || 0) / campaign.total_recipients) * 100 
                  : 0;

                return (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(campaign.status)}
                      <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{campaign.total_recipients}</TableCell>
                  <TableCell>
                    {campaign.sent_date ? format(new Date(campaign.sent_date), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>{openRate.toFixed(1)}%</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No campaigns found. Create your first campaign to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Campaign Builder Dialog */}
      {showCampaignBuilder && (
        <Dialog open={showCampaignBuilder} onOpenChange={setShowCampaignBuilder}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Email Campaign</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="setup" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="recipients">Recipients</TabsTrigger>
                <TabsTrigger value="review">Review & Send</TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input
                      id="campaign-name"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., 'Spring Promotion 2024'"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template">Email Template</Label>
                    <Select value={campaignData.template_id} onValueChange={handleTemplateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={campaignData.subject}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Subject line for your email"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Email Content</Label>
                  <Textarea
                    id="message"
                    value={campaignData.message_content}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, message_content: e.target.value }))}
                    rows={8}
                    placeholder="Your email message content..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="recipients" className="space-y-4">
                <div>
                  <Label>Select Recipients by Client Status</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {clientStatuses.map((status) => {
                      const clientCount = clients.filter(c => c.status === status.id).length;
                      return (
                        <div key={status.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={status.id}
                            checked={campaignData.recipient_criteria.status.includes(status.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCampaignData(prev => ({
                                  ...prev,
                                  recipient_criteria: {
                                    ...prev.recipient_criteria,
                                    status: [...prev.recipient_criteria.status, status.id]
                                  }
                                }));
                              } else {
                                setCampaignData(prev => ({
                                  ...prev,
                                  recipient_criteria: {
                                    ...prev.recipient_criteria,
                                    status: prev.recipient_criteria.status.filter(s => s !== status.id)
                                  }
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={status.id} className="capitalize flex items-center gap-1">
                            {status.label}
                            <span className="text-xs text-gray-500">({clientCount})</span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select which client statuses to include in this email campaign.
                  </p>
                </div>

                <div>
                  <Label>Or Select Specific Clients</Label>
                  <Select 
                    value="" // Controlled component requires a value, but we want it to reset after selection.
                    onValueChange={(clientId) => {
                      if (!campaignData.recipient_criteria.specific_clients.includes(clientId)) {
                        setCampaignData(prev => ({
                          ...prev,
                          recipient_criteria: {
                            ...prev.recipient_criteria,
                            specific_clients: [...prev.recipient_criteria.specific_clients, clientId]
                          }
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add specific clients..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {clients
                        .filter(client => !campaignData.recipient_criteria.specific_clients.includes(client.id))
                        .map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.company_name || client.contact_person} ({client.email}) - {client.status.replace('_', ' ')}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  
                  {/* Show selected specific clients */}
                  {campaignData.recipient_criteria.specific_clients.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <Label className="text-xs">Selected Clients:</Label>
                      {campaignData.recipient_criteria.specific_clients.map(clientId => {
                        const client = clients.find(c => c.id === clientId);
                        if (!client) return null;
                        return (
                          <div key={clientId} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                            <span>{client.company_name || client.contact_person} - {client.status.replace('_', ' ')}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCampaignData(prev => ({
                                  ...prev,
                                  recipient_criteria: {
                                    ...prev.recipient_criteria,
                                    specific_clients: prev.recipient_criteria.specific_clients.filter(id => id !== clientId)
                                  }
                                }));
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={handlePreviewRecipients} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                    Preview Recipients
                  </Button>
                  <span className="text-sm text-gray-500">
                    {totalRecipients} recipients selected
                  </span>
                </div>

                {previewRecipients.length > 0 && (
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewRecipients.map((recipient) => (
                          <TableRow key={recipient.id}>
                            <TableCell>{recipient.name}</TableCell>
                            <TableCell>{recipient.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {recipient.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="review" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Campaign Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {campaignData.name}
                    </div>
                    <div>
                      <span className="font-medium">Recipients:</span> {totalRecipients}
                    </div>
                    <div>
                      <span className="font-medium">Subject:</span> {campaignData.subject}
                    </div>
                    <div>
                      <span className="font-medium">Send:</span> {campaignData.send_immediately ? 'Immediately' : 'Scheduled'}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Scheduling</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="send-immediately"
                        checked={campaignData.send_immediately}
                        onCheckedChange={(checked) => setCampaignData(prev => ({ ...prev, send_immediately: checked }))}
                      />
                      <Label htmlFor="send-immediately">Send Immediately</Label>
                    </div>
                    {!campaignData.send_immediately && (
                      <Input
                        type="datetime-local"
                        value={campaignData.scheduled_date}
                        onChange={(e) => setCampaignData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                        className="w-auto"
                      />
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCampaignBuilder(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendCampaign} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {campaignData.send_immediately ? 'Send Campaign' : 'Schedule Campaign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
