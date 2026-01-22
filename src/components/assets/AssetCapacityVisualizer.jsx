
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Package, 
  Truck, 
  Weight, 
  Maximize, 
  Users, 
  Fuel,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  RotateCcw,
  Layers // New icon for stackable
} from 'lucide-react';
import { toast } from 'sonner';

// Helper function to calculate volume from dimensions
const calculateVolume = (dimensions) => {
  if (!dimensions || !dimensions.length || !dimensions.width || !dimensions.height) return 0;
  return dimensions.length * dimensions.width * dimensions.height;
};

// Helper function to get display color based on utilization
const getUtilizationColor = (percentage) => {
  if (percentage <= 60) return 'text-green-600 bg-green-50';
  if (percentage <= 80) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

// New helper to convert product dimensions to feet if they are in inches
const convertToFeet = (dim) => {
    if (!dim || !dim.length || !dim.width || !dim.height) return { length: 0, width: 0, height: 0 };
    if (dim.unit === 'inches') {
        return {
            length: dim.length / 12,
            width: dim.width / 12,
            height: dim.height / 12
        };
    }
    // Assuming 'feet' or other units are already in a compatible format for volume calculation in cubic feet.
    // This can be expanded for cm, meters if needed.
    return dim;
};


export default function AssetCapacityVisualizer({ 
  assets = [], 
  products = [], 
  selectedAsset, 
  onAssetSelect,
  projectLineItems = [],
  onLoadingPlanChange 
}) {
  const [loadedItems, setLoadedItems] = useState([]);
  const [viewMode, setViewMode] = useState('3d');

  // Filter assets that have capacity information
  const capacityAssets = useMemo(() => {
    return assets.filter(asset => 
      asset.capacity && (
        asset.capacity.weight_limit ||
        (asset.capacity.bed_dimensions && asset.capacity.bed_dimensions.length > 0)
      )
    );
  }, [assets]);

  // Calculate current asset volume
  const assetBedVolume = useMemo(() => {
    const currentAsset = assets.find(a => a.id === selectedAsset);
    if (!currentAsset?.capacity?.bed_dimensions) return 0;
    const bedDims = convertToFeet(currentAsset.capacity.bed_dimensions); // Convert bed dimensions too
    const { length, width, height } = bedDims;
    return length * width * height;
  }, [selectedAsset, assets]);
  
  const usableAssetHeight = useMemo(() => {
    const currentAsset = assets.find(a => a.id === selectedAsset);
    if (!currentAsset?.capacity?.bed_dimensions?.height) return 0;
    // Reserve 15% of height for forklift clearance
    const bedDims = convertToFeet(currentAsset.capacity.bed_dimensions);
    return bedDims.height * 0.85;
  }, [selectedAsset, assets]);

  // Calculate current loading totals
  const loadingTotals = useMemo(() => {
    return loadedItems.reduce((totals, item) => {
      const product = products.find(p => p.id === item.product_id);
      if (!product || !product.logistics) return totals;

      const itemWeight = (product.logistics.weight || 0) * item.quantity;
      const itemDimsInFeet = convertToFeet(product.logistics.dimensions);
      const itemVolume = (itemDimsInFeet.length * itemDimsInFeet.width * itemDimsInFeet.height) * item.quantity;

      return {
        weight: totals.weight + itemWeight,
        volume: totals.volume + itemVolume,
        items: totals.items + item.quantity
      };
    }, { weight: 0, volume: 0, items: 0 });
  }, [loadedItems, products]);

  // Get current asset capacity
  const currentAsset = assets.find(a => a.id === selectedAsset);
  const capacity = currentAsset?.capacity || {};

  // Calculate utilization percentages
  const utilizationPercentages = useMemo(() => {
    if (!currentAsset) return {};
    
    return {
      weight: capacity.weight_limit ? (loadingTotals.weight / capacity.weight_limit) * 100 : 0,
      volume: assetBedVolume > 0 ? (loadingTotals.volume / assetBedVolume) * 100 : 0,
    };
  }, [currentAsset, loadingTotals, capacity, assetBedVolume]);


  const addItemToLoad = (productId, quantity = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if adding this item would exceed capacity
    const newWeight = loadingTotals.weight + ((product.logistics?.weight || 0) * quantity);
    const itemDimsInFeet = convertToFeet(product.logistics?.dimensions);
    const itemVolume = (itemDimsInFeet.length * itemDimsInFeet.width * itemDimsInFeet.height);
    const newVolume = loadingTotals.volume + (itemVolume * quantity);

    if (capacity.weight_limit && newWeight > capacity.weight_limit) {
      toast.error('Adding this item would exceed weight capacity!');
      return;
    }
    
    if (assetBedVolume > 0 && newVolume > assetBedVolume) {
      toast.error('Adding this item would exceed volume capacity!');
      return;
    }

    const existingItem = loadedItems.find(item => item.product_id === productId);
    
    if (existingItem) {
      setLoadedItems(prev => 
        prev.map(item => 
          item.product_id === productId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setLoadedItems(prev => [...prev, { 
        product_id: productId, 
        quantity,
        id: `${productId}-${Date.now()}`
      }]);
    }

    if (onLoadingPlanChange) {
      // Pass a copy of the state after it's updated, not the current stale state
      // This is a common pattern for passing state changes to parent components
      // or for asynchronous operations based on the new state.
      // For immediate effect, you might calculate it directly here,
      // but for consistency with `setLoadedItems`, using a callback or new state reference is better.
      // For now, let's pass `loadedItems` and rely on React's state update mechanism.
      // A more robust solution might pass (prevLoadedItems) => { const newState = calculateNewState(prevLoadedItems); onLoadingPlanChange(newState); return newState; }
      // but for this example, the existing pattern is maintained with the awareness that onLoadingPlanChange
      // might receive the "old" state in this specific tick if not handled carefully.
      // However, the common pattern is to let parent respond to its own props.
    }
  };

  const removeItemFromLoad = (productId, quantity = 1) => {
    setLoadedItems(prev => {
      const newState = prev.map(item => {
        if (item.product_id === productId) {
          const newQuantity = Math.max(0, item.quantity - quantity);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);

      if (onLoadingPlanChange) {
        onLoadingPlanChange(newState);
      }
      return newState;
    });
  };

  const clearAllItems = () => {
    setLoadedItems([]);
    if (onLoadingPlanChange) {
      onLoadingPlanChange([]);
    }
  };

  // 3D Visualization Component
  const ThreeDView = () => {
    if (!currentAsset || !capacity.bed_dimensions || !capacity.bed_dimensions.length) {
      return (
        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
          <p className="text-slate-500">Select an asset with bed dimensions to view 3D visualization</p>
        </div>
      );
    }
  
    const bedDims = convertToFeet(capacity.bed_dimensions);
    const scale = Math.min(300 / (bedDims.length || 1), 200 / (bedDims.width || 1));
  
    return (
      <div className="h-64 flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg relative overflow-hidden p-4" style={{ perspective: '800px' }}>
        <div 
          className="border-2 border-slate-400 bg-slate-200/50 relative transition-transform duration-500"
          style={{
            width: `${bedDims.length * scale}px`,
            height: `${bedDims.width * scale}px`,
            transformStyle: 'preserve-3d',
            transform: 'rotateX(60deg) rotateZ(-45deg)',
          }}
        >
          {/* Floor */}
          <div className="absolute inset-0 bg-slate-300"></div>

          {/* Capacity Fill Indicator */}
          <div 
            className={`absolute bottom-0 left-0 right-0 transition-all duration-500 opacity-30 ${
              utilizationPercentages.volume > 80 ? 'bg-red-500' : 
              utilizationPercentages.volume > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ height: '100%', transform: `scaleY(${Math.min(100, utilizationPercentages.volume) / 100})`, transformOrigin: 'bottom' }}
          />
  
          {/* Items Representation */}
          {loadedItems.map((item, index) => {
            const product = products.find(p => p.id === item.product_id);
            if (!product?.logistics?.dimensions) return null;
  
            const itemDims = convertToFeet(product.logistics.dimensions);
            const itemScale = scale * 0.9;
            const isStackable = product.logistics.stackable;

            const maxStack = isStackable && itemDims.height > 0
                ? Math.floor(usableAssetHeight / itemDims.height)
                : 1;
            
            const numStacks = itemDims.height > 0 ? Math.ceil(item.quantity / maxStack) : item.quantity;
            // Ensure numStacks is at least 1 for non-stackable items or if quantity is 0
            const actualNumStacks = Math.max(1, numStacks);

            return Array.from({ length: Math.min(actualNumStacks, 9) }).map((_, stackIndex) => { // Limit visual items
                // This is a simplified visual. In a real 3D renderer, items would be precisely placed.
                // Here, we just stack them visually on top of each other at fixed x,y positions.
                const itemsInThisStack = (stackIndex === actualNumStacks - 1) && (item.quantity % maxStack !== 0)
                    ? (item.quantity % maxStack)
                    : maxStack;

                // Adjust vertical position to simulate stacking
                const zOffset = stackIndex * (itemDims.height * itemScale * 0.8); // 0.8 to make them look like they fit
                const xOffset = (index % 3) * (bedDims.length * scale / 4) + (bedDims.length * scale / 8);
                const yOffset = Math.floor(index / 3) * (bedDims.width * scale / 4) + (bedDims.width * scale / 8);

                return (
                    <div
                    key={`${item.id}-${stackIndex}`}
                    className="absolute bg-blue-500/80 border border-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-semibold"
                    style={{
                      width: `${Math.max(15, itemDims.length * itemScale)}px`,
                      height: `${Math.max(10, itemDims.width * itemScale)}px`,
                      left: `${xOffset}px`,
                      top: `${yOffset}px`,
                      transform: `translateZ(${zOffset}px)`,
                      boxShadow: '2px 2px 5px rgba(0,0,0,0.3)'
                    }}
                    title={`${product.name} - ${item.quantity} units`}
                  >
                   {isStackable && <Layers className="w-3 h-3 absolute -top-1 -right-1 text-white bg-blue-700 rounded-full p-0.5" />}
                  </div>
                )
            });
          })}

        </div>
        <div className="absolute bottom-4 right-4 text-right">
          <div className={`px-2 py-1 rounded text-sm font-semibold ${getUtilizationColor(utilizationPercentages.volume)}`}>
            {utilizationPercentages.volume.toFixed(1)}% Volume Used
          </div>
        </div>
        <div className="absolute top-4 left-4 text-xs text-slate-600">
            {bedDims.length.toFixed(1)}' L × {bedDims.width.toFixed(1)}' W × {bedDims.height.toFixed(1)}' H
        </div>
      </div>
    );
  };

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
      {loadedItems.map((item) => {
        const product = products.find(p => p.id === item.product_id);
        if (!product) return null;

        const itemWeight = (product.logistics?.weight || 0) * item.quantity;
        const itemDimsInFeet = convertToFeet(product.logistics?.dimensions);
        const itemVolume = (itemDimsInFeet.length * itemDimsInFeet.width * itemDimsInFeet.height) * item.quantity;

        return (
          <Card key={item.id} className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold">×{item.quantity}</span>
            </div>
            <h4 className="font-medium text-sm mb-1 truncate">{product.name}</h4>
            <div className="text-xs text-slate-600 space-y-1">
              {itemWeight > 0 && <div>Weight: {itemWeight.toFixed(1)} lbs</div>}
              {itemVolume > 0 && <div>Volume: {itemVolume.toFixed(1)} ft³</div>}
            </div>
            <div className="flex gap-1 mt-2">
              <Button
                size="sm" 
                variant="outline" 
                onClick={() => removeItemFromLoad(item.product_id, 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Button
                size="sm" 
                variant="outline" 
                onClick={() => addItemToLoad(item.product_id, 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
  
  return (
    <div className="space-y-6">
      {/* Asset Selection and Capacity Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Asset Capacity Planner
            </CardTitle>
            <div className="flex gap-2">
              <Select value={selectedAsset || ''} onValueChange={onAssetSelect}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Asset" />
                </SelectTrigger>
                <SelectContent>
                  {capacityAssets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllItems}
                disabled={loadedItems.length === 0}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {currentAsset && (
          <CardContent>
            {/* Capacity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {capacity.weight_limit && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Weight className="w-4 h-4" />
                      Weight
                    </span>
                    <span className="text-sm">
                      {loadingTotals.weight.toFixed(1)} / {capacity.weight_limit} lbs
                    </span>
                  </div>
                  <Progress value={utilizationPercentages.weight} className="h-2" />
                  <div className={`text-xs text-center ${getUtilizationColor(utilizationPercentages.weight)}`}>
                    {utilizationPercentages.weight.toFixed(1)}% Capacity
                  </div>
                </div>
              )}

              {assetBedVolume > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Maximize className="w-4 h-4" />
                      Volume
                    </span>
                    <span className="text-sm">
                      {loadingTotals.volume.toFixed(1)} / {assetBedVolume.toFixed(1)} ft³
                    </span>
                  </div>
                  <Progress value={utilizationPercentages.volume} className="h-2" />
                  <div className={`text-xs text-center ${getUtilizationColor(utilizationPercentages.volume)}`}>
                    {utilizationPercentages.volume.toFixed(1)}% Capacity
                  </div>
                </div>
              )}

              {capacity.passenger_capacity && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <Users className="w-4 h-4" />
                      Passengers
                    </span>
                    <span className="text-sm">
                      0 / {capacity.passenger_capacity}
                    </span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <div className="text-xs text-center text-slate-600">
                    Available
                  </div>
                </div>
              )}
            </div>

            {/* Capacity Warnings */}
            {(utilizationPercentages.weight > 100 || utilizationPercentages.volume > 100) && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700 font-medium">
                  Warning: Current load exceeds asset capacity!
                </span>
              </div>
            )}

            {(utilizationPercentages.weight > 80 || utilizationPercentages.volume > 80) && 
             (utilizationPercentages.weight <= 100 && utilizationPercentages.volume <= 100) && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700 font-medium">
                  Near capacity limit. Consider using additional vehicle.
                </span>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Visualization Tabs */}
      {currentAsset && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Load Visualization</CardTitle>
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                <Button 
                  variant={viewMode === '3d' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('3d')}
                >
                  3D View
                </Button>
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === '3d' ? <ThreeDView /> : <GridView />}
          </CardContent>
        </Card>
      )}

      {/* Available Products for Loading */}
      {currentAsset && (
        <Card>
          <CardHeader>
            <CardTitle>Available Products & Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {products
                .filter(product => product.logistics && (product.logistics.weight || (product.logistics.dimensions && product.logistics.dimensions.length > 0)))
                .map(product => {
                  const weight = product.logistics.weight || 0;
                  const dimsInFeet = convertToFeet(product.logistics.dimensions);
                  const volume = dimsInFeet.length * dimsInFeet.width * dimsInFeet.height;
                  const loadedItem = loadedItems.find(item => item.product_id === product.id);
                  const isStackable = product.logistics.stackable;

                  return (
                    <Card key={product.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow relative">
                      {isStackable && (
                        <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="secondary" className="absolute top-2 right-2 bg-blue-100 text-blue-800 p-1">
                              <Layers className="w-3 h-3" />
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This item is stackable.</p>
                          </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm truncate pr-8">{product.name}</h4>
                        {loadedItem && (
                          <Badge variant="secondary">×{loadedItem.quantity}</Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 space-y-1 mb-3">
                        {weight > 0 && <div>Weight: {weight} lbs</div>}
                        {volume > 0 && <div>Volume: {volume.toFixed(2)} ft³</div>}
                        {product.logistics.dimensions && (
                          <div>
                            Size: {product.logistics.dimensions.length}" × {product.logistics.dimensions.width}" × {product.logistics.dimensions.height}"
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => addItemToLoad(product.id, 1)}
                        disabled={
                          (capacity.weight_limit && loadingTotals.weight + weight > capacity.weight_limit) ||
                          (assetBedVolume > 0 && loadingTotals.volume + volume > assetBedVolume)
                        }
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add to Load
                      </Button>
                    </Card>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
