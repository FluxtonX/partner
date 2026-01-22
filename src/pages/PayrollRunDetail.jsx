
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Payroll, PayrollRun } from '@/api/entities';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Keep table components as they might be used elsewhere or for future features
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ArrowLeft, User, Clock, DollarSign, Percent } from "lucide-react";
import { createPageUrl } from '@/utils';

export default function PayrollRunDetail() {
  const [runDetails, setRunDetails] = useState(null);
  const [payrolls, setPayrolls] = useState([]); // This will be payrollRecords from the outline
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const runId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    if (runId) {
      loadRunDetails();
    }
  }, [runId]);

  const loadRunDetails = async () => {
    setIsLoading(true);
    try {
      const [runData, payrollsData] = await Promise.all([
        PayrollRun.get(runId),
        Payroll.filter({ payroll_run_id: runId })
      ]);
      setRunDetails(runData);
      setPayrolls(payrollsData); // Set payrolls state with fetched data
    } catch (error) {
      console.error('Error loading payroll run details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!runDetails) {
    return <div className="p-8">Payroll run not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to={createPageUrl('Payroll')} className="flex items-center text-slate-600 hover:text-slate-900 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payroll History
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Payroll Details</h1>
        <p className="text-slate-600 mb-8">
          Pay Period: {format(new Date(runDetails.start_date), 'MMM d, yyyy')} to {format(new Date(runDetails.end_date), 'MMM d, yyyy')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Total Gross Pay</p>
              <p className="text-2xl font-bold text-emerald-600">${(runDetails.total_gross_pay || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Employees Paid</p>
              <p className="text-2xl font-bold">{runDetails.total_employees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Run Date</p>
              <p className="text-2xl font-bold">{format(new Date(runDetails.run_date), 'MMM d, yyyy')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Employee Details */}
        <div className="space-y-4">
          {payrolls.map(record => ( // Using payrolls state as payrollRecords
            <Card key={record.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{record.user_full_name || record.user_email}</CardTitle>
                    <p className="text-slate-500 capitalize">{record.payment_type.replace('_', ' ')} Employee</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800">
                    ${record.gross_pay.toLocaleString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500">Hours Worked</p>
                    <p className="font-semibold">{record.total_hours?.toFixed(2) || 0}</p>
                  </div>
                  {(record.total_mileage > 0) && (
                    <div>
                      <p className="text-sm text-slate-500">Miles Driven</p>
                      <p className="font-semibold">{record.total_mileage?.toFixed(1) || 0}</p>
                    </div>
                  )}
                  {(record.mileage_pay > 0) && (
                    <div>
                      <p className="text-sm text-slate-500">Mileage Pay</p>
                      <p className="font-semibold">${record.mileage_pay?.toFixed(2) || 0}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-500">Net Pay</p>
                    <p className="font-semibold text-emerald-600">${record.net_pay.toLocaleString()}</p>
                  </div>
                </div>

                {/* Detailed Calculation Breakdown */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Pay Calculation Details</h4>
                  <div className="space-y-2 text-sm">
                    {record.payment_type === 'hourly' && (
                      <div className="flex justify-between">
                        <span>{record.total_hours?.toFixed(2)} hours × ${record.calculation_details?.rate}</span>
                        <span>${(record.total_hours * (record.calculation_details?.rate || 0)).toFixed(2)}</span>
                      </div>
                    )}
                    {record.payment_type === 'piece_rate' && (
                      <>
                        <div className="flex justify-between">
                          <span>Pieces Completed: {record.calculation_details?.pieces_completed || 0}</span>
                          <span>Rate per piece: ${record.calculation_details?.rate_per_piece?.toFixed(2) || 0}</span>
                        </div>
                        {record.calculation_details?.bonus_rate > 0 && (
                          <div className="flex justify-between">
                            <span>Bonus Pay</span>
                            <span>${record.calculation_details?.bonus_rate?.toFixed(2) || 0}</span>
                          </div>
                        )}
                        <hr className="my-1" />
                        <div className="flex justify-between font-semibold">
                          <span>Total Gross Pay</span>
                          <span>${record.gross_pay.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    {record.payment_type === 'salary' && (
                      <>
                        <div className="flex justify-between">
                          <span>Annual Salary</span>
                          <span>${(record.calculation_details?.annual_salary || 0).toLocaleString()}</span>
                        </div>
                        <hr className="my-1" />
                        <div className="flex justify-between font-semibold">
                          <span>Pay Period Amount</span>
                          <span>${record.gross_pay.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    {record.payment_type === 'commission' && (
                      <>
                        <div className="flex justify-between">
                          <span>Commission Rate</span>
                          <span>{record.calculation_details?.commission_rate * 100}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Revenue</span>
                          <span>${(record.calculation_details?.revenue || 0).toLocaleString()}</span>
                        </div>
                        <hr className="my-1" />
                        <div className="flex justify-between font-semibold">
                          <span>Calculated Gross Pay</span>
                          <span>${record.gross_pay.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    {record.payment_type === 'mileage' && (
                      <div className="flex justify-between">
                        <span>{record.total_mileage?.toFixed(1)} miles × ${record.calculation_details?.mileage_rate?.toFixed(2)}</span>
                        <span>${record.mileage_pay?.toFixed(2)}</span>
                      </div>
                    )}
                    {record.payment_type === 'mileage_plus' && (
                      <>
                        <div className="flex justify-between">
                          <span>Base pay: {record.total_hours?.toFixed(2)} hours × ${record.calculation_details?.base_rate?.toFixed(2)}</span>
                          <span>${(record.total_hours * (record.calculation_details?.base_rate || 0)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mileage: {record.total_mileage?.toFixed(1)} miles × ${record.calculation_details?.mileage_rate?.toFixed(2)}</span>
                          <span>${record.mileage_pay?.toFixed(2)}</span>
                        </div>
                        {record.calculation_details?.bonus_rate > 0 && (
                          <div className="flex justify-between">
                            <span>Bonus Pay</span>
                            <span>${record.calculation_details?.bonus_rate?.toFixed(2) || 0}</span>
                          </div>
                        )}
                        <hr className="my-1" />
                        <div className="flex justify-between font-semibold">
                          <span>Total Gross Pay</span>
                          <span>${record.gross_pay.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    {/* Add a default/fallback message if payment_type is not recognized or has no detailed calculation */}
                    {!['hourly', 'piece_rate', 'salary', 'commission', 'mileage', 'mileage_plus'].includes(record.payment_type) && (
                      <div className="flex justify-between">
                        <span>Gross Pay Calculated</span>
                        <span>${record.gross_pay.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
