import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const referralSourceLabels = {
  google_search: 'Google Search',
  facebook: 'Facebook',
  instagram: 'Instagram',
  nextdoor: 'Nextdoor',
  yelp: 'Yelp',
  angies_list: "Angie's List",
  home_advisor: 'HomeAdvisor',
  thumbtack: 'Thumbtack',
  word_of_mouth: 'Word of Mouth',
  repeat_customer: 'Repeat Customer',
  direct_mail: 'Direct Mail',
  yard_sign: 'Yard Sign',
  vehicle_wrap: 'Vehicle Wrap',
  radio: 'Radio',
  tv: 'TV',
  newspaper: 'Newspaper',
  trade_show: 'Trade Show',
  other: 'Other'
};

export default function ReferralPerformanceTable({ clients, projects, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Referral Source Performance</CardTitle>
          <CardDescription>Analyze which channels are driving the most valuable leads.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const performanceData = Object.entries(
    clients.reduce((acc, client) => {
      const source = client.referral_source || 'unknown';
      if (!acc[source]) {
        acc[source] = { leads: 0, converted: 0, revenue: 0 };
      }
      acc[source].leads++;
      
      const hasConvertedProject = projects.some(p => p.client_id === client.id && p.status !== 'cancelled' && p.status !== 'estimate');
      if (hasConvertedProject) {
        acc[source].converted++;
        const clientRevenue = projects
          .filter(p => p.client_id === client.id)
          .reduce((sum, p) => sum + (p.actual_cost || 0), 0);
        acc[source].revenue += clientRevenue;
      }
      return acc;
    }, {})
  ).map(([source, data]) => ({
    source: referralSourceLabels[source] || source,
    ...data,
    conversionRate: data.leads > 0 ? (data.converted / data.leads) * 100 : 0,
  })).sort((a, b) => b.revenue - a.revenue);

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Referral Source Performance</CardTitle>
        <CardDescription>Analyze which channels are driving the most valuable leads.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
              <TableHead className="text-right">Conversion Rate</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performanceData.map((item) => (
              <TableRow key={item.source}>
                <TableCell className="font-medium">{item.source}</TableCell>
                <TableCell className="text-right">{item.leads}</TableCell>
                <TableCell className="text-right">{item.converted}</TableCell>
                <TableCell className="text-right">{item.conversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right font-semibold">${item.revenue.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}