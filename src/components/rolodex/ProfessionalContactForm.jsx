import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'accounting', label: 'Accounting' },
  { value: 'tax_services', label: 'Tax Services' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'banking', label: 'Banking' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'it_services', label: 'IT Services' },
  { value: 'custodial', label: 'Custodial' },
  { value: 'security', label: 'Security' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'software_subscriptions', label: 'Software Subscriptions' },
  { value: 'equipment_rental', label: 'Equipment Rental' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'other', label: 'Other' }
];

export default function ProfessionalContactForm({ contact, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    company_name: contact?.company_name || '',
    contact_person: contact?.contact_person || '',
    title: contact?.title || '',
    category: contact?.category || 'other',
    email: contact?.email || '',
    phone: contact?.phone || '',
    phone_secondary: contact?.phone_secondary || '',
    website: contact?.website || '',
    address: contact?.address || '',
    city: contact?.city || '',
    state: contact?.state || '',
    zip_code: contact?.zip_code || '',
    monthly_expense: contact?.monthly_expense || 0,
    payment_frequency: contact?.payment_frequency || 'monthly',
    contract_start_date: contact?.contract_start_date || '',
    contract_end_date: contact?.contract_end_date || '',
    auto_renew: contact?.auto_renew || false,
    services_provided: contact?.services_provided || [],
    notes: contact?.notes || '',
    last_contact_date: contact?.last_contact_date || '',
    rating: contact?.rating || 0,
    preferred_contact_method: contact?.preferred_contact_method || 'email',
    emergency_contact: contact?.emergency_contact || false,
    status: contact?.status || 'active',
    tags: contact?.tags || []
  });

  const [newService, setNewService] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addService = () => {
    if (newService.trim() && !formData.services_provided.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services_provided: [...prev.services_provided, newService.trim()]
      }));
      setNewService('');
    }
  };

  const removeService = (serviceToRemove) => {
    setFormData(prev => ({
      ...prev,
      services_provided: prev.services_provided.filter(service => service !== serviceToRemove)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.company_name.trim()) {
      toast.error('Company name is required');
      return;
    }
    
    if (!formData.contact_person.trim()) {
      toast.error('Contact person is required');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contact ? 'Edit Professional Contact' : 'Add Professional Contact'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="ABC Accounting Services"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person *</Label>
                <Input
                  id="contact_person"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                  placeholder="John Smith"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Senior Accountant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Service Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@abcaccounting.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Primary Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_secondary">Secondary Phone</Label>
                <Input
                  id="phone_secondary"
                  name="phone_secondary"
                  value={formData.phone_secondary}
                  onChange={handleInputChange}
                  placeholder="(555) 987-6543"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://abcaccounting.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                <Select value={formData.preferred_contact_method} onValueChange={(value) => handleSelectChange('preferred_contact_method', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="portal">Client Portal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Springfield"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="IL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  placeholder="62701"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Financial Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly_expense">Monthly Expense ($)</Label>
                <Input
                  id="monthly_expense"
                  name="monthly_expense"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthly_expense}
                  onChange={handleInputChange}
                  placeholder="299.99"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_frequency">Payment Frequency</Label>
                <Select value={formData.payment_frequency} onValueChange={(value) => handleSelectChange('payment_frequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi_annually">Semi-Annually</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                    <SelectItem value="as_needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract_start_date">Contract Start Date</Label>
                <Input
                  id="contract_start_date"
                  name="contract_start_date"
                  type="date"
                  value={formData.contract_start_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract_end_date">Contract End Date</Label>
                <Input
                  id="contract_end_date"
                  name="contract_end_date"
                  type="date"
                  value={formData.contract_end_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto_renew"
                name="auto_renew"
                checked={formData.auto_renew}
                onCheckedChange={(checked) => handleSelectChange('auto_renew', checked)}
              />
              <Label htmlFor="auto_renew">Contract auto-renews</Label>
            </div>
          </div>

          <Separator />

          {/* Services and Additional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Additional Information</h3>

            {/* Services Provided */}
            <div className="space-y-2">
              <Label>Services Provided</Label>
              <div className="flex gap-2">
                <Input
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Add a service..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                />
                <Button type="button" onClick={addService} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.services_provided.map((service, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {service}
                    <button
                      type="button"
                      onClick={() => removeService(service)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Your Rating (1-5)</Label>
                <Select value={formData.rating.toString()} onValueChange={(value) => handleSelectChange('rating', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rate this service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Rating</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_contact_date">Last Contact Date</Label>
                <Input
                  id="last_contact_date"
                  name="last_contact_date"
                  type="date"
                  value={formData.last_contact_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="emergency_contact"
                name="emergency_contact"
                checked={formData.emergency_contact}
                onCheckedChange={(checked) => handleSelectChange('emergency_contact', checked)}
              />
              <Label htmlFor="emergency_contact">This is an emergency contact</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about this professional contact..."
                rows={3}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              {contact ? 'Update Contact' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}