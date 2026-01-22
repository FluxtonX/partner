import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import {
  Calendar,
  DollarSign,
  Clock,
  Edit,
  User,
  MoreVertical,
  Trash2,
  Eye,
  Tag
} from "lucide-react";

const statusColors = {
  estimate: "bg-amber-100 text-amber-800 border-amber-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  service: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-purple-100 text-purple-800 border-purple-200",
  cancelled: "bg-red-100 text-red-800 border-red-200"
};

const priorityColors = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700"
};

const getStatusColor = (status) => statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
const getPriorityColor = (priority) => priorityColors[priority] || "bg-slate-100 text-slate-600";

export default function ProjectCard({ project, client, onEdit, onView, onDelete }) {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-slate-800 truncate">{project.title}</h3>
            <p className="text-sm text-slate-600 truncate">{client?.contact_person || 'Unknown Client'}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(project)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(project)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(project)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status and Priority */}
        <div className="flex gap-2 mb-4">
          <Badge className={getStatusColor(project.status)}>
            {project.status?.replace('_', ' ') || 'Unknown'}
          </Badge>
          <Badge className={getPriorityColor(project.priority)}>
            {project.priority || 'Medium'}
          </Badge>
        </div>

        {/* Scrollable project details */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="flex gap-6 min-w-max pb-2">
            <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
              <DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="whitespace-nowrap">${(project.estimated_cost || 0).toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="whitespace-nowrap">{project.estimated_hours || 0}h</span>
            </div>
            
            {project.start_date && (
              <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="whitespace-nowrap">{format(new Date(project.start_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            
            {project.assigned_to && (
              <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{project.assigned_to}</span>
              </div>
            )}

            {project.project_type && (
              <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
                <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="whitespace-nowrap">{project.project_type.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress and action buttons */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex-1 mr-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(((project.actual_hours || 0) / Math.max(project.estimated_hours || 1, 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(((project.actual_hours || 0) / Math.max(project.estimated_hours || 1, 1)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                <Button size="sm" variant="outline" onClick={() => onView?.(project)}>
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button size="sm" onClick={() => onEdit?.(project)}>
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}