import React, { useState } from 'react';
import { User } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Loader2, CheckCircle } from 'lucide-react';

export default function ProfileEditor({ currentUser, onUpdate }) {
  const [displayName, setDisplayName] = useState(currentUser?.display_name || currentUser?.full_name || '');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentUser?.profile_image_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback('');
    try {
      let imageUrl = currentUser?.profile_image_url;
      if (profileImageFile) {
        const { file_url } = await UploadFile({ file: profileImageFile });
        imageUrl = file_url;
      }
      
      await User.updateMyUserData({
        display_name: displayName,
        profile_image_url: imageUrl
      });

      setFeedback('Profile updated successfully!');
      if(onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving profile:', error);
      setFeedback('Failed to update profile.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>Update your photo and display name.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={previewUrl} alt={displayName} />
            <AvatarFallback className="text-2xl">{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="profile-picture">Profile Picture</Label>
            <Input 
              id="profile-picture" 
              type="file" 
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange} 
            />
            <p className="text-xs text-slate-500">Upload a clear portrait image (PNG, JPG, GIF).</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display-name">Display Name</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your preferred display name"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          {feedback && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              {feedback}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}