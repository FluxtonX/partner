import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { WorkdayConfirmation } from '@/api/entities';
import { toast } from 'sonner';

export default function WorkdayETAConfirmation({ confirmation, businessSettings, onConfirm }) {
  const [eta, setEta] = useState(businessSettings?.business_hours_start || '08:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLate = eta > (businessSettings?.business_hours_start || '23:59');

  const handleConfirm = async () => {
    if (isLate && !notes) {
      toast.error('Notes are required if your ETA is after the start of the workday.');
      return;
    }
    setIsSubmitting(true);
    try {
      const newStatus = isLate ? 'confirmed_late' : 'confirmed_ontime';
      await WorkdayConfirmation.update(confirmation.id, {
        status: newStatus,
        confirmed_at: new Date().toISOString(),
        confirmed_eta: eta,
        notes: notes
      });
      toast.success('ETA confirmed successfully!');
      if (onConfirm) {
        onConfirm();
      }
    } catch (error) {
      console.error('Failed to confirm ETA:', error);
      toast.error('Failed to confirm ETA. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-emerald-500 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-emerald-800">
          <Clock className="w-6 h-6" />
          Confirm Your Workday ETA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-600">
          Your workday starts at <span className="font-bold">{businessSettings?.business_hours_start}</span>. Please confirm your estimated time of arrival.
        </p>
        <div className="space-y-2">
          <Label htmlFor="eta">Your ETA</Label>
          <Input 
            id="eta" 
            type="time" 
            value={eta} 
            onChange={(e) => setEta(e.target.value)} 
          />
        </div>
        
        {isLate && (
          <div className="space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Label htmlFor="notes" className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-4 h-4" />
              Reason for being late (Required)
            </Label>
            <Textarea 
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Doctor's appointment, traffic..."
              required
            />
          </div>
        )}

        <Button 
          onClick={handleConfirm} 
          disabled={isSubmitting} 
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Confirming...' : 'Confirm ETA'}
        </Button>
      </CardContent>
    </Card>
  );
}