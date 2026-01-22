
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, FileText, TrendingUp, TrendingDown, Eye, User, BarChart2, Receipt, FileWarning, Percent, Landmark } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Added tooltip imports

export default function FinancialsTab({ project, expenses = [], changeOrders = [], invoices = [], currentUser }) {
  const [viewMode, setViewMode] = useState('client'); // 'client' or 'internal'

  // --- CALCULATIONS ---
  const approvedChangeOrders = changeOrders.filter(co => co.status === 'approved');

  // Client-facing "Sales Price" calculations
  const originalEstimateTotal = project.total_after_adjustments || project.estimated_cost || 0;
  const approvedChangeOrdersSaleTotal = approvedChangeOrders.reduce((sum, co) => sum + (co.total_after_adjustments || 0), 0);
  const totalContractValue = originalEstimateTotal + approvedChangeOrdersSaleTotal;

  // Internal-facing "Budget" calculations
  const originalEstimateInternalCost = (project.estimated_labor_cost || 0) + (project.estimated_materials_cost || 0);
  const approvedChangeOrdersInternalCost = approvedChangeOrders.reduce((sum, co) => sum + (co.internal_cost_total || 0), 0);
  const totalBudget = originalEstimateInternalCost + approvedChangeOrdersInternalCost;
  
  // Actuals
  const totalActualCost = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Variance calculations
  const budgetVariance = totalBudget - totalActualCost;
  const profit = totalContractValue - totalActualCost;
  const profitMargin = totalContractValue > 0 ? (profit / totalContractValue) * 100 : 0;

  const isAdminOrOwner = currentUser?.role === 'admin' || currentUser?.role === 'owner';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const isClientView = viewMode === 'client' || !isAdminOrOwner;

  // New calculations for estimated profit including partner fee
  const estimatedTotal = project.total_after_adjustments || 0;
  const estimatedInternalCost = (project.estimated_labor_cost || 0) + (project.estimated_materials_cost || 0);
  const estimatedGrossProfit = estimatedTotal - estimatedInternalCost;
  const estimatedGrossMargin = estimatedTotal > 0 ? (estimatedGrossProfit / estimatedTotal) * 100 : 0;
  
  // Use stored values if they exist
  const partnerFee = project.partner_fee_amount || 0;
  const netProfitMargin = project.net_profit_margin || 0;

  return (
    <div className="space-y-6">
      {isAdminOrOwner && (
        <div className="flex items-center justify-end space-x-2">
          <Label htmlFor="view-mode-toggle" className="flex items-center gap-2 text-slate-600">
            <User className="w-4 h-4" /> Client View
          </Label>
          <Switch
            id="view-mode-toggle"
            checked={viewMode === 'internal'}
            onCheckedChange={(checked) => setViewMode(checked ? 'internal' : 'client')}
          />
          <Label htmlFor="view-mode-toggle" className="flex items-center gap-2 text-slate-600">
            <Eye className="w-4 h-4" /> Internal View
          </Label>
        </div>
      )}

      {/* --- NEW BUDGET OVERVIEW CARD --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-slate-500" />
            <span>Budget Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <p className="text-slate-500">Total Estimated Price</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(estimatedTotal)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-500">Estimated Internal Cost</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(estimatedInternalCost)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-500">Estimated Gross Profit</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(estimatedGrossProfit)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-500">Gross Profit Margin</p>
              <p className={`text-2xl font-bold ${estimatedGrossMargin < 20 ? 'text-amber-600' : 'text-emerald-600'}`}>{estimatedGrossMargin.toFixed(1)}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-500 flex items-center">
                Partner Fee
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Landmark className="w-3 h-3 ml-1.5 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fee based on your subscription tier ({(project.partner_fee_percentage * 100 || 0).toFixed(1)}%)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(partnerFee)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-500">Net Profit Margin</p>
              <p className={`text-2xl font-bold ${netProfitMargin < 20 ? 'text-red-600' : 'text-emerald-600'}`}>{netProfitMargin.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- EXISTING SUMMARY CARDS --- */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Contract Value / Total Budget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isClientView ? 'Total Contract Value' : 'Total Project Budget'}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(isClientView ? totalContractValue : totalBudget)}</div>
            <p className="text-xs text-muted-foreground">{isClientView ? 'Original Estimate + Change Orders' : 'Internal Costs for Labor & Materials'}</p>
          </CardContent>
        </Card>
        {/* Actual Costs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Costs to Date</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalActualCost)}</div>
            <p className="text-xs text-muted-foreground">Sum of all recorded expenses</p>
          </CardContent>
        </Card>
        {/* Profit / Budget Variance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isClientView ? 'Gross Profit' : 'Budget Variance'}</CardTitle>
            <TrendingUp className={`h-4 w-4 ${ (isClientView && profit < 0) || (!isClientView && budgetVariance < 0) ? 'text-red-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(isClientView && profit < 0) || (!isClientView && budgetVariance < 0) ? 'text-red-500' : 'text-green-500'}`}>
              {formatCurrency(isClientView ? profit : budgetVariance)}
            </div>
            <p className="text-xs text-muted-foreground">{isClientView ? 'Contract Value - Actual Costs' : 'Budget - Actual Costs'}</p>
          </CardContent>
        </Card>
        {/* Profit Margin */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitMargin < 0 ? 'text-red-500' : 'text-green-500'}`}>{profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Based on client-facing price</p>
          </CardContent>
        </Card>
      </div>

      {/* --- FINANCIAL BREAKDOWN TABLE --- */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Sales Price</TableHead>
                {isAdminOrOwner && <TableHead className="text-right">Internal Cost</TableHead>}
                <TableHead className="text-right">Actual Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Original Estimate</TableCell>
                <TableCell className="text-right">{formatCurrency(originalEstimateTotal)}</TableCell>
                {isAdminOrOwner && <TableCell className="text-right">{formatCurrency(originalEstimateInternalCost)}</TableCell>}
                <TableCell className="text-right">-</TableCell>
              </TableRow>
              {approvedChangeOrders.map(co => (
                <TableRow key={co.id}>
                  <TableCell className="pl-6 text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>CO: {co.change_order_number} - {co.title}</span>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(co.total_after_adjustments)}</TableCell>
                  {isAdminOrOwner && <TableCell className="text-right">{formatCurrency(co.internal_cost_total)}</TableCell>}
                  <TableCell className="text-right">-</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                <TableCell>{isClientView ? 'Total Contract Value' : 'Total Project Budget'}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalContractValue)}</TableCell>
                {isAdminOrOwner && <TableCell className="text-right">{formatCurrency(totalBudget)}</TableCell>}
                <TableCell className="text-right">{formatCurrency(totalActualCost)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
