
import React, { useState, useEffect } from 'react';
import { Asset, User, Project, ProductOrService } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Package, Truck, Wrench, Home, MoreHorizontal, User as UserIcon, Calendar, DollarSign, TrendingUp, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

import AssetForm from '../components/assets/AssetForm';
import AssetCard from '../components/assets/AssetCard';
import AssetAssignmentDialog from '../components/assets/AssetAssignmentDialog';
import AssetAvailabilityCalendar from '../components/assets/AssetAvailabilityCalendar';
import AssetCapacityVisualizer from '../components/assets/AssetCapacityVisualizer';

export default function CompanyAssetsPage() {
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [products, setProducts] = useState([]); // New state for products
  const [currentUser, setCurrentUser] = useState(null);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [showCapacityPlanner, setShowCapacityPlanner] = useState(false); // New state for capacity planner
  const [selectedAssetForPlanning, setSelectedAssetForPlanning] = useState(null); // New state for selected asset for planning

  useEffect(() => {
    loadData();
    loadProducts(); // Load products on initial render
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, searchTerm, typeFilter, statusFilter, assigneeFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [assetsData, usersData, projectsData] = await Promise.all([
        Asset.list('-updated_date'),
        User.list(),
        Project.list()
      ]);

      setAssets(assetsData);
      setUsers(usersData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load assets data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productData = await ProductOrService.list();
      setProducts(productData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const filterAssets = () => {
    let filtered = [...assets];

    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(asset => asset.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.status === statusFilter);
    }

    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(asset => asset.assigned_to === assigneeFilter);
    }

    setFilteredAssets(filtered);
  };

  const handleSubmit = async (assetData) => {
    try {
      if (editingAsset) {
        await Asset.update(editingAsset.id, assetData);
        toast.success('Asset updated successfully');
      } else {
        await Asset.create(assetData);
        toast.success('Asset created successfully');
      }
      setShowForm(false);
      setEditingAsset(null);
      loadData();
    } catch (error) {
      console.error('Error saving asset:', error);
      toast.error('Failed to save asset');
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleDelete = async (assetId) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      await Asset.delete(assetId);
      toast.success('Asset deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
    }
  };

  const handleAssign = (asset) => {
    setSelectedAsset(asset);
    setShowAssignmentDialog(true);
  };

  const handleAssignmentSubmit = async (assignmentData) => {
    try {
      await Asset.update(selectedAsset.id, assignmentData);
      toast.success('Asset assignment updated');
      setShowAssignmentDialog(false);
      setSelectedAsset(null);
      loadData();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  const handleCapacityPlanning = (asset) => {
    setSelectedAssetForPlanning(asset.id);
    setShowCapacityPlanner(true);
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.display_name || user?.full_name || email;
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case 'Vehicle': return <Truck className="w-5 h-5" />;
      case 'Tool': return <Wrench className="w-5 h-5" />;
      case 'Equipment': return <Package className="w-5 h-5" />;
      case 'Real Estate': return <Home className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'In Use': return 'bg-blue-100 text-blue-800';
      case 'In Repair': return 'bg-red-100 text-red-800';
      case 'Decommissioned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getTotalValue = () => {
    return assets.reduce((total, asset) => total + (asset.current_value || 0), 0);
  };

  const getMonthlyOperatingCost = () => {
    return assets.reduce((total, asset) => total + (asset.monthly_cost || 0), 0);
  };

  const getAvailableAssets = () => {
    return assets.filter(asset => asset.status === 'Available').length;
  };

  const getInUseAssets = () => {
    return assets.filter(asset => asset.status === 'In Use').length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Company Assets</h1>
            <p className="text-slate-600">Track and manage your company's equipment, vehicles, and tools</p>
          </div>
          <Button 
            onClick={() => { setEditingAsset(null); setShowForm(true); }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Asset
          </Button>
        </div>

        {/* Capacity Planner Modal */}
        {showCapacityPlanner && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Asset Capacity Planner</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setShowCapacityPlanner(false);
                      setSelectedAssetForPlanning(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <AssetCapacityVisualizer
                  assets={assets}
                  products={products}
                  selectedAsset={selectedAssetForPlanning}
                  onAssetSelect={setSelectedAssetForPlanning}
                />
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{assets.length}</p>
                  <p className="text-sm text-slate-600 font-medium">Total Assets</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{getAvailableAssets()}</p>
                  <p className="text-sm text-slate-600 font-medium">Available</p>
                </div>
                <div className="p-2 rounded-xl bg-green-100">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{getInUseAssets()}</p>
                  <p className="text-sm text-slate-600 font-medium">In Use</p>
                </div>
                <UserIcon className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">${getTotalValue().toLocaleString()}</p>
                  <p className="text-sm text-slate-600 font-medium">Total Value</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="assets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assets">Asset Management</TabsTrigger>
            <TabsTrigger value="availability">Availability Calendar</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-6">
            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search assets by name, description, or serial number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/70"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40 bg-white/70">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Vehicle">Vehicle</SelectItem>
                      <SelectItem value="Tool">Tool</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-white/70">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="In Use">In Use</SelectItem>
                      <SelectItem value="In Repair">In Repair</SelectItem>
                      <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger className="w-40 bg-white/70">
                      <SelectValue placeholder="Filter by assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.email}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Assets Grid/Table */}
            {viewMode === 'grid' ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading ? (
                  Array(8).fill(0).map((_, i) => (
                    <div key={i} className="h-64 bg-white/50 rounded-lg animate-pulse" />
                  ))
                ) : filteredAssets.length > 0 ? (
                  filteredAssets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onCapacityPlanning={handleCapacityPlanning}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No assets found</p>
                    <p className="text-slate-400">Adjust your search criteria or add a new asset</p>
                  </div>
                )}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {getAssetIcon(asset.type)}
                              <div>
                                <p className="font-medium">{asset.name}</p>
                                <p className="text-sm text-slate-500">{asset.serial_number}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{asset.type}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(asset.status)}>
                              {asset.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {asset.assigned_to ? getUserName(asset.assigned_to) : 'Unassigned'}
                          </TableCell>
                          <TableCell>{asset.location || 'Not specified'}</TableCell>
                          <TableCell>${(asset.current_value || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEdit(asset)}>
                                  Edit Asset
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAssign(asset)}>
                                  Assign/Reassign
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCapacityPlanning(asset)}>
                                  Capacity Planning
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(asset.id)} className="text-red-600">
                                  Delete Asset
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <AssetAvailabilityCalendar assets={assets} users={users} projects={projects} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Asset Value Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Vehicle', 'Equipment', 'Tool', 'Real Estate', 'Other'].map(type => {
                      const typeAssets = assets.filter(a => a.type === type);
                      const typeValue = typeAssets.reduce((sum, a) => sum + (a.current_value || 0), 0);
                      const percentage = getTotalValue() > 0 ? (typeValue / getTotalValue()) * 100 : 0;
                      
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getAssetIcon(type)}
                            <span className="font-medium">{type}</span>
                            <span className="text-sm text-slate-500">({typeAssets.length})</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${typeValue.toLocaleString()}</p>
                            <p className="text-sm text-slate-500">{percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Monthly Operating Costs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-3xl font-bold text-slate-900">${getMonthlyOperatingCost().toLocaleString()}</p>
                    <p className="text-slate-600">Total monthly recurring costs</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Annual: ${(getMonthlyOperatingCost() * 12).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-3 mt-6">
                    {assets.filter(a => a.monthly_cost > 0).map(asset => (
                      <div key={asset.id} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{asset.name}</span>
                        <span className="text-sm">${asset.monthly_cost}/month</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Forms and Dialogs */}
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

        {showAssignmentDialog && selectedAsset && (
          <AssetAssignmentDialog
            asset={selectedAsset}
            users={users}
            projects={projects}
            onSubmit={handleAssignmentSubmit}
            onCancel={() => {
              setShowAssignmentDialog(false);
              setSelectedAsset(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
