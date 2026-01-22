import React, { useState, useEffect } from 'react';
import { Asset, ProductOrService } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Truck, 
  Package, 
  Route, 
  Clock, 
  MapPin,
  Calculator,
  Users,
  AlertTriangle
} from 'lucide-react';
import { optimizeRoute } from '@/api/functions';
import AssetCapacityVisualizer from '../assets/AssetCapacityVisualizer';

export default function LogisticsPlanner({ 
  project, 
  lineItems = [], 
  onLogisticsPlanChange 
}) {
  const [assets, setAssets] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [logisticsPlan, setLogisticsPlan] = useState({
    routes: [],
    assetAllocations: {},
    deliverySchedule: []
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    loadAssets();
    loadProducts();
  }, []);

  const loadAssets = async () => {
    try {
      const assetData = await Asset.filter({ 
        type: 'Vehicle',
        status: 'Available' 
      });
      setAssets(assetData);
    } catch (error) {
      console.error('Error loading assets:', error);
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

  // Get products that require logistics (pickup/delivery)
  const logisticsItems = lineItems.filter(item => {
    const product = products.find(p => p.id === item.product_service_id);
    return product?.logistics && (
      product.logistics.delivery_required || 
      product.logistics.pickup_required ||
      product.supplier_address
    );
  });

  // Group items by supplier/location
  const locationGroups = logisticsItems.reduce((groups, item) => {
    const product = products.find(p => p.id === item.product_service_id);
    const address = product?.supplier_address || 'Unknown Location';
    
    if (!groups[address]) {
      groups[address] = {
        address,
        location: product?.supplier_location,
        items: [],
        totalWeight: 0,
        totalVolume: 0,
        requiresDelivery: false,
        requiresPickup: false
      };
    }

    const weight = (product?.logistics?.weight || 0) * item.quantity;
    const volume = calculateVolume(product?.logistics?.dimensions) * item.quantity;

    groups[address].items.push({ ...item, product });
    groups[address].totalWeight += weight;
    groups[address].totalVolume += volume;
    groups[address].requiresDelivery = groups[address].requiresDelivery || product?.logistics?.delivery_required;
    groups[address].requiresPickup = groups[address].requiresPickup || product?.logistics?.pickup_required;

    return groups;
  }, {});

  const calculateVolume = (dimensions) => {
    if (!dimensions) return 0;
    return (dimensions.length || 0) * (dimensions.width || 0) * (dimensions.height || 0);
  };

  const optimizeLogisticsRoute = async () => {
    if (!project?.site_location) {
      alert('Project site location is required for route optimization');
      return;
    }

    setIsOptimizing(true);
    try {
      const locations = Object.values(locationGroups)
        .filter(group => group.location)
        .map(group => ({
          address: group.address,
          latitude: group.location.latitude,
          longitude: group.location.longitude,
          items: group.items.map(item => item.id),
          totalWeight: group.totalWeight,
          totalVolume: group.totalVolume,
          requiresDelivery: group.requiresDelivery,
          requiresPickup: group.requiresPickup
        }));

      const startLocation = {
        address: project.site_address,
        latitude: project.site_location.latitude,
        longitude: project.site_location.longitude
      };

      const routeResponse = await optimizeRoute({
        locations,
        startLocation
      });

      if (routeResponse.data.success) {
        const optimizedPlan = {
          ...logisticsPlan,
          routes: [{
            id: `route-${Date.now()}`,
            asset_id: selectedAsset,
            stops: routeResponse.data.optimized_route,
            total_distance: routeResponse.data.total_distance_miles,
            estimated_time: routeResponse.data.estimated_total_time_minutes,
            ai_suggestions: routeResponse.data.ai_suggestions
          }]
        };

        setLogisticsPlan(optimizedPlan);
        if (onLogisticsPlanChange) {
          onLogisticsPlanChange(optimizedPlan);
        }
      }
    } catch (error) {
      console.error('Error optimizing route:', error);
      alert('Failed to optimize route. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleLoadingPlanChange = (loadingPlan) => {
    const updatedPlan = {
      ...logisticsPlan,
      assetAllocations: {
        ...logisticsPlan.assetAllocations,
        [selectedAsset]: loadingPlan
      }
    };
    setLogisticsPlan(updatedPlan);
    if (onLogisticsPlanChange) {
      onLogisticsPlanChange(updatedPlan);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logistics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Logistics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{logisticsItems.length}</div>
              <div className="text-sm text-blue-700">Items Requiring Logistics</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Object.keys(locationGroups).length}</div>
              <div className="text-sm text-green-700">Supplier Locations</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{assets.length}</div>
              <div className="text-sm text-purple-700">Available Vehicles</div>
            </div>
          </div>

          {logisticsItems.length > 0 && (
            <div className="mt-4">
              <Button 
                onClick={optimizeLogisticsRoute}
                disabled={isOptimizing || !selectedAsset}
                className="w-full"
              >
                {isOptimizing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing Route...
                  </>
                ) : (
                  <>
                    <Route className="w-4 h-4 mr-2" />
                    Optimize Logistics Route
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Planning */}
      {logisticsItems.length > 0 && (
        <Tabs defaultValue="capacity" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
            <TabsTrigger value="locations">Supplier Locations</TabsTrigger>
            <TabsTrigger value="routes">Route Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="capacity" className="space-y-4">
            <AssetCapacityVisualizer
              assets={assets}
              products={products}
              selectedAsset={selectedAsset}
              onAssetSelect={setSelectedAsset}
              projectLineItems={lineItems}
              onLoadingPlanChange={handleLoadingPlanChange}
            />
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <div className="grid gap-4">
              {Object.values(locationGroups).map((group, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {group.address}
                        </CardTitle>
                        <div className="flex gap-2 mt-2">
                          {group.requiresPickup && (
                            <Badge variant="outline" className="bg-blue-50">Pickup Required</Badge>
                          )}
                          {group.requiresDelivery && (
                            <Badge variant="outline" className="bg-green-50">Delivery Available</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-600">
                        <div>Weight: {group.totalWeight.toFixed(1)} lbs</div>
                        <div>Volume: {group.totalVolume.toFixed(1)} ft³</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {group.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                            <span className="font-medium">{item.product?.name}</span>
                            <span className="text-sm text-slate-600 ml-2">×{item.quantity}</span>
                          </div>
                          <div className="text-sm text-slate-600">
                            {item.product?.logistics?.lead_time_days && (
                              <span>Lead time: {item.product.logistics.lead_time_days} days</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
            {logisticsPlan.routes.length > 0 ? (
              <div className="space-y-4">
                {logisticsPlan.routes.map((route, index) => (
                  <Card key={route.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Route className="w-5 h-5" />
                        Optimized Route #{index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">
                            {route.total_distance.toFixed(1)} mi
                          </div>
                          <div className="text-sm text-blue-700">Total Distance</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-xl font-bold text-green-600">
                            {Math.floor(route.estimated_time / 60)}h {route.estimated_time % 60}m
                          </div>
                          <div className="text-sm text-green-700">Estimated Time</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-xl font-bold text-purple-600">
                            {route.stops.length}
                          </div>
                          <div className="text-sm text-purple-700">Stops</div>
                        </div>
                      </div>

                      {/* Route Stops */}
                      <div className="space-y-2">
                        <h4 className="font-semibold">Route Stops:</h4>
                        {route.stops.map((stop, stopIndex) => (
                          <div key={stopIndex} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {stopIndex + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{stop.address}</div>
                              {stop.distance_from_previous > 0 && (
                                <div className="text-sm text-slate-600">
                                  {stop.distance_from_previous.toFixed(1)} mi • {stop.estimated_time} min from previous
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* AI Suggestions */}
                      {route.ai_suggestions && (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <h4 className="font-semibold text-amber-800 mb-2">AI Route Suggestions:</h4>
                          <div className="space-y-2 text-sm text-amber-700">
                            {route.ai_suggestions.suggested_departure_time && (
                              <div>🕒 Suggested departure: {route.ai_suggestions.suggested_departure_time}</div>
                            )}
                            {route.ai_suggestions.traffic_considerations && (
                              <div>🚦 Traffic: {route.ai_suggestions.traffic_considerations}</div>
                            )}
                            {route.ai_suggestions.logistical_tips && (
                              <div>💡 Tips: {route.ai_suggestions.logistical_tips.join(', ')}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Route className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No Routes Optimized Yet</h3>
                  <p className="text-slate-500 mb-4">
                    Select an asset and click "Optimize Logistics Route" to generate an efficient delivery/pickup plan.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}