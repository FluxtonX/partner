import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, DollarSign, Truck, Calendar } from 'lucide-react';

export default function VendorAssetCard({ asset, vendors, onEdit, onDelete }) {
  const vendor = vendors.find(v => v.id === asset.vendor_integration_id);
  const basePricing = asset.pricing_structure?.[0] || {};

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{asset.asset_name}</h3>
            <p className="text-sm text-slate-600">{asset.make} {asset.model} {asset.year}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(asset)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => onDelete(asset.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Asset Image */}
        {asset.image_urls?.[0] && (
          <img 
            src={asset.image_urls[0]} 
            alt={asset.asset_name}
            className="w-full h-48 object-cover rounded-lg"
          />
        )}

        {/* Status & Type */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getStatusColor(asset.availability_status)}>
            {asset.availability_status}
          </Badge>
          <Badge variant="outline">{asset.asset_type}</Badge>
          {asset.fuel_type && asset.fuel_type !== 'none' && (
            <Badge variant="outline" className="capitalize">
              {asset.fuel_type}
            </Badge>
          )}
        </div>

        {/* Vendor Info */}
        <div className="text-sm text-slate-600">
          <p><strong>Vendor:</strong> {vendor?.vendor_name || 'Unknown'}</p>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4" />
          <span>{asset.location || 'Location not specified'}</span>
        </div>

        {/* Pricing */}
        <div className="bg-slate-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium">Starting Price</span>
          </div>
          <p className="text-lg font-bold text-green-600">
            ${basePricing.rate || 0}/{basePricing.duration_type || 'day'}
          </p>
          {basePricing.deposit_required > 0 && (
            <p className="text-sm text-slate-600">
              + ${basePricing.deposit_required} deposit
            </p>
          )}
        </div>

        {/* Delivery Info */}
        {asset.delivery_available && (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <Truck className="w-4 h-4" />
            <span>Delivery available (${asset.delivery_fee})</span>
          </div>
        )}

        {/* Requirements */}
        <div className="flex flex-wrap gap-1">
          {asset.requires_license && (
            <Badge variant="outline" className="text-xs">
              License Required
            </Badge>
          )}
          {asset.insurance_required && (
            <Badge variant="outline" className="text-xs">
              Insurance Required
            </Badge>
          )}
        </div>

        {/* Tags */}
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {asset.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {asset.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{asset.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Description */}
        {asset.description && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {asset.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}