import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export default function RevenueChart({ projects }) {
  const generateRevenueData = () => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthlyRevenue = projects
        .filter(p => {
          const projectDate = new Date(p.created_date);
          return projectDate >= monthStart && projectDate <= monthEnd;
        })
        .reduce((sum, p) => sum + (p.actual_cost || p.estimated_cost || 0), 0);
      
      return {
        month: format(month, 'MMM yyyy'),
        revenue: monthlyRevenue
      };
    });
  };

  const data = generateRevenueData();

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}