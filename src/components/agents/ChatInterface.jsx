import React, { useState, useEffect, useRef } from 'react';
// import { agentSDK } from '@/components/agents';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import MessageBubble from './MessageBubble';

export default function ChatInterface({ agentName }) {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const initializeConversation = async () => {
            setIsLoading(true);
            const conv = await agentSDK.createConversation({
                agent_name: agentName,
                metadata: {
                    name: `Data Integrity Check - ${format(new Date(), 'PPP p')}`,
                }
            });
            setConversation(conv);
            setMessages(conv.messages || []);
            setIsLoading(false);
        };
        initializeConversation();
    }, [agentName]);

    useEffect(() => {
        if (!conversation?.id) return;

        const unsubscribe = agentSDK.subscribeToConversation(conversation.id, (data) => {
            setMessages(data.messages);
            setIsLoading(data.status === 'running' || data.status === 'pending');
        });

        return () => unsubscribe();
    }, [conversation?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (messageContent) => {
        const content = messageContent || input;
        if (!content.trim() || !conversation) return;

        setIsLoading(true);
        setInput(''); // Clear input immediately
        await agentSDK.addMessage(conversation, {
            role: 'user',
            content: content,
        });
        // isLoading will be handled by the subscription
    };

    const suggestedPrompts = [
        "Run a full data integrity audit.",
        "Check for orphaned projects and communications.",
        "Verify invoice and payment consistency.",
        "Find clients with a 'lost' status that still have active projects."
    ];

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 flex flex-col h-[75vh]">
                <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                    {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} />
                    ))}
                    {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Agent is thinking...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="mt-4 border-t pt-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {suggestedPrompts.map(prompt => (
                            <Button 
                                key={prompt}
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleSendMessage(prompt)}
                                disabled={isLoading}
                            >
                                {prompt}
                            </Button>
                        ))}
                    </div>
                    <div className="relative">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Ask the agent to perform a check..."
                            className="pr-20 bg-white"
                            disabled={isLoading}
                        />
                        <Button
                            size="icon"
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleSendMessage()}
                            disabled={!input.trim() || isLoading}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}