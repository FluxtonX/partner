
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/providers/LanguageContext';
import { 
  Users, 
  Calculator, 
  FolderOpen, 
  Package,
  X,
  FileText,
  Zap,
  Ruler
} from 'lucide-react';

export default function QuickCreateMenu({ onClose, currentUser }) {
  const { t } = useLanguage();

  const quickCreateItems = [
    {
      title: 'Quick Project',
      description: 'Create and clock into a new project',
      icon: Zap,
      url: createPageUrl("Projects?quick_project=true"),
      color: "bg-yellow-50 text-yellow-600 border-yellow-200"
    },
    {
      title: 'AR Estimate',
      description: 'Use AR to measure and estimate',
      icon: Ruler,
      url: createPageUrl("AREstimator"),
      color: "bg-cyan-50 text-cyan-600 border-cyan-200"
    },
    {
      title: 'New Estimate',
      description: 'Create detailed project estimate',
      icon: Calculator,
      url: createPageUrl("Estimates"),
      color: "bg-emerald-50 text-emerald-600 border-emerald-200"
    },
    {
      title: 'New Project',
      description: 'Full project with timeline',
      icon: FolderOpen,
      url: createPageUrl("Projects"),
      color: "bg-blue-50 text-blue-600 border-blue-200"
    },
    {
      title: 'New Client',
      description: 'Add client information',
      icon: Users,
      url: createPageUrl("Clients"),
      color: "bg-purple-50 text-purple-600 border-purple-200"
    },
    {
      title: 'New Invoice',
      description: 'Generate client invoice',
      icon: FileText,
      url: createPageUrl("Invoices"), // Updated to point to Invoices page
      color: "bg-green-50 text-green-600 border-green-200"
    },
    {
      title: 'Product/Service',
      description: 'Add to your catalog',
      icon: Package,
      url: createPageUrl("ProductsServices"),
      color: "bg-indigo-50 text-indigo-600 border-indigo-200"
    }
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
          {quickCreateItems.map((item) => {
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.title}
                to={item.url}
                onClick={onClose}
                className="group"
              >
                <div className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:scale-105 ${item.color}`}>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-lg bg-white/80">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-xs opacity-70 mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
