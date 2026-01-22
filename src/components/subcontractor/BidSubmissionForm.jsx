import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function BidSubmissionForm({ assignment, project, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    bid_amount: '',
    estimated_hours: '',
    proposed_start_date: '',
    proposed_completion_date: '',
    materials_included: false,
    materials_cost: '0',
    labor_cost: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAssignmentDescription = () => {
    const details = assignment.assignment_details;
    switch (assignment.assignment_type) {
      case 'project':
        return `Full project: ${project?.title || 'Unknown Project'}`;
      case 'category':
        return `Category: ${details.category} - ${details.description || 'Multiple items'}`;
      case 'task':
        return `Task: ${details.description}`;
      default:
        return 'Assignment details';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const bidData = {
        assignment_id: assignment.id,
        project_id: assignment.project_id,
        assignment_type: assignment.assignment_type,
        assignment_details: assignment.assignment_details,
        bid_amount: parseFloat(formData.bid_amount),
        estimated_hours: parseFloat(formData.estimated_hours),
        proposed_start_date: formData.proposed_start_date,
        proposed_completion_date: formData.proposed_completion_date,
        materials_included: formData.materials_included,
        materials_cost: parseFloat(formData.materials_cost),
        labor_cost: parseFloat(formData.labor_cost || formData.bid_amount),
        notes: formData.notes,
        status: 'submitted'
      };

      await onSubmit(bidData);
    } catch (error) {
      console.error('Error submitting bid:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBidAmount = () => {
    const materials = parseFloat(formData.materials_cost || 0);
    const labor = parseFloat(formData.labor_cost || 0);
    const total = materials + labor;
    setFormData(prev => ({ ...prev, bid_amount: total.toString() }));
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Bid</DialogTitle>
        </DialogHeader>

        {/* Assignment Details */}
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Assignment Details</h4>
            <p className="text-slate-600 mb-2">{getAssignmentDescription()}</p>
            <div className="text-sm text-slate-500">
              <p><strong>Project:</strong> {project?.title}</p>
              <p><strong>Assigned by:</strong> {assignment.assigned_by}</p>
              {assignment.assignment_details.estimated_value && (
                <p><strong>Estimated Value:</strong> ${assignment.assignment_details.estimated_value.toLocaleString()}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bid Amount Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="labor_cost">Labor Cost *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="labor_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.labor_cost}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, labor_cost: e.target.value }));
                    setTimeout(updateBidAmount, 100);
                  }}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Estimated Hours *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="estimated_hours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Materials Section */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="materials_included"
                checked={formData.materials_included}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({ ...prev, materials_included: checked }));
                  if (!checked) {
                    setFormData(prev => ({ ...prev, materials_cost: '0' }));
                    setTimeout(updateBidAmount, 100);
                  }
                }}
              />
              <Label htmlFor="materials_included">I will provide materials</Label>
            </div>

            {formData.materials_included && (
              <div className="space-y-2">
                <Label htmlFor="materials_cost">Materials Cost</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="materials_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.materials_cost}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, materials_cost: e.target.value }));
                      setTimeout(updateBidAmount, 100);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Total Bid Amount */}
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700">Total Bid Amount:</span>
              <span className="text-2xl font-bold text-emerald-600">
                ${(parseFloat(formData.labor_cost || 0) + parseFloat(formData.materials_cost || 0)).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proposed_start_date">Proposed Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="proposed_start_date"
                  type="date"
                  value={formData.proposed_start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, proposed_start_date: e.target.value }))}
                  className="pl-10"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposed_completion_date">Proposed Completion Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="proposed_completion_date"
                  type="date"
                  value={formData.proposed_completion_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, proposed_completion_date: e.target.value }))}
                  className="pl-10"
                  min={formData.proposed_start_date || format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information about your approach, timeline, or special considerations..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Bid'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}