import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, Percent, TrendingUp } from 'lucide-react';

export default function MarketingMetrics({ clients, projects, invoices, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const totalLeads = clients.length;
  
  const convertedClientIds = new Set(
    projects
      .filter(p => p.status !== 'cancelled' && p.status !== 'estimate')
      .map(p => p.client_id)
  );

  const convertedClientsCount = convertedClientIds.size;
  const conversionRate = totalLeads > 0 ? (convertedClientsCount / totalLeads) * 100 : 0;

  // Calculate revenue from paid invoices belonging to converted clients.
  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'paid' && convertedClientIds.has(invoice.client_id))
    .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

  const stats = [
    { title: "Total Leads", value: totalLeads, icon: Users, color: "text-blue-600" },
    { title: "Converted Clients", value: convertedClientsCount, icon: TrendingUp, color: "text-emerald-600" },
    { title: "Conversion Rate", value: `${conversionRate.toFixed(1)}%`, icon: Percent, color: "text-purple-600" },
    { title: "Total Marketing Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
              </div>
              <div className={`p-3 rounded-xl bg-opacity-20 ${stat.color.replace('text-', 'bg-')}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}