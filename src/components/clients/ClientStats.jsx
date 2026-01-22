import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, DollarSign, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientStats({ clients, projects, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalRevenue = projects.reduce((sum, p) => sum + (p.actual_cost || p.estimated_cost || 0), 0);
  const activeClients = clients.filter(c => c.status === 'won').length;
  const averageProjectValue = projects.length > 0 ? totalRevenue / projects.length : 0;
  const newLeadsThisMonth = clients.filter(c => {
    if (!c.created_date) return false;
    try {
      const createdDate = new Date(c.created_date);
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    } catch (error) {
      return false;
    }
  }).length;

  const stats = [
    {
      title: "Total Clients",
      value: clients.length,
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Active Clients",
      value: activeClients,
      icon: Building,
      color: "bg-green-500"
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-purple-500"
    },
    {
      title: "Avg Project Value",
      value: `$${averageProjectValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}