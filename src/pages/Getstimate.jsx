
import React, { useState, useEffect } from 'react';
import { getPublicBidRequests } from '@/api/functions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Clock, 
  MapPin, 
  FileText,
  Send,
  Eye,
  Briefcase
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

export default function GetstimatePage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check if we're on the isolated getstimate.com domain
  const isGetstimateDomain = typeof window !== 'undefined' && 
    (window.location.hostname === 'getstimate.com' || 
     window.location.hostname === 'www.getstimate.com');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await getPublicBidRequests();
        setRequests(data || []);
      } catch (error) {
        console.error("Failed to fetch bid requests:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleBidClick = () => {
    if (isGetstimateDomain) {
      // If on getstimate.com, redirect to the main app login
      window.location.href = 'https://partner.getstimate.com/';
    } else {
      // If already in the app, show login modal
      setShowLoginModal(true);
    }
  };
  
  const handleLogin = () => {
    // Redirect to main app for login
    window.location.href = 'https://partner.getstimate.com/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading Available Projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0168145bd_PartnerLogo.png" alt="Getstimate Logo" className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-slate-900">Getstimate Marketplace</h1>
            </div>
            <Button onClick={handleBidClick}>
              {isGetstimateDomain ? 'Become a Partner' : 'Contractor Login'}
            </Button>
        </div>
      </header>
      <main className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Find Your Next Project</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {isGetstimateDomain 
                ? 'Browse live project requests from clients in your area. Become a Partner to start bidding today.'
                : 'Browse live project requests from clients in your area. Log in to become a Partner and start bidding today.'
              }
            </p>
        </div>

        {requests.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex"
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all w-full flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 capitalize">
                        {categoryLabels[request.project_category] || request.project_category}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {budgetLabels[request.budget_range] || request.budget_range.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{request.project_title}</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-grow flex flex-col">
                    <p className="text-slate-600 text-sm line-clamp-3 flex-grow">{request.project_description}</p>
                    <div className="space-y-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span>{request.project_city}, {request.project_state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>Timeline: {timelineLabels[request.timeline] || request.timeline}</span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-6 pt-4 mt-auto">
                    <Button onClick={handleBidClick} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Send className="w-4 h-4 mr-2" />
                      Bid on Project
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-20">
              <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600 mb-2">No Open Projects</h3>
              <p className="text-slate-500">There are no available bid requests at the moment. Please check back soon!</p>
            </CardContent>
          </Card>
        )}

        {!isGetstimateDomain && (
          <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Become a Partner to Bid</DialogTitle>
                <DialogDescription>
                  To submit a bid, manage projects, and connect with clients, you need to be a Partner. Please log in or create an account to continue.
                </DialogDescription>
              </DialogHeader>
              <div className="pt-4 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowLoginModal(false)}>Cancel</Button>
                <Button onClick={handleLogin} className="bg-emerald-600 hover:bg-emerald-700">
                  Log In or Sign Up
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
