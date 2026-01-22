import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Save, X, Calendar as CalendarIcon } from "lucide-react";

export default function AccreditationForm({ accreditation, users, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(accreditation || {
    user_email: '',
    license_name: '',
    issuing_authority: '',
    license_number: '',
    expiration_date: '',
    portal_link: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{accreditation ? 'Edit' : 'Add New'} Accreditation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
          <div className="space-y-2">
            <Label htmlFor="user_email">User *</Label>
            <Select value={formData.user_email} onValueChange={(val) => setFormData(p => ({...p, user_email: val}))} required>
              <SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger>
              <SelectContent>
                {users.map(user => <SelectItem key={user.id} value={user.email}>{user.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="license_name">License Name *</Label>
              <Input id="license_name" value={formData.license_name} onChange={(e) => setFormData(p => ({...p, license_name: e.target.value}))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input id="license_number" value={formData.license_number} onChange={(e) => setFormData(p => ({...p, license_number: e.target.value}))} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issuing_authority">Issuing Authority</Label>
              <Input id="issuing_authority" value={formData.issuing_authority} onChange={(e) => setFormData(p => ({...p, issuing_authority: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration_date">Expiration Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiration_date ? format(new Date(formData.expiration_date), 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.expiration_date ? new Date(formData.expiration_date) : undefined} onSelect={(date) => setFormData(p => ({...p, expiration_date: date}))} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portal_link">License Portal Link</Label>
            <Input id="portal_link" type="url" value={formData.portal_link} onChange={(e) => setFormData(p => ({...p, portal_link: e.target.value}))} placeholder="https://example.com/portal" />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Saving...' : 'Save Accreditation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}