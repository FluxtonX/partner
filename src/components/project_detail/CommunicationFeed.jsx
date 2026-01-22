import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Paperclip, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Communication, ActivityLog } from '@/api/entities';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function CommunicationFeed({ project, communications, users = [], client, currentUser, onNewPost }) {
  const [newCommunication, setNewCommunication] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthorDetails = (email) => {
    // Guard against undefined users array
    if (!users || !Array.isArray(users)) {
      return {
        name: email || 'Unknown User',
        initials: email ? email.substring(0, 2).toUpperCase() : 'UU',
        imageUrl: null
      };
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return {
        name: email || 'Unknown User',
        initials: email ? email.substring(0, 2).toUpperCase() : 'UU',
        imageUrl: null
      };
    }
    const name = user.display_name || user.full_name || email || 'Unknown User';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return {
      name,
      initials,
      imageUrl: user.profile_image_url
    };
  };

  const handleSubmit = async () => {
    if (!newCommunication.trim() || !project || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      await Communication.create({
        project_id: project.id,
        message: newCommunication,
        is_internal: false, // Assuming posts from this feed are visible to the client
      });

      await ActivityLog.create({
        project_id: project.id,
        user_email: currentUser.email,
        user_name: currentUser.full_name || currentUser.email,
        action_type: 'communication_sent',
        action_description: 'Posted an update to the project feed.',
        metadata: {
          message_snippet: newCommunication.substring(0, 50) + (newCommunication.length > 50 ? '...' : ''),
        },
        visible_to_client: true,
      });

      toast.success('Update posted successfully!');
      setNewCommunication('');
      if (onNewPost) onNewPost();
    } catch (error) {
      console.error('Failed to post update:', error);
      toast.error('Failed to post update. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!communications) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Project Communications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Project Communications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Post a new communication */}
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={currentUser?.profile_image_url} />
            <AvatarFallback>
              {getAuthorDetails(currentUser?.email).initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={newCommunication}
              onChange={(e) => setNewCommunication(e.target.value)}
              placeholder="Post an update, message, or log a communication..."
              rows={3}
              className="bg-white"
            />
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="sm">
                <Paperclip className="w-4 h-4 mr-2" />
                Attach File
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Posting...' : 'Post Update'}
              </Button>
            </div>
          </div>
        </div>

        {/* Communication Log */}
        <div className="space-y-4">
          {communications.map((comm) => {
            const author = getAuthorDetails(comm.created_by);
            return (
              <div key={comm.id} className="flex items-start gap-4 p-4 rounded-lg bg-white/80 hover:bg-white transition-colors border">
                <Avatar>
                  <AvatarImage src={author.imageUrl} />
                  <AvatarFallback className="bg-slate-100">{author.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-slate-800">{author.name}</p>
                    <p className="text-xs text-slate-500">{format(new Date(comm.created_date), "MMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{comm.message}</p>
                </div>
              </div>
            );
          })}

          {communications.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              No communications have been logged for this project yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}