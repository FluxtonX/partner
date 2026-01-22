
import React, { useState, useEffect } from 'react';
import { VendorIntegration, VendorAsset, AssetRental, VendorPayout } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Settings, 
  DollarSign, 
  Truck, 
  Search,
  Eye,
  Edit,
  Trash2,
  Star,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

import VendorIntegrationForm from '../components/vendor/VendorIntegrationForm';
import VendorAssetForm from '../components/vendor/VendorAssetForm';
import VendorAssetCard from '../components/vendor/VendorAssetCard';
import RentalManagement from '../components/vendor/RentalManagement';
import VendorPayoutDashboard from '../components/vendor/VendorPayoutDashboard';

export default function VendorManagementPage() {
  const [activeTab, setActiveTab] = useState('integrations');
  const [vendors, setVendors] = useState([]);
  const [vendorAssets, setVendorAssets] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null); // Fix: Removed extra closing parenthesis

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vendorsData, assetsData, rentalsData, payoutsData] = await Promise.all([
        VendorIntegration.list('-created_date'),
        VendorAsset.list('-created_date'),
        AssetRental.list('-created_date'),
        VendorPayout.list('-created_date')
      ]);
      
      setVendors(vendorsData || []);
      setVendorAssets(assetsData || []);
      setRentals(rentalsData || []);
      setPayouts(payoutsData || []);
    } catch (error) {
      console.error('Error loading vendor data:', error);
      toast.error('Failed to load vendor data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVendorSubmit = async (formData) => {
    try {
      if (editingVendor) {
        await VendorIntegration.update(editingVendor.id, formData);
        toast.success('Vendor updated successfully');
      } else {
        await VendorIntegration.create(formData);
        toast.success('Vendor added successfully');
      }
      setShowVendorForm(false);
      setEditingVendor(null);
      loadData();
    } catch (error) {
      toast.error('Failed to save vendor');
    }
  };

  const handleAssetSubmit = async (formData) => {
    try {
      if (editingAsset) {
        await VendorAsset.update(editingAsset.id, formData);
        toast.success('Asset updated successfully');
      } else {
        await VendorAsset.create(formData);
        toast.success('Asset added successfully');
      }
      setShowAssetForm(false);
      setEditingAsset(null);
      loadData();
    } catch (error) {
      toast.error('Failed to save asset');
    }
  };

  const handleDeleteVendor = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await VendorIntegration.delete(id);
        toast.success('Vendor deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete vendor');
      }
    }
  };

  const handleDeleteAsset = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await VendorAsset.delete(id);
        toast.success('Asset deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete asset');
      }
    }
  };

  const filteredVendors = vendors.filter(vendor => 
    vendor.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssets = vendorAssets.filter(asset =>
    asset.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vendors</h1>
          <p className="text-slate-600">Manage vendor integrations, rental assets, and payouts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search vendors or assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="integrations">
            <Settings className="w-4 h-4 mr-2" />
            API Integrations
          </TabsTrigger>
          <TabsTrigger value="rental-assets">
            <Truck className="w-4 h-4 mr-2" />
            Rental Assets
          </TabsTrigger>
          <TabsTrigger value="rentals">
            <DollarSign className="w-4 h-4 mr-2" />
            Active Rentals
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <TrendingUp className="w-4 h-4 mr-2" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Eye className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Vendor Integrations</h2>
            <Button onClick={() => { setEditingVendor(null); setShowVendorForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor Integration
            </Button>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              <p>Loading vendors...</p>
            ) : filteredVendors.length > 0 ? (
              filteredVendors.map(vendor => (
                <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span>{vendor.vendor_name}</span>
                        <Badge variant={vendor.active ? 'default' : 'secondary'}>
                          {vendor.active ? 'Active' : 'Inactive'}
                        </Badge>
                        {vendor.is_premium && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => { setEditingVendor(vendor); setShowVendorForm(true); }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleDeleteVendor(vendor.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-600">Type:</span>
                        <p className="capitalize">{vendor.vendor_type?.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">API Status:</span>
                        <p className="capitalize">{vendor.api_status}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Priority:</span>
                        <p>{vendor.priority_level}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Monthly Calls:</span>
                        <p>{vendor.monthly_api_calls || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-slate-500">No vendor integrations found</p>
                  <Button className="mt-4" onClick={() => setShowVendorForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Vendor
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rental-assets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Rental Assets</h2>
            <Button onClick={() => { setEditingAsset(null); setShowAssetForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rental Asset
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <p>Loading assets...</p>
            ) : filteredAssets.length > 0 ? (
              filteredAssets.map(asset => (
                <VendorAssetCard
                  key={asset.id}
                  asset={asset}
                  vendors={vendors}
                  onEdit={(asset) => { setEditingAsset(asset); setShowAssetForm(true); }}
                  onDelete={handleDeleteAsset}
                />
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="text-center py-8">
                  <p className="text-slate-500">No rental assets found</p>
                  <Button className="mt-4" onClick={() => setShowAssetForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Rental Asset
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rentals">
          <RentalManagement rentals={rentals} vendors={vendors} assets={vendorAssets} onUpdate={loadData} />
        </TabsContent>

        <TabsContent value="payouts">
          <VendorPayoutDashboard 
            payouts={payouts} 
            vendors={vendors} 
            rentals={rentals}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{vendors.length}</div>
                <p className="text-xs text-slate-600">Total Vendors</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{vendorAssets.length}</div>
                <p className="text-xs text-slate-600">Rental Assets</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {rentals.filter(r => r.rental_status === 'active').length}
                </div>
                <p className="text-xs text-slate-600">Active Rentals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  ${rentals.reduce((sum, r) => sum + (r.platform_commission || 0), 0).toFixed(2)}
                </div>
                <p className="text-xs text-slate-600">Platform Revenue</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showVendorForm && (
        <VendorIntegrationForm
          vendor={editingVendor}
          onSubmit={handleVendorSubmit}
          onCancel={() => { setShowVendorForm(false); setEditingVendor(null); }}
        />
      )}

      {showAssetForm && (
        <VendorAssetForm
          asset={editingAsset}
          vendors={vendors}
          onSubmit={handleAssetSubmit}
          onCancel={() => { setShowAssetForm(false); setEditingAsset(null); }}
        />
      )}
    </div>
  );
}
