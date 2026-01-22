import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export default function CashFlowChart({ revenue, expenses, invoices }) {
  const generateCashFlowData = () => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      // Calculate monthly payments received
      const monthlyPayments = invoices
        .filter(i => {
          const paymentDate = new Date(i.issue_date);
          return paymentDate >= monthStart && paymentDate <= monthEnd && i.status === 'paid';
        })
        .reduce((sum, i) => sum + (i.total_amount || 0), 0);
      
      // For simplicity, distribute expenses evenly across months
      const monthlyExpenses = expenses / 6;
      
      return {
        month: format(month, 'MMM'),
        income: monthlyPayments,
        expenses: monthlyExpenses,
        netFlow: monthlyPayments - monthlyExpenses
      };
    });
  };

  const data = generateCashFlowData();

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Cash Flow Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#059669" 
              strokeWidth={2}
              name="Income"
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#dc2626" 
              strokeWidth={2}
              name="Expenses"
            />
            <Line 
              type="monotone" 
              dataKey="netFlow" 
              stroke="#0ea5e9" 
              strokeWidth={2}
              name="Net Flow"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}