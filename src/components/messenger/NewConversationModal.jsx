import React, { useState } from 'react';
import { User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewConversationModal({ allUsers, currentUser, onClose, onCreateConversation }) {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const toggleUser = (email) => {
        setSelectedUsers(prev =>
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
    };

    const handleSubmit = () => {
        if (selectedUsers.length === 0) return;
        if (selectedUsers.length > 1 && !groupName.trim()) {
            alert('Please provide a name for the group chat.');
            return;
        }
        onCreateConversation(selectedUsers, groupName);
    };
    
    const filteredUsers = allUsers.filter(user => 
        user.email !== currentUser.email &&
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b">
                    <h2 className="text-lg font-semibold">New Conversation</h2>
                </header>
                <div className="p-4 flex-1 flex flex-col min-h-0">
                    <Input 
                        placeholder="Search for users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                    />

                    {selectedUsers.length > 1 && (
                        <div className="mb-4">
                            <label htmlFor="groupName" className="text-sm font-medium text-slate-700">Group Name</label>
                            <Input
                                id="groupName"
                                placeholder="e.g., Project Team"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    )}
                    
                    <div className="flex-1 overflow-y-auto -mx-4 px-4 space-y-2">
                        {filteredUsers.map(user => (
                            <div
                                key={user.email}
                                onClick={() => toggleUser(user.email)}
                                className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-slate-100"
                            >
                                <span>{user.full_name || user.email}</span>
                                {selectedUsers.includes(user.email) && <Check className="w-5 h-5 text-emerald-600" />}
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="p-4 border-t flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={selectedUsers.length === 0}>
                        Start Chat
                    </Button>
                </footer>
            </div>
        </div>
    );
}