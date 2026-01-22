import React, { useState, useEffect } from 'react';
import { EstimateRequest, EstimateBid, BusinessProfile, User, BusinessSettings } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  DollarSign, 
  Clock, 
  MapPin, 
  Send, 
  Eye,
  FileText,
  User as UserIcon,
  Phone,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';

const categoryLabels = {
  cabinetry: 'Cabinetry',
  carpentry: 'Carpentry', 
  cleaning: 'Cleaning',
  concrete: 'Concrete Work',
  countertop: 'Countertops',
  decking: 'Decking',
  demolition: 'Demolition',
  drywall: 'Drywall',
  electrical: 'Electrical',
  excavation: 'Excavation',
  fencing: 'Fencing',
  flooring: 'Flooring',
  foundation: 'Foundation',
  framing: 'Framing',
  gutters: 'Gutters',
  handyman: 'Handyman Services',
  hvac: 'HVAC',
  insulation: 'Insulation',
  landscaping: 'Landscaping',
  lighting_installation: 'Lighting Installation',
  masonry: 'Masonry',
  painting: 'Painting', 
  paving: 'Paving',
  plans_permits: 'Plans & Permits',
  plumbing: 'Plumbing',
  roofing: 'Roofing',
  siding: 'Siding',
  tile: 'Tile Work',
  trim_molding: 'Trim & Molding',
  ventilation: 'Ventilation',
  waterproofing: 'Waterproofing',
  windows_doors: 'Windows & Doors'
};

const budgetLabels = {
  under_1k: 'Under $1,000',
  '1k_5k': '$1,000 - $5,000',
  '5k_15k': '$5,000 - $15,000',
  '15k_50k': '$15,000 - $50,000',
  '50k_100k': '$50,000 - $100,000',
  over_100k: 'Over $100,000'
};

const timelineLabels = {
  asap: 'ASAP',
  within_month: 'Within a month',
  within_3_months: 'Within 3 months',
  flexible: 'Flexible'
};

