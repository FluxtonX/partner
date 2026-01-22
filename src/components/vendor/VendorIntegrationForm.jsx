import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VendorIntegrationForm({ vendor, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(vendor || {
    vendor_name: '',
    vendor_type: 'other',
    api_endpoint: '',
    api_key: '',
    api_secret: '',
    api_format: 'rest_json',
    search_endpoint: '',
    authentication_type: 'api_key',
    rate_limit_per_minute: 60,
    priority_level: 0,
    is_premium: false,
    premium_expiry_date: '',
    cost_markup_percentage: 0,
    shipping_info: {
      free_shipping_threshold: 0,
      standard_shipping_cost: 0,
      expedited_shipping_cost: 0,
      delivery_time_days: 0
    },
    contact_info: {
      phone: '',
      email: '',
      website: '',
      account_manager: ''
    },
    active: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleShippingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      shipping_info: {
        ...prev.shipping_info,
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value
      }
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor ? 'Edit' : 'Add'} Vendor Integration</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor_name">Vendor Name *</Label>
                <Input
                  id="vendor_name"
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({...formData, vendor_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor_type">Vendor Type</Label>
                <Select
                  value={formData.vendor_type}
                  onValueChange={(value) => setFormData({...formData, vendor_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home_improvement">Home Improvement</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="lumber">Lumber</SelectItem>
                    <SelectItem value="concrete">Concrete</SelectItem>
                    <SelectItem value="specialty">Specialty</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  API credentials are encrypted and secure. Only authorized personnel can access them.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api_endpoint">API Endpoint *</Label>
                  <Input
                    id="api_endpoint"
                    type="url"
                    value={formData.api_endpoint}
                    onChange={(e) => setFormData({...formData, api_endpoint: e.target.value})}
                    placeholder="https://api.vendor.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search_endpoint">Search Endpoint</Label>
                  <Input
                    id="search_endpoint"
                    value={formData.search_endpoint}
                    onChange={(e) => setFormData({...formData, search_endpoint: e.target.value})}
                    placeholder="/products/search"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_key">API Key</Label>
                  <Input
                    id="api_key"
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                    placeholder="Enter API key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_secret">API Secret (Optional)</Label>
                  <Input
                    id="api_secret"
                    type="password"
                    value={formData.api_secret}
                    onChange={(e) => setFormData({...formData, api_secret: e.target.value})}
                    placeholder="Enter API secret if required"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authentication_type">Authentication Type</Label>
                  <Select
                    value={formData.authentication_type}
                    onValueChange={(value) => setFormData({...formData, authentication_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="bearer_token">Bearer Token</SelectItem>
                      <SelectItem value="basic_auth">Basic Auth</SelectItem>
                      <SelectItem value="oauth2">OAuth2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_format">Response Format</Label>
                  <Select
                    value={formData.api_format}
                    onValueChange={(value) => setFormData({...formData, api_format: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rest_json">REST JSON</SelectItem>
                      <SelectItem value="rest_xml">REST XML</SelectItem>
                      <SelectItem value="graphql">GraphQL</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Premium */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Premium Features</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority_level">Priority Level</Label>
                <Input
                  id="priority_level"
                  type="number"
                  value={formData.priority_level}
                  onChange={(e) => setFormData({...formData, priority_level: parseInt(e.target.value) || 0})}
                  min="0"
                />
                <p className="text-xs text-slate-500">Higher numbers show first in search results</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate_limit">Rate Limit (per minute)</Label>
                <Input
                  id="rate_limit"
                  type="number"
                  value={formData.rate_limit_per_minute}
                  onChange={(e) => setFormData({...formData, rate_limit_per_minute: parseInt(e.target.value) || 60})}
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_premium"
                  checked={formData.is_premium}
                  onCheckedChange={(checked) => setFormData({...formData, is_premium: checked})}
                />
                <Label htmlFor="is_premium">Premium Vendor</Label>
              </div>
              {formData.is_premium && (
                <div className="space-y-2">
                  <Label htmlFor="premium_expiry">Premium Expiry Date</Label>
                  <Input
                    id="premium_expiry"
                    type="datetime-local"
                    value={formData.premium_expiry_date}
                    onChange={(e) => setFormData({...formData, premium_expiry_date: e.target.value})}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_info.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_info.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_website">Website</Label>
                <Input
                  id="contact_website"
                  type="url"
                  value={formData.contact_info.website}
                  onChange={(e) => handleContactChange('website', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_manager">Account Manager</Label>
                <Input
                  id="account_manager"
                  value={formData.contact_info.account_manager}
                  onChange={(e) => handleContactChange('account_manager', e.target.value)}
                />
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
              {vendor ? 'Update' : 'Create'} Vendor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}