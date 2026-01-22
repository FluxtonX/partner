import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#059669', '#0ea5e9', '#d97706', '#dc2626', '#7c3aed', '#059669'];

export default function ExpenseBreakdown({ expenses }) {
  const generateExpenseData = () => {
    const categories = expenses.reduce((acc, expense) => {
      const category = expense.category || 'other';
      acc[category] = (acc[category] || 0) + (expense.amount || 0);
      return acc;
    }, {});

    return Object.entries(categories).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
      value: amount,
      percentage: expenses.length > 0 ? ((amount / expenses.reduce((sum, e) => sum + (e.amount || 0), 0)) * 100).toFixed(1) : 0
    }));
  };

  const data = generateExpenseData();
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 mb-4">Category Breakdown</h3>
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">${item.value.toLocaleString()}</p>
                  <p className="text-sm text-slate-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Total Expenses</span>
                <span className="font-bold text-lg text-slate-900">${totalExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}