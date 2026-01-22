import React, { useState, useEffect } from 'react';
import { User, UserBusiness } from '@/api/entities';
import { getOrCreateSupportChat } from '@/api/functions';
import MessageArea from '@/components/messenger/MessageArea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, MessageSquare, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageContext';

export default function SupportChatPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        // Fetch the user's role within their current business using UserBusiness entity
        const userBusinessData = await UserBusiness.filter({ 
          user_email: currentUser.email, 
          business_id: currentUser.current_business_id 
        });
        
        const role = userBusinessData.length > 0 ? userBusinessData[0].role : 'member';
        setUserRole(role);
        
        // Allow all users to access support chat (removed role restriction)
        const { data, error: funcError } = await getOrCreateSupportChat();
        if (funcError) {
          throw new Error(funcError.error || 'Failed to initialize support chat.');
        }
        setConversationId(data.conversationId);
      } catch (err) {
        console.error("Error initializing support chat:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        <p className="ml-3 text-slate-600">Loading Support Chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-8 h-8 text-slate-700" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Support Chat</h1>
          <p className="text-slate-600">Directly communicate with platform support for assistance.</p>
        </div>
      </div>
      <div className="flex-1 min-h-0">
          {conversationId ? (
              <MessageArea conversationId={conversationId} />
          ) : (
              <p>No conversation available.</p>
          )}
      </div>
    </div>
  );
}