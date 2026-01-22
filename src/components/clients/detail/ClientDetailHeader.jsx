
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, DollarSign, Edit, FolderOpen, User, Calculator } from 'lucide-react';

export default function ClientDetailHeader({ client, projects, onEdit, onCreateEstimate, onStatusChange }) {
  const totalRevenue = projects.reduce((sum, p) => sum + (p.actual_cost || p.estimated_cost || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;

  const statusOptions = [
    { value: 'new_lead', label: 'New Lead', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'attempted_contact', label: 'Attempted Contact', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'contacted', label: 'Contacted', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'estimate', label: 'Estimate', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'won', label: 'Won', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'do_not_contact', label: 'Do Not Contact', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ];

  const currentStatus = statusOptions.find(s => s.value === client.status) || statusOptions[0];

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{client.company_name || `${client.first_name} ${client.last_name}`}</h1>
                <Select value={client.status} onValueChange={onStatusChange}>
                  <SelectTrigger className={`w-auto border-none focus:ring-0 focus:ring-offset-0 p-0 h-auto ${currentStatus.color}`}>
                    <Badge className={`h-6 text-xs px-2.5 py-0.5 rounded-md ${currentStatus.color}`}>
                      <SelectValue />
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${option.color}`}>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-slate-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                {client.contact_person}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={onCreateEstimate} className="bg-emerald-600 hover:bg-emerald-700">
              <Calculator className="w-4 h-4 mr-2" />
              Create Estimate
            </Button>
            <Button onClick={onEdit} variant="outline" className="flex-shrink-0">
              <Edit className="w-4 h-4 mr-2" />
              Edit Client
            </Button>
          </div>
        </div>
        
        <div className="border-t border-slate-200/60 my-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Projects</p>
            <p className="text-2xl font-bold text-slate-900">{activeProjects}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Projects</p>
            <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
