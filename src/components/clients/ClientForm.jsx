import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Save, X, User, Building, CalendarIcon, Users } from "lucide-react";
import { generateClientPin } from "@/api/functions";

export default function ClientForm({ client, clients, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(client || {
    client_type: 'residential',
    company_name: '',
    contact_person: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    phone_secondary: '',
    portal_pin: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    billing_address: '',
    billing_city: '',
    billing_state: '',
    billing_zip_code: '',
    date_of_birth: null,
    spouse_name: '',
    spouse_phone: '',
    occupation: '',
    employer: '',
    annual_income_range: '',
    property_type: '',
    property_ownership: '',
    home_built_year: '',
    lot_size: '',
    square_footage: '',
    industry: '',
    business_years: '',
    employee_count: '',
    annual_revenue_range: '',
    referral_source: '',
    referral_details: '',
    referred_by_client_id: '',
    preferred_communication: 'any',
    best_contact_time: '',
    notes: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    status: 'new_lead'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [isGeneratingPin, setIsGeneratingPin] = useState(false);

  const generatePinFromPhone = async () => {
    if (!formData.phone || formData.portal_pin) return;
    
    setIsGeneratingPin(true);
    try {
      const response = await generateClientPin({ phone: formData.phone });
      if (response.data && response.data.pin) {
        setFormData(prev => ({ ...prev, portal_pin: response.data.pin }));
      }
    } catch (error) {
      console.error('Error generating PIN:', error);
    } finally {
      setIsGeneratingPin(false);
    }
  };

  // Generate PIN when phone number changes (for new clients only)
  useEffect(() => {
    if (!client && formData.phone && formData.phone.replace(/\D/g, '').length >= 10) {
      generatePinFromPhone();
    }
  }, [formData.phone, client]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        contact_person: formData.client_type === 'residential' 
          ? `${formData.first_name} ${formData.last_name}`.trim() || formData.contact_person
          : formData.contact_person,
        date_of_birth: formData.date_of_birth ? format(formData.date_of_birth, 'yyyy-MM-dd') : null,
        home_built_year: formData.home_built_year && formData.home_built_year !== '' ? (parseInt(formData.home_built_year) || null) : null,
        square_footage: formData.square_footage && formData.square_footage !== '' ? (parseInt(formData.square_footage) || null) : null,
        business_years: formData.business_years && formData.business_years !== '' ? (parseInt(formData.business_years) || null) : null
      };

      if (!client && !dataToSubmit.portal_pin && dataToSubmit.phone && dataToSubmit.phone.replace(/\D/g, '').length >= 10) {
        try {
          const response = await generateClientPin({ phone: dataToSubmit.phone });
          if (response.data && response.data.pin) {
            dataToSubmit.portal_pin = response.data.pin;
          }
        } catch (error) {
          console.error('Final PIN generation attempt failed:', error);
        }
      }

      if (sameBillingAddress) {
        dataToSubmit.billing_address = '';
        dataToSubmit.billing_city = '';
        dataToSubmit.billing_state = '';
        dataToSubmit.billing_zip_code = '';
      }

      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const referralSources = [
    { value: 'google_search', label: 'Google Search' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'nextdoor', label: 'Nextdoor' },
    { value: 'yelp', label: 'Yelp' },
    { value: 'angies_list', label: 'Angie\'s List' },
    { value: 'home_advisor', label: 'HomeAdvisor' },
    { value: 'thumbtack', label: 'Thumbtack' },
    { value: 'word_of_mouth', label: 'Word of Mouth' },
    { value: 'repeat_customer', label: 'Repeat Customer' },
    { value: 'direct_mail', label: 'Direct Mail' },
    { value: 'yard_sign', label: 'Yard Sign' },
    { value: 'vehicle_wrap', label: 'Vehicle Wrap' },
    { value: 'radio', label: 'Radio' },
    { value: 'tv', label: 'TV' },
    { value: 'newspaper', label: 'Newspaper' },
    { value: 'trade_show', label: 'Trade Show' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {formData.client_type === 'residential' ? <User className="w-5 h-5" /> : <Building className="w-5 h-5" />}
            {client ? 'Edit Client' : 'Add New Client'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 border-b pb-2">Client Type</h3>
            <RadioGroup
              value={formData.client_type}
              onValueChange={(value) => handleInputChange('client_type', value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="residential" id="residential" />
                <Label htmlFor="residential" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Residential
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="commercial" id="commercial" />
                <Label htmlFor="commercial" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Commercial
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              {formData.client_type === 'commercial' && (
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Enter company name"
                    required={formData.client_type === 'commercial'}
                  />
                </div>
              )}

              {formData.client_type === 'residential' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Primary Contact *</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => handleInputChange('contact_person', e.target.value)}
                    placeholder="Primary contact person"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>

              {!client && (
                <div className="space-y-2">
                  <Label htmlFor="portal_pin">Portal PIN (Auto-generated)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="portal_pin"
                      value={formData.portal_pin}
                      onChange={(e) => handleInputChange('portal_pin', e.target.value)}
                      placeholder={isGeneratingPin ? "Generating..." : "Will be generated from phone"}
                      maxLength={4}
                      pattern="[0-9]{4}"
                      className="w-32"
                      disabled={isGeneratingPin}
                    />
                    <span className="text-sm text-slate-500">
                      {isGeneratingPin ? (
                        "Generating unique PIN..."
                      ) : formData.portal_pin ? (
                        "PIN ready for client portal access"
                      ) : (
                        "Enter phone number (at least 10 digits) to auto-generate PIN"
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone_secondary">Secondary Phone</Label>
                <Input
                  id="phone_secondary"
                  type="tel"
                  value={formData.phone_secondary}
                  onChange={(e) => handleInputChange('phone_secondary', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-700">Address Information</h4>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="same_billing"
                    checked={sameBillingAddress}
                    onCheckedChange={setSameBillingAddress}
                  />
                  <Label htmlFor="same_billing">Billing address same as above</Label>
                </div>
                
                {!sameBillingAddress && (
                  <div className="space-y-4 border-l-2 border-slate-200 pl-4">
                    <h4 className="font-medium text-slate-700">Billing Address</h4>
                    <div className="space-y-2">
                      <Label htmlFor="billing_address">Billing Street Address</Label>
                      <Input
                        id="billing_address"
                        value={formData.billing_address}
                        onChange={(e) => handleInputChange('billing_address', e.target.value)}
                        placeholder="123 Billing Street"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="billing_city">City</Label>
                        <Input
                          id="billing_city"
                          value={formData.billing_city}
                          onChange={(e) => handleInputChange('billing_city', e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billing_state">State</Label>
                        <Input
                          id="billing_state"
                          value={formData.billing_state}
                          onChange={(e) => handleInputChange('billing_state', e.target.value)}
                          placeholder="State"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billing_zip_code">ZIP Code</Label>
                        <Input
                          id="billing_zip_code"
                          value={formData.billing_zip_code}
                          onChange={(e) => handleInputChange('billing_zip_code', e.target.value)}
                          placeholder="12345"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {formData.client_type === 'residential' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date_of_birth ? format(formData.date_of_birth, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.date_of_birth}
                            onSelect={(date) => handleInputChange('date_of_birth', date)}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                        placeholder="Occupation"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employer">Employer</Label>
                      <Input
                        id="employer"
                        value={formData.employer}
                        onChange={(e) => handleInputChange('employer', e.target.value)}
                        placeholder="Employer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="annual_income_range">Annual Income Range</Label>
                      <Select
                        value={formData.annual_income_range}
                        onValueChange={(value) => handleInputChange('annual_income_range', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under_25k">Under $25,000</SelectItem>
                          <SelectItem value="25k_50k">$25,000 - $50,000</SelectItem>
                          <SelectItem value="50k_75k">$50,000 - $75,000</SelectItem>
                          <SelectItem value="75k_100k">$75,000 - $100,000</SelectItem>
                          <SelectItem value="100k_150k">$100,000 - $150,000</SelectItem>
                          <SelectItem value="150k_250k">$150,000 - $250,000</SelectItem>
                          <SelectItem value="over_250k">Over $250,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="spouse_name">Spouse/Partner Name</Label>
                      <Input
                        id="spouse_name"
                        value={formData.spouse_name}
                        onChange={(e) => handleInputChange('spouse_name', e.target.value)}
                        placeholder="Spouse name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spouse_phone">Spouse/Partner Phone</Label>
                      <Input
                        id="spouse_phone"
                        type="tel"
                        value={formData.spouse_phone}
                        onChange={(e) => handleInputChange('spouse_phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-700">Property Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="property_type">Property Type</Label>
                        <Select
                          value={formData.property_type}
                          onValueChange={(value) => handleInputChange('property_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single_family">Single Family</SelectItem>
                            <SelectItem value="condo">Condo</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="mobile_home">Mobile Home</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="property_ownership">Ownership</Label>
                        <Select
                          value={formData.property_ownership}
                          onValueChange={(value) => handleInputChange('property_ownership', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ownership" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="renter">Renter</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="home_built_year">Year Built</Label>
                        <Input
                          id="home_built_year"
                          type="number"
                          value={formData.home_built_year}
                          onChange={(e) => handleInputChange('home_built_year', e.target.value)}
                          placeholder="2000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="square_footage">Square Footage</Label>
                        <Input
                          id="square_footage"
                          type="number"
                          value={formData.square_footage}
                          onChange={(e) => handleInputChange('square_footage', e.target.value)}
                          placeholder="2500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lot_size">Lot Size</Label>
                        <Input
                          id="lot_size"
                          value={formData.lot_size}
                          onChange={(e) => handleInputChange('lot_size', e.target.value)}
                          placeholder="0.25 acres"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => handleInputChange('industry', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="construction">Construction</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_years">Years in Business</Label>
                      <Input
                        id="business_years"
                        type="number"
                        value={formData.business_years}
                        onChange={(e) => handleInputChange('business_years', e.target.value)}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee_count">Number of Employees</Label>
                      <Select
                        value={formData.employee_count}
                        onValueChange={(value) => handleInputChange('employee_count', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1_5">1-5</SelectItem>
                          <SelectItem value="6_25">6-25</SelectItem>
                          <SelectItem value="26_100">26-100</SelectItem>
                          <SelectItem value="101_500">101-500</SelectItem>
                          <SelectItem value="over_500">Over 500</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="annual_revenue_range">Annual Revenue</Label>
                      <Select
                        value={formData.annual_revenue_range}
                        onValueChange={(value) => handleInputChange('annual_revenue_range', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under_100k">Under $100K</SelectItem>
                          <SelectItem value="100k_500k">$100K - $500K</SelectItem>
                          <SelectItem value="500k_1m">$500K - $1M</SelectItem>
                          <SelectItem value="1m_5m">$1M - $5M</SelectItem>
                          <SelectItem value="5m_25m">$5M - $25M</SelectItem>
                          <SelectItem value="over_25m">Over $25M</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="marketing" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referral_source">How did you hear about us? *</Label>
                <Select
                  value={formData.referral_source}
                  onValueChange={(value) => handleInputChange('referral_source', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select referral source" />
                  </SelectTrigger>
                  <SelectContent>
                    {referralSources.map(source => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral_details">Additional Details</Label>
                <Textarea
                  id="referral_details"
                  value={formData.referral_details}
                  onChange={(e) => handleInputChange('referral_details', e.target.value)}
                  placeholder="Please provide more details about how you found us..."
                  rows={3}
                />
              </div>

              {formData.referral_source === 'word_of_mouth' && (
                <div className="space-y-2">
                  <Label htmlFor="referred_by_client_id">Referred By</Label>
                  <Select
                    value={formData.referred_by_client_id}
                    onValueChange={(value) => handleInputChange('referred_by_client_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select existing client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients && clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.contact_person || `${c.first_name} ${c.last_name}`.trim() || c.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            <TabsContent value="additional" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferred_communication">Preferred Communication</Label>
                  <Select
                    value={formData.preferred_communication}
                    onValueChange={(value) => handleInputChange('preferred_communication', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                      <SelectItem value="any">Any Method</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="best_contact_time">Best Time to Contact</Label>
                  <Input
                    id="best_contact_time"
                    value={formData.best_contact_time}
                    onChange={(e) => handleInputChange('best_contact_time', e.target.value)}
                    placeholder="e.g., Weekdays 9am-5pm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Client Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_lead">New Lead</SelectItem>
                    <SelectItem value="attempted_contact">Attempted Contact</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="estimate">Estimate</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="do_not_contact">Do Not Contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-700">Emergency Contact</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                    <Input
                      id="emergency_contact_relationship"
                      value={formData.emergency_contact_relationship}
                      onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                      placeholder="e.g., Spouse, Parent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about the client..."
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isGeneratingPin}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : client ? 'Update Client' : 'Add Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}