import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';
import { safeFormatDate } from '@/components/lib/formatters';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClientFinancialsTab({ invoices }) {

  const totalInvoiced = invoices.filter(inv => inv.status !== 'void').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const balanceDue = totalInvoiced - totalPaid;

  const statusColors = {
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    sent: 'bg-blue-100 text-blue-800 border-blue-200',
    overdue: 'bg-red-100 text-red-800 border-red-200',
    draft: 'bg-slate-100 text-slate-800 border-slate-200',
    void: 'bg-gray-100 text-gray-500 line-through border-gray-200',
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">{invoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status] || statusColors.draft}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{safeFormatDate(invoice.issue_date, 'MMM d, yyyy')}</TableCell>
                    <TableCell>{safeFormatDate(invoice.due_date, 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      ${(invoice.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                        <Link to={createPageUrl(`PublicInvoice?id=${invoice.id}`)} target="_blank">
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No invoices found for this client.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}