
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserBusiness, UserInvitation } from '@/api/entities';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Shield, Briefcase, Power, User as UserIcon, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from 'sonner';

import InviteUserButton from '../components/users/InviteUserButton';
import { updateUserDetails } from '@/api/functions';
import { removeUserFromBusiness } from '@/api/functions';
import UserForm from '../components/users/UserForm';

export default function UsersPage() {
  const [usersWithDetails, setUsersWithDetails] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [userBusinessLinks, allUsers, pendingInvites] = await Promise.all([
        UserBusiness.filter({ business_id: user.current_business_id }),
        User.list(),
        UserInvitation.filter({ business_id: user.current_business_id, status: 'sent' })
      ]);

      const currentUserBusiness = userBusinessLinks.find(link => link.user_email === user.email);
      setCurrentUserRole(currentUserBusiness?.role || 'member');
      
      const activeUsers = userBusinessLinks.map(link => {
        const userDetails = allUsers.find(u => u.email === link.user_email);
        return {
          id: userDetails?.id || link.id,
          ...link,
          ...userDetails,
          userBusinessId: link.id,
          status: 'active'
        };
      });

      const invitedUsers = pendingInvites
        .filter(invite => !activeUsers.some(u => u.email === invite.invitee_email))
        .map(invite => ({
          id: invite.id,
          email: invite.invitee_email,
          role: invite.role,
          is_trainer: invite.is_trainer,
          status: 'invited',
        }));

      setUsersWithDetails([...activeUsers, ...invitedUsers]);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load user data.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveUser = async (userEmail, updates) => {
    try {
      const { error } = await updateUserDetails({ targetUserEmail: userEmail, updates });
      if (error) throw new Error(error);
      toast.success("User details updated successfully!");
      loadData();
      setEditingUser(null);
    } catch (error) {
      console.error("Failed to update user details:", error);
      toast.error(error.message || "Failed to update user details.");
    }
  };

  const handleRoleChange = async (user, newRole) => {
    if (user.status === 'invited') {
        const { error } = await updateUserDetails({ targetUserEmail: user.email, updates: { role: newRole } });
        if (error) {
            toast.error("Failed to update invited user's role.");
        } else {
            toast.success("Invited user's role updated.");
            loadData();
        }
    } else {
        handleSaveUser(user.email, { role: newRole });
    }
  };

  const handleTrainerToggle = async (userEmail, isTrainer) => {
    try {
      const { error } = await updateUserDetails({ targetUserEmail: userEmail, updates: { is_trainer: isTrainer } });
      if (error) throw new Error(error);
      toast.success(`Trainer status updated successfully!`);
      loadData();
    } catch (error) {
      console.error("Failed to update trainer status:", error);
      toast.error("Failed to update trainer status.");
    }
  };

  const handleDelete = async (userEmail) => {
    if (window.confirm('Are you sure you want to remove this user from the business? This will also cancel any pending invitations.')) {
      try {
        const { error } = await removeUserFromBusiness({ targetUserEmail: userEmail });
        if (error) throw new Error(error);
        toast.success('User removed from business.');
        loadData();
      } catch (error) {
        console.error('Error removing user:', error);
        toast.error('Failed to remove user.');
      }
    }
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin', icon: Shield },
    { value: 'sales', label: 'Sales', icon: Briefcase },
    { value: 'production', label: 'Production', icon: Power },
    { value: 'member', label: 'Member', icon: UserIcon },
    { value: 'subcontractor_member', label: 'Subcontractor', icon: UserIcon }
  ];

  const getRoleIcon = (role) => {
    const option = roleOptions.find(o => o.value === role);
    return option ? <option.icon className="w-4 h-4 mr-2" /> : null;
  };
  
  const getUserInitials = (user) => {
    const name = user?.display_name || user?.full_name || user?.email;
    return name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  const canManageUsers = currentUserRole === 'admin' || currentUserRole === 'owner';

  if (isLoading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Invite User and Statistics */}
          <div className="lg:w-80 space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Invite New User</CardTitle>
                <p className="text-sm text-slate-600">Add team members to your organization</p>
              </CardHeader>
              <CardContent>
                {canManageUsers ? (
                  <InviteUserButton />
                ) : (
                  <p className="text-sm text-slate-500">You need admin privileges to invite users.</p>
                )}
              </CardContent>
            </Card>

            {/* User Statistics */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Team Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Users</span>
                  <span className="font-semibold">{usersWithDetails.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Admins</span>
                  <span className="font-semibold">{usersWithDetails.filter(u => u.role === 'admin' || u.role === 'owner').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Invited</span>
                  <span className="font-semibold">{usersWithDetails.filter(u => u.status === 'invited').length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - User List */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
              <p className="text-slate-600 mt-1">Manage your team members, roles, and permissions.</p>
            </div>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        {canManageUsers && <TableHead>Trainer</TableHead>}
                        <TableHead>Status</TableHead>
                        {canManageUsers && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersWithDetails.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.profile_image_url} alt={user.display_name} />
                                <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                              </Avatar>
                              <div className="flex items-center gap-2">
                                {user.display_name || user.full_name || 'N/A'}
                                {user.is_trainer && user.status === 'active' && (
                                  <GraduationCap 
                                    className="w-4 h-4 text-emerald-600" 
                                    title="Certified Trainer" 
                                  />
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {canManageUsers && (user.status === 'active' || user.status === 'invited') ? (
                              <Select
                                value={user.role}
                                onValueChange={(newRole) => handleRoleChange(user, newRole)}
                                disabled={user.role === 'owner' || (user.status === 'active' && currentUser.email === user.email)}
                              >
                                <SelectTrigger className="w-48">
                                  <div className="flex items-center">
                                    {getRoleIcon(user.role)}
                                    <SelectValue />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  {roleOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center">
                                        {getRoleIcon(option.value)}
                                        {option.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center capitalize">
                                {getRoleIcon(user.role)}
                                {user.role.replace('_', ' ')}
                              </div>
                            )}
                          </TableCell>
                          {canManageUsers && (
                            <TableCell>
                              {user.status === 'active' ? (
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={user.is_trainer || false}
                                    onCheckedChange={(checked) => handleTrainerToggle(user.email, checked)}
                                    disabled={user.role === 'owner' && user.email === currentUser.email}
                                  />
                                </div>
                              ) : (
                                <Badge variant="outline">N/A</Badge>
                              )}
                            </TableCell>
                          )}
                          <TableCell>
                            <Badge variant={user.status === 'invited' ? 'secondary' : 'default'} className="capitalize">
                              {user.status}
                            </Badge>
                          </TableCell>
                          {canManageUsers && (
                            <TableCell className="text-right">
                               <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)} disabled={user.role === 'owner'}>
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(user.email)} disabled={user.role === 'owner' || currentUser.email === user.email}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {editingUser && (
        <UserForm
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}
