import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS = {
  estimate: '#d97706',
  active: '#059669',
  service: '#0ea5e9',
  completed: '#6366f1',
  cancelled: '#ef4444'
};

export default function ProjectStatusChart({ projects, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Project Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Skeleton className="w-48 h-48 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: STATUS_COLORS[status]
  }));

  const revenueData = Object.entries(statusCounts).map(([status, count]) => {
    const revenue = projects
      .filter(p => p.status === status)
      .reduce((sum, p) => sum + (p.actual_cost || p.estimated_cost || 0), 0);
    
    return {
      name: status.charAt(0).toUpperCase() + status.slice(1),
      revenue,
      color: STATUS_COLORS[status]
    };
  });

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Project Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Project Count Pie Chart */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-4 text-center">Project Count by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Bar Chart */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-4 text-center">Revenue by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}