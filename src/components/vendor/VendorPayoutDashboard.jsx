import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, DollarSign, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function VendorPayoutDashboard({ payouts, vendors, rentals, onUpdate }) {
  const [selectedVendor, setSelectedVendor] = useState('all');

  const filteredPayouts = selectedVendor === 'all' 
    ? payouts 
    : payouts.filter(p => p.vendor_integration_id === selectedVendor);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPayouts = payouts.reduce((sum, payout) => sum + (payout.vendor_payout_amount || 0), 0);
  const totalCommission = payouts.reduce((sum, payout) => sum + (payout.platform_commission_total || 0), 0);
  const pendingPayouts = payouts.filter(p => p.payout_status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-emerald-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold">${totalCommission.toFixed(2)}</div>
                <p className="text-xs text-slate-600">Total Platform Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold">${totalPayouts.toFixed(2)}</div>
                <p className="text-xs text-slate-600">Total Vendor Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold">{payouts.length}</div>
                <p className="text-xs text-slate-600">Total Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-yellow-600">{pendingPayouts}</div>
                <p className="text-xs text-slate-600">Pending Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Payout History</h2>
        <Select value={selectedVendor} onValueChange={setSelectedVendor}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by vendor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {vendors.map(vendor => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.vendor_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payouts List */}
      <div className="space-y-4">
        {filteredPayouts.length > 0 ? (
          filteredPayouts.map(payout => {
            const vendor = vendors.find(v => v.id === payout.vendor_integration_id);
            const payoutRentals = rentals.filter(r => 
              payout.rental_transactions?.includes(r.rental_id)
            );
            
            return (
              <Card key={payout.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payout.payout_status)}
                        <span>{vendor?.vendor_name || 'Unknown Vendor'}</span>
                        <Badge className={getStatusColor(payout.payout_status)}>
                          {payout.payout_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {format(new Date(payout.payout_period_start), 'MMM d')} - {format(new Date(payout.payout_period_end), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">${payout.vendor_payout_amount.toFixed(2)}</div>
                      <p className="text-sm text-slate-600">
                        Platform: ${payout.platform_commission_total?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Total Revenue:</span>
                      <p className="font-semibold">${payout.total_rental_revenue?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Transactions:</span>
                      <p>{payout.rental_transactions?.length || 0} rentals</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Payout Method:</span>
                      <p className="capitalize">{payout.payout_method?.replace('_', ' ') || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Processing Fee:</span>
                      <p>${payout.processing_fee?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                  
                  {payout.payout_date && (
                    <div className="mt-4 pt-4 border-t">
                      <span className="font-medium text-slate-600">Payout Date: </span>
                      <span>{format(new Date(payout.payout_date), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                  
                  {payout.notes && (
                    <div className="mt-2">
                      <span className="font-medium text-slate-600">Notes: </span>
                      <span>{payout.notes}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-slate-500">No payouts found</p>
              <p className="text-sm text-slate-400 mt-2">
                Payouts are automatically generated when rentals are completed
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}