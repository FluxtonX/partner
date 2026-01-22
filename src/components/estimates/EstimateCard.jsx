
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Calendar,
  DollarSign,
  User,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  Mail,
  MessageSquare,
  Copy,
  CheckCheck
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Define statusColors as it's used in the outline but not present in the original code,
// and left as a placeholder in the outline. Providing sensible defaults.
const statusColors = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  sent: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-purple-100 text-purple-800 border-purple-200",
  active: "bg-green-100 text-green-800 border-green-200" // Added 'active' for consistency
};

const getStatusColor = (status) => statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";

export default function EstimateCard({
  estimate,
  client,
  assignedUser,
  onStatusChange, // Kept from outline, though not explicitly used in this card's current actions
  onApproval, // Kept from outline, though not explicitly used in this card's current actions
  onEdit,
  onSendForApproval,
  onDelete,
  onInternalApprove,
  onDuplicate,
  isSelected
}) {

  const handleActionClick = (e, action) => {
    e.stopPropagation(); // Prevent card click event from firing when dropdown item is clicked
    action?.(estimate); // Call the action with the estimate, check if action exists
  }

  return (
    <Card className={cn(
      "border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group cursor-pointer",
      isSelected && "ring-2 ring-emerald-500 border-emerald-500 shadow-xl"
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-slate-800 truncate">{estimate.title}</h3>
            <p className="text-sm text-slate-600 truncate">{client?.contact_person || 'No Client'}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* Stop propagation for the button itself to prevent card click */}
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            {/* Stop propagation for the dropdown content to prevent card click when items are interacted with */}
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={(e) => handleActionClick(e, onEdit)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit / View
              </DropdownMenuItem>
              {onSendForApproval && (
                <DropdownMenuItem onClick={(e) => handleActionClick(e, onSendForApproval)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send for Approval
                </DropdownMenuItem>
              )}
              {onInternalApprove && (
                <DropdownMenuItem onClick={(e) => handleActionClick(e, onInternalApprove)}>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Internal Approval
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={(e) => handleActionClick(e, onDuplicate)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={(e) => handleActionClick(e, onDelete)} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2 mb-4">
          <Badge variant={estimate.budget_approved ? 'default' : 'outline'} className={cn(
            estimate.budget_approved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          )}>
            {estimate.budget_approved ? "Budget Approved" : "Budget Pending"}
          </Badge>
          <Badge className={getStatusColor(estimate.status)}>
            {estimate.status?.replace('_', ' ')}
          </Badge>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="flex gap-6 min-w-max pb-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-emerald-600">
                ${(estimate.total_after_adjustments || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {estimate.created_date && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{format(new Date(estimate.created_date), "MMM d, yyyy")}</span>
              </div>
            )}
            {assignedUser && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4 text-slate-400" />
                <span className="truncate">{assignedUser}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>{estimate.line_items?.length || 0} items</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
