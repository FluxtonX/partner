import React, { useState, useEffect } from 'react';
import { Insurance, Asset, User, Alert, BusinessSettings } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Edit, Trash2, AlertTriangle, CheckCircle, DollarSign, Calendar } from 'lucide-react';
import { format, differenceInDays, isBefore, subDays } from 'date-fns';

// New imports for the Table component
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

// New imports for the AlertDialog component for delete confirmation
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import InsuranceForm from '../components/insurance/InsuranceForm';

export default function InsurancePage() {
  const [policies, setPolicies] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // New states for delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPolicy, setDeletingPolicy] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
    checkExpirationNotifications();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [policiesData, assetsData] = await Promise.all([
        Insurance.list('-expiration_date'),
        Asset.list()
      ]);
      setPolicies(policiesData);
      setAssets(assetsData);
    } catch (error) {
      console.error('Error loading insurance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkExpirationNotifications = async () => {
    try {
      const user = await User.me();
      const settingsList = await BusinessSettings.list();
      const policiesData = await Insurance.list();
      const today = new Date();
      const todayString = format(today, 'yyyy-MM-dd');
      
      for (const policy of policiesData) {
        const expirationDate = new Date(policy.expiration_date);
        const notificationDays = policy.notification_days || 30;
        const notificationStartDate = subDays(expirationDate, notificationDays);

        if (today >= notificationStartDate && today <= expirationDate && policy.last_notified_date !== todayString) {
          const daysUntilExpiry = differenceInDays(expirationDate, today);
          
          await Alert.create({
            user_email: user.email,
            title: 'Insurance Policy Expiring Soon',
            message: `Your "${policy.policy_name}" policy (${policy.policy_number}) is expiring on ${format(expirationDate, 'PPP')}. Please renew or update the policy.`,
            type: 'insurance_expiry',
            priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
            related_id: policy.id,
            related_type: 'insurance'
          });

          await Insurance.update(policy.id, { last_notified_date: todayString });
        }
      }
    } catch (error) {
      console.error("Failed to check insurance expiration dates:", error);
    }
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setShowForm(true);
  };

  const handleDelete = (policy) => {
    setDeletingPolicy(policy);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingPolicy) return;
    setIsDeleting(true);
    try {
      await Insurance.delete(deletingPolicy.id);
      loadData();
      setShowDeleteConfirm(false);
      setDeletingPolicy(null);
    } catch (error) {
      console.error('Error deleting policy:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (policyData) => {
    try {
      if (editingPolicy) {
        await Insurance.update(editingPolicy.id, policyData);
      } else {
        await Insurance.create(policyData);
      }
      setShowForm(false);
      setEditingPolicy(null);
      loadData();
    } catch (error) {
      console.error('Error saving policy:', error);
    }
  };

  const getStatus = (policy) => {
    const today = new Date();
    const expirationDate = new Date(policy.expiration_date);
    const daysUntilExpiry = differenceInDays(expirationDate, today);

    if (policy.status === 'cancelled') {
      return { text: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertTriangle };
    }
    if (isBefore(expirationDate, today)) {
      return { text: 'Expired', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle };
    }
    if (daysUntilExpiry <= 7) {
      return { text: `Expires in ${daysUntilExpiry}d`, color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
    }
    if (daysUntilExpiry <= 30) {
      return { text: `Expires in ${daysUntilExpiry}d`, color: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertTriangle };
    }
    return { text: 'Active', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle };
  };

  const getTotalCoverageAmount = () => {
    return policies.reduce((sum, policy) => sum + (policy.coverage_amount || 0), 0);
  };

  const getTotalPremiums = () => {
    return policies.reduce((sum, policy) => sum + (policy.premium_amount || 0), 0);
  };

  const getExpiringPolicies = () => {
    const today = new Date();
    return policies.filter(policy => {
      const expirationDate = new Date(policy.expiration_date);
      const daysUntilExpiry = differenceInDays(expirationDate, today);
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    });
  };

  const activePolicies = policies.filter(p => p.status === 'active');
  const expiringPolicies = getExpiringPolicies();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-slate-700" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Insurance Management</h1>
              <p className="text-slate-600">Manage company insurance policies and track coverage</p>
            </div>
          </div>
          <Button 
            onClick={() => { setEditingPolicy(null); setShowForm(true); }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Insurance Policy
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{activePolicies.length}</p>
                  <p className="text-sm text-slate-600 font-medium">Active Policies</p>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${getTotalCoverageAmount().toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Total Coverage</p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    ${getTotalPremiums().toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Annual Premiums</p>
                </div>
                <Calendar className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{expiringPolicies.length}</p>
                  <p className="text-sm text-slate-600 font-medium">Expiring Soon</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-300 border-t-slate-500 rounded-full"></div>
            <p className="mt-4 text-slate-600">Loading policies...</p>
          </div>
        ) : policies.length > 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-800">Your Insurance Policies</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Policy Name</TableHead>
                      <TableHead className="min-w-[120px]">Type</TableHead>
                      <TableHead className="min-w-[150px]">Company</TableHead>
                      <TableHead className="min-w-[100px]">Coverage</TableHead>
                      <TableHead className="min-w-[100px]">Premium</TableHead>
                      <TableHead className="min-w-[150px]">Expires</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                      <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map(policy => {
                      const status = getStatus(policy);
                      return (
                        <TableRow key={policy.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-medium text-slate-800 truncate">{policy.policy_name}</TableCell>
                          <TableCell className="truncate">{policy.policy_type}</TableCell>
                          <TableCell className="truncate">{policy.insurance_company}</TableCell>
                          <TableCell>${(policy.coverage_amount || 0).toLocaleString()}</TableCell>
                          <TableCell>${(policy.premium_amount || 0).toLocaleString()}</TableCell>
                          <TableCell>{format(new Date(policy.expiration_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`py-1 px-2 text-xs font-semibold ${status.color}`}>
                              {React.createElement(status.icon, { className: 'w-3 h-3 inline mr-1' })}
                              {status.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(policy)}
                              className="text-blue-600 hover:text-blue-700 p-1 h-auto"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(policy)}
                              className="text-red-600 hover:text-red-700 p-1 h-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-300 rounded-lg bg-white/50 backdrop-blur-sm">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">No insurance policies found</p>
            <p className="text-slate-400 mt-1">Add your first insurance policy to get started.</p>
            <Button
              onClick={() => { setEditingPolicy(null); setShowForm(true); }}
              className="mt-6 bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Insurance Policy
            </Button>
          </div>
        )}

        {showForm && (
          <InsuranceForm
            policy={editingPolicy}
            assets={assets}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingPolicy(null);
            }}
          />
        )}
        
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the policy &quot;
                {deletingPolicy?.policy_name}&quot; and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}