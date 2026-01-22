
import React, { useState, useEffect, useRef } from 'react';
import { Message, Conversation } from '@/api/entities';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, GraduationCap } from 'lucide-react'; // Added GraduationCap
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion'; // Added motion and AnimatePresence

export default function MessageArea({ conversationId, currentUser, users, onNewMessage }) {
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll for new messages every 5 seconds
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    if (!conversationId) return;
    try {
      const [convData, msgsData] = await Promise.all([
        Conversation.get(conversationId),
        Message.filter({ conversation_id: conversationId }, 'created_date')
      ]);
      setConversation(convData);
      setMessages(msgsData);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    try {
      await Message.create({
        conversation_id: conversationId,
        sender_email: currentUser.email,
        content: newMessage.trim(),
      });
      setNewMessage('');
      await loadMessages(); // Immediately fetch new messages
      onNewMessage(); // Notify parent to reload conversations for sorting
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getUserDetails = (email) => {
    // Returns the full user object, or a default object if not found
    return users.find(u => u.email === email) || { full_name: email, display_name: email, is_trainer: false, profile_image_url: null };
  };

  const getUserInitials = (user) => {
    const name = user?.display_name || user?.full_name || 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const conversationName = conversation?.type === 'group'
    ? conversation.name
    : conversation?.participants
      ? (() => {
          const otherParticipantEmail = conversation.participants.find(p => p !== currentUser.email);
          const otherUser = getUserDetails(otherParticipantEmail);
          return otherUser.display_name || otherUser.full_name;
        })()
      : "Loading...";

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-slate-200 flex-shrink-0">
        <h3 className="font-bold text-lg text-slate-900">{conversationName}</h3>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4"> {/* Changed padding and spacing */}
        <AnimatePresence>
          {messages.map((message) => { // Changed msg to message
            const sender = getUserDetails(message.sender_email);
            const isCurrentUser = message.sender_email === currentUser.email;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="w-8 h-8"> {/* Changed avatar size */}
                    <AvatarImage src={sender.profile_image_url} alt={sender.display_name || sender.full_name} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs"> {/* Changed fallback styling */}
                      {getUserInitials(sender)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-medium text-slate-600">
                        {sender.display_name || sender.full_name}
                      </span>
                      {sender.is_trainer && (
                        <GraduationCap className="w-3 h-3 text-emerald-600" title="Certified Trainer" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${ // Changed border radius and padding
                        isCurrentUser
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-900' // Changed background and border for non-current user
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs underline hover:no-underline"
                            >
                              📎 {attachment.filename}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 mt-1">
                      {format(new Date(message.created_date), 'h:mm a')} {/* Changed time format */}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-start gap-4">
          <Avatar className="w-10 h-10">
             <AvatarImage src={currentUser?.profile_image_url} />
             <AvatarFallback className="bg-emerald-500 text-white">{getUserInitials(currentUser)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              className="resize-none"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="self-end">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
