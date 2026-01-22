import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function RentalManagement({ rentals, vendors, assets, onUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending_approval': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = rental.rental_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rental.renter_user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rental.rental_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = rentals.reduce((sum, rental) => sum + (rental.platform_commission || 0), 0);
  const activeRentals = rentals.filter(r => r.rental_status === 'active').length;
  const pendingApproval = rentals.filter(r => r.rental_status === 'pending_approval').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{rentals.length}</div>
            <p className="text-xs text-slate-600">Total Rentals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{activeRentals}</div>
            <p className="text-xs text-slate-600">Active Rentals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingApproval}</div>
            <p className="text-xs text-slate-600">Pending Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">
              ${totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600">Platform Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by rental ID or renter email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_approval">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="checked_out">Checked Out</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rentals List */}
      <div className="space-y-4">
        {filteredRentals.length > 0 ? (
          filteredRentals.map(rental => {
            const asset = assets.find(a => a.id === rental.vendor_asset_id);
            const vendor = vendors.find(v => v.id === rental.vendor_integration_id);
            
            return (
              <Card key={rental.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(rental.rental_status)}
                        <span className="font-mono text-sm">{rental.rental_id}</span>
                        <Badge className={getStatusColor(rental.rental_status)}>
                          {rental.rental_status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {asset?.asset_name || 'Unknown Asset'} by {vendor?.vendor_name || 'Unknown Vendor'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Renter:</span>
                      <p>{rental.renter_user_email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Duration:</span>
                      <p>{rental.duration_quantity} {rental.duration_type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Rental Period:</span>
                      <p>{format(new Date(rental.rental_start_date), 'MMM d')} - {format(new Date(rental.rental_end_date), 'MMM d')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Total Cost:</span>
                      <p className="font-semibold">${rental.total_rental_cost?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Platform Commission:</span>
                      <p className="text-green-600 font-semibold">${rental.platform_commission?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Vendor Payout:</span>
                      <p>${rental.vendor_payout?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Payment Status:</span>
                      <Badge variant="outline" className="capitalize">
                        {rental.payment_status}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Deposit:</span>
                      <p>${rental.deposit_amount?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-slate-500">No rentals found matching your criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}