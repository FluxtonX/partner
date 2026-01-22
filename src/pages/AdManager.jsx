
import React, { useState, useEffect } from 'react';
import { InternalAdvertisement, AdImpression } from '@/api/entities';
import { stripePayments } from '@/api/functions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Calendar as CalendarIcon,
  BarChart3,
  Eye,
  MousePointer,
  DollarSign,
  TrendingUp,
  Send,
  Copy,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdManagerPage() {
  const [ads, setAds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    external_link: '',
    placement_areas: [],
    target_industries: [],
    target_subscription_types: [],
    campaign_start_date: null,
    campaign_end_date: null,
    budget_total: 0,
    cost_per_impression: 0,
    cost_per_click: 0,
    max_impressions_per_business: 10,
    priority: 1,
    advertiser_name: '',
    advertiser_email: '',
    call_to_action: 'Learn More'
  });

  const [paymentData, setPaymentData] = useState({
    advertiser_email: '',
    advertiser_name: '',
    amount: 0,
    description: '',
    campaign_name: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allAds = await InternalAdvertisement.list('-created_date');
      setAds(allAds);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load advertisements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const adData = {
        ...formData,
        campaign_start_date: formData.campaign_start_date ? formData.campaign_start_date.toISOString() : null,
        campaign_end_date: formData.campaign_end_date ? formData.campaign_end_date.toISOString() : null,
      };

      if (editingAd) {
        await InternalAdvertisement.update(editingAd.id, adData);
        toast.success('Advertisement updated successfully');
      } else {
        await InternalAdvertisement.create(adData);
        toast.success('Advertisement created successfully');
      }

      setShowForm(false);
      setEditingAd(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast.error('Failed to save advertisement');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      external_link: '',
      placement_areas: [],
      target_industries: [],
      target_subscription_types: [],
      campaign_start_date: null,
      campaign_end_date: null,
      budget_total: 0,
      cost_per_impression: 0,
      cost_per_click: 0,
      max_impressions_per_business: 10,
      priority: 1,
      advertiser_name: '',
      advertiser_email: '',
      call_to_action: 'Learn More'
    });
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      ...ad,
      campaign_start_date: ad.campaign_start_date ? new Date(ad.campaign_start_date) : null,
      campaign_end_date: ad.campaign_end_date ? new Date(ad.campaign_end_date) : null,
      placement_areas: ad.placement_areas || [],
      target_industries: ad.target_industries || [],
      target_subscription_types: ad.target_subscription_types || []
    });
    setShowForm(true);
  };

  const handleDelete = async (adId) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        await InternalAdvertisement.delete(adId);
        toast.success('Advertisement deleted successfully');
        loadData();
      } catch (error) {
        console.error('Error deleting advertisement:', error);
        toast.error('Failed to delete advertisement');
      }
    }
  };

  const toggleAdStatus = async (ad) => {
    try {
      const newStatus = ad.status === 'active' ? 'paused' : 'active';
      await InternalAdvertisement.update(ad.id, { status: newStatus });
      toast.success(`Advertisement ${newStatus === 'active' ? 'activated' : 'paused'}`);
      loadData();
    } catch (error) {
      console.error('Error updating ad status:', error);
      toast.error('Failed to update advertisement status');
    }
  };

  const viewAnalytics = async (ad) => {
    setSelectedAd(ad);
    setShowAnalytics(true);
  };

  const handleCreatePaymentLink = async () => {
    if (!paymentData.advertiser_email || !paymentData.amount || !paymentData.campaign_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const amountInCents = Math.round(paymentData.amount * 100);

      const response = await stripePayments({
        action: 'create_payment_intent',
        amount: amountInCents,
        currency: 'usd',
        metadata: {
          campaign_name: paymentData.campaign_name,
          advertiser_name: paymentData.advertiser_name,
          advertiser_email: paymentData.advertiser_email,
          type: 'advertising_campaign',
          description: paymentData.description
        }
      });

      if (response.data?.client_secret) {
        const paymentLink = `${window.location.origin}/payment?payment_intent_client_secret=${response.data.client_secret}&campaign=${encodeURIComponent(paymentData.campaign_name)}&amount=${paymentData.amount}&advertiser_email=${encodeURIComponent(paymentData.advertiser_email)}`;
        
        const newPaymentLink = {
          id: Date.now(),
          ...paymentData,
          payment_link: paymentLink,
          client_secret: response.data.client_secret,
          created_date: new Date().toISOString(),
          status: 'pending'
        };

        setPaymentLinks(prev => [...prev, newPaymentLink]);
        
        await navigator.clipboard.writeText(paymentLink);
        toast.success('Payment link created and copied to clipboard!');
        
        setShowPaymentForm(false);
        setPaymentData({
          advertiser_email: '',
          advertiser_name: '',
          amount: 0,
          description: '',
          campaign_name: ''
        });
      } else {
        toast.error('Failed to get client secret for payment link.');
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast.error('Failed to create payment link');
    }
  };

  const copyPaymentLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Payment link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const sendPaymentLinkEmail = async (paymentInfo) => {
    try {
      const emailBody = `Subject: Payment for Your Advertising Campaign: "${paymentInfo.campaign_name}"

Hi ${paymentInfo.advertiser_name || 'Partner'},

Your advertising campaign "${paymentInfo.campaign_name}" is ready for payment.

Amount Due: $${paymentInfo.amount.toFixed(2)}
Description: ${paymentInfo.description || 'Advertising Campaign Services'}

Please click the link below to complete payment securely:
${paymentInfo.payment_link}

Thank you for your partnership!

Best regards,
The Partner Development Team`;

      await navigator.clipboard.writeText(emailBody);
      toast.success('Email content copied to clipboard! You can now paste it into your email client.');
    } catch (error) {
      console.error('Error preparing email:', error);
      toast.error('Failed to prepare email content');
    }
  };

  const placementOptions = [
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'rolodex', label: 'Rolodex' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'all', label: 'All Areas' }
  ];

  const industryOptions = [
    { value: 'construction', label: 'Construction' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'all', label: 'All Industries' },
    { value: 'other', label: 'Other' }
  ];

  const subscriptionOptions = [
    { value: 'Trial', label: 'Trial' },
    { value: 'Starter', label: 'Starter' },
    { value: 'Partner', label: 'Partner' },
    { value: 'Enterprise', label: 'Enterprise' },
    { value: 'Enterprise Annual', label: 'Enterprise Annual' },
    { value: 'all', label: 'All Subscriptions' }
  ];

  const handleArrayFieldChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter(item => item !== value)
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateCTR = (clicks, impressions) => {
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading advertisements...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Developer - Advertisement Manager</h1>
            <p className="text-slate-600">Manage internal advertising campaigns and collect payments for external advertisers.</p>
          </div>
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="payments">Payment Links</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6 mt-6">
            <div className="flex justify-end">
              <Button onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                New Advertisement
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{ads.length}</p>
                      <p className="text-sm text-slate-600">Total Campaigns</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {ads.filter(ad => ad.status === 'active').length}
                      </p>
                      <p className="text-sm text-slate-600">Active Campaigns</p>
                    </div>
                    <Play className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {ads.reduce((sum, ad) => sum + (ad.total_impressions || 0), 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600">Total Impressions</p>
                    </div>
                    <Eye className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        ${ads.reduce((sum, ad) => sum + (ad.total_revenue || 0), 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-600">Total Revenue</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advertisements Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Advertisements</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Advertiser</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Placement</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ads.map(ad => (
                      <TableRow key={ad.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ad.title}</p>
                            <p className="text-sm text-slate-500 line-clamp-1">{ad.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ad.advertiser_name || 'Partner'}</p>
                            <p className="text-sm text-slate-500">{ad.advertiser_email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ad.status)}>
                            {ad.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(ad.placement_areas || []).slice(0, 2).map(area => (
                              <Badge key={area} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                            {(ad.placement_areas || []).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(ad.placement_areas || []).length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{(ad.total_impressions || 0).toLocaleString()} views</p>
                            <p className="text-sm text-slate-500">
                              {(ad.total_clicks || 0)} clicks • {calculateCTR(ad.total_clicks || 0, ad.total_impressions || 0)}% CTR
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">${(ad.total_revenue || 0).toFixed(2)}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleAdStatus(ad)}
                              className="h-8 w-8"
                            >
                              {ad.status === 'active' ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(ad)}
                              className="h-8 w-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(ad.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {ads.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-500">No advertisements created yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6 mt-6">
            <div className="flex justify-end">
              <Button onClick={() => setShowPaymentForm(true)}>
                <CreditCard className="w-4 h-4 mr-2" />
                Create Payment Link
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Generated Payment Links</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Advertiser</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentLinks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          No payment links created yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {paymentLinks.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.campaign_name}</p>
                            <p className="text-sm text-slate-500">{payment.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.advertiser_name}</p>
                            <p className="text-sm text-slate-500">{payment.advertiser_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">${payment.amount.toFixed(2)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{format(new Date(payment.created_date), 'MMM d, yyyy')}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyPaymentLink(payment.payment_link)}
                              className="h-8 w-8"
                              title="Copy Link"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => sendPaymentLinkEmail(payment)}
                              className="h-8 w-8"
                              title="Prepare Email"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(payment.payment_link, '_blank')}
                              className="h-8 w-8"
                              title="Open Link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Placement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {placementOptions.filter(p => p.value !== 'all').map(placement => {
                      const placementRevenue = ads
                        .filter(ad => ad.placement_areas?.includes(placement.value))
                        .reduce((sum, ad) => sum + (ad.total_revenue || 0), 0);
                      return (
                        <div key={placement.value} className="flex justify-between items-center">
                          <span className="capitalize">{placement.label}</span>
                          <span className="font-medium">${placementRevenue.toFixed(2)}</span>
                        </div>
                      );
                    })}
                     <div className="flex justify-between items-center pt-2 border-t mt-4">
                      <span className="font-semibold">Total Revenue</span>
                      <span className="font-bold">${ads.reduce((sum, ad) => sum + (ad.total_revenue || 0), 0).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Impressions</span>
                      <span className="font-medium">
                         {ads.reduce((sum, ad) => sum + (ad.total_impressions || 0), 0).toLocaleString()}
                      </span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span>Total Clicks</span>
                      <span className="font-medium">
                         {ads.reduce((sum, ad) => sum + (ad.total_clicks || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average CTR</span>
                      <span className="font-medium">
                        {calculateCTR(
                          ads.reduce((sum, ad) => sum + (ad.total_clicks || 0), 0),
                          ads.reduce((sum, ad) => sum + (ad.total_impressions || 0), 0)
                        )}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Advertisers</span>
                      <span className="font-medium">
                        {new Set(ads.map(ad => ad.advertiser_email).filter(Boolean)).size}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Revenue per Campaign</span>
                      <span className="font-medium">
                        ${ads.length > 0 ? (ads.reduce((sum, ad) => sum + (ad.total_revenue || 0), 0) / ads.length).toFixed(2) : '0.00'}
                      </span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span>Active Campaigns</span>
                      <span className="font-medium">
                        {ads.filter(ad => ad.status === 'active').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Advertisement Form */}
        {showForm && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Campaign Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="advertiser_name">Advertiser Name</Label>
                    <Input
                      id="advertiser_name"
                      value={formData.advertiser_name}
                      onChange={(e) => setFormData({...formData, advertiser_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="external_link">External Link</Label>
                    <Input
                      id="external_link"
                      type="url"
                      value={formData.external_link}
                      onChange={(e) => setFormData({...formData, external_link: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="advertiser_email">Advertiser Email</Label>
                    <Input
                      id="advertiser_email"
                      type="email"
                      value={formData.advertiser_email}
                      onChange={(e) => setFormData({...formData, advertiser_email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="call_to_action">Call to Action</Label>
                    <Input
                      id="call_to_action"
                      value={formData.call_to_action}
                      onChange={(e) => setFormData({...formData, call_to_action: e.target.value})}
                    />
                  </div>
                </div>

                {/* Placement Areas */}
                <div className="space-y-2">
                  <Label>Placement Areas</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {placementOptions.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`placement-${option.value}`}
                          checked={(formData.placement_areas || []).includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleArrayFieldChange('placement_areas', option.value, checked)
                          }
                        />
                        <Label htmlFor={`placement-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Industries */}
                <div className="space-y-2">
                  <Label>Target Industries</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {industryOptions.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`industry-${option.value}`}
                          checked={(formData.target_industries || []).includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleArrayFieldChange('target_industries', option.value, checked)
                          }
                        />
                        <Label htmlFor={`industry-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Subscription Types */}
                <div className="space-y-2">
                  <Label>Target Subscription Types</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {subscriptionOptions.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subscription-${option.value}`}
                          checked={(formData.target_subscription_types || []).includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleArrayFieldChange('target_subscription_types', option.value, checked)
                          }
                        />
                        <Label htmlFor={`subscription-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campaign Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Campaign Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.campaign_start_date ? format(formData.campaign_start_date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.campaign_start_date}
                          onSelect={(date) => setFormData({...formData, campaign_start_date: date})}
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
                          {formData.campaign_end_date ? format(formData.campaign_end_date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.campaign_end_date}
                          onSelect={(date) => setFormData({...formData, campaign_end_date: date})}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Budget and Pricing */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget_total">Total Budget</Label>
                    <Input
                      id="budget_total"
                      type="number"
                      step="0.01"
                      value={formData.budget_total}
                      onChange={(e) => setFormData({...formData, budget_total: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost_per_impression">Cost per Impression</Label>
                    <Input
                      id="cost_per_impression"
                      type="number"
                      step="0.01"
                      value={formData.cost_per_impression}
                      onChange={(e) => setFormData({...formData, cost_per_impression: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost_per_click">Cost per Click</Label>
                    <Input
                      id="cost_per_click"
                      type="number"
                      step="0.01"
                      value={formData.cost_per_click}
                      onChange={(e) => setFormData({...formData, cost_per_click: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_impressions_per_business">Max Impressions per Business</Label>
                  <Input
                    id="max_impressions_per_business"
                    type="number"
                    value={formData.max_impressions_per_business}
                    onChange={(e) => setFormData({...formData, max_impressions_per_business: parseInt(e.target.value) || 10})}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAd ? 'Update Advertisement' : 'Create Advertisement'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Payment Form Dialog */}
        {showPaymentForm && (
          <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Payment Link</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign_name">Campaign Name *</Label>
                    <Input
                      id="campaign_name"
                      value={paymentData.campaign_name}
                      onChange={(e) => setPaymentData({...paymentData, campaign_name: e.target.value})}
                      placeholder="e.g., Q1 2024 Marketing Campaign"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="advertiser_name">Advertiser Name</Label>
                    <Input
                      id="advertiser_name"
                      value={paymentData.advertiser_name}
                      onChange={(e) => setPaymentData({...paymentData, advertiser_name: e.target.value})}
                      placeholder="Company or person name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="advertiser_email">Advertiser Email *</Label>
                    <Input
                      id="advertiser_email"
                      type="email"
                      value={paymentData.advertiser_email}
                      onChange={(e) => setPaymentData({...paymentData, advertiser_email: e.target.value})}
                      placeholder="advertiser@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={paymentData.description}
                    onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                    placeholder="Brief description of the campaign services"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowPaymentForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePaymentLink}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Create Payment Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
