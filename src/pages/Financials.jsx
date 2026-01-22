
import React, { useState, useEffect } from 'react';
import { Project, Client, Expense, Invoice } from '@/api/entities';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Corrected import syntax here
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, FileText, Plus, Edit, Trash2, Receipt } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

import RevenueChart from '../components/financials/RevenueChart';
import ExpenseBreakdown from '../components/financials/ExpenseBreakdown';
import ProfitLossStatement from '../components/financials/ProfitLossStatement';
import CashFlowChart from '../components/financials/CashFlowChart';

const ExpenseForm = ({ expense, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(expense || {
    description: '',
    amount: '',
    category: 'other_overhead',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, amount: parseFloat(formData.amount) });
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit' : 'Add'} General Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={formData.description} onChange={(e) => setFormData(p => ({...p, description: e.target.value}))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(p => ({...p, amount: e.target.value}))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData(p => ({...p, date: e.target.value}))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(val) => setFormData(p => ({...p, category: val}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent_utilities">Rent & Utilities</SelectItem>
                <SelectItem value="software_subscriptions">Software & Subscriptions</SelectItem>
                <SelectItem value="office_supplies">Office Supplies</SelectItem>
                <SelectItem value="marketing_advertising">Marketing & Advertising</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="professional_services">Professional Services</SelectItem>
                <SelectItem value="vehicle_fuel">Vehicle & Fuel</SelectItem>
                <SelectItem value="other_overhead">Other Overhead</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function FinancialsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [dateRange, setDateRange] = useState('3months');
  const [isLoading, setIsLoading] = useState(true);

  // General Expenses state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseDateRange, setExpenseDateRange] = useState('this_month');

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const [projectsData, expensesData, invoicesData, clientsData] = await Promise.all([
        Project.list('-updated_date'),
        Expense.list('-date'),
        Invoice.list('-issue_date'),
        Client.list()
      ]);
      
      setProjects(projectsData);
      setExpenses(expensesData);
      setInvoices(invoicesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpenseSubmit = async (data) => {
    try {
      if (editingExpense) {
        await Expense.update(editingExpense.id, data);
      } else {
        await Expense.create(data);
      }
      setShowExpenseForm(false);
      setEditingExpense(null);
      loadFinancialData();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleExpenseDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await Expense.delete(id);
        loadFinancialData();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const getDateRangeData = () => {
    const now = new Date();
    let startDate;
    
    switch (dateRange) {
      case '1month':
        startDate = startOfMonth(now);
        break;
      case '3months':
        startDate = startOfMonth(subMonths(now, 2));
        break;
      case '6months':
        startDate = startOfMonth(subMonths(now, 5));
        break;
      case '1year':
        startDate = startOfMonth(subMonths(now, 11));
        break;
      default:
        startDate = startOfMonth(subMonths(now, 2));
    }
    
    return { startDate, endDate: now };
  };

  const getExpenseDateRange = () => {
    const now = new Date();
    if (expenseDateRange === 'this_month') {
      return { start: startOfMonth(now), end: endOfMonth(now) };
    }
    if (expenseDateRange === 'last_month') {
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    return { start: null, end: null };
  };

  const calculateMetrics = () => {
    const { startDate, endDate } = getDateRangeData();
    
    // Filter data by date range
    const filteredProjects = projects.filter(p => {
      const projectDate = new Date(p.created_date);
      return projectDate >= startDate && projectDate <= endDate;
    });
    
    const filteredExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    const filteredInvoices = invoices.filter(i => {
      const invoiceDate = new Date(i.issue_date);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });

    // Calculate metrics
    const totalRevenue = filteredProjects.reduce((sum, p) => sum + (p.actual_cost || p.estimated_cost || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalInvoiced = filteredInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const paidInvoices = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0);
    
    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    return {
      totalRevenue,
      totalExpenses,
      profit,
      profitMargin,
      totalInvoiced,
      paidInvoices,
      outstandingInvoices: totalInvoiced - paidInvoices,
      filteredProjects,
      filteredExpenses,
      filteredInvoices
    };
  };

  const getFilteredGeneralExpenses = () => {
    const generalExpenses = expenses.filter(e => !e.project_id);
    
    if (expenseDateRange === 'all') return generalExpenses;
    
    const { start, end } = getExpenseDateRange();
    return generalExpenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= start && expenseDate <= end;
    });
  };

  const metrics = calculateMetrics();
  const filteredGeneralExpenses = getFilteredGeneralExpenses();
  const totalGeneralExpenses = filteredGeneralExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Financial Dashboard</h1>
            <p className="text-slate-600">Track your business's financial performance and manage expenses</p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Total Revenue</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    ${metrics.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Total Expenses</p>
                </div>
                <div className="p-3 rounded-xl bg-red-100">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${metrics.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${metrics.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Net Profit</p>
                </div>
                <div className={`p-3 rounded-xl ${metrics.profit >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  <TrendingUp className={`w-6 h-6 ${metrics.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {metrics.profitMargin.toFixed(2)}%
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Profit Margin</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-100">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Financial Analysis */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <RevenueChart projects={metrics.filteredProjects} />
              <CashFlowChart 
                revenue={metrics.totalRevenue} 
                expenses={metrics.totalExpenses}
                invoices={metrics.filteredInvoices}
              />
            </div>
            <ExpenseBreakdown expenses={metrics.filteredExpenses} />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Invoice Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total Invoiced</span>
                      <span className="font-bold">${metrics.totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Paid</span>
                      <span className="font-bold text-emerald-600">${metrics.paidInvoices.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Outstanding</span>
                      <span className="font-bold text-amber-600">${metrics.outstandingInvoices.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="lg:col-span-2">
                <RevenueChart projects={metrics.filteredProjects} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseBreakdown expenses={metrics.filteredExpenses} />
          </TabsContent>

          <TabsContent value="reports">
            <ProfitLossStatement 
              projects={metrics.filteredProjects}
              expenses={metrics.filteredExpenses}
            />
          </TabsContent>
        </Tabs>

        {/* General Expenses Section */}
        <div className="mt-12 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">General Business Expenses</h2>
              <p className="text-slate-600">Track and manage your company's overhead and indirect costs.</p>
            </div>
            <Button onClick={() => { setEditingExpense(null); setShowExpenseForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>

          {showExpenseForm && (
            <ExpenseForm 
              expense={editingExpense} 
              onSubmit={handleExpenseSubmit} 
              onCancel={() => setShowExpenseForm(false)} 
            />
          )}

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>General Expenses</CardTitle>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Total: ${totalGeneralExpenses.toFixed(2)}</span>
                  <Select value={expenseDateRange} onValueChange={setExpenseDateRange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGeneralExpenses.length > 0 ? (
                    filteredGeneralExpenses.map(expense => (
                      <TableRow key={expense.id}>
                        <TableCell>{format(new Date(expense.date), 'PPP')}</TableCell>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell className="capitalize">{expense.category.replace(/_/g, ' ')}</TableCell>
                        <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingExpense(expense); setShowExpenseForm(true); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleExpenseDelete(expense.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                        No general expenses recorded for this period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
