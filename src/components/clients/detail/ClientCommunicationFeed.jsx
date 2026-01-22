
import React, { useState, useEffect } from 'react';
import { ClientCommunication, CommunicationTemplate, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Plus, 
  Calendar,
  User as UserIcon,
  Clock,
  Tag,
  FileText,
  PhoneCall,
  MessageCircle,
  Edit,
  Copy,
  Send,
  Trash2,
  Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { safeFormatDate } from '@/components/lib/formatters';

import CommunicationForm from './CommunicationForm';
import TemplateManager from './TemplateManager';

export default function ClientCommunicationFeed({ client, onUpdate }) {
  const [communications, setCommunications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]); // Add users state
  const [showCommunicationForm, setShowCommunicationForm] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [communicationType, setCommunicationType] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    loadData();
    getCurrentUser();
  }, [client.id]);

  const loadData = async () => {
    try {
      const [commsData, templatesData, usersData] = await Promise.all([
        ClientCommunication.filter({ client_id: client.id }, '-created_date'),
        CommunicationTemplate.list(),
        User.list() // Load all users
      ]);
      setCommunications(commsData);
      setTemplates(templatesData);
      setUsers(usersData); // Set users
    } catch (error) {
      console.error('Error loading communications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const handleQuickContact = (type) => {
    setCommunicationType(type);
    setShowCommunicationForm(true);
  };

  const handleCommunicationSubmit = async (commData) => {
    try {
      await ClientCommunication.create({
        ...commData,
        client_id: client.id,
        user_email: currentUser.email
      });
      setShowCommunicationForm(false);
      setCommunicationType('');
      loadData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving communication:', error);
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() || isSavingNote) return;
    setIsSavingNote(true);
    try {
      await ClientCommunication.create({
        client_id: client.id,
        user_email: currentUser.email,
        type: 'note',
        subject: `Note - ${format(new Date(), 'PPP')}`,
        content: noteContent,
      });
      setNoteContent('');
      setShowNoteForm(false);
      loadData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving quick note:', error);
    } finally {
      setIsSavingNote(false);
    }
  };

  const getCommunicationIcon = (type) => {
    switch (type) {
      case 'phone_call': return <PhoneCall className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'text_message': return <MessageCircle className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'follow_up': return <Clock className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'successful': return 'bg-emerald-100 text-emerald-800';
      case 'no_answer': return 'bg-amber-100 text-amber-800';
      case 'voicemail': return 'bg-blue-100 text-blue-800';
      case 'callback_requested': return 'bg-purple-100 text-purple-800';
      case 'follow_up_needed': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.display_name || user?.full_name || email.split('@')[0];
  };

  const filteredCommunications = filterType === 'all' 
    ? communications 
    : communications.filter(comm => comm.type === filterType);

  const communicationStats = {
    total: communications.length,
    thisWeek: communications.filter(c => new Date(c.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    followUpsNeeded: communications.filter(c => c.follow_up_date && new Date(c.follow_up_date) <= new Date()).length
  };

  return (
    <div className="space-y-6">
      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Communications</p>
                <p className="text-2xl font-bold">{communicationStats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">This Week</p>
                <p className="text-2xl font-bold text-emerald-600">{communicationStats.thisWeek}</p>
              </div>
              <Calendar className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Follow-ups Needed</p>
                <p className="text-2xl font-bold text-amber-600">{communicationStats.followUpsNeeded}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Contact Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => window.open(`tel:${client.phone}`, '_self')}
              className="bg-green-600 hover:bg-green-700"
              disabled={!client.phone}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button 
              onClick={() => window.open(`sms:${client.phone}`, '_self')}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!client.phone}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Text
            </Button>
            <Button 
              onClick={() => window.open(`mailto:${client.email}`, '_self')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button 
              onClick={() => handleQuickContact('phone_call')}
              variant="outline"
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              Log Call
            </Button>
            <Button 
              onClick={() => {
                setShowNoteForm(p => !p);
                if (showNoteForm) setNoteContent('');
              }}
              variant="outline"
              className={showNoteForm ? 'bg-slate-100' : ''}
            >
              <FileText className="w-4 h-4 mr-2" />
              {showNoteForm ? 'Cancel Note' : 'Add Note'}
            </Button>
          </div>
          {showNoteForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <div className="space-y-2">
                <Label htmlFor="quick-note" className="text-sm font-medium">Quick Note</Label>
                <Textarea
                  id="quick-note"
                  placeholder={`Add a note for ${client.company_name || client.contact_person || 'this client'}...`}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  className="bg-slate-50"
                />
                <div className="flex justify-end">
                  <Button onClick={handleSaveNote} disabled={!noteContent.trim() || isSavingNote}>
                    {isSavingNote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Note
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Communication History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Communication History</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="phone_call">Phone Calls</SelectItem>
                  <SelectItem value="email">Emails</SelectItem>
                  <SelectItem value="text_message">Text Messages</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="note">Notes</SelectItem>
                  <SelectItem value="follow_up">Follow-ups</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => setShowTemplateManager(true)}
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                Templates
              </Button>
              
              <Button 
                onClick={() => setShowCommunicationForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Communication
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-slate-200 rounded"></div>
                </div>
              ))
            ) : filteredCommunications.length > 0 ? (
              filteredCommunications.map((comm) => (
                <motion.div
                  key={comm.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-slate-100">
                        {getCommunicationIcon(comm.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{comm.subject}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <UserIcon className="w-3 h-3" />
                          <span>{getUserName(comm.user_email)}</span>
                          <span>•</span>
                          <span>{safeFormatDate(comm.created_date, 'MMM d, yyyy h:mm a')}</span>
                          {comm.duration_minutes && (
                            <>
                              <span>•</span>
                              <span>{comm.duration_minutes} min</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {comm.direction && (
                        <Badge variant="outline" className="text-xs">
                          {comm.direction}
                        </Badge>
                      )}
                      {comm.outcome && (
                        <Badge className={`${getOutcomeColor(comm.outcome)} text-xs`}>
                          {comm.outcome.replace('_', ' ')}
                        </Badge>
                      )}
                      {comm.priority && comm.priority !== 'medium' && (
                        <Badge variant={comm.priority === 'high' || comm.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-xs">
                          {comm.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {comm.content && (
                    <p className="text-slate-700 mb-3 whitespace-pre-wrap">{comm.content}</p>
                  )}
                  
                  {comm.follow_up_date && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <Clock className="w-3 h-3" />
                      <span>Follow-up: {safeFormatDate(comm.follow_up_date, 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  
                  {comm.tags && comm.tags.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <div className="flex gap-1">
                        {comm.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No communications recorded yet</p>
                <Button 
                  onClick={() => setShowCommunicationForm(true)}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Communication
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Communication Form Modal */}
      {showCommunicationForm && (
        <CommunicationForm
          client={client}
          initialType={communicationType}
          templates={templates}
          onSubmit={handleCommunicationSubmit}
          onCancel={() => {
            setShowCommunicationForm(false);
            setCommunicationType('');
          }}
        />
      )}

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <TemplateManager
          templates={templates}
          onUpdate={loadData}
          onClose={() => setShowTemplateManager(false)}
        />
      )}
    </div>
  );
}
