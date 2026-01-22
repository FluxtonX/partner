import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Package, User, MapPin } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday, isSameDay } from 'date-fns';

export default function AssetAvailabilityCalendar({ assets = [], users = [], projects = [] }) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedAsset, setSelectedAsset] = useState(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const getAssetStatus = (asset) => {
    switch (asset.status) {
      case 'Available': return { color: 'bg-green-100 text-green-800', label: 'Available' };
      case 'In Use': return { color: 'bg-blue-100 text-blue-800', label: 'In Use' };
      case 'In Repair': return { color: 'bg-red-100 text-red-800', label: 'In Repair' };
      case 'Decommissioned': return { color: 'bg-gray-100 text-gray-800', label: 'Decommissioned' };
      default: return { color: 'bg-slate-100 text-slate-800', label: 'Unknown' };
    }
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.display_name || user?.full_name || email;
  };

  const getAssetIcon = (type) => {
    const iconProps = { className: "w-4 h-4" };
    switch (type) {
      case 'Vehicle': return <Package {...iconProps} />;
      case 'Tool': return <Package {...iconProps} />;
      case 'Equipment': return <Package {...iconProps} />;
      default: return <Package {...iconProps} />;
    }
  };

  const filteredAssets = selectedAsset 
    ? assets.filter(asset => asset.id === selectedAsset) 
    : assets;

  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Asset Availability Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium text-sm">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedAsset === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAsset(null)}
            >
              All Assets
            </Button>
            {assets.map(asset => (
              <Button
                key={asset.id}
                variant={selectedAsset === asset.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAsset(asset.id)}
                className="flex items-center gap-1"
              >
                {getAssetIcon(asset.type)}
                {asset.name}
              </Button>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="font-semibold text-sm text-slate-600 p-2">Asset</div>
                {weekDays.map((day, index) => (
                  <div 
                    key={index} 
                    className={`text-center p-2 rounded-lg ${
                      isToday(day) ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-slate-600'
                    }`}
                  >
                    <div className="font-semibold text-sm">{format(day, 'EEE')}</div>
                    <div className="text-xs">{format(day, 'd')}</div>
                  </div>
                ))}
              </div>

              {/* Asset Rows */}
              <div className="space-y-2">
                {filteredAssets.map(asset => {
                  const status = getAssetStatus(asset);
                  return (
                    <div key={asset.id} className="grid grid-cols-8 gap-2">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getAssetIcon(asset.type)}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{asset.name}</p>
                            <p className="text-xs text-slate-500 truncate">{asset.type}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge className={`${status.color} text-xs`}>
                            {status.label}
                          </Badge>
                        </div>
                        {asset.assigned_to && (
                          <div className="mt-1 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500 truncate">
                              {getUserName(asset.assigned_to)}
                            </span>
                          </div>
                        )}
                        {asset.location && (
                          <div className="mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500 truncate">
                              {asset.location}
                            </span>
                          </div>
                        )}
                      </div>

                      {weekDays.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`p-2 rounded-lg border-2 border-dashed min-h-[80px] ${
                            asset.status === 'Available' 
                              ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                              : asset.status === 'In Use'
                              ? 'border-blue-200 bg-blue-50'
                              : asset.status === 'In Repair'
                              ? 'border-red-200 bg-red-50'
                              : 'border-gray-200 bg-gray-50'
                          } transition-colors cursor-pointer`}
                        >
                          <div className="text-center">
                            <div className={`inline-block w-3 h-3 rounded-full ${
                              asset.status === 'Available' ? 'bg-green-500' :
                              asset.status === 'In Use' ? 'bg-blue-500' :
                              asset.status === 'In Repair' ? 'bg-red-500' :
                              'bg-gray-500'
                            }`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-500 mb-2">No assets to display</h3>
              <p className="text-slate-400">Add some assets to see their availability</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm">In Use</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">In Repair</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
              <span className="text-sm">Decommissioned</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}