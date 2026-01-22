import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function UserAgreementForm({ agreement, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(agreement || {
    title: '',
    content: '',
    agreement_type: 'asset_checkout',
    version: 1,
    is_active: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{agreement ? 'Edit' : 'Create'} User Agreement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="agreement_type">Agreement Type</Label>
              <Select
                value={formData.agreement_type}
                onValueChange={(value) => setFormData({ ...formData, agreement_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset_checkout">Asset Checkout</SelectItem>
                  <SelectItem value="general_policy">General Policy</SelectItem>
                  <SelectItem value="safety_procedure">Safety Procedure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Content</Label>
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              className="bg-white"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" /> Save Agreement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}