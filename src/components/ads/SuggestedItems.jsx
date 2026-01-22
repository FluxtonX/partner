import React, { useState, useEffect } from 'react';
import { InternalAdvertisement, AdImpression, User, BusinessSettings } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Star, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SuggestedItems({ placement, maxItems = 3, className = "" }) {
  const [ads, setAds] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserAndAds();
  }, [placement]);

  const loadUserAndAds = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (user.current_business_id) {
        const settings = await BusinessSettings.filter({ business_id: user.current_business_id });
        const businessSetting = settings.length > 0 ? settings[0] : null;
        setBusinessSettings(businessSetting);

        if (businessSetting) {
          await loadRelevantAds(businessSetting, user);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelevantAds = async (business, user) => {
    try {
      const now = new Date().toISOString();
      
      // Get all active ads
      const activeAds = await InternalAdvertisement.filter({
        status: 'active'
      });

      // Filter ads based on targeting criteria
      const relevantAds = activeAds.filter(ad => {
        // Check if campaign is currently active
        const startDate = new Date(ad.campaign_start_date);
        const endDate = new Date(ad.campaign_end_date);
        const currentDate = new Date();
        
        if (currentDate < startDate || currentDate > endDate) {
          return false;
        }

        // Check placement area
        if (!ad.placement_areas.includes(placement) && !ad.placement_areas.includes('all')) {
          return false;
        }

        // Check industry targeting
        if (business.industry && ad.target_industries.length > 0) {
          if (!ad.target_industries.includes(business.industry) && !ad.target_industries.includes('all')) {
            return false;
          }
        }

        // Check subscription type targeting
        if (business.subscription_type && ad.target_subscription_types.length > 0) {
          if (!ad.target_subscription_types.includes(business.subscription_type) && !ad.target_subscription_types.includes('all')) {
            return false;
          }
        }

        return true;
      });

      // Check impression limits
      const filteredAds = [];
      for (const ad of relevantAds) {
        const existingImpressions = await AdImpression.filter({
          advertisement_id: ad.id,
          business_id: user.current_business_id
        });

        if (existingImpressions.length < ad.max_impressions_per_business) {
          filteredAds.push(ad);
        }
      }

      // Sort by priority and take only the requested number
      const sortedAds = filteredAds
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .slice(0, maxItems);

      setAds(sortedAds);

      // Record impressions
      for (const ad of sortedAds) {
        await recordImpression(ad);
      }

    } catch (error) {
      console.error('Error loading ads:', error);
    }
  };

  const recordImpression = async (ad) => {
    try {
      const impression = await AdImpression.create({
        advertisement_id: ad.id,
        business_id: currentUser.current_business_id,
        user_email: currentUser.email,
        placement_area: placement,
        user_agent: navigator.userAgent,
        revenue_generated: ad.cost_per_impression || 0
      });

      // Update ad statistics
      await InternalAdvertisement.update(ad.id, {
        total_impressions: (ad.total_impressions || 0) + 1,
        total_revenue: (ad.total_revenue || 0) + (ad.cost_per_impression || 0)
      });

    } catch (error) {
      console.error('Error recording impression:', error);
    }
  };

  const handleAdClick = async (ad) => {
    try {
      // Record the click
      const impressions = await AdImpression.filter({
        advertisement_id: ad.id,
        business_id: currentUser.current_business_id,
        user_email: currentUser.email,
        clicked: false
      });

      if (impressions.length > 0) {
        const latestImpression = impressions[impressions.length - 1];
        await AdImpression.update(latestImpression.id, {
          clicked: true,
          click_timestamp: new Date().toISOString(),
          revenue_generated: (latestImpression.revenue_generated || 0) + (ad.cost_per_click || 0)
        });

        // Update ad statistics
        await InternalAdvertisement.update(ad.id, {
          total_clicks: (ad.total_clicks || 0) + 1,
          total_revenue: (ad.total_revenue || 0) + (ad.cost_per_click || 0)
        });
      }

      // Open external link
      window.open(ad.external_link, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error recording click:', error);
      // Still open the link even if tracking fails
      window.open(ad.external_link, '_blank', 'noopener,noreferrer');
    }
  };

  const getPlacementTitle = () => {
    switch (placement) {
      case 'marketplace': return 'Suggested Products';
      case 'rolodex': return 'Suggested Services';
      case 'marketing': return 'Suggested Tools';
      case 'dashboard': return 'Suggested for You';
      default: return 'Suggestions';
    }
  };

  if (isLoading || ads.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-slate-900">{getPlacementTitle()}</h3>
        <Badge variant="outline" className="text-xs">Sponsored</Badge>
      </div>

      <AnimatePresence>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad, index) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-3">
                  {ad.image_url && (
                    <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
                      <img 
                        src={ad.image_url} 
                        alt={ad.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2">
                    {ad.title}
                  </CardTitle>
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {ad.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-slate-600">
                        {ad.advertiser_name || 'Partner'}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleAdClick(ad)}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      {ad.call_to_action || 'Learn More'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}