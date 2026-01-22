
import React, { useState, useEffect } from 'react';
import { DeveloperNews, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Newspaper,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Sparkles,
  Bug,
  Wrench,
  Megaphone,
  Lightbulb,
  Handshake,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

import NewsEditor from '../components/news/NewsEditor';
import SponsoredNewsForm from '../components/news/SponsoredNewsForm'; // Assuming this component exists

const categoryIcons = {
  feature_update: Sparkles,
  bug_fix: Bug,
  maintenance: Wrench,
  announcement: Megaphone,
  tips: Lightbulb,
  partnership: Handshake,
  vendor_spotlight: DollarSign, // New category icon
  product_showcase: Sparkles // New category icon, using an existing one for now
};

const categoryColors = {
  feature_update: 'bg-blue-100 text-blue-800',
  bug_fix: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  announcement: 'bg-purple-100 text-purple-800',
  tips: 'bg-green-100 text-green-800',
  partnership: 'bg-indigo-100 text-indigo-800',
  vendor_spotlight: 'bg-amber-100 text-amber-800', // New category color
  product_showcase: 'bg-lime-100 text-lime-800' // New category color
};

export default function DeveloperNewsPage() {
  const [news, setNews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [showSponsoredForm, setShowSponsoredForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      // Remove all user access restrictions by setting isDeveloper to true unconditionally
      setIsDeveloper(true);

      // Load all news items, as restrictions are removed
      const newsData = await DeveloperNews.list('-created_date');
      setNews(newsData);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (newsItem) => {
    // Determine which form to open based on news type
    if (newsItem.sponsored) {
      setEditingNews(newsItem);
      setShowSponsoredForm(true);
    } else {
      setEditingNews(newsItem);
      setShowEditor(true);
    }
  };

  const handleDelete = async (newsId) => {
    if (!window.confirm('Are you sure you want to delete this news item?')) return;

    try {
      await DeveloperNews.delete(newsId);
      loadData();
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  const handleSave = async (newsData) => {
    try {
      if (editingNews) {
        await DeveloperNews.update(editingNews.id, newsData);
      } else {
        await DeveloperNews.create(newsData);
      }
      setShowEditor(false);
      setShowSponsoredForm(false);
      setEditingNews(null);
      loadData();
    } catch (error) {
      console.error('Error saving news:', error);
    }
  };

  const markAsRead = async (newsId) => {
    if (!currentUser) return;

    try {
      const newsItem = news.find(n => n.id === newsId);
      if (!newsItem || newsItem.read_by?.includes(currentUser.email)) return;

      const updatedReadBy = [...(newsItem.read_by || []), currentUser.email];
      await DeveloperNews.update(newsId, { read_by: updatedReadBy });

      setNews(prev => prev.map(item =>
        item.id === newsId
          ? { ...item, read_by: updatedReadBy }
          : item
      ));
    } catch (error) {
      console.error('Error marking news as read:', error);
    }
  };

  const handleCreateSponsored = () => {
    setEditingNews(null);
    setShowSponsoredForm(true);
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const publishedNews = filteredNews.filter(item => item.published && !item.sponsored);
  const draftNews = filteredNews.filter(item => !item.published && !item.sponsored);
  const sponsoredNews = filteredNews.filter(item => item.sponsored);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-slate-700" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Platform Updates</h1>
              <p className="text-slate-600">Stay informed about new features and improvements</p>
            </div>
          </div>

          {isDeveloper && (
            <div className="flex gap-3">
              <Button
                onClick={handleCreateSponsored}
                variant="outline"
                className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Create Sponsored News
              </Button>
              <Button
                onClick={() => { setEditingNews(null); setShowEditor(true); }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create News
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="feature_update">Feature Updates</SelectItem>
              <SelectItem value="bug_fix">Bug Fixes</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="announcement">Announcements</SelectItem>
              <SelectItem value="tips">Tips</SelectItem>
              <SelectItem value="partnership">Partnerships</SelectItem>
              <SelectItem value="vendor_spotlight">Vendor Spotlight</SelectItem>
              <SelectItem value="product_showcase">Product Showcase</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* News Content */}
        {isDeveloper ? (
          <Tabs defaultValue="published" className="space-y-6">
            <TabsList>
              <TabsTrigger value="published">
                Published ({publishedNews.length})
              </TabsTrigger>
              <TabsTrigger value="drafts">
                Drafts ({draftNews.length})
              </TabsTrigger>
              <TabsTrigger value="sponsored">
                Sponsored ({sponsoredNews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="published">
              <NewsGrid
                news={publishedNews}
                currentUser={currentUser}
                isDeveloper={isDeveloper}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkRead={markAsRead}
              />
            </TabsContent>

            <TabsContent value="drafts">
              <NewsGrid
                news={draftNews}
                currentUser={currentUser}
                isDeveloper={isDeveloper}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkRead={markAsRead}
              />
            </TabsContent>

            <TabsContent value="sponsored">
              <SponsoredNewsGrid
                news={sponsoredNews}
                currentUser={currentUser}
                isDeveloper={isDeveloper}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkRead={markAsRead}
              />
            </TabsContent>
          </Tabs>
        ) : (
          // When all restrictions are removed, even non-developers will see all news.
          // This path will effectively not be taken if isDeveloper is always true for any logged in user.
          // However, keeping it for robustness in case `isDeveloper` logic changes elsewhere.
          <NewsGrid
            news={filteredNews.filter(item => !item.sponsored)} // Regular users only see non-sponsored news in the main feed
            currentUser={currentUser}
            isDeveloper={isDeveloper}
            onMarkRead={markAsRead}
          />
        )}

        {/* News Editor Modal */}
        {showEditor && (
          <NewsEditor
            news={editingNews}
            onSave={handleSave}
            onCancel={() => {
              setShowEditor(false);
              setEditingNews(null);
            }}
          />
        )}

        {/* Sponsored News Form */}
        {showSponsoredForm && (
          <SponsoredNewsForm
            news={editingNews}
            onSave={handleSave}
            onCancel={() => {
              setShowSponsoredForm(false);
              setEditingNews(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function NewsGrid({ news, currentUser, isDeveloper, onEdit, onDelete, onMarkRead }) {
  if (news.length === 0) {
    return (
      <div className="text-center py-12">
        <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg">No news items found</p>
        <p className="text-slate-400">Check back later for updates.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {news.map((item) => {
        const CategoryIcon = categoryIcons[item.category] || Megaphone;
        const isUnread = currentUser && !item.read_by?.includes(currentUser.email);

        return (
          <Card key={item.id} className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm group hover:shadow-xl transition-shadow ${
            isUnread ? 'ring-2 ring-emerald-200' : ''
          }`}>
            <CardHeader className="p-0">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-t-lg flex items-center justify-center">
                  <CategoryIcon className="w-16 h-16 text-emerald-600" />
                </div>
              )}
            </CardHeader>

            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-bold text-lg text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                  {item.title}
                </h3>
                {isUnread && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>
                )}
              </div>

              <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                {item.summary}
              </p>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge className={`text-xs ${categoryColors[item.category]}`}>
                  {item.category.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-slate-400">
                  {format(new Date(item.created_date), 'MMM d, yyyy')}
                </span>
                {item.featured && (
                  <Badge className="text-xs bg-amber-100 text-amber-800">
                    Featured
                  </Badge>
                )}
                {!item.published && (
                  <Badge className="text-xs bg-gray-100 text-gray-800">
                    Draft
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to={createPageUrl(`DeveloperNews/${item.id}`)}
                  onClick={() => onMarkRead && onMarkRead(item.id)}
                >
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Read More
                  </Button>
                </Link>

                {isDeveloper && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit && onEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete && onDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SponsoredNewsGrid({ news, currentUser, isDeveloper, onEdit, onDelete, onMarkRead }) {
  if (news.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg">No sponsored news items found</p>
        <p className="text-slate-400">Create paid news placements to reach targeted businesses.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {news.map((item) => {
        const CategoryIcon = categoryIcons[item.category] || Megaphone;
        const isUnread = currentUser && !item.read_by?.includes(currentUser.email);

        return (
          <Card key={item.id} className={`border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50 group hover:shadow-xl transition-shadow ${
            isUnread ? 'ring-2 ring-emerald-200' : ''
          }`}>
            <CardHeader className="p-0 relative">
              <div className="absolute top-2 left-2 z-10">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Sponsored
                </Badge>
              </div>

              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-t-lg flex items-center justify-center">
                  <CategoryIcon className="w-16 h-16 text-emerald-600" />
                </div>
              )}
            </CardHeader>

            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-bold text-lg text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                  {item.title}
                </h3>
                {isUnread && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></div>
                )}
              </div>

              <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                {item.summary}
              </p>

              {item.sponsor_name && (
                <p className="text-xs text-slate-500 mb-3">
                  Sponsored by {item.sponsor_name}
                </p>
              )}

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge className={`text-xs ${categoryColors[item.category]}`}>
                  {item.category.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-slate-400">
                  {format(new Date(item.created_date), 'MMM d, yyyy')}
                </span>
                {item.featured && (
                  <Badge className="text-xs bg-amber-100 text-amber-800">
                    Featured
                  </Badge>
                )}
                {!item.published && (
                  <Badge className="text-xs bg-gray-100 text-gray-800">
                    Draft
                  </Badge>
                )}
                <Badge className="text-xs bg-green-100 text-green-800">
                  {item.total_views || 0} views
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to={createPageUrl(`DeveloperNews/${item.id}`)}
                  onClick={() => onMarkRead && onMarkRead(item.id)}
                >
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    {item.call_to_action || 'Read More'}
                  </Button>
                </Link>

                {isDeveloper && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit && onEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete && onDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
