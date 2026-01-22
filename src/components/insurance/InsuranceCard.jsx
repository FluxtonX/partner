import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  Calendar,
  DollarSign,
  Package
} from 'lucide-react';
import { format } from 'date-fns';

const policyTypeLabels = {
  general_liability: 'General Liability',
  workers_compensation: 'Workers Comp',
  commercial_auto: 'Commercial Auto',
  property: 'Property',
  professional_liability: 'Professional Liability',
  cyber_liability: 'Cyber Liability',
  equipment: 'Equipment',
  umbrella: 'Umbrella',
  other: 'Other'
};

export default function InsuranceCard({ policy, coveredAssets, status, onEdit, onDelete, highlighted = false }) {
  const StatusIcon = status.icon;
  
  return (
    <Card className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm ${highlighted ? 'ring-2 ring-amber-200 bg-amber-50/50' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 mb-1">
              {policy.policy_name}
            </CardTitle>
            <p className="text-sm text-slate-600">{policy.insurance_company}</p>
            <Badge className="mt-2 text-xs">
              {policyTypeLabels[policy.policy_type] || policy.policy_type}
            </Badge>
          </div>
          <Badge className={`${status.color} border flex items-center gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {status.text}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Policy Details */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Policy Number:</span>
            <span className="font-mono text-slate-900">{policy.policy_number}</span>
          </div>
          
          {policy.coverage_amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Coverage:</span>
              <span className="font-semibold text-emerald-600">
                ${policy.coverage_amount.toLocaleString()}
              </span>
            </div>
          )}
          
          {policy.premium_amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Annual Premium:</span>
              <span className="font-semibold text-slate-900">
                ${policy.premium_amount.toLocaleString()}
              </span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Expires:</span>
            <span className="font-medium text-slate-900">
              {format(new Date(policy.expiration_date), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        {/* Contact Information */}
        {(policy.agent_name || policy.agent_phone || policy.agent_email) && (
          <div className="border-t pt-3">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Agent Contact</h4>
            <div className="space-y-1">
              {policy.agent_name && (
                <p className="text-sm font-medium text-slate-900">{policy.agent_name}</p>
              )}
              {policy.agent_phone && (
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Phone className="w-3 h-3" />
                  <span>{policy.agent_phone}</span>
                </div>
              )}
              {policy.agent_email && (
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Mail className="w-3 h-3" />
                  <span>{policy.agent_email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Covered Assets */}
        {coveredAssets.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
              <Package className="w-3 h-3" />
              Covered Assets ({coveredAssets.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {coveredAssets.slice(0, 3).map(asset => (
                <Badge key={asset.id} variant="outline" className="text-xs">
                  {asset.name}
                </Badge>
              ))}
              {coveredAssets.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{coveredAssets.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Documents */}
        {(policy.policy_document_url || policy.certificate_url) && (
          <div className="border-t pt-3">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Documents</h4>
            <div className="flex gap-2">
              {policy.policy_document_url && (
                <a 
                  href={policy.policy_document_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  Policy
                </a>
              )}
              {policy.certificate_url && (
                <a 
                  href={policy.certificate_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  Certificate
                </a>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t pt-3 flex gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit} className="flex-1">
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}