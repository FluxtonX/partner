import React, { useState } from 'react';
import { Expense } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const EXPENSE_CATEGORIES = ["materials", "labor", "equipment", "travel", "consulting", "other_overhead"];

export default function ReceiptScannerConfirmation({ projectId, extractedData, fileUrl, onClose, onSuccess }) {
    const [expenseData, setExpenseData] = useState({
        amount: extractedData.total || 0,
        date: extractedData.date || new Date().toISOString().split('T')[0],
        description: extractedData.vendor_name || 'Scanned Receipt',
        category: 'materials',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await Expense.create({
                ...expenseData,
                project_id: projectId,
                receipt_url: fileUrl,
                billable: true,
            });
            onSuccess();
        } catch (error) {
            console.error('Error creating expense from receipt:', error);
            alert('Failed to create expense.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Scanned Receipt</DialogTitle>
                    <DialogDescription>
                        Review the data extracted from the receipt and confirm to create an expense.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Total Amount</Label>
                        <Input id="amount" type="number" step="0.01" value={expenseData.amount} onChange={e => setExpenseData({...expenseData, amount: parseFloat(e.target.value)})} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" value={expenseData.date} onChange={e => setExpenseData({...expenseData, date: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={expenseData.description} onChange={e => setExpenseData({...expenseData, description: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={expenseData.category} onValueChange={value => setExpenseData({...expenseData, category: value})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {EXPENSE_CATEGORIES.map(cat => <SelectItem key={cat} value={cat} className="capitalize">{cat.replace('_', ' ')}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Expense
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}