import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DeveloperNews, User } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, 
  Calendar,
  User as UserIcon,
  Sparkles, 
  Bug, 
  Wrench, 
  Megaphone,
  Lightbulb,
  Handshake,
  Edit
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

export default function DeveloperNewsDetail() {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    loadNewsItem();
  }, [id]);

  const loadNewsItem = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      // Check if user is a developer
      const isDevUser = user.email.endsWith('@yourpartner.app') || user.role === 'developer';
      setIsDeveloper(isDevUser);

      const newsData = await DeveloperNews.filter({ id: id });
      const item = newsData[0];
      
      if (!item) {
        setNewsItem(null);
        return;
      }

      // Non-developers can only see published items
      if (!isDevUser && !item.published) {
        setNewsItem(null);
        return;
      }

      // Check if expired for non-developers
      if (!isDevUser && item.expires_date && new Date(item.expires_date) < new Date()) {
        setNewsItem(null);
        return;
      }

      setNewsItem(item);

      // Mark as read
      if (!item.read_by?.includes(user.email)) {
        const updatedReadBy = [...(item.read_by || []), user.email];
        await DeveloperNews.update(item.id, { read_by: updatedReadBy });
        setNewsItem(prev => ({ ...prev, read_by: updatedReadBy }));
      }
    } catch (error) {
      console.error('Error loading news item:', error);
      setNewsItem(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
            <div className="h-96 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">News Not Found</h1>
          <p className="text-slate-600 mb-6">The news item you're looking for doesn't exist or is no longer available.</p>
          <Link to={createPageUrl('DeveloperNews')}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[newsItem.category] || Megaphone;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl('DeveloperNews')}>
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Button>
          </Link>
          
          {isDeveloper && (
            <Link to={createPageUrl('DeveloperNews')}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit News
              </Button>
            </Link>
          )}
        </div>

        {/* News Article */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
          {/* Featured Image */}
          {newsItem.image_url ? (
            <img 
              src={newsItem.image_url} 
              alt={newsItem.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          ) : (
            <div className="w-full h-64 md:h-96 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
              <CategoryIcon className="w-24 h-24 text-emerald-600" />
            </div>
          )}

          <CardContent className="p-8">
            {/* Article Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`${categoryColors[newsItem.category]} flex items-center gap-1`}>
                  <CategoryIcon className="w-3 h-3" />
                  {newsItem.category.replace('_', ' ')}
                </Badge>
                {newsItem.featured && (
                  <Badge className="bg-amber-100 text-amber-800">
                    Featured
                  </Badge>
                )}
                {!newsItem.published && isDeveloper && (
                  <Badge className="bg-gray-100 text-gray-800">
                    Draft
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {newsItem.title}
              </h1>
              
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(newsItem.created_date), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Platform Team</span>
                </div>
              </div>
            </div>

            {/* Article Summary */}
            <div className="bg-slate-50 rounded-lg p-6 mb-8">
              <p className="text-lg text-slate-700 leading-relaxed">
                {newsItem.summary}
              </p>
            </div>

            {/* Article Content */}
            <div className="prose prose-slate max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: newsItem.content }}
                className="text-slate-700 leading-relaxed"
              />
            </div>

            {/* Tags */}
            {newsItem.tags && newsItem.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {newsItem.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Have questions or feedback? Contact our support team.
                </p>
                <Link to={createPageUrl('DeveloperNews')}>
                  <Button variant="outline">
                    View More News
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}