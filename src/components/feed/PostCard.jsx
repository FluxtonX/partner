
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostComment, PostLike } from '@/api/entities';
import { Heart, MessageCircle, MapPin, Download, Send, Image, FileText, GraduationCap, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const postTypeColors = {
  general: 'bg-blue-100 text-blue-800',
  milestone: 'bg-emerald-100 text-emerald-800',
  issue: 'bg-red-100 text-red-800',
  completion: 'bg-purple-100 text-purple-800'
};

const renderWithMentions = (text, users) => {
  if (!text) return '';
  const mentionRegex = /@(\w+)/g;
  
  const parts = text.split(mentionRegex);

  return parts.map((part, index) => {
    if (index % 2 !== 0) { // It's a captured group (the username part of the mention)
      const matchedUser = users.find(u => 
        (u.display_name && u.display_name.toLowerCase() === part.toLowerCase()) || 
        (u.full_name && u.full_name.toLowerCase() === part.toLowerCase())
      );

      if (matchedUser) {
        return (
          <Badge key={index} variant="secondary" className="font-normal bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
            @{matchedUser.display_name || matchedUser.full_name}
            {matchedUser.is_trainer && (
              <GraduationCap className="w-3 h-3 text-emerald-600" />
            )}
          </Badge>
        );
      }
    }
    return part; // It's regular text or an unmatched "@word"
  });
};

export default function PostCard({ post, projectName, clientName, currentUser, users, comments: initialComments, likes: initialLikes, onLike, onComment, onDelete }) {
  const [comments, setComments] = useState(initialComments || []);
  const [likes, setLikes] = useState(initialLikes || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setComments(initialComments || []);
    setLikes(initialLikes || []);
    setIsLiked((initialLikes || []).some(like => like.user_email === currentUser?.email));
  }, [initialComments, initialLikes, currentUser?.email]);

  const handleLike = () => {
    onLike();
    setIsLiked(!isLiked);
    // Optimistically update likes count
    if (isLiked) {
      setLikes(prev => prev.filter(like => like.user_email !== currentUser?.email));
    } else {
      setLikes(prev => [...prev, { user_email: currentUser?.email }]);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await onComment(post.id, newComment);
      setNewComment('');
      // The parent will update the comments via props
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(post.id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getAuthor = (email) => {
    return users.find(u => u.email === email);
  };

  const getUserInitials = (user) => {
    const name = user?.display_name || user?.full_name;
    if (!name) return 'U'; 
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return initials || 'U';
  };
  
  const author = getAuthor(post.created_by);
  const isPostOwner = currentUser?.email === post.created_by;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={author?.profile_image_url} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {getUserInitials(author)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    {author?.display_name || author?.full_name || post.created_by}
                    {author?.is_trainer && (
                      <GraduationCap className="w-4 h-4 text-emerald-600" title="Certified Trainer" />
                    )}
                  </p>
                  <Badge className={postTypeColors[post.post_type]}>
                    {post.post_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{projectName} • {clientName}</span>
                  <span>•</span>
                  <span>{format(new Date(post.created_date), 'MMM d, h:mm a')}</span>
                </div>
              </div>
            </div>
            
            {isPostOwner && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                title="Delete post"
              >
                {isDeleting ? (
                  <div className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Post Content */}
          <div className="text-slate-800 whitespace-pre-wrap">
            {renderWithMentions(post.content, users)}
          </div>

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="space-y-3">
              {/* Image Gallery */}
              {post.attachments.filter(att => att.type === 'image').length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {post.attachments.filter(att => att.type === 'image').map((attachment, index) => (
                    <div key={`img-${index}`} className="relative group">
                      <img
                        src={attachment.url}
                        alt={attachment.filename}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(attachment.url, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                          Click to view
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Document Files */}
              {post.attachments.filter(att => att.type === 'document').length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Documents:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {post.attachments.filter(att => att.type === 'document').map((attachment, index) => (
                      <div key={`doc-${index}`} className="border rounded-lg p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-slate-700 truncate">
                            {attachment.filename}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          {post.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
              <MapPin className="w-4 h-4" />
              <span>{post.location.place_name || post.location.address}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`${isLiked ? 'text-red-500' : 'text-slate-600'} hover:text-red-500`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {likes.length > 0 ? `${likes.length}` : 'Like'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-slate-600 hover:text-slate-900"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {comments.length > 0 ? `${comments.length}` : 'Comment'}
              </Button>
            </div>

            <Badge variant="outline" className="text-xs">
              {post.visibility}
            </Badge>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="space-y-3 pt-3 border-t">
              {/* Existing Comments */}
              {comments.map((comment) => {
                const commenter = getAuthor(comment.created_by);
                return (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                       <AvatarImage src={commenter?.profile_image_url} />
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                        {getUserInitials(commenter)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                          {commenter?.display_name || commenter?.full_name || comment.created_by}
                          {commenter?.is_trainer && (
                            <GraduationCap className="w-3 h-3 text-emerald-600" title="Certified Trainer" />
                          )}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{renderWithMentions(comment.content, users)}</p>
                    </div>
                  </div>
                );
              })}

              {/* New Comment Input */}
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUser?.profile_image_url} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                    {getUserInitials(currentUser)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
