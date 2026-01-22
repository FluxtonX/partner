import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, Clock, DollarSign, Fuel, Route, Calculator } from 'lucide-react';
import { calculateDriveTime } from '@/api/functions';
import { Asset, BusinessSettings } from '@/api/entities';

export default function DriveTimeCalculator({ 
  project, 
  assignedUsers = [], 
  onDriveTimeCalculated,
  className = "" 
}) {
  const [driveData, setDriveData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [businessAddress, setBusinessAddress] = useState('');
  const [vehicleAssets, setVehicleAssets] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      // Get business address
      const businessSettings = await BusinessSettings.list();
      if (businessSettings.length > 0 && businessSettings[0].business_address) {
        setBusinessAddress(businessSettings[0].business_address);
      }

      // Get vehicle assets
      const assets = await Asset.filter({ type: 'Vehicle' });
      setVehicleAssets(assets || []);
      
      // Auto-select first vehicle if available
      if (assets && assets.length > 0) {
        setSelectedVehicleId(assets[0].id);
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    }
  };

  const handleCalculateDriveTime = async () => {
    if (!businessAddress || !project?.site_address) {
      alert('Business address and project address are required');
      return;
    }

    setIsCalculating(true);
    try {
      const response = await calculateDriveTime({
        businessAddress,
        projectAddress: project.site_address,
        assignedUsers: assignedUsers.map(user => user.email || user),
        vehicleAssetId: selectedVehicleId
      });

      if (response.data) {
        setDriveData(response.data);
        if (onDriveTimeCalculated) {
          onDriveTimeCalculated(response.data);
        }
      }
    } catch (error) {
      console.error('Error calculating drive time:', error);
      alert('Failed to calculate drive time. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  if (!businessAddress || !project?.site_address) {
    return (
      <Card className={`border-amber-200 bg-amber-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Route className="w-4 h-4" />
            <span className="text-sm">
              {!businessAddress && "Business address not set. "}
              {!project?.site_address && "Project address not set. "}
              Drive time calculation unavailable.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Route className="w-5 h-5" />
          Drive Time & Costs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vehicle Selection */}
        {vehicleAssets.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Vehicle:</label>
            <select 
              value={selectedVehicleId || ''} 
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Default Vehicle (15 MPG)</option>
              {vehicleAssets.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} {vehicle.description && `- ${vehicle.description}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Calculate Button */}
        <Button 
          onClick={handleCalculateDriveTime} 
          disabled={isCalculating}
          className="w-full"
        >
          <Calculator className="w-4 h-4 mr-2" />
          {isCalculating ? 'Calculating...' : 'Calculate Drive Time & Costs'}
        </Button>

        {/* Results */}
        {driveData && (
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600">One Way</p>
                  <p className="font-semibold">{driveData.drive_time_minutes} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm text-slate-600">Round Trip</p>
                  <p className="font-semibold">{driveData.round_trip_time_minutes} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-slate-600">Distance</p>
                  <p className="font-semibold">{driveData.round_trip_miles.toFixed(1)} miles</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-sm text-slate-600">Gas Cost</p>
                  <p className="font-semibold">${driveData.vehicle.gas_cost.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                <span className="font-medium">{driveData.vehicle.name}</span>
              </div>
              <Badge variant="outline">{driveData.vehicle.mpg} MPG</Badge>
            </div>

            {/* Labor Costs */}
            {driveData.labor_costs.user_breakdown.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Drive Labor Costs
                </h4>
                {driveData.labor_costs.user_breakdown.map(user => (
                  <div key={user.user_email} className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm">{user.user_name}</span>
                    <span className="font-medium">${user.drive_cost.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-2 bg-indigo-50 rounded border-indigo-200 border">
                  <span className="font-semibold">Total Additional Cost</span>
                  <span className="font-bold text-indigo-700">${driveData.total_additional_cost.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Route Description */}
            {driveData.route_description && (
              <div className="text-sm text-slate-600 p-3 bg-white rounded border">
                <p className="font-medium mb-1">Route:</p>
                <p>{driveData.route_description}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}