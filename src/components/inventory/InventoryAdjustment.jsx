import React, { useState } from 'react';
import { ProductOrService } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Minus, RotateCcw } from 'lucide-react';

export default function InventoryAdjustment({ item, onComplete, onCancel }) {
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [newMinimum, setNewMinimum] = useState(item.minimum_stock || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quantity || isNaN(parseFloat(quantity))) {
      alert('Please enter a valid quantity.');
      return;
    }

    setIsSubmitting(true);
    try {
      const adjustmentAmount = parseFloat(quantity);
      const currentStock = item.current_stock || 0;
      
      let newStock;
      switch (adjustmentType) {
        case 'add':
          newStock = currentStock + adjustmentAmount;
          break;
        case 'remove':
          newStock = Math.max(0, currentStock - adjustmentAmount);
          break;
        case 'set':
          newStock = adjustmentAmount;
          break;
        default:
          newStock = currentStock;
      }

      await ProductOrService.update(item.id, {
        current_stock: newStock,
        minimum_stock: parseFloat(newMinimum) || item.minimum_stock
      });

      // Log the adjustment (you could create a separate InventoryLog entity for this)
      console.log(`Inventory adjustment: ${item.name} ${adjustmentType} ${adjustmentAmount} ${item.unit}. Reason: ${reason}`);

      onComplete();
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNewTotal = () => {
    if (!quantity || isNaN(parseFloat(quantity))) return item.current_stock || 0;
    
    const adjustmentAmount = parseFloat(quantity);
    const currentStock = item.current_stock || 0;
    
    switch (adjustmentType) {
      case 'add':
        return currentStock + adjustmentAmount;
      case 'remove':
        return Math.max(0, currentStock - adjustmentAmount);
      case 'set':
        return adjustmentAmount;
      default:
        return currentStock;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Adjust Inventory: {item.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600">Current Stock</p>
            <p className="text-2xl font-bold">{item.current_stock || 0} {item.unit}</p>
          </div>

          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <Select value={adjustmentType} onValueChange={setAdjustmentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-green-500" />
                    Add Stock
                  </div>
                </SelectItem>
                <SelectItem value="remove">
                  <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-red-500" />
                    Remove Stock
                  </div>
                </SelectItem>
                <SelectItem value="set">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-blue-500" />
                    Set Exact Amount
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity ({item.unit}) *
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={adjustmentType === 'set' ? 'Enter exact amount' : 'Enter quantity'}
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              New Total: <span className="font-bold">{getNewTotal()} {item.unit}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newMinimum">Update Minimum Stock Level</Label>
            <Input
              id="newMinimum"
              type="number"
              min="0"
              step="0.01"
              value={newMinimum}
              onChange={(e) => setNewMinimum(e.target.value)}
              placeholder="Minimum stock level"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Received shipment, Used for project, Damaged goods"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Inventory'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}