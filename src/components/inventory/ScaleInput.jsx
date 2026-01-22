import React, { useState, useEffect } from 'react';
import { ProductOrService } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scale, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function ScaleInput({ item, onComplete, onCancel }) {
  const [scaleReading, setScaleReading] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [autoReading, setAutoReading] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState('set');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Try to connect to scale via Web Serial API
    if ('serial' in navigator) {
      setConnectionStatus('available');
    } else {
      setConnectionStatus('not_supported');
    }
  }, []);

  const connectToScale = async () => {
    try {
      if ('serial' in navigator) {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Set up reader for scale data
        const reader = port.readable.getReader();
        readScaleData(reader);
      }
    } catch (error) {
      console.error('Error connecting to scale:', error);
      setConnectionStatus('error');
    }
  };

  const readScaleData = async (reader) => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        // Parse scale data (format depends on scale model)
        const text = new TextDecoder().decode(value);
        const weightMatch = text.match(/(\d+\.?\d*)/);
        
        if (weightMatch && autoReading) {
          setScaleReading(weightMatch[1]);
        }
      }
    } catch (error) {
      console.error('Error reading from scale:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!scaleReading || isNaN(parseFloat(scaleReading))) {
      alert('Please enter a valid weight reading.');
      return;
    }

    setIsSubmitting(true);
    try {
      const weight = parseFloat(scaleReading);
      const currentStock = item.current_stock || 0;
      
      let newStock;
      switch (adjustmentType) {
        case 'add':
          newStock = currentStock + weight;
          break;
        case 'remove':
          newStock = Math.max(0, currentStock - weight);
          break;
        case 'set':
          newStock = weight;
          break;
        default:
          newStock = currentStock;
      }

      await ProductOrService.update(item.id, {
        current_stock: newStock
      });

      // Log the scale input
      console.log(`Scale input: ${item.name} ${adjustmentType} ${weight} ${item.unit}. Reason: ${reason}`);

      onComplete();
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNewTotal = () => {
    if (!scaleReading || isNaN(parseFloat(scaleReading))) return item.current_stock || 0;
    
    const weight = parseFloat(scaleReading);
    const currentStock = item.current_stock || 0;
    
    switch (adjustmentType) {
      case 'add':
        return currentStock + weight;
      case 'remove':
        return Math.max(0, currentStock - weight);
      case 'set':
        return weight;
      default:
        return currentStock;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Scale Input: {item.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600">Current Stock</p>
            <p className="text-2xl font-bold">{item.current_stock || 0} {item.unit}</p>
          </div>

          {/* Scale Connection Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Scale Connection</Label>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm">Not Connected</span>
                  </div>
                )}
                {connectionStatus === 'available' && !isConnected && (
                  <Button type="button" variant="outline" size="sm" onClick={connectToScale}>
                    Connect Scale
                  </Button>
                )}
              </div>
            </div>

            {connectionStatus === 'not_supported' && (
              <Alert>
                <AlertDescription>
                  Web Serial API not supported in this browser. Please enter weight manually.
                </AlertDescription>
              </Alert>
            )}

            {isConnected && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoReading"
                  checked={autoReading}
                  onChange={(e) => setAutoReading(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="autoReading" className="text-sm">
                  Auto-update from scale
                </Label>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <Select value={adjustmentType} onValueChange={setAdjustmentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Weight</SelectItem>
                <SelectItem value="remove">Remove Weight</SelectItem>
                <SelectItem value="set">Set Exact Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scaleReading">
              Weight Reading ({item.unit}) *
            </Label>
            <div className="flex gap-2">
              <Input
                id="scaleReading"
                type="number"
                min="0"
                step="0.01"
                value={scaleReading}
                onChange={(e) => setScaleReading(e.target.value)}
                placeholder="Enter weight from scale"
                required
              />
              {isConnected && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAutoReading(!autoReading)}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              New Total: <span className="font-bold">{getNewTotal()} {item.unit}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Received shipment, Weighed remaining materials"
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