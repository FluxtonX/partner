import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, User, Users, GraduationCap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ConversationList({ conversations, currentUser, users, activeConversationId, onSelectConversation, onNewConversation }) {
  
  const getConversationDetails = (conv) => {
    if (conv.type === 'group') {
      return {
        name: conv.name || 'Group Chat',
        avatar: <Users className="w-5 h-5 text-white" />,
        fallbackBg: 'bg-purple-500'
      };
    }
    
    // Direct message
    const otherUserEmail = conv.participants.find(email => email !== currentUser.email);
    const otherUser = users.find(u => u.email === otherUserEmail);
    
    if (!otherUser) {
      return { name: 'Unknown User', avatarUrl: null, initials: '?' };
    }
    
    const initials = (otherUser.display_name || otherUser.full_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2);
    
    return {
      name: otherUser.display_name || otherUser.full_name,
      avatarUrl: otherUser.profile_image_url,
      initials,
      fallbackBg: 'bg-emerald-500',
      isTrainer: otherUser.is_trainer
    };
  };

  return (
    <aside className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
      <header className="p-4 border-b border-slate-200">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Conversations</h2>
            <button onClick={onNewConversation} className="text-emerald-600 hover:text-emerald-700">
                <PlusCircle className="w-6 h-6" />
            </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2">
          {conversations.map(conv => {
            const { name, avatar, avatarUrl, initials, fallbackBg, isTrainer } = getConversationDetails(conv);
            const isActive = conv.id === activeConversationId;
            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors mb-1 ${
                  isActive ? 'bg-emerald-100' : 'hover:bg-slate-100'
                }`}
              >
                <Avatar className="w-10 h-10">
                  {avatarUrl !== undefined ? (
                    <>
                      <AvatarImage src={avatarUrl} alt={name} />
                      <AvatarFallback className={`${fallbackBg} text-white`}>{initials}</AvatarFallback>
                    </>
                  ) : (
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${fallbackBg}`}>{avatar}</div>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className={`font-semibold truncate flex items-center gap-1 ${isActive ? 'text-emerald-800' : 'text-slate-800'}`}>
                      {name}
                      {isTrainer && (
                        <GraduationCap className="w-3 h-3 text-emerald-600" title="Certified Trainer" />
                      )}
                    </p>
                    {conv.last_message_at && (
                        <p className="text-xs text-slate-500 flex-shrink-0 ml-2">
                            {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                        </p>
                    )}
                  </div>
                  {/* You can add a last message preview here */}
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}