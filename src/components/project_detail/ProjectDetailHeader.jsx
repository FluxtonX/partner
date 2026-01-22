
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Building, 
  DollarSign, 
  TrendingDown,
  Edit,
  Wrench,
  FileText
} from "lucide-react";

const statusColors = {
  estimate: "bg-amber-100 text-amber-800 border-amber-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  service: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-purple-100 text-purple-800 border-purple-200",
  cancelled: "bg-red-100 text-red-800 border-red-200"
};

export default function ProjectDetailHeader({ project, parentTitle, client, stats, onEdit, onCreateServiceProject, onCreateChangeOrder }) {
  const totalEstimatedCost = (project.estimated_cost || 0) + (stats.totalChangeOrderValue || 0);
  
  // Safe client name extraction with fallback
  const getClientName = () => {
    // Treat 'Client Not Found' as an unassigned client for display purposes
    if (!client || client.company_name === 'Client Not Found') return 'No Client Assigned';
    return client.company_name || client.contact_person || 
           `${client.first_name || ''} ${client.last_name || ''}`.trim() || 
           'Unknown Client';
  };

  const getClientLink = () => {
    if (!client || !client.id || client.company_name === 'Client Not Found') {
      return <span className="text-slate-600">{getClientName()}</span>;
    }
    return (
      <Link to={createPageUrl(`ClientDetail?id=${client.id}`)} className="hover:underline text-slate-600">
        {getClientName()}
      </Link>
    );
  };
  
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={`${statusColors[project.status]} border font-medium`}>{project.status}</Badge>
              {parentTitle && (
                <Link to={createPageUrl(`ProjectDetail?id=${project.parent_project_id}`)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                  <Wrench className="w-3 h-3" />
                  <span>Service for: {parentTitle}</span>
                </Link>
              )}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.title}</h1>
            <div className="flex items-center gap-2 text-slate-600">
              <Building className="w-4 h-4" />
              {getClientLink()}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Project
            </Button>
            <Button variant="outline" onClick={onCreateServiceProject}>
              <Wrench className="w-4 h-4 mr-2" />
              Create Service Project
            </Button>
            <Button variant="outline" onClick={onCreateChangeOrder}>
              <FileText className="w-4 h-4 mr-2" />
              Create Change Order
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-200/60 my-6"></div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-500 uppercase">Est. Cost</p>
            <p className="text-lg font-bold text-slate-900">${totalEstimatedCost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Actual Cost</p>
            <p className="text-lg font-bold text-slate-900">${(project.actual_cost || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Total Expenses</p>
            <p className="text-lg font-bold text-red-600">${(stats.totalExpenses || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Total Invoiced</p>
            <p className="text-lg font-bold text-emerald-600">${(stats.totalInvoiced || 0).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
