import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Save, X, Calendar as CalendarIcon, Upload, DollarSign, Target } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadFile } from '@/api/integrations';
import { stripePayments } from '@/api/functions';
import { toast } from 'sonner';

export default function SponsoredNewsForm({ news, onSave, onCancel }) {
  const [formData, setFormData] = useState(news || {
    title: '',
    summary: '',
    content: '',
    image_url: '',
    category: 'vendor_spotlight',
    priority: 'high',
    published: false,
    featured: true,
    sponsored: true,
    sponsor_name: '',
    sponsor_email: '',
    sponsor_website: '',
    campaign_budget: 100,
    cost_per_view: 0.50,
    max_views_per_business: 5,
    target_business_categories: [],
    target_subscription_types: [],
    campaign_start_date: '',
    campaign_end_date: '',
    call_to_action: 'Learn More',
    call_to_action_url: '',
    tags: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleArrayFieldChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter(item => item !== value)
    }));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const newTags = [...(formData.tags || []), tagInput.trim()];
    setFormData(prev => ({ ...prev, tags: newTags }));
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = formData.tags.filter(tag => tag !== tagToRemove);
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const calculateEstimatedCost = () => {
    const estimatedViews = formData.max_views_per_business * 100; // Rough estimate
    return (estimatedViews * formData.cost_per_view).toFixed(2);
  };

  const handlePayment = async () => {
    try {
      const response = await stripePayments({
        action: 'create_payment_intent',
        amount: Math.round(formData.campaign_budget * 100),
        currency: 'usd',
        metadata: {
          type: 'sponsored_news',
          sponsor_name: formData.sponsor_name,
          sponsor_email: formData.sponsor_email,
          campaign_title: formData.title,
          campaign_budget: formData.campaign_budget
        }
      });

      if (response.data?.client_secret) {
        setFormData(prev => ({ ...prev, payment_intent_id: response.data.payment_intent_id }));
        toast.success('Payment processed successfully!');
        setShowPayment(false);
        handleSubmit();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.payment_intent_id && formData.campaign_budget > 0) {
      setShowPayment(true);
      return;
    }

    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
  };

  const businessCategories = [
    { value: 'construction', label: 'Construction' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'all', label: 'All Categories' }
  ];

  const subscriptionTypes = [
    { value: 'Trial', label: 'Trial' },
    { value: 'Starter', label: 'Starter' },
    { value: 'Partner', label: 'Partner' },
    { value: 'Enterprise', label: 'Enterprise' },
    { value: 'Enterprise Annual', label: 'Enterprise Annual' },
    { value: 'all', label: 'All Subscriptions' }
  ];

  return (
    <>
      <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {news ? 'Edit Sponsored' : 'Create Sponsored'} News Campaign
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 p-2">
            {/* Sponsor Information */}
            <div className="bg-emerald-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-emerald-800">Sponsor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sponsor_name">Company Name *</Label>
                  <Input 
                    id="sponsor_name" 
                    value={formData.sponsor_name} 
                    onChange={(e) => handleInputChange('sponsor_name', e.target.value)} 
                    required 
                    placeholder="Your company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sponsor_email">Contact Email *</Label>
                  <Input 
                    id="sponsor_email" 
                    type="email"
                    value={formData.sponsor_email} 
                    onChange={(e) => handleInputChange('sponsor_email', e.target.value)} 
                    required 
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sponsor_website">Website</Label>
                <Input 
                  id="sponsor_website" 
                  type="url"
                  value={formData.sponsor_website} 
                  onChange={(e) => handleInputChange('sponsor_website', e.target.value)} 
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>

            {/* Campaign Content */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => handleInputChange('title', e.target.value)} 
                  required 
                  placeholder="Engaging title for your campaign..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">Summary *</Label>
                <Textarea 
                  id="summary" 
                  value={formData.summary} 
                  onChange={(e) => handleInputChange('summary', e.target.value)} 
                  required 
                  rows={3}
                  placeholder="Brief, compelling summary..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Full Content *</Label>
                <Textarea 
                  id="content" 
                  value={formData.content} 
                  onChange={(e) => handleInputChange('content', e.target.value)} 
                  required 
                  rows={8}
                  placeholder="Detailed content of your news campaign..."
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label>Featured Image</Label>
              <div className="flex items-center gap-4">
                {formData.image_url && (
                  <img 
                    src={formData.image_url} 
                    alt="Featured" 
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingImage}
                      className="cursor-pointer"
                      asChild
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </div>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {/* Targeting */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Targeting Options
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Target Business Categories</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {businessCategories.map(category => (
                      <div key={category.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.value}`}
                          checked={(formData.target_business_categories || []).includes(category.value)}
                          onCheckedChange={(checked) => 
                            handleArrayFieldChange('target_business_categories', category.value, checked)
                          }
                        />
                        <Label htmlFor={`category-${category.value}`} className="text-sm">
                          {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Target Subscription Types</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {subscriptionTypes.map(sub => (
                      <div key={sub.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subscription-${sub.value}`}
                          checked={(formData.target_subscription_types || []).includes(sub.value)}
                          onCheckedChange={(checked) => 
                            handleArrayFieldChange('target_subscription_types', sub.value, checked)
                          }
                        />
                        <Label htmlFor={`subscription-${sub.value}`} className="text-sm">
                          {sub.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign_budget">Campaign Budget ($) *</Label>
                <Input 
                  id="campaign_budget" 
                  type="number" 
                  step="0.01"
                  value={formData.campaign_budget} 
                  onChange={(e) => handleInputChange('campaign_budget', parseFloat(e.target.value) || 0)} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_per_view">Cost per View ($)</Label>
                <Input 
                  id="cost_per_view" 
                  type="number" 
                  step="0.01"
                  value={formData.cost_per_view} 
                  onChange={(e) => handleInputChange('cost_per_view', parseFloat(e.target.value) || 0)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_views_per_business">Max Views per Business</Label>
                <Input 
                  id="max_views_per_business" 
                  type="number"
                  value={formData.max_views_per_business} 
                  onChange={(e) => handleInputChange('max_views_per_business', parseInt(e.target.value) || 5)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="call_to_action">Call to Action Button</Label>
                <Input 
                  id="call_to_action" 
                  value={formData.call_to_action} 
                  onChange={(e) => handleInputChange('call_to_action', e.target.value)} 
                  placeholder="Learn More"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="call_to_action_url">Call to Action URL</Label>
              <Input 
                id="call_to_action_url" 
                type="url"
                value={formData.call_to_action_url} 
                onChange={(e) => handleInputChange('call_to_action_url', e.target.value)} 
                placeholder="https://yourcompany.com/landing-page"
              />
            </div>

            {/* Campaign Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Campaign Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.campaign_start_date ? format(new Date(formData.campaign_start_date), "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.campaign_start_date ? new Date(formData.campaign_start_date) : undefined}
                      onSelect={(date) => handleInputChange('campaign_start_date', date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Campaign End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.campaign_end_date ? format(new Date(formData.campaign_end_date), "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.campaign_end_date ? new Date(formData.campaign_end_date) : undefined}
                      onSelect={(date) => handleInputChange('campaign_end_date', date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Campaign Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Campaign Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium ml-2">${formData.campaign_budget}</span>
                </div>
                <div>
                  <span className="text-gray-600">Cost per View:</span>
                  <span className="font-medium ml-2">${formData.cost_per_view}</span>
                </div>
                <div>
                  <span className="text-gray-600">Estimated Reach:</span>
                  <span className="font-medium ml-2">{Math.floor(formData.campaign_budget / formData.cost_per_view)} views</span>
                </div>
                <div>
                  <span className="text-gray-600">Target Categories:</span>
                  <span className="font-medium ml-2">{formData.target_business_categories?.length || 0}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                <DollarSign className="w-4 h-4 mr-2" /> 
                {isSubmitting ? 'Processing...' : `Pay & Launch Campaign ($${formData.campaign_budget})`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      {showPayment && (
        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h3 className="font-semibold text-emerald-800 mb-2">Campaign Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Campaign Budget:</span>
                    <span className="font-medium">${formData.campaign_budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Views:</span>
                    <span className="font-medium">{Math.floor(formData.campaign_budget / formData.cost_per_view)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">
                      {formData.campaign_start_date && formData.campaign_end_date 
                        ? `${Math.ceil((new Date(formData.campaign_end_date) - new Date(formData.campaign_start_date)) / (1000 * 60 * 60 * 24))} days`
                        : 'Not specified'
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                You will be charged ${formData.campaign_budget} for this sponsored news campaign.
                The campaign will run according to your specified dates and targeting settings.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPayment(false)}>
                Cancel
              </Button>
              <Button onClick={handlePayment} className="bg-emerald-600 hover:bg-emerald-700">
                <DollarSign className="w-4 h-4 mr-2" />
                Pay ${formData.campaign_budget}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}