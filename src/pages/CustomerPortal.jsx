import React, { useState, useEffect } from 'react';
import { Post, PostComment, PostLike, User, EstimateRequest, EstimateBid, BusinessProfile } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Eye, Calendar, DollarSign, Star, Phone, Mail, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function CustomerPortal() {
  const [clientPosts, setClientPosts] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [receivedBids, setReceivedBids] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPortalData();
  }, []);

  const loadPortalData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Load client-visible posts
      const allPosts = await Post.filter({ visibility: 'client' }, '-created_date');
      setClientPosts(allPosts);

      // Load user's estimate requests
      const requests = await EstimateRequest.filter({ client_email: user.email }, '-created_date');
      setMyRequests(requests);

      // Load bids for user's requests
      if (requests.length > 0) {
        const requestIds = requests.map(r => r.id);
        const bids = await EstimateBid.filter({ 
          estimate_request_id: { $in: requestIds } 
        }, '-created_date');
        setReceivedBids(bids);

        // Load business profiles for the bids
        const businessIds = [...new Set(bids.map(b => b.business_id))];
        if (businessIds.length > 0) {
          const businessProfiles = await BusinessProfile.filter({ 
            business_id: { $in: businessIds } 
          });
          setBusinesses(businessProfiles);
        }
      }

    } catch (error) {
      console.error('Error loading customer portal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      // Check if already liked
      const existingLike = await PostLike.filter({ 
        post_id: postId, 
        user_email: currentUser.email 
      });

      if (existingLike.length > 0) {
        // Unlike
        await PostLike.delete(existingLike[0].id);
      } else {
        // Like
        await PostLike.create({
          post_id: postId,
          user_email: currentUser.email
        });
      }
      loadPortalData(); // Refresh to update like counts
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (postId, content) => {
    try {
      await PostComment.create({
        post_id: postId,
        content: content
      });
      loadPortalData(); // Refresh feed
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getBusinessProfile = (businessId) => {
    return businesses.find(b => b.business_id === businessId);
  };

  const getBidsForRequest = (requestId) => {
    return receivedBids.filter(b => b.estimate_request_id === requestId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {currentUser?.display_name || currentUser?.full_name}!</h1>
          <p className="text-slate-600">Stay updated on your projects and manage your estimates</p>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Project Updates
            </TabsTrigger>
            <TabsTrigger value="estimates" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              My Estimates
            </TabsTrigger>
            <TabsTrigger value="businesses" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Contractors
            </TabsTrigger>
          </TabsList>

          {/* Project Updates Feed */}
          <TabsContent value="feed" className="space-y-6">
            <div className="space-y-6">
              {clientPosts.length > 0 ? (
                clientPosts.map(post => (
                  <Card key={post.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-slate-900">{post.project_name || 'Project Update'}</h3>
                          <p className="text-sm text-slate-500">
                            {format(new Date(post.created_date), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          Client Update
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 mb-4">{post.content}</p>
                      
                      {/* Attachments */}
                      {post.attachments && post.attachments.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          {post.attachments.map((attachment, index) => (
                            <div key={index}>
                              {attachment.type === 'image' ? (
                                <img
                                  src={attachment.url}
                                  alt={attachment.filename}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="bg-slate-100 p-4 rounded-lg text-center">
                                  <p className="text-sm text-slate-600">{attachment.filename}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Interaction buttons */}
                      <div className="flex items-center gap-4 pt-4 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikePost(post.id)}
                          className="flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Like
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Comment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-500 mb-2">No project updates yet</h3>
                    <p className="text-slate-400">Updates from your contractors will appear here</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* My Estimates */}
          <TabsContent value="estimates" className="space-y-6">
            <div className="space-y-6">
              {myRequests.length > 0 ? (
                myRequests.map(request => {
                  const bids = getBidsForRequest(request.id);
                  return (
                    <Card key={request.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{request.project_title}</CardTitle>
                            <p className="text-slate-600 mt-1">{request.project_description}</p>
                            <p className="text-sm text-slate-500 mt-2">
                              Submitted: {format(new Date(request.created_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Badge variant={request.status === 'open' ? 'default' : 'secondary'}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <h4 className="font-semibold text-slate-900 mb-2">
                            Received Bids ({bids.length})
                          </h4>
                          {bids.length > 0 ? (
                            <div className="space-y-3">
                              {bids.map(bid => {
                                const business = getBusinessProfile(bid.business_id);
                                return (
                                  <div key={bid.id} className="border rounded-lg p-4 bg-slate-50">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h5 className="font-medium text-slate-900">{bid.business_name}</h5>
                                        <p className="text-sm text-slate-600">{bid.contact_person}</p>
                                        {business && (
                                          <div className="flex items-center gap-2 mt-1">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <span className="text-sm">{business.average_rating.toFixed(1)}</span>
                                            <span className="text-sm text-slate-500">({business.total_reviews} reviews)</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="text-lg font-bold text-emerald-600">
                                          ${bid.estimated_cost.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                          Start: {format(new Date(bid.estimated_start_date), 'MMM d')}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm text-slate-700 mt-2">{bid.bid_description}</p>
                                    <div className="flex gap-2 mt-3">
                                      <Button size="sm" variant="outline">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </Button>
                                      <Button size="sm" variant="outline">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Contact
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-slate-500 text-sm">No bids received yet</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-500 mb-2">No estimate requests yet</h3>
                    <p className="text-slate-400 mb-4">Get started by requesting estimates for your projects</p>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Get New Estimates
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Business Profiles */}
          <TabsContent value="businesses" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map(business => (
                <Card key={business.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      {business.business_logo_url && (
                        <img
                          src={business.business_logo_url}
                          alt={business.business_name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg">{business.business_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{business.average_rating.toFixed(1)}</span>
                          <span className="text-sm text-slate-500">({business.total_reviews})</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {business.business_description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{business.years_in_business} years in business</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span>{business.projects_completed} projects completed</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}