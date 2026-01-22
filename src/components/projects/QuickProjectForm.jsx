
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from 'sonner';

export default function QuickProjectForm({ clients, isOpen, onClose, onSubmit }) {
    const [clientId, setClientId] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!clientId) {
            toast.error("Please select a client.");
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({ client_id: clientId, notes });
            toast.success("Quick project created and you are now clocked in!");
            onClose();
        } catch (error) {
            console.error("Failed to create quick project:", error);
            toast.error(error.message || "Could not create the project.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Quick Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="client">Client *</Label>
                        <Select value={clientId} onValueChange={setClientId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.company_name || `${client.first_name} ${client.last_name}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Scope Notes</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Briefly describe the work to be done..."
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" /> Create & Clock In
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
