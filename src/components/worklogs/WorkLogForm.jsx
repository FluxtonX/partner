import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { format, parseISO } from 'date-fns';

const toDatetimeLocal = (isoString) => {
  if (!isoString) return '';
  try {
    return format(parseISO(isoString), "yyyy-MM-dd'T'HH:mm");
  } catch (e) {
    return '';
  }
};

export default function WorkLogForm({ worklog, users, projects, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    project_id: worklog.project_id || '',
    user_email: worklog.user_email || '',
    start_time: toDatetimeLocal(worklog.start_time),
    end_time: toDatetimeLocal(worklog.end_time),
    notes: worklog.notes || '',
    total_mileage: worklog.total_mileage || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);
      const durationHours = formData.end_time ? (endTime - startTime) / (1000 * 60 * 60) : null;
      
      const updatedData = {
        ...formData,
        start_time: startTime.toISOString(),
        end_time: formData.end_time ? endTime.toISOString() : null,
        duration_hours: durationHours,
        total_mileage: parseFloat(formData.total_mileage) || 0,
      };
      
      await onSubmit(updatedData, worklog.id);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Work Log</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project_id">Project</Label>
            <Select value={formData.project_id} onValueChange={(value) => setFormData(p => ({...p, project_id: value}))}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user_email">User</Label>
            <Select value={formData.user_email} onValueChange={(value) => setFormData(p => ({...p, user_email: value}))}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                {users.map(u => <SelectItem key={u.id} value={u.email}>{u.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input id="start_time" type="datetime-local" value={formData.start_time} onChange={(e) => setFormData(p => ({...p, start_time: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input id="end_time" type="datetime-local" value={formData.end_time} onChange={(e) => setFormData(p => ({...p, end_time: e.target.value}))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_mileage">Total Mileage</Label>
            <Input id="total_mileage" type="number" step="0.1" value={formData.total_mileage} onChange={(e) => setFormData(p => ({...p, total_mileage: e.target.value}))} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData(p => ({...p, notes: e.target.value}))} rows={4} />
          </div>
          
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}