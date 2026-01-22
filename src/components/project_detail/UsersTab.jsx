import React, { useState } from 'react';
import { Project } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { X, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function UsersTab({ project, allUsers, onUpdate }) {
  const [assignedEmails, setAssignedEmails] = useState(project.assigned_user_emails || []);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const assignedUsers = allUsers.filter(user => assignedEmails.includes(user.email));
  const unassignedUsers = allUsers.filter(user => !assignedEmails.includes(user.email));

  const handleSelectionChange = (email, isSelected) => {
    setAssignedEmails(prev => 
      isSelected ? [...prev, email] : prev.filter(e => e !== email)
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Project.update(project.id, { assigned_user_emails: assignedEmails });
      toast.success('Project team updated successfully!');
      if (onUpdate) onUpdate();
      setIsPopoverOpen(false);
    } catch (error) {
      console.error('Failed to update project team:', error);
      toast.error('Failed to update project team.');
    } finally {
      setIsSaving(false);
    }
  };

  const getUserInitials = (user) => {
    const name = user.display_name || user.full_name;
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <CardTitle>Project Team</CardTitle>
        </div>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button><UserPlus className="w-4 h-4 mr-2" /> Assign Users</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search users..." />
              <CommandList>
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  {allUsers.map(user => (
                    <CommandItem key={user.id} onSelect={() => handleSelectionChange(user.email, !assignedEmails.includes(user.email))}>
                      <Checkbox
                        className="mr-2"
                        checked={assignedEmails.includes(user.email)}
                        onCheckedChange={checked => handleSelectionChange(user.email, checked)}
                      />
                      <span>{user.display_name || user.full_name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="p-2 border-t">
              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving ? 'Saving...' : 'Update Team'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        {assignedUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Avatar>
                  <AvatarImage src={user.profile_image_url} />
                  <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{user.display_name || user.full_name}</p>
                  <p className="text-xs text-slate-500">{user.primary_labor_type || 'Team Member'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>No users have been assigned to this project's team yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}