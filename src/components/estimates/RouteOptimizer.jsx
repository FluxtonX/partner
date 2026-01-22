import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Route, ArrowUpDown, Loader2, Clock, Truck, Navigation } from 'lucide-react';
import { optimizeRoute } from '@/api/functions';
import { toast } from 'sonner';

export default function RouteOptimizer({ lineItems, onRouteOptimized }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [routeReversed, setRouteReversed] = useState(false);

  const optimizeDeliveryRoute = async (reverse = false) => {
    setIsOptimizing(true);
    try {
      const response = await optimizeRoute({
        lineItems,
        reverse,
        // You could get user's current location here
        startLocation: {
          latitude: 39.8283,
          longitude: -98.5795,
          address: 'Business Location'
        }
      });

      if (response.data.success) {
        setOptimizedRoute(response.data);
        setRouteReversed(reverse);
        onRouteOptimized && onRouteOptimized(response.data);
        toast.success(`Route optimized! Total distance: ${response.data.totalDistance} miles`);
      } else {
        toast.error(response.data.error || 'Failed to optimize route');
      }
    } catch (error) {
      console.error('Route optimization error:', error);
      toast.error('Failed to optimize route');
    } finally {
      setIsOptimizing(false);
    }
  };

  const reverseRoute = () => {
    optimizeDeliveryRoute(!routeReversed);
  };

  if (!lineItems || lineItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="w-5 h-5" />
          Route Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => optimizeDeliveryRoute(false)}
            disabled={isOptimizing}
            className="flex items-center gap-2"
          >
            {isOptimizing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
          </Button>
          
          {optimizedRoute && (
            <Button
              variant="outline"
              onClick={reverseRoute}
              disabled={isOptimizing}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              {routeReversed ? 'Closest First' : 'Furthest First'}
            </Button>
          )}
        </div>

        {optimizedRoute && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">Total Distance:</span>
                  <Badge variant="outline">{optimizedRoute.totalDistance} miles</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">Est. Time:</span>
                  <Badge variant="outline">{optimizedRoute.estimatedTime} minutes</Badge>
                </div>
              </div>
              {routeReversed && (
                <Badge className="bg-blue-100 text-blue-800">Route Reversed</Badge>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Optimized Route:</h4>
              {optimizedRoute.optimizedRoute.map((stop, index) => (
                <div key={stop.product_id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex items-center justify-center w-6 h-6 bg-emerald-600 text-white text-sm rounded-full font-medium">
                    {stop.route_order}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{stop.product_name}</div>
                    <div className="text-sm text-slate-600">
                      {stop.address}, {stop.city}, {stop.state} {stop.zip}
                    </div>
                    {stop.logistics && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {stop.logistics.delivery_required && (
                          <Badge variant="outline" className="text-xs">
                            <Truck className="w-3 h-3 mr-1" />
                            Delivery Required
                          </Badge>
                        )}
                        {stop.logistics.requires_appointment && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Appointment Required
                          </Badge>
                        )}
                        {stop.logistics.delivery_window_start && (
                          <Badge variant="outline" className="text-xs">
                            {stop.logistics.delivery_window_start} - {stop.logistics.delivery_window_end}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    {stop.distance_from_previous > 0 && (
                      <div>{stop.distance_from_previous.toFixed(1)} mi</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {optimizedRoute.optimizedRoute.length === 0 && (
              <Alert>
                <AlertDescription>
                  No products with supplier addresses found in this estimate. Add supplier addresses to products/services to enable route optimization.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}