export default function BidRequestsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBidForm, setShowBidForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bidForm, setBidForm] = useState({
    estimated_cost: '',
    estimated_hours: '',
    estimated_start_date: null,
    estimated_completion_date: null,
    bid_description: '',
    warranty_offered: '',
    payment_terms: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Load business settings to get service categories
      const settings = await BusinessSettings.filter({ business_id: user.current_business_id });
      if (settings.length > 0) {
        setBusinessSettings(settings[0]);
      }

      // Load or create business profile
      let profiles = await BusinessProfile.filter({ business_id: user.current_business_id });
      if (profiles.length === 0) {
        // Create default profile
        const newProfile = await BusinessProfile.create({
          business_id: user.current_business_id,
          business_name: user.display_name || user.full_name || 'Business',
          business_description: 'Professional contractor services',
          service_categories: ['handyman'], // Default category
          is_active: true
        });
        profiles = [newProfile];
      }
      setBusinessProfile(profiles[0]);

      // Load available estimate requests based on service categories
      const serviceCategories = profiles[0].service_categories || ['handyman'];
      const requests = await EstimateRequest.filter({
        project_category: { $in: serviceCategories },
        status: { $in: ['open', 'receiving_bids'] }
      }, '-created_date');
      setAvailableRequests(requests);

      // Load existing bids from this business
      const existingBids = await EstimateBid.filter({ 
        business_id: user.current_business_id 
      }, '-created_date');
      setMyBids(existingBids);

    } catch (error) {
      console.error('Error loading bid requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitBid = async () => {
    if (!selectedRequest || !bidForm.estimated_cost || !bidForm.bid_description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await EstimateBid.create({
        estimate_request_id: selectedRequest.id,
        business_id: currentUser.current_business_id,
        business_name: businessProfile.business_name,
        contact_person: currentUser.display_name || currentUser.full_name,
        contact_email: currentUser.email,
        contact_phone: businessProfile.phone || '',
        estimated_cost: parseFloat(bidForm.estimated_cost),
        estimated_hours: parseFloat(bidForm.estimated_hours) || 0,
        estimated_start_date: bidForm.estimated_start_date ? format(bidForm.estimated_start_date, 'yyyy-MM-dd') : null,
        estimated_completion_date: bidForm.estimated_completion_date ? format(bidForm.estimated_completion_date, 'yyyy-MM-dd') : null,
        bid_description: bidForm.bid_description,
        warranty_offered: bidForm.warranty_offered,
        payment_terms: bidForm.payment_terms || 'Standard terms',
        expires_date: addDays(new Date(), 30).toISOString()
      });

      // Reset form and close dialog
      setBidForm({
        estimated_cost: '',
        estimated_hours: '',
        estimated_start_date: null,
        estimated_completion_date: null,
        bid_description: '',
        warranty_offered: '',
        payment_terms: ''
      });
      setShowBidForm(false);
      setSelectedRequest(null);
      
      // Reload data
      loadData();
      
      alert('Your bid has been submitted successfully!');
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('Error submitting bid. Please try again.');
    }
  };

  const openBidForm = (request) => {
    setSelectedRequest(request);
    setShowBidForm(true);
  };

  const hasAlreadyBid = (requestId) => {
    return myBids.some(bid => bid.estimate_request_id === requestId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading bid requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Bid Requests</h1>
            <p className="text-slate-600">Available projects in your service areas</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              {availableRequests.length} Available Requests
            </Badge>
            <Badge variant="outline">
              {myBids.length} Submitted Bids
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{availableRequests.length}</p>
                  <p className="text-sm text-slate-600 font-medium">Available Requests</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{myBids.length}</p>
                  <p className="text-sm text-slate-600 font-medium">Submitted Bids</p>
                </div>
                <Send className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {myBids.filter(b => b.status === 'selected').length}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Won Bids</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    ${myBids.reduce((sum, bid) => sum + (bid.estimated_cost || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Total Bid Value</p>
                </div>
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Requests */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Available Project Requests</h2>
          
          {availableRequests.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-3">
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          {categoryLabels[request.project_category]}
                        </Badge>
                        <Badge variant="outline">
                          {budgetLabels[request.budget_range]}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-lg mb-2">
                        {request.project_title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-slate-600 text-sm line-clamp-3">
                        {request.project_description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>{request.project_city}, {request.project_state}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>Timeline: {timelineLabels[request.timeline]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <UserIcon className="w-4 h-4" />
                          <span>{request.client_name}</span>
                        </div>
                      </div>

                      {request.attachments && request.attachments.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">
                            {request.attachments.length} attachment(s)
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {request.attachments.slice(0, 2).map((attachment, index) => (
                              <div key={index}>
                                {attachment.type === 'image' ? (
                                  <img
                                    src={attachment.url}
                                    alt="Project"
                                    className="w-full h-20 object-cover rounded"
                                  />
                                ) : (
                                  <div className="h-20 bg-slate-100 rounded flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-slate-400" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        {hasAlreadyBid(request.id) ? (
                          <Button disabled className="w-full">
                            <Send className="w-4 h-4 mr-2" />
                            Bid Submitted
                          </Button>
                        ) : (
                          <Button
                            onClick={() => openBidForm(request)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit Bid
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <Eye className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-500 mb-2">No bid requests available</h3>
                <p className="text-slate-400">Check back later for new project opportunities</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bid Form Modal */}
        {showBidForm && selectedRequest && (
          <Dialog open={showBidForm} onOpenChange={setShowBidForm}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Bid for: {selectedRequest.project_title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Project Summary */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">Project Details</h3>
                  <p className="text-sm text-slate-600 mb-2">{selectedRequest.project_description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{budgetLabels[selectedRequest.budget_range]}</Badge>
                    <Badge variant="outline">{timelineLabels[selectedRequest.timeline]}</Badge>
                    <Badge variant="outline">{selectedRequest.project_city}, {selectedRequest.project_state}</Badge>
                  </div>
                </div>

                {/* Bid Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimated_cost">Estimated Cost * ($)</Label>
                    <Input
                      id="estimated_cost"
                      type="number"
                      value={bidForm.estimated_cost}
                      onChange={(e) => setBidForm(prev => ({ ...prev, estimated_cost: e.target.value }))}
                      placeholder="Enter your bid amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimated_hours">Estimated Hours</Label>
                    <Input
                      id="estimated_hours"
                      type="number"
                      value={bidForm.estimated_hours}
                      onChange={(e) => setBidForm(prev => ({ ...prev, estimated_hours: e.target.value }))}
                      placeholder="Total hours needed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Estimated Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bidForm.estimated_start_date 
                            ? format(bidForm.estimated_start_date, 'PPP')
                            : 'Select start date'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={bidForm.estimated_start_date}
                          onSelect={(date) => setBidForm(prev => ({ ...prev, estimated_start_date: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Estimated Completion Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bidForm.estimated_completion_date 
                            ? format(bidForm.estimated_completion_date, 'PPP')
                            : 'Select completion date'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={bidForm.estimated_completion_date}
                          onSelect={(date) => setBidForm(prev => ({ ...prev, estimated_completion_date: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bid_description">Bid Description *</Label>
                  <Textarea
                    id="bid_description"
                    value={bidForm.bid_description}
                    onChange={(e) => setBidForm(prev => ({ ...prev, bid_description: e.target.value }))}
                    placeholder="Describe what's included in your bid, your approach, materials, etc."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="warranty_offered">Warranty Offered</Label>
                    <Input
                      id="warranty_offered"
                      value={bidForm.warranty_offered}
                      onChange={(e) => setBidForm(prev => ({ ...prev, warranty_offered: e.target.value }))}
                      placeholder="e.g., 1 year warranty"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment_terms">Payment Terms</Label>
                    <Input
                      id="payment_terms"
                      value={bidForm.payment_terms}
                      onChange={(e) => setBidForm(prev => ({ ...prev, payment_terms: e.target.value }))}
                      placeholder="e.g., 50% upfront, 50% on completion"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBidForm(false);
                      setSelectedRequest(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitBid}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Bid
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}