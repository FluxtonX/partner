import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format, parseISO, startOfToday } from 'date-fns';
import { CalendarCheck } from 'lucide-react';

export default function SubcontractorAvailability({ currentUser, onUpdate }) {
  const [selectedDate, setSelectedDate] = useState(
    currentUser.next_available_date ? parseISO(currentUser.next_available_date) : null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback('');
    try {
      await User.updateMyUserData({
        next_available_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
      });
      setFeedback('Availability updated successfully!');
      setTimeout(() => setFeedback(''), 3000);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to update availability:", error);
      setFeedback('Error updating availability.');
       setTimeout(() => setFeedback(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <CalendarCheck className="w-5 h-5" />
          Update Your Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <p className="text-slate-600 text-center">Set your next available start date for new projects.</p>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          disabled={(date) => date < startOfToday()}
        />
        <div className="flex items-center gap-4 h-10">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Availability'}
            </Button>
            {feedback && <p className="text-sm text-emerald-600 animate-pulse">{feedback}</p>}
        </div>
      </CardContent>
    </Card>
  );
}