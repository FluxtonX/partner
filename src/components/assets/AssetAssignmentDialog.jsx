import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, MapPin, Calendar } from 'lucide-react';

export default function AssetAssignmentDialog({ asset, users, projects, onSubmit, onCancel }) {
  const [assignmentData, setAssignmentData] = useState({
    assigned_to: asset.assigned_to || '',
    location: asset.location || '',
    status: asset.status || 'Available'
  });
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(assignmentData);
  };

  const handleUserChange = (userEmail) => {
    setAssignmentData(prev => ({
      ...prev,
      assigned_to: userEmail,
      status: userEmail ? 'In Use' : 'Available'
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Assign Asset: {asset.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assign To User</Label>
            <Select value={assignmentData.assigned_to} onValueChange={handleUserChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user or leave unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Unassigned</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.email}>
                    <div className="flex items-center gap-2">
                      <span>{user.display_name || user.full_name}</span>
                      <span className="text-xs text-slate-500">({user.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Current Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="location"
                value={assignmentData.location}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Where is this asset located?"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Asset Status</Label>
            <Select 
              value={assignmentData.status} 
              onValueChange={(status) => setAssignmentData(prev => ({ ...prev, status }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="In Use">In Use</SelectItem>
                <SelectItem value="In Repair">In Repair</SelectItem>
                <SelectItem value="Decommissioned">Decommissioned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Assignment Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this assignment (optional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Update Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}