
import React, { useState, useEffect } from 'react';
import { Post, PostComment, PostLike, Project, Client, User } from '@/api/entities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Heart, MapPin, Upload, Send, Image, FileText, Clock, ArrowRight, History } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/providers/LanguageContext';

import PostCard from '../components/feed/PostCard';
import PostCreator from '../components/feed/PostCreator';
import RecentViews from '../components/feed/RecentViews';
import WeatherWidget from '../components/feed/WeatherWidget';

export default function FeedPage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [allComments, setAllComments] = useState([]);
  const [allLikes, setAllLikes] = useState([]);

  useEffect(() => {
    loadFeedData();
  }, []);

  const loadFeedData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Add delays between calls to avoid rate limiting
      const allPosts = await Post.list('-created_date');
      
      // Small delay before next call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const projectsData = await Project.list('-updated_date');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const clientsData = await Client.list();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const usersData = await User.list();

      setPosts(allPosts);
      setProjects(projectsData);
      setClients(clientsData);
      setUsers(usersData);

      // Batch load all comments and likes for all posts
      if (allPosts.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        try {
          const commentsData = await PostComment.list('-created_date');
          setAllComments(commentsData);
        } catch (error) {
          console.error('Error loading comments:', error);
          setAllComments([]);
        }

        await new Promise(resolve => setTimeout(resolve, 300));
        
        try {
          const likesData = await PostLike.list();
          setAllLikes(likesData);
        } catch (error) {
          console.error('Error loading likes:', error);
          setAllLikes([]);
        }
      }

    } catch (error) {
      console.error('Error loading feed data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showClientNotificationModal = (post, project, client) => {
    if (!project || !client || !post || !currentUser) {
      console.error('Missing data for client notification modal.');
      return;
    }

    const emailSubject = `Project Update: ${project.title}`;
    const emailBody = `
Dear ${client.contact_person},

Here is an update on the project "${project.title}":

---
${post.content}
---

Posted by: ${currentUser.full_name || currentUser.email}

Best regards,
The ProjectFlow Team
    `;

    const modalContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h3 style="color: #059669; margin-bottom: 20px;">📧 Notify Client</h3>
        <p style="margin-bottom: 15px; color: #64748b;">Copy the content below and send it to your client via email to notify them of this update.</p>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px; font-size: 14px;">
          <strong>To:</strong> ${client.email}<br>
          <strong>Subject:</strong> ${emailSubject}
        </div>
        
        <textarea style="width: 100%; min-height: 200px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-family: monospace; font-size: 14px; border: 1px solid #e2e8f0; white-space: pre-wrap; resize: vertical;" readonly>${emailBody.trim()}</textarea>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
          <button id="copyEmailBtn" style="background: #059669; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">
            📋 Copy Email Content
          </button>
          <button id="closeModalBtn" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">
            Close
          </button>
        </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0,0,0,0.5); display: flex; align-items: center; 
      justify-content: center; z-index: 1000; padding: 20px;
    `;
    
    const modalDialog = document.createElement('div');
    modalDialog.style.cssText = `
      background: white; border-radius: 12px; padding: 30px; 
      max-width: 90vw; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;
    
    modalDialog.innerHTML = modalContent;
    modal.appendChild(modalDialog);
    document.body.appendChild(modal);

    const closeModal = () => {
        if (modal && document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    };

    // Attach event listeners after modal is in DOM
    const copyBtn = document.getElementById('copyEmailBtn');
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(emailBody.trim())
          .then(() => alert('Email content copied to clipboard!'))
          .catch(err => console.error('Failed to copy text: ', err));
      };
    }
    
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
      closeBtn.onclick = closeModal;
    }
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };
  };

  const handleCreatePost = async (postData) => {
    try {
      const newPost = await Post.create({
        ...postData,
        created_by: currentUser.email
      });
      setShowPostCreator(false);
      
      // Add delay before reloading
      await new Promise(resolve => setTimeout(resolve, 500));
      loadFeedData(); // Refresh feed

      // Check for client visibility and show notification modal
      if (postData.visibility === 'client' && postData.project_id) {
        let project = projects.find(p => p.id === postData.project_id);
        if (!project) {
          // If not found in current projects, fetch it (e.g., if list is filtered or not fully loaded)
          try {
            project = await Project.get(postData.project_id);
          } catch (fetchError) {
            console.error('Error fetching project:', fetchError);
            project = null; // Ensure project is null if fetch fails
          }
        }
        
        if (project && project.client_id) {
          let client = clients.find(c => c.id === project.client_id);
          if (!client) {
            // If not found in clients, fetch it
            try {
              client = await Client.get(project.client_id);
            } catch (fetchError) {
              console.error('Error fetching client:', fetchError);
              client = null; // Ensure client is null if fetch fails
            }
          }

          if (client) {
            showClientNotificationModal(newPost, project, client);
          } else {
            console.warn(`Client with ID ${project.client_id} not found for project ${project.title}. Cannot show client notification.`);
          }
        } else if (project) {
          console.warn(`Project ${project.title} has no client_id. Cannot show client notification.`);
        } else {
          console.warn(`Project with ID ${postData.project_id} not found. Cannot show client notification.`);
        }
      }

    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const existingLike = allLikes.find(
        like => like.post_id === postId && like.user_email === currentUser.email
      );

      if (existingLike) {
        await PostLike.delete(existingLike.id);
        setAllLikes(prev => prev.filter(like => like.id !== existingLike.id));
      } else {
        const newLike = await PostLike.create({
          post_id: postId,
          user_email: currentUser.email
        });
        setAllLikes(prev => [...prev, newLike]);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      const newComment = await PostComment.create({
        post_id: postId,
        content: content
      });
      setAllComments(prev => [newComment, ...prev]);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await Post.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setAllComments(prev => prev.filter(c => c.post_id !== postId));
      setAllLikes(prev => prev.filter(l => l.post_id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  const getProjectName = (projectId) => {
    // Look in all projects data
    const allProjects = [...projects];
    const project = allProjects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  const getClientName = (projectId) => {
    // Look in all projects data
    const allProjects = [...projects];
    const project = allProjects.find(p => p.id === projectId);
    const client = clients.find(c => c.id === project?.client_id);
    return client?.company_name || 'Unknown Client';
  };

  const filteredPosts = filterProject === 'all' 
    ? posts 
    : posts.filter(p => p.project_id === filterProject);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded mb-4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-slate-700" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Activity Feed</h1>
              <p className="text-slate-600">Stay updated on project activities</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={() => setShowPostCreator(!showPostCreator)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Feed Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Creator */}
            {showPostCreator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <PostCreator
                  projects={projects}
                  onSubmit={handleCreatePost}
                  onCancel={() => setShowPostCreator(false)}
                />
              </motion.div>
            )}

            {/* Feed */}
            <div className="space-y-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => {
                  const postComments = allComments.filter(c => c.post_id === post.id);
                  const postLikes = allLikes.filter(l => l.post_id === post.id);
                  
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      projectName={getProjectName(post.project_id)}
                      clientName={getClientName(post.project_id)}
                      currentUser={currentUser}
                      users={users}
                      comments={postComments}
                      likes={postLikes}
                      onLike={() => handleLikePost(post.id)}
                      onComment={handleAddComment}
                      onDelete={handleDeletePost}
                    />
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-500 mb-2">No posts yet</h3>
                  <p className="text-slate-400">Be the first to share an update on your projects!</p>
                  <Button 
                    onClick={() => setShowPostCreator(true)}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Create First Post
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <WeatherWidget />
            
            <RecentViews />
            
            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <h3 className="font-semibold text-slate-900">Quick Stats</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Active Projects</span>
                  <Badge variant="outline">{projects.filter(p => p.status === 'active').length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Estimates</span>
                  <Badge variant="outline">{projects.filter(p => p.status === 'estimate').length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Service Requests</span>
                  <Badge variant="outline">{projects.filter(p => p.status === 'service').length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Posts</span>
                  <Badge variant="outline">{posts.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
