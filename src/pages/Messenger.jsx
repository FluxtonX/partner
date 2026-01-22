import React, { useState, useEffect } from 'react';
import { Conversation, ConversationParticipant, Message, User } from '@/api/entities';
import { useLanguage } from '@/components/providers/LanguageContext';
import { PlusCircle, Loader2 } from 'lucide-react';
import ConversationList from '@/components/messenger/ConversationList';
import MessageArea from '@/components/messenger/MessageArea';
import NewConversationModal from '@/components/messenger/NewConversationModal';

export default function MessengerPage() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [allUsers, userConversationParticipants] = await Promise.all([
        User.list(),
        ConversationParticipant.filter({ user_email: user.email })
      ]);
      setUsers(allUsers);

      if (userConversationParticipants.length > 0) {
        const conversationIds = userConversationParticipants.map(p => p.conversation_id);
        const convs = await Conversation.filter({ id: { $in: conversationIds } }, '-last_message_at');
        
        const enrichedConvs = await Promise.all(convs.map(async c => {
            const participants = await ConversationParticipant.filter({conversation_id: c.id});
            return {...c, participants: participants.map(p => p.user_email)};
        }));

        setConversations(enrichedConvs);

        if (enrichedConvs.length > 0) {
          setActiveConversationId(enrichedConvs[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading messenger data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConversation = async (participantEmails, groupName) => {
    if (!currentUser) return;

    try {
        const isGroup = participantEmails.length > 1;
        const finalParticipants = [...participantEmails, currentUser.email];
        
        const newConversation = await Conversation.create({
            name: isGroup ? groupName : null,
            type: isGroup ? 'group' : 'direct',
            last_message_at: new Date().toISOString()
        });

        await ConversationParticipant.bulkCreate(
            finalParticipants.map(email => ({
                conversation_id: newConversation.id,
                user_email: email
            }))
        );

        setIsModalOpen(false);
        await loadInitialData();
        setActiveConversationId(newConversation.id);

    } catch (error) {
        console.error("Error creating conversation:", error);
    }
  };


  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen bg-white">
      <ConversationList
        conversations={conversations}
        currentUser={currentUser}
        users={users}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={() => setIsModalOpen(true)}
      />
      <main className="flex-1 flex flex-col">
        {activeConversationId ? (
          <MessageArea
            key={activeConversationId}
            conversationId={activeConversationId}
            currentUser={currentUser}
            users={users}
            onNewMessage={loadInitialData} // Reload all conversations to update sorting
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center p-8">
            <h2 className="text-xl font-semibold text-slate-700">Welcome to Messenger</h2>
            <p className="text-slate-500 mt-2">Select a conversation to start chatting or create a new one.</p>
            <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
                <PlusCircle className="w-5 h-5"/>
                New Conversation
            </button>
          </div>
        )}
      </main>

      {isModalOpen && (
        <NewConversationModal
          allUsers={users}
          currentUser={currentUser}
          onClose={() => setIsModalOpen(false)}
          onCreateConversation={handleCreateConversation}
        />
      )}
    </div>
  );
}