import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { sendInvitation } from '@/api/functions';

export default function InviteUserButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inviteData, setInviteData] = useState({
    invitee_email: '',
    role: 'member',
    is_trainer: false
  });

  const handleSendInvite = async () => {
    if (!inviteData.invitee_email.trim()) {
      toast.error('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.invitee_email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    try {
      const { error } = await sendInvitation(inviteData);
      if (error) {
        throw new Error(error);
      }
      toast.success(`Invitation sent to ${inviteData.invitee_email}`);
      handleClose();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    setInviteData({ invitee_email: '', role: 'member', is_trainer: false });
  };

  return (
    <>
      <Button onClick={() => setShowDialog(true)} className="gap-2">
        <UserPlus className="w-4 h-4" />
        Invite User
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter user's email"
                value={inviteData.invitee_email}
                onChange={(e) => setInviteData(prev => ({ ...prev, invitee_email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteData.role}
                onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="subcontractor_member">Subcontractor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="trainer"
                checked={inviteData.is_trainer}
                onCheckedChange={(checked) => setInviteData(prev => ({ ...prev, is_trainer: checked }))}
              />
              <Label htmlFor="trainer">Certified Trainer</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSendInvite} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}