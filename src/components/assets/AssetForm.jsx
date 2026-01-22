
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Save, X, Calendar as CalendarIcon, Upload, Gauge } from "lucide-react";
import { UploadFile } from '@/api/integrations';

export default function AssetForm({ asset, users, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(asset || {
    name: '',
    type: 'Equipment',
    description: '',
    purchase_date: '',
    purchase_price: '',
    current_value: '',
    monthly_cost: '',
    serial_number: '',
    location: '',
    assigned_to: '',
    status: 'Available',
    image_url: '',
    capacity: {
      weight_limit: 0,
      passenger_capacity: 0,
      towing_capacity: 0,
      stackable_height: 0, // New field
      stackable_weight: 0, // New field
      bed_dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: 'feet'
      },
      fuel_capacity: 0,
      operating_radius: 0
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handler for top-level capacity fields, including new stackable fields
  const handleCapacityChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      capacity: {
        ...prev.capacity,
        [field]: parseFloat(value) || 0
      }
    }));
  };

  // Handler for nested bed_dimensions fields
  const handleBedDimensionChange = (dimension, value) => {
    setFormData(prev => ({
      ...prev,
      capacity: {
        ...prev.capacity,
        bed_dimensions: {
          ...prev.capacity.bed_dimensions,
          [dimension]: dimension === 'unit' ? value : (parseFloat(value) || 0)
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submitData = {
      ...formData,
      purchase_price: parseFloat(formData.purchase_price) || 0,
      current_value: parseFloat(formData.current_value) || 0,
      monthly_cost: parseFloat(formData.monthly_cost) || 0,
      // capacity fields are already parsed to numbers by their respective handlers
    };
    await onSubmit(submitData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? 'Edit' : 'Add New'} Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="capacity">Capacity</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Asset Name *</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData(p => ({...p, type: val}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vehicle">Vehicle</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Tool">Tool</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={(e) => setFormData(p => ({...p, description: e.target.value}))} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_date">Purchase Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.purchase_date ? format(new Date(formData.purchase_date), 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar 
                      mode="single" 
                      selected={formData.purchase_date ? new Date(formData.purchase_date) : undefined} 
                      onSelect={(date) => setFormData(p => ({...p, purchase_date: date ? format(date, 'yyyy-MM-dd') : ''}))} // Format date for storage
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input id="serial_number" value={formData.serial_number} onChange={(e) => setFormData(p => ({...p, serial_number: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={formData.location} onChange={(e) => setFormData(p => ({...p, location: e.target.value}))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Select value={formData.assigned_to || ''} onValueChange={(val) => setFormData(p => ({...p, assigned_to: val}))}>
                  <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Unassigned</SelectItem>
                    {users.map(user => <SelectItem key={user.id} value={user.email}>{user.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData(p => ({...p, status: val}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="In Use">In Use</SelectItem>
                    <SelectItem value="In Repair">In Repair</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                    <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Asset Image</Label>
                <div className="flex items-center gap-4">
                  {formData.image_url && <img src={formData.image_url} alt="Asset" className="w-16 h-16 object-cover rounded-lg" />}
                  <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <label htmlFor="image-upload" className="flex-grow">
                    <Button type="button" variant="outline" asChild disabled={isUploading}>
                      <div className="w-full flex items-center justify-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        {isUploading ? 'Uploading...' : 'Upload Image'}
                      </div>
                    </Button>
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="capacity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5" />
                    Capacity & Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Weight Limit (lbs)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.capacity?.weight_limit || 0}
                        onChange={(e) => handleCapacityChange('weight_limit', e.target.value)}
                      />
                    </div>
                    {/* Removed Volume Limit */}
                    <div className="space-y-2">
                      <Label>Passenger Capacity</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.capacity?.passenger_capacity || 0}
                        onChange={(e) => handleCapacityChange('passenger_capacity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Towing Capacity (lbs)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.capacity?.towing_capacity || 0}
                        onChange={(e) => handleCapacityChange('towing_capacity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stackable Height (inches)</Label> {/* New field */}
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.capacity?.stackable_height || 0}
                        onChange={(e) => handleCapacityChange('stackable_height', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stackable Weight (lbs)</Label> {/* New field */}
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.capacity?.stackable_weight || 0}
                        onChange={(e) => handleCapacityChange('stackable_weight', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fuel Capacity (gallons)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.capacity?.fuel_capacity || 0}
                        onChange={(e) => handleCapacityChange('fuel_capacity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Operating Radius (miles)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.capacity?.operating_radius || 0}
                        onChange={(e) => handleCapacityChange('operating_radius', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Cargo/Bed Dimensions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Length</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.capacity?.bed_dimensions?.length || 0}
                          onChange={(e) => handleBedDimensionChange('length', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Width</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.capacity?.bed_dimensions?.width || 0}
                          onChange={(e) => handleBedDimensionChange('width', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Height</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.capacity?.bed_dimensions?.height || 0}
                          onChange={(e) => handleBedDimensionChange('height', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Select
                          value={formData.capacity?.bed_dimensions?.unit || 'feet'}
                          onValueChange={(value) => handleBedDimensionChange('unit', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inches">Inches</SelectItem>
                            <SelectItem value="feet">Feet</SelectItem>
                            <SelectItem value="meters">Meters</SelectItem>
                            <SelectItem value="cm">Centimeters</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_price">Purchase Price ($) *</Label>
                  <Input id="purchase_price" type="number" step="0.01" value={formData.purchase_price} onChange={(e) => setFormData(p => ({...p, purchase_price: e.target.value}))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_value">Current Value ($)</Label>
                  <Input id="current_value" type="number" step="0.01" value={formData.current_value} onChange={(e) => setFormData(p => ({...p, current_value: e.target.value}))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_cost">Monthly Cost ($)</Label>
                <Input id="monthly_cost" type="number" step="0.01" value={formData.monthly_cost} onChange={(e) => setFormData(p => ({...p, monthly_cost: e.target.value}))} />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Saving...' : 'Save Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
