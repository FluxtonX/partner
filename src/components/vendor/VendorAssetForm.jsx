import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, X, Plus, Trash2, DollarSign } from 'lucide-react';

export default function VendorAssetForm({ asset, vendors, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(asset || {
    vendor_integration_id: '',
    asset_name: '',
    asset_type: 'Equipment',
    description: '',
    specifications: {},
    image_urls: [],
    location: '',
    pickup_address: '',
    delivery_available: false,
    delivery_radius_miles: 0,
    delivery_fee: 0,
    pricing_structure: [
      {
        duration_type: 'daily',
        minimum_duration: 1,
        rate: 0,
        deposit_required: 0
      }
    ],
    availability_status: 'available',
    requires_license: false,
    license_type: '',
    insurance_required: true,
    minimum_insurance_amount: 0,
    capacity: {},
    serial_number: '',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    fuel_type: 'none',
    tags: [],
    is_active: true,
    platform_commission_rate: 0.15
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addPricingTier = () => {
    setFormData(prev => ({
      ...prev,
      pricing_structure: [
        ...prev.pricing_structure,
        {
          duration_type: 'daily',
          minimum_duration: 1,
          rate: 0,
          deposit_required: 0
        }
      ]
    }));
  };

  const removePricingTier = (index) => {
    setFormData(prev => ({
      ...prev,
      pricing_structure: prev.pricing_structure.filter((_, i) => i !== index)
    }));
  };

  const updatePricingTier = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      pricing_structure: prev.pricing_structure.map((tier, i) => 
        i === index ? { ...tier, [field]: value } : tier
      )
    }));
  };

  const handleTagsChange = (tagsString) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? 'Edit' : 'Add'} Rental Asset</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor_integration_id">Vendor *</Label>
                <Select
                  value={formData.vendor_integration_id}
                  onValueChange={(value) => setFormData({...formData, vendor_integration_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.vendor_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset_name">Asset Name *</Label>
                <Input
                  id="asset_name"
                  value={formData.asset_name}
                  onChange={(e) => setFormData({...formData, asset_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset_type">Asset Type</Label>
                <Select
                  value={formData.asset_type}
                  onValueChange={(value) => setFormData({...formData, asset_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Tool">Tool</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Machinery">Machinery</SelectItem>
                    <SelectItem value="Generator">Generator</SelectItem>
                    <SelectItem value="Trailer">Trailer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Asset Details */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({...formData, make: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel_type">Fuel Type</Label>
                <Select
                  value={formData.fuel_type}
                  onValueChange={(value) => setFormData({...formData, fuel_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">Gasoline</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="propane">Propane</SelectItem>
                    <SelectItem value="natural_gas">Natural Gas</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="excavator, heavy equipment, construction"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Delivery */}
          <Card>
            <CardHeader>
              <CardTitle>Location & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup_address">Pickup Address *</Label>
                <Textarea
                  id="pickup_address"
                  value={formData.pickup_address}
                  onChange={(e) => setFormData({...formData, pickup_address: e.target.value})}
                  rows={2}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location Description</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Warehouse A, Bay 3"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="delivery_available"
                  checked={formData.delivery_available}
                  onCheckedChange={(checked) => setFormData({...formData, delivery_available: checked})}
                />
                <Label htmlFor="delivery_available">Delivery Available</Label>
              </div>
              {formData.delivery_available && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="delivery_radius">Delivery Radius (miles)</Label>
                    <Input
                      id="delivery_radius"
                      type="number"
                      value={formData.delivery_radius_miles}
                      onChange={(e) => setFormData({...formData, delivery_radius_miles: parseFloat(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery_fee">Delivery Fee</Label>
                    <Input
                      id="delivery_fee"
                      type="number"
                      step="0.01"
                      value={formData.delivery_fee}
                      onChange={(e) => setFormData({...formData, delivery_fee: parseFloat(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pricing Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Pricing Structure
                <Button type="button" variant="outline" size="sm" onClick={addPricingTier}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.pricing_structure.map((tier, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Duration Type</Label>
                    <Select
                      value={tier.duration_type}
                      onValueChange={(value) => updatePricingTier(index, 'duration_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Min Duration</Label>
                    <Input
                      type="number"
                      value={tier.minimum_duration}
                      onChange={(e) => updatePricingTier(index, 'minimum_duration', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rate ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tier.rate}
                      onChange={(e) => updatePricingTier(index, 'rate', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deposit ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tier.deposit_required}
                      onChange={(e) => updatePricingTier(index, 'deposit_required', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removePricingTier(index)}
                      disabled={formData.pricing_structure.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="requires_license"
                  checked={formData.requires_license}
                  onCheckedChange={(checked) => setFormData({...formData, requires_license: checked})}
                />
                <Label htmlFor="requires_license">Requires Special License</Label>
              </div>
              {formData.requires_license && (
                <div className="space-y-2">
                  <Label htmlFor="license_type">License Type</Label>
                  <Input
                    id="license_type"
                    value={formData.license_type}
                    onChange={(e) => setFormData({...formData, license_type: e.target.value})}
                    placeholder="CDL, Forklift Certification, etc."
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="insurance_required"
                  checked={formData.insurance_required}
                  onCheckedChange={(checked) => setFormData({...formData, insurance_required: checked})}
                />
                <Label htmlFor="insurance_required">Insurance Required</Label>
              </div>
              {formData.insurance_required && (
                <div className="space-y-2">
                  <Label htmlFor="minimum_insurance">Minimum Coverage ($)</Label>
                  <Input
                    id="minimum_insurance"
                    type="number"
                    value={formData.minimum_insurance_amount}
                    onChange={(e) => setFormData({...formData, minimum_insurance_amount: parseFloat(e.target.value) || 0})}
                    min="0"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission_rate">Platform Commission Rate</Label>
                <Input
                  id="commission_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.platform_commission_rate}
                  onChange={(e) => setFormData({...formData, platform_commission_rate: parseFloat(e.target.value) || 0.15})}
                />
                <p className="text-xs text-slate-500">
                  {(formData.platform_commission_rate * 100).toFixed(1)}% commission on rentals
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Asset Available for Rental</Label>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {asset ? 'Update' : 'Create'} Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}