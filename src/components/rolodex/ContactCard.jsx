import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Phone, 
  Mail, 
  DollarSign, 
  Star, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_COLORS = {
  accounting: 'bg-blue-100 text-blue-800 border-blue-200',
  tax_services: 'bg-green-100 text-green-800 border-green-200',
  legal: 'bg-purple-100 text-purple-800 border-purple-200',
  insurance: 'bg-red-100 text-red-800 border-red-200',
  banking: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  marketing: 'bg-pink-100 text-pink-800 border-pink-200',
  it_services: 'bg-gray-100 text-gray-800 border-gray-200',
  custodial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  security: 'bg-orange-100 text-orange-800 border-orange-200',
  maintenance: 'bg-teal-100 text-teal-800 border-teal-200',
  consulting: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  software_subscriptions: 'bg-violet-100 text-violet-800 border-violet-200',
  equipment_rental: 'bg-amber-100 text-amber-800 border-amber-200',
  utilities: 'bg-slate-100 text-slate-800 border-slate-200',
  other: 'bg-neutral-100 text-neutral-800 border-neutral-200'
};

const CATEGORY_LABELS = {
  accounting: 'Accounting',
  tax_services: 'Tax Services',
  legal: 'Legal Services',
  insurance: 'Insurance',
  banking: 'Banking',
  marketing: 'Marketing',
  it_services: 'IT Services',
  custodial: 'Custodial',
  security: 'Security',
  maintenance: 'Maintenance',
  consulting: 'Consulting',
  software_subscriptions: 'Software Subscriptions',
  equipment_rental: 'Equipment Rental',
  utilities: 'Utilities',
  other: 'Other'
};

export default function ContactCard({ contact, onEdit, onView, onDelete }) {
  const isExpiring = contact.contract_end_date && 
    new Date(contact.contract_end_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const getMonthlyAmount = () => {
    let amount = contact.monthly_expense || 0;
    switch (contact.payment_frequency) {
      case 'quarterly':
        return amount / 3;
      case 'semi_annually':
        return amount / 6;
      case 'annually':
        return amount / 12;
      default:
        return amount;
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-slate-900 truncate">
              {contact.company_name}
            </CardTitle>
            <p className="text-sm text-slate-600 truncate">
              {contact.contact_person}
              {contact.title && ` • ${contact.title}`}
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(contact)}
              className="h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(contact)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(contact.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge className={CATEGORY_COLORS[contact.category]}>
            {CATEGORY_LABELS[contact.category]}
          </Badge>
          {isExpiring && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Expiring Soon
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Contact Info */}
        <div className="space-y-2">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-slate-500" />
              <a 
                href={`mailto:${contact.email}`}
                className="text-blue-600 hover:underline truncate"
              >
                {contact.email}
              </a>
            </div>
          )}
          
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-slate-500" />
              <a 
                href={`tel:${contact.phone}`}
                className="text-blue-600 hover:underline"
              >
                {contact.phone}
              </a>
            </div>
          )}

          {contact.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-slate-500" />
              <a 
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>

        {/* Financial Info */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Monthly Cost</span>
            <span className="text-lg font-bold text-emerald-600">
              ${getMonthlyAmount().toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Billed {contact.payment_frequency || 'monthly'}
          </p>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span>Status:</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                contact.status === 'active' ? 'border-green-200 text-green-700' :
                contact.status === 'inactive' ? 'border-red-200 text-red-700' :
                contact.status === 'expired' ? 'border-orange-200 text-orange-700' :
                'border-gray-200 text-gray-700'
              }`}
            >
              {contact.status}
            </Badge>
          </div>
          
          {contact.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span>{contact.rating}/5</span>
            </div>
          )}
        </div>

        {/* Services Preview */}
        {contact.services_provided?.length > 0 && (
          <div className="text-xs text-slate-600">
            <span className="font-medium">Services: </span>
            <span>{contact.services_provided.slice(0, 2).join(', ')}</span>
            {contact.services_provided.length > 2 && (
              <span className="text-slate-500"> +{contact.services_provided.length - 2} more</span>
            )}
          </div>
        )}

        {/* Contract Expiry Warning */}
        {contact.contract_end_date && (
          <div className={`text-xs p-2 rounded ${isExpiring ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600'}`}>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                Contract expires: {format(new Date(contact.contract_end_date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        )}

        {/* Emergency Contact Badge */}
        {contact.emergency_contact && (
          <Badge variant="outline" className="text-xs border-red-200 text-red-700">
            Emergency Contact
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}