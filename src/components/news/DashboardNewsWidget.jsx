import React, { useState, useEffect } from 'react';
import { DeveloperNews, NewsView, User, BusinessSettings } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Star, X, Sparkles, Bug, Wrench, Megaphone, Lightbulb, Handshake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const categoryIcons = {
  feature_update: Sparkles,
  bug_fix: Bug,
  maintenance: Wrench,
  announcement: Megaphone,
  tips: Lightbulb,
  partnership: Handshake,
  vendor_spotlight: Star,
  product_showcase: Star
};

const categoryColors = {
  feature_update: 'bg-blue-100 text-blue-800 border-blue-200',
  bug_fix: 'bg-red-100 text-red-800 border-red-200',
  maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  announcement: 'bg-purple-100 text-purple-800 border-purple-200',
  tips: 'bg-green-100 text-green-800 border-green-200',
  partnership: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  vendor_spotlight: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  product_showcase: 'bg-amber-100 text-amber-800 border-amber-200'
};

export default function DashboardNewsWidget() {
  const [news, setNews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [dismissedNews, setDismissedNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNewsAndUserData();
    loadDismissedNews();
  }, []);

  const loadDismissedNews = () => {
    const dismissed = JSON.parse(localStorage.getItem('dismissedNews') || '[]');
    setDismissedNews(dismissed);
  };

  const loadNewsAndUserData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (user.current_business_id) {
        const settings = await BusinessSettings.filter({ business_id: user.current_business_id });
        const businessSetting = settings.length > 0 ? settings[0] : null;
        setBusinessSettings(businessSetting);

        if (businessSetting) {
          await loadRelevantNews(businessSetting, user);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelevantNews = async (business, user) => {
    try {
      const now = new Date();
      
      // Get all published and active news
      const allNews = await DeveloperNews.filter({
        published: true
      }, '-created_date');

      // Filter news based on targeting criteria and active campaigns
      const relevantNews = allNews.filter(newsItem => {
        // Check if campaign is currently active (for sponsored content)
        if (newsItem.sponsored && newsItem.campaign_start_date && newsItem.campaign_end_date) {
          const startDate = new Date(newsItem.campaign_start_date);
          const endDate = new Date(newsItem.campaign_end_date);
          
          if (now < startDate || now > endDate) {
            return false;
          }
        }

        // Check if news has expired
        if (newsItem.expires_date && now > new Date(newsItem.expires_date)) {
          return false;
        }

        // Check business category targeting
        if (business.industry && newsItem.target_business_categories?.length > 0) {
          if (!newsItem.target_business_categories.includes(business.industry) && 
              !newsItem.target_business_categories.includes('all')) {
            return false;
          }
        }

        // Check subscription type targeting
        if (business.subscription_type && newsItem.target_subscription_types?.length > 0) {
          if (!newsItem.target_subscription_types.includes(business.subscription_type) && 
              !newsItem.target_subscription_types.includes('all')) {
            return false;
          }
        }

        return true;
      });

      // Check view limits for sponsored content
      const filteredNews = [];
      for (const newsItem of relevantNews) {
        if (newsItem.sponsored && newsItem.max_views_per_business) {
          const existingViews = await NewsView.filter({
            news_id: newsItem.id,
            business_id: user.current_business_id
          });

          if (existingViews.length < newsItem.max_views_per_business) {
            filteredNews.push(newsItem);
          }
        } else {
          filteredNews.push(newsItem);
        }
      }

      // Sort by priority and sponsorship (sponsored first, then by priority)
      const sortedNews = filteredNews.sort((a, b) => {
        if (a.sponsored && !b.sponsored) return -1;
        if (!a.sponsored && b.sponsored) return 1;
        return (b.priority_level || 0) - (a.priority_level || 0);
      });

      // Take top 3 items and record views
      const topNews = sortedNews.slice(0, 3);
      setNews(topNews);

      // Record views for analytics
      for (const newsItem of topNews) {
        await recordView(newsItem, user);
      }

    } catch (error) {
      console.error('Error loading news:', error);
    }
  };

  const recordView = async (newsItem, user) => {
    try {
      const view = await NewsView.create({
        news_id: newsItem.id,
        business_id: user.current_business_id,
        user_email: user.email,
        view_timestamp: new Date().toISOString(),
        revenue_generated: newsItem.cost_per_view || 0
      });

      // Update news statistics
      if (newsItem.sponsored) {
        await DeveloperNews.update(newsItem.id, {
          total_views: (newsItem.total_views || 0) + 1,
          total_revenue: (newsItem.total_revenue || 0) + (newsItem.cost_per_view || 0)
        });
      }

    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const handleNewsClick = async (newsItem) => {
    try {
      // Record click if this is sponsored content
      if (newsItem.sponsored && currentUser) {
        const existingViews = await NewsView.filter({
          news_id: newsItem.id,
          business_id: currentUser.current_business_id,
          user_email: currentUser.email,
          clicked: false
        });

        if (existingViews.length > 0) {
          const latestView = existingViews[existingViews.length - 1];
          await NewsView.update(latestView.id, {
            clicked: true,
            click_timestamp: new Date().toISOString(),
            revenue_generated: (latestView.revenue_generated || 0) + (newsItem.cost_per_click || 0)
          });

          // Update news statistics
          await DeveloperNews.update(newsItem.id, {
            total_clicks: (newsItem.total_clicks || 0) + 1,
            total_revenue: (newsItem.total_revenue || 0) + (newsItem.cost_per_click || 0)
          });
        }
      }

      // Open external link or navigate to news detail
      const targetUrl = newsItem.call_to_action_url || newsItem.sponsor_website;
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error recording click:', error);
      // Still open the link even if tracking fails
      const targetUrl = newsItem.call_to_action_url || newsItem.sponsor_website;
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleDismiss = (newsId) => {
    const newDismissed = [...dismissedNews, newsId];
    setDismissedNews(newDismissed);
    localStorage.setItem('dismissedNews', JSON.stringify(newDismissed));
    setNews(prev => prev.filter(n => n.id !== newsId));
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visibleNews = news.filter(n => !dismissedNews.includes(n.id));

  if (visibleNews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {visibleNews.map((newsItem, index) => {
          const CategoryIcon = categoryIcons[newsItem.category] || Megaphone;
          
          return (
            <motion.div
              key={newsItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                newsItem.sponsored 
                  ? 'bg-gradient-to-r from-emerald-50 to-blue-50 border-l-4 border-l-emerald-500' 
                  : 'bg-white/80 backdrop-blur-sm'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        newsItem.sponsored ? 'bg-emerald-100' : 'bg-slate-100'
                      }`}>
                        <CategoryIcon className={`w-5 h-5 ${
                          newsItem.sponsored ? 'text-emerald-600' : 'text-slate-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                            {newsItem.title}
                          </CardTitle>
                          {newsItem.sponsored && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                              Sponsored
                            </Badge>
                          )}
                          {newsItem.featured && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                          {newsItem.summary}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <Badge className={categoryColors[newsItem.category]}>
                            {newsItem.category.replace('_', ' ')}
                          </Badge>
                          <span>{format(new Date(newsItem.created_date), 'MMM d')}</span>
                          {newsItem.sponsor_name && (
                            <span>by {newsItem.sponsor_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleNewsClick(newsItem)}
                        size="sm"
                        className={newsItem.sponsored 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                          : "bg-slate-600 hover:bg-slate-700 text-white"
                        }
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {newsItem.call_to_action || 'Learn More'}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(newsItem.id);
                        }}
                        className="h-8 w-8 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}