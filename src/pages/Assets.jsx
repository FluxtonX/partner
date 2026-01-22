import React, { useState, useEffect } from 'react';
import { Asset, User } from '@/api/entities';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Warehouse, AlertCircle } from 'lucide-react';

import AssetCard from '../components/assets/AssetCard';
import AssetForm from '../components/assets/AssetForm';

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      if (currentUser.role !== 'admin') {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      setIsAdmin(true);

      const [assetsData, usersData] = await Promise.all([
        Asset.list('-created_date'),
        User.list()
      ]);
      setAssets(assetsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading assets data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleDelete = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      try {
        await Asset.delete(assetId);
        loadData();
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const handleSubmit = async (assetData) => {
    try {
      if (editingAsset) {
        await Asset.update(editingAsset.id, assetData);
      } else {
        await Asset.create(assetData);
      }
      setShowForm(false);
      setEditingAsset(null);
      loadData();
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };
  
  const getUserName = (email) => {
    if (!email) return 'Unassigned';
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };
  
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600">You must be an administrator to manage company assets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Company Assets</h1>
            <p className="text-slate-600">Manage your company's vehicles, equipment, and other assets.</p>
          </div>
          <Button
            onClick={() => { setEditingAsset(null); setShowForm(true); }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Asset
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset}
              assignedUserName={getUserName(asset.assigned_to)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
        
        {assets.length === 0 && (
          <div className="text-center py-12">
            <Warehouse className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No assets found</p>
            <p className="text-slate-400">Add your first company asset to get started.</p>
          </div>
        )}

        {showForm && (
          <AssetForm
            asset={editingAsset}
            users={users}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingAsset(null);
            }}
          />
        )}
      </div>
    </div>
  );
}