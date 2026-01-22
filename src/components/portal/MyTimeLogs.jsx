
import React, { useState } from 'react';
import { WorkLog } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { History, Edit3, Plus, Clock } from 'lucide-react';

export default function MyTimeLogs({ logs, projects }) {
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const getProjectTitle = (projectId) => {
    return projects.find(p => p.id === projectId)?.title || 'Unknown Project';
  };

  const handleAddNotes = (log) => {
    setSelectedLog(log);
    setNotes(log.notes || '');
    setShowNotesDialog(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedLog) return;
    
    setIsSaving(true);
    try {
      await WorkLog.update(selectedLog.id, { notes });
      setShowNotesDialog(false);
      setSelectedLog(null);
      setNotes('');
      // Note: In a real app, you'd want to refresh the logs or update the local state
      // For now, the notes will show after page refresh
      window.location.reload();
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <History className="w-5 h-5" />
            Recent Work Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[28rem] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length > 0 ? (
                  logs.filter(log => log.end_time).map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{getProjectTitle(log.project_id)}</TableCell>
                      <TableCell>{format(new Date(log.start_time), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(log.start_time), 'p')} - {format(new Date(log.end_time), 'p')}
                      </TableCell>
                      <TableCell>{log.duration_hours?.toFixed(2) || 'N/A'} hrs</TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-xs">
                        {log.notes ? (
                          <div className="truncate" title={log.notes}>
                            {log.notes}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No notes</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddNotes(log)}
                          className="h-8 w-8 p-0"
                        >
                          {log.notes ? (
                            <Edit3 className="w-4 h-4 text-slate-500" />
                          ) : (
                            <Plus className="w-4 h-4 text-slate-500" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">No work logs found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedLog?.notes ? 'Edit Notes' : 'Add Notes'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Work Session Details</Label>
              <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                <p><strong>Project:</strong> {selectedLog && getProjectTitle(selectedLog.project_id)}</p>
                <p><strong>Date:</strong> {selectedLog && format(new Date(selectedLog.start_time), 'MMM d, yyyy')}</p>
                <p><strong>Duration:</strong> {selectedLog?.duration_hours?.toFixed(2) || 'N/A'} hours</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add details about what you worked on, any issues encountered, materials used, etc..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNotesDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNotes}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Notes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
