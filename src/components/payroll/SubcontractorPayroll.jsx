import React, { useState, useEffect } from 'react';
import { SubcontractorAssignment, User, Project, BusinessSettings, SubcontractorContract } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileText,
  User as UserIcon,
  Building
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export default function SubcontractorPayroll() {
  const [completedAssignments, setCompletedAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [assignmentsData, usersData, projectsData, settingsData, contractsData] = await Promise.all([
        SubcontractorAssignment.filter({ status: 'completed' }),
        User.list(),
        Project.list(),
        BusinessSettings.list(),
        SubcontractorContract.list()
      ]);

      setCompletedAssignments(assignmentsData);
      setUsers(usersData);
      setProjects(projectsData);
      setBusinessSettings(settingsData[0] || {});
      setContracts(contractsData);
    } catch (error) {
      console.error('Error loading subcontractor payroll data:', error);
      toast.error('Failed to load subcontractor payroll data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePayment = (assignment) => {
    const contract = contracts.find(c => c.assignment_id === assignment.id);
    if (!contract) return { finalAmount: 0, penalties: 0, holdbackAmount: 0, netPayment: 0 };

    const baseAmount = assignment.final_amount || 0;
    const penalties = (assignment.daily_delay_penalties || 0) + (assignment.completion_delay_penalties || 0);
    const holdbackPercentage = businessSettings.subcontractor_holdback_percentage || 0.1;
    const holdbackAmount = baseAmount * holdbackPercentage;
    const netPayment = baseAmount - penalties - holdbackAmount;

    return {
      baseAmount,
      penalties,
      holdbackAmount,
      netPayment: Math.max(0, netPayment)
    };
  };

  const handleVerifyCompletion = async (assignment) => {
    try {
      await SubcontractorAssignment.update(assignment.id, {
        completion_verified: true,
        verification_date: new Date().toISOString(),
        verified_by: (await User.me()).email
      });
      
      toast.success('Assignment completion verified');
      loadData();
    } catch (error) {
      console.error('Error verifying completion:', error);
      toast.error('Failed to verify completion');
    }
  };

  const handleReleaseHoldback = async (assignment) => {
    try {
      await SubcontractorAssignment.update(assignment.id, {
        holdback_released: true
      });
      
      toast.success('Holdback amount released');
      loadData();
    } catch (error) {
      console.error('Error releasing holdback:', error);
      toast.error('Failed to release holdback');
    }
  };

  const handleMarkAsPaid = async (assignment) => {
    setIsProcessingPayment(true);
    try {
      // In a real implementation, this would integrate with your payment system
      // For now, we'll just mark it as paid in a custom field or status
      await SubcontractorAssignment.update(assignment.id, {
        payment_processed: true,
        payment_date: new Date().toISOString()
      });
      
      toast.success('Payment processed successfully');
      setShowPaymentDialog(false);
      loadData();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  const getAssignmentTypeDisplay = (assignment) => {
    switch (assignment.assignment_type) {
      case 'project':
        return 'Full Project';
      case 'category':
        return `Category: ${assignment.assignment_details?.category || 'Unknown'}`;
      case 'task':
        return `Task: ${assignment.assignment_details?.description || 'Unknown'}`;
      default:
        return 'Unknown Assignment';
    }
  };

  const totalPaymentsReady = completedAssignments
    .filter(a => a.completion_verified && !a.payment_processed)
    .reduce((sum, assignment) => {
      const payment = calculatePayment(assignment);
      return sum + payment.netPayment;
    }, 0);

  const totalHoldbackAmount = completedAssignments
    .filter(a => a.completion_verified && !a.holdback_released)
    .reduce((sum, assignment) => {
      const payment = calculatePayment(assignment);
      return sum + payment.holdbackAmount;
    }, 0);

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Clock className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{completedAssignments.filter(a => a.completion_verified && !a.payment_processed).length}</p>
                <p className="text-sm text-slate-600 font-medium">Ready for Payment</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">${totalPaymentsReady.toLocaleString()}</p>
                <p className="text-sm text-slate-600 font-medium">Total Payments Due</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-600">${totalHoldbackAmount.toLocaleString()}</p>
                <p className="text-sm text-slate-600 font-medium">Total Holdback</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Assignments */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Completed Subcontractor Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedAssignments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-500 mb-2">No Completed Work</h3>
              <p className="text-slate-400">Completed subcontractor assignments will appear here for payment processing.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedAssignments.map((assignment) => {
                const payment = calculatePayment(assignment);
                const isReadyForPayment = assignment.completion_verified && !assignment.payment_processed;
                const needsVerification = !assignment.completion_verified;
                
                return (
                  <div key={assignment.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{getUserName(assignment.subcontractor_email)}</h4>
                          {needsVerification && (
                            <Badge variant="outline" className="text-amber-600 border-amber-200">
                              Needs Verification
                            </Badge>
                          )}
                          {isReadyForPayment && (
                            <Badge className="bg-emerald-100 text-emerald-800">
                              Ready for Payment
                            </Badge>
                          )}
                          {assignment.payment_processed && (
                            <Badge className="bg-slate-100 text-slate-600">
                              Paid
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-1">{getProjectName(assignment.project_id)}</p>
                        <p className="text-sm text-slate-500">{getAssignmentTypeDisplay(assignment)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">${payment.netPayment.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">Net Payment</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Base Amount</p>
                        <p className="font-medium">${payment.baseAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Penalties</p>
                        <p className="font-medium text-red-600">-${payment.penalties.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Holdback</p>
                        <p className="font-medium text-amber-600">-${payment.holdbackAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Completed</p>
                        <p className="font-medium">
                          {assignment.actual_completion_date ? 
                            format(new Date(assignment.actual_completion_date), 'MMM d, yyyy') : 
                            'Recently'
                          }
                        </p>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-500">
                        {assignment.completion_verified ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                            Verified by {assignment.verified_by}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="w-4 h-4" />
                            Awaiting verification
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {needsVerification && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVerifyCompletion(assignment)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Verify Completion
                          </Button>
                        )}
                        {assignment.completion_verified && !assignment.holdback_released && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReleaseHoldback(assignment)}
                          >
                            Release Holdback
                          </Button>
                        )}
                        {isReadyForPayment && (
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowPaymentDialog(true);
                            }}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Process Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Processing Dialog */}
      {showPaymentDialog && selectedAssignment && (
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold mb-2">{getUserName(selectedAssignment.subcontractor_email)}</h4>
                <p className="text-sm text-slate-600 mb-2">{getProjectName(selectedAssignment.project_id)}</p>
                <p className="text-sm text-slate-500">{getAssignmentTypeDisplay(selectedAssignment)}</p>
              </div>
              
              {(() => {
                const payment = calculatePayment(selectedAssignment);
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Amount:</span>
                      <span>${payment.baseAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Penalties:</span>
                      <span>-${payment.penalties.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-amber-600">
                      <span>Holdback:</span>
                      <span>-${payment.holdbackAmount.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Net Payment:</span>
                      <span>${payment.netPayment.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This will mark the payment as processed. Make sure you have actually sent the payment before confirming.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleMarkAsPaid(selectedAssignment)} 
                disabled={isProcessingPayment}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isProcessingPayment ? 'Processing...' : 'Mark as Paid'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}