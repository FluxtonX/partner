
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  User,
  Hash,
  Package,
  Wrench,
  Truck,
  Building,
  HardHat
} from "lucide-react";
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const typeIcons = {
  'Vehicle': <Truck className="w-5 h-5 text-slate-500" />,
  'Real Estate': <Building className="w-5 h-5 text-slate-500" />,
  'Tool': <Wrench className="w-5 h-5 text-slate-500" />,
  'Equipment': <HardHat className="w-5 h-5 text-slate-500" />,
  'Other': <Package className="w-5 h-5 text-slate-500" />
};

const statusColors = {
  'Available': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'In Use': 'bg-blue-100 text-blue-800 border-blue-200',
  'In Repair': 'bg-amber-100 text-amber-800 border-amber-200',
  'Sold': 'bg-slate-100 text-slate-600 border-slate-200',
  'Decommissioned': 'bg-red-100 text-red-800 border-red-200'
};

const getStatusStyle = (status) => statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";

export default function AssetCard({ asset, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <CardContent className="p-6 flex-grow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100">
                {typeIcons[asset.type] || <Package className="w-5 h-5 text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-800 truncate">{asset.name}</h3>
                <Badge className={getStatusStyle(asset.status)}>{asset.status}</Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(asset)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(asset.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-4">
            <p className="text-sm text-slate-600 truncate">{asset.description || 'No description provided.'}</p>
          </div>

          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="flex gap-6 min-w-max pb-2 text-sm">
              <div className="flex items-center gap-2" title="Current Value">
                <DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600">
                  ${(asset.current_value || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2" title="Purchase Date">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 whitespace-nowrap">
                  {asset.purchase_date ? format(new Date(asset.purchase_date), 'MMM yyyy') : 'N/A'}
                </span>
              </div>
              {asset.serial_number && (
                <div className="flex items-center gap-2" title="Serial Number">
                  <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600 whitespace-nowrap">{asset.serial_number}</span>
                </div>
              )}
              {asset.assigned_to && (
                <div className="flex items-center gap-2" title="Assigned To">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600 truncate">{asset.assigned_to}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
