
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ProfitLossStatement({ data, isLoading }) {

  if (isLoading) {
    return <Card><CardHeader><CardTitle>Profit & Loss Statement</CardTitle></CardHeader><CardContent>Loading...</CardContent></Card>;
  }
  
  if (!data) {
    return <Card><CardHeader><CardTitle>Profit & Loss Statement</CardTitle></CardHeader><CardContent>No data available for this period.</CardContent></Card>;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Profit & Loss Statement</CardTitle>
        <CardDescription>
          Summary of revenues, costs, and expenses during the selected period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="font-semibold bg-slate-50">
                <TableCell>Total Revenue</TableCell>
                <TableCell className="text-right">${data.totalRevenue.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Completed Projects</TableCell>
                <TableCell className="text-right">${data.projectRevenue.toLocaleString()}</TableCell>
              </TableRow>

              <TableRow className="font-semibold bg-slate-50">
                <TableCell>Cost of Goods Sold (COGS)</TableCell>
                <TableCell className="text-right text-orange-600">-${data.totalCOGS.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Direct Labor</TableCell>
                <TableCell className="text-right">-${data.laborCost.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Materials & Supplies</TableCell>
                <TableCell className="text-right">-${data.materialsCost.toLocaleString()}</TableCell>
              </TableRow>

              <TableRow className="font-bold bg-blue-50 border-y-2 border-blue-200">
                <TableCell>Gross Profit</TableCell>
                <TableCell className="text-right">${data.grossProfit.toLocaleString()}</TableCell>
              </TableRow>

              <TableRow className="font-semibold bg-slate-50">
                <TableCell>Operating Expenses</TableCell>
                <TableCell className="text-right text-orange-600">-${data.totalExpenses.toLocaleString()}</TableCell>
              </TableRow>
              {Object.entries(data.expensesByCategory).map(([category, amount]) => (
                <TableRow key={category}>
                  <TableCell className="pl-6 capitalize">{category.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="text-right">-${amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}

              <TableRow className="font-bold bg-emerald-50 border-y-2 border-emerald-200">
                <TableCell>Net Income (Profit)</TableCell>
                <TableCell className="text-right text-emerald-700">${data.netIncome.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
