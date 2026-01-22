
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Building, Phone, Mail, MapPin, MoreVertical, Edit, Trash2, Eye, User } from "lucide-react"; // Added Eye, User; removed Link as LinkIcon, FileText
import { toast } from 'sonner';
import { SendEmail } from '@/api/integrations';
import { Client } from '@/api/entities'; // Import Client entity

// Helper function to get display name (company_name or contact_person)
const getDisplayName = (client) => {
  return client.company_name || client.contact_person;
};

// Helper function to get status badge style based on status value
const getStatusStyle = (status) => {
  const statusColors = {
    new_lead: 'bg-blue-100 text-blue-700',
    attempted_contact: 'bg-yellow-100 text-yellow-700',
    contacted: 'bg-indigo-100 text-indigo-700',
    estimate: 'bg-purple-100 text-purple-700',
    won: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-red-100 text-red-700',
    do_not_contact: 'bg-slate-100 text-slate-600',
  };
  return `${statusColors[status] || 'bg-slate-100 text-slate-700'} capitalize`;
};

// Updated props to match the outline: removed projects, onQuickUpdate, statusOptions
export default function ClientCard({ client, onEdit, onView, onDelete }) {

  const handleSendPortalInvite = async (client) => {
    toast.info("Generating secure setup link...");

    try {
        // Generate a new, secure one-time access token for PIN setup
        const setupToken = `setup_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
        
        await Client.update(client.id, {
            access_token: setupToken,
            token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Link expires in 24 hours
        });

        // Construct the portal URL using window.location.origin
        const portalUrl = `${window.location.origin}/YourPartner?token=${setupToken}`; 
        
        const emailSubject = `Secure Portal Access for ${client.company_name || client.contact_person}`;
        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #059669;">Your Project Portal is Ready</h2>
                <p>Hello ${client.contact_person || client.company_name},</p>
                <p>We've created a secure portal for you to access all your project details, including estimates, invoices, and progress updates.</p>
                
                <p>Please use the link below to create your private 4-digit PIN for secure access. This is a one-time setup link and will expire in 24 hours.</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${portalUrl}" target="_blank" style="text-decoration: none; background: #059669; color: white; padding: 15px 30px; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block;">
                        Set Up Your Portal Access
                    </a>
                </div>

                <p style="font-size: 14px; color: #64748b;">After setting up your PIN, you will use your email address and the PIN to log in for future visits.</p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                </div>
            </div>
        `;

        await SendEmail({
            to: client.email,
            subject: emailSubject,
            body: emailBody
        });
        toast.success("Portal setup invitation sent successfully!");
    } catch (error) {
        console.error("Failed to send portal invite:", error);
        toast.error(error.message || "Failed to send invitation. Please try again.");
    }
  };

  const handleDelete = () => {
    // The outline implies onDelete now receives the full client object
    onDelete?.(client); 
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        {/* Header with client type and actions */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              client.client_type === 'commercial' ? 'bg-blue-100' : 'bg-emerald-100'
            }`}>
              {client.client_type === 'commercial' ? 
                <Building className="w-5 h-5 text-blue-600" /> : 
                <User className="w-5 h-5 text-emerald-600" />
              }
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                {getDisplayName(client)}
              </h3>
              <Badge className={getStatusStyle(client.status)}>
                {client.status?.replace(/_/g, ' ') || 'Unknown'} {/* Replaced all underscores */}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(client)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(client)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Client
              </DropdownMenuItem>
              {/* Preserving the Send Portal Setup Link functionality */}
              <DropdownMenuItem onClick={() => handleSendPortalInvite(client)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Portal Setup Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Scrollable contact information */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="flex gap-6 min-w-max pb-2"> {/* min-w-max ensures content takes its natural width */}
            <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0"> {/* min-w-0 for truncate to work */}
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" /> {/* flex-shrink-0 prevents icon from shrinking */}
              <a href={`mailto:${client.email}`} className="truncate hover:underline">{client.email}</a>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="whitespace-nowrap">{client.phone}</span> {/* whitespace-nowrap prevents phone number wrap */}
            </div>
            
            {client.address && ( // Conditional rendering based on address existence
              <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{client.address}{client.city ? `, ${client.city}` : ''}</span> {/* Combined address and city */}
              </div>
            )}
            
            {client.referral_source && ( // New field from outline
              <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
                <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="whitespace-nowrap">{client.referral_source.replace(/_/g, ' ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable additional details */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="flex gap-4 min-w-max"> {/* min-w-max to allow horizontal scrolling */}
              <div className="text-center min-w-[80px]"> {/* Fixed min-width for consistent columns */}
                <p className="text-xs text-slate-500">Projects</p>
                <p className="font-semibold text-slate-700">{client.projects_count || 0}</p> {/* Assumed client.projects_count is available */}
              </div>
              <div className="text-center min-w-[80px]">
                <p className="text-xs text-slate-500">Total Value</p>
                <p className="font-semibold text-emerald-600">${(client.total_value || 0).toLocaleString()}</p> {/* Assumed client.total_value is available */}
              </div>
              <div className="text-center min-w-[80px]">
                <p className="text-xs text-slate-500">Last Contact</p>
                <p className="text-xs text-slate-600">{client.last_contact || 'Never'}</p> {/* Assumed client.last_contact is available */}
              </div>
              {client.portal_pin && ( // Display portal PIN if available
                <div className="text-center min-w-[60px]">
                  <p className="text-xs text-slate-500">PIN</p>
                  <p className="font-mono text-sm text-slate-700">{client.portal_pin}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
