import React, { useState, useEffect } from 'react';
import { ProductOrService, User, Alert } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Scale, Package, AlertTriangle, Plus, Minus, BarChart3, TrendingDown, TrendingUp, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import InventoryAdjustment from '../components/inventory/InventoryAdjustment';
import ScaleInput from '../components/inventory/ScaleInput';

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [showScaleInput, setShowScaleInput] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Load all inventory-tracked items
      const allProducts = await ProductOrService.filter({ 
        business_id: user.current_business_id,
        inventory_tracked: true 
      }, '-created_date');
      
      setInventoryItems(allProducts);
      
      // Filter low stock items
      const lowStock = allProducts.filter(item => 
        (item.current_stock || 0) <= (item.minimum_stock || 0)
      );
      setLowStockItems(lowStock);

      // Create alerts for low stock items (admin only)
      if (user.role === 'admin') {
        await createLowStockAlerts(lowStock, user);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createLowStockAlerts = async (lowStockItems, user) => {
    for (const item of lowStockItems) {
      try {
        // Check if alert already exists for this item today
        const today = new Date().toISOString().split('T')[0];
        const existingAlerts = await Alert.filter({
          user_email: user.email,
          related_id: item.id,
          type: 'low_stock'
        });

        const todayAlert = existingAlerts.find(alert => 
          alert.created_date.startsWith(today)
        );

        if (!todayAlert) {
          await Alert.create({
            user_email: user.email,
            title: 'Low Stock Alert',
            message: `${item.name} is running low. Current stock: ${item.current_stock || 0}, Minimum: ${item.minimum_stock || 0}`,
            type: 'low_stock',
            priority: 'high',
            related_id: item.id,
            related_type: 'product'
          });
        }
      } catch (error) {
        console.error('Error creating low stock alert:', error);
      }
    }
  };

  const handleStockAdjustment = (item) => {
    setSelectedItem(item);
    setShowAdjustment(true);
  };

  const handleScaleInput = (item) => {
    setSelectedItem(item);
    setShowScaleInput(true);
  };

  const onAdjustmentComplete = () => {
    setShowAdjustment(false);
    setShowScaleInput(false);
    setSelectedItem(null);
    loadInventoryData();
  };

  const getStockStatus = (item) => {
    const current = item.current_stock || 0;
    const minimum = item.minimum_stock || 0;
    
    if (current <= 0) return { status: 'out', color: 'bg-red-500', text: 'Out of Stock' };
    if (current <= minimum) return { status: 'low', color: 'bg-orange-500', text: 'Low Stock' };
    if (current <= minimum * 1.5) return { status: 'medium', color: 'bg-yellow-500', text: 'Medium' };
    return { status: 'good', color: 'bg-green-500', text: 'In Stock' };
  };

  const getTotalValue = () => {
    return inventoryItems.reduce((total, item) => 
      total + ((item.current_stock || 0) * (item.cost_price || 0)), 0
    );
  };

  const filteredItems = inventoryItems.filter(item => 
    filterCategory === 'all' || item.category === filterCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Inventory Management</h1>
            <p className="text-slate-600">Track stock levels, manage inventory, and monitor thresholds</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{inventoryItems.length}</p>
                  <p className="text-sm text-slate-600 font-medium">Total Items</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
                  <p className="text-sm text-slate-600 font-medium">Low Stock Items</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">${getTotalValue().toLocaleString()}</p>
                  <p className="text-sm text-slate-600 font-medium">Total Value</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {inventoryItems.reduce((sum, item) => sum + (item.current_stock || 0), 0)}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Total Units</p>
                </div>
                <Scale className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inventory">All Inventory</TabsTrigger>
            <TabsTrigger value="low-stock" className="flex items-center gap-2">
              Low Stock 
              {lowStockItems.length > 0 && (
                <Badge variant="destructive" className="ml-1">{lowStockItems.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4 items-center">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="materials">Materials</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Inventory Table */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventory Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Min Threshold</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                        </TableRow>
                      ) : filteredItems.length > 0 ? (
                        filteredItems.map((item) => {
                          const stockStatus = getStockStatus(item);
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {item.image_urls?.[0] && (
                                    <img 
                                      src={item.image_urls[0]} 
                                      alt={item.name}
                                      className="w-10 h-10 rounded-md object-cover"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-slate-500">{item.barcode}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">{item.category}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.current_stock || 0}</span>
                                  {item.unit === 'lb' || item.unit === 'kg' || item.unit === 'oz' ? (
                                    <Scale className="w-4 h-4 text-purple-500" />
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell>{item.minimum_stock || 0}</TableCell>
                              <TableCell>
                                ${((item.current_stock || 0) * (item.cost_price || 0)).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${stockStatus.color} text-white`}>
                                  {stockStatus.text}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStockAdjustment(item)}
                                  >
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                  {(item.unit === 'lb' || item.unit === 'kg' || item.unit === 'oz') && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleScaleInput(item)}
                                    >
                                      <Scale className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No inventory items found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="low-stock" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  Low Stock Items Requiring Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockItems.length > 0 ? (
                  <div className="space-y-4">
                    {lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-4">
                          {item.image_urls?.[0] && (
                            <img 
                              src={item.image_urls[0]} 
                              alt={item.name}
                              className="w-12 h-12 rounded-md object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-red-900">{item.name}</p>
                            <p className="text-sm text-red-700">
                              Current: {item.current_stock || 0} {item.unit} | 
                              Minimum: {item.minimum_stock || 0} {item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStockAdjustment(item)}
                            className="border-red-300 hover:bg-red-50"
                          >
                            Restock
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-green-600">
                    <Package className="w-16 h-16 mx-auto mb-4 text-green-400" />
                    <p className="text-lg font-medium">All items are adequately stocked!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showAdjustment && selectedItem && (
          <InventoryAdjustment
            item={selectedItem}
            onComplete={onAdjustmentComplete}
            onCancel={() => setShowAdjustment(false)}
          />
        )}

        {showScaleInput && selectedItem && (
          <ScaleInput
            item={selectedItem}
            onComplete={onAdjustmentComplete}
            onCancel={() => setShowScaleInput(false)}
          />
        )}
      </div>
    </div>
  );
}