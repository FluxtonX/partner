import React, { useState, useEffect } from 'react';
import { DeveloperNews, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Newspaper, 
  ArrowRight, 
  Sparkles, 
  Bug, 
  Wrench, 
  Megaphone,
  Lightbulb,
  Handshake,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

const categoryIcons = {
  feature_update: Sparkles,
  bug_fix: Bug,
  maintenance: Wrench,
  announcement: Megaphone,
  tips: Lightbulb,
  partnership: Handshake
};

const categoryColors = {
  feature_update: 'bg-blue-100 text-blue-800',
  bug_fix: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  announcement: 'bg-purple-100 text-purple-800',
  tips: 'bg-green-100 text-green-800',
  partnership: 'bg-indigo-100 text-indigo-800'
};

export default function NewsFeedWidget() {
  const [news, setNews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Get published news, prioritizing featured and recent items
      const newsData = await DeveloperNews.filter(
        { published: true },
        '-created_date',
        5
      );
      
      // Filter out expired news
      const now = new Date();
      const activeNews = newsData.filter(item => {
        if (!item.expires_date) return true;
        return new Date(item.expires_date) > now;
      });

      setNews(activeNews);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (newsId) => {
    if (!currentUser) return;
    
    try {
      const newsItem = news.find(n => n.id === newsId);
      if (!newsItem || newsItem.read_by?.includes(currentUser.email)) return;

      const updatedReadBy = [...(newsItem.read_by || []), currentUser.email];
      await DeveloperNews.update(newsId, { read_by: updatedReadBy });
      
      // Update local state
      setNews(prev => prev.map(item => 
        item.id === newsId 
          ? { ...item, read_by: updatedReadBy }
          : item
      ));
    } catch (error) {
      console.error('Error marking news as read:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Platform Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (news.length === 0) {
    return null; // Don't show widget if no news
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Newspaper className="w-5 h-5 text-emerald-600" />
            Platform Updates
          </CardTitle>
          <Link to={createPageUrl('DeveloperNews')}>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {news.slice(0, 3).map((item) => {
          const CategoryIcon = categoryIcons[item.category] || Megaphone;
          const isUnread = currentUser && !item.read_by?.includes(currentUser.email);
          
          return (
            <Link
              key={item.id}
              to={createPageUrl(`DeveloperNews/${item.id}`)}
              onClick={() => markAsRead(item.id)}
              className="block group"
            >
              <div className={`flex gap-3 p-3 rounded-lg transition-colors ${
                isUnread ? 'bg-emerald-50/50 border border-emerald-100' : 'hover:bg-slate-50'
              }`}>
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CategoryIcon className="w-8 h-8 text-emerald-600" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`font-semibold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors ${
                      isUnread ? 'text-emerald-800' : ''
                    }`}>
                      {item.title}
                    </h4>
                    {isUnread && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                    {item.summary}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${categoryColors[item.category]}`}>
                      {item.category.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {format(new Date(item.created_date), 'MMM d')}
                    </span>
                    {item.featured && (
                      <Badge className="text-xs bg-amber-100 text-amber-800">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        
        {news.length > 3 && (
          <Link to={createPageUrl('DeveloperNews')}>
            <Button variant="outline" className="w-full mt-4">
              View All Updates
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}