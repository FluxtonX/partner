
import React, { useState, useEffect, useCallback } from 'react';
import { PayrollRun, User, WorkLog, Project, Payroll } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, sub, add } from 'date-fns';
import { CreditCard, Calendar as CalendarIcon, Play, Loader2, Clock, Filter, Edit, User as UserIcon, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

import WorkLogForm from '../components/worklogs/WorkLogForm';
import SubcontractorPayroll from '../components/payroll/SubcontractorPayroll';

export default function PayrollPage() {
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [schedule, setSchedule] = useState('weekly');
  const [payPeriod, setPayPeriod] = useState({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  // Work Logs state
  const [filteredUser, setFilteredUser] = useState('all');
  const [filteredProject, setFilteredProject] = useState('all');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const handleDateChange = useCallback((date) => {
    let from, to;
    if (schedule === 'weekly') {
      from = startOfWeek(date, { weekStartsOn: 1 });
      to = endOfWeek(date, { weekStartsOn: 1 });
    } else if (schedule === 'bi-weekly') {
      // This is a simplified bi-weekly, needs more logic for true bi-weekly cycles
      from = startOfWeek(date, { weekStartsOn: 1 });
      to = endOfWeek(add(from, { weeks: 1 }), { weekStartsOn: 1 });
    } else { // monthly
      from = startOfMonth(date);
      to = endOfMonth(date);
    }
    setPayPeriod({ from, to });
  }, [schedule]); // Dependency array for useCallback

  useEffect(() => {
    handleDateChange(new Date());
  }, [schedule, handleDateChange]); // Updated dependency array

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (user.role !== 'admin') {
        // Non-admin users can only see their own logs
        const [runs, userLogs, projectsData] = await Promise.all([
          PayrollRun.list('-run_date'),
          WorkLog.filter({ user_email: user.email }, '-start_time'),
          Project.list()
        ]);
        setPayrollRuns(runs);
        setWorkLogs(userLogs);
        setProjects(projectsData);
        setUsers([user]); // Only the current user for non-admins
      } else {
        // Admin can see all data
        const [runs, allLogs, usersData, projectsData] = await Promise.all([
          PayrollRun.list('-run_date'),
          WorkLog.list('-start_time'),
          User.list(),
          Project.list()
        ]);
        setPayrollRuns(runs);
        setWorkLogs(allLogs);
        setUsers(usersData);
        setProjects(projectsData);
      }
    } catch (error) {
      console.error('Error loading payroll data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runPayroll = async () => {
    setIsCalculating(true);
    const startDate = payPeriod.from;
    const endDate = payPeriod.to;
    
    try {
      // 1. Create a PayrollRun entry
      const newRun = await PayrollRun.create({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        run_date: new Date().toISOString(),
        status: 'processing',
      });

      // 2. Fetch all data needed for payroll calculation
      const [allUsers, workLogsInPeriod, projectsInPeriod] = await Promise.all([
        User.list(),
        WorkLog.filter({ 
          start_time__gte: startDate.toISOString(), 
          end_time__lte: endDate.toISOString() 
        }),
        Project.filter({ 
          actual_completion__gte: startDate.toISOString(), 
          actual_completion__lte: endDate.toISOString() 
        })
      ]);

      let totalGrossPay = 0;
      const payrollRecords = [];

      for (const user of allUsers) {
        let grossPay = 0;
        let totalHours = 0;
        let totalMileage = 0;
        let mileagePay = 0;
        let commissionEarned = 0;
        const calculationDetails = {};

        const userWorkLogs = workLogsInPeriod.filter(log => log.user_email === user.email && log.duration_hours);
        totalHours = userWorkLogs.reduce((sum, log) => sum + log.duration_hours, 0);
        totalMileage = userWorkLogs.reduce((sum, log) => sum + (log.total_mileage || 0), 0);

        switch (user.payment_type) {
          case 'hourly':
            grossPay = totalHours * (user.hourly_rate || 0);
            calculationDetails.rate = user.hourly_rate;
            calculationDetails.hours = totalHours;
            break;
          case 'piece_rate':
            // Assuming piece rate is also calculated based on hours for simplicity or specific logic
            grossPay = totalHours * ((user.hourly_rate || 0) + (user.bonus_rate || 0));
            calculationDetails.base_rate = user.hourly_rate;
            calculationDetails.bonus_rate = user.bonus_rate;
            calculationDetails.hours = totalHours;
            break;
          case 'mileage':
            mileagePay = totalMileage * (user.mileage_rate || 0);
            grossPay = mileagePay;
            calculationDetails.mileage_rate = user.mileage_rate;
            calculationDetails.total_mileage = totalMileage;
            break;
          case 'mileage_plus':
            const basePay = totalHours * (user.hourly_rate || 0);
            mileagePay = totalMileage * (user.mileage_rate || 0);
            const bonusPay = (user.bonus_rate || 0); // Flat bonus rate
            grossPay = basePay + mileagePay + bonusPay;
            calculationDetails.base_rate = user.hourly_rate;
            calculationDetails.hours = totalHours;
            calculationDetails.mileage_rate = user.mileage_rate;
            calculationDetails.total_mileage = totalMileage;
            calculationDetails.bonus_rate = user.bonus_rate;
            break;
          case 'salary':
            const divisor = schedule === 'weekly' ? 52 : schedule === 'bi-weekly' ? 26 : 12;
            grossPay = (user.salary_amount || 0) / divisor;
            calculationDetails.annual_salary = user.salary_amount;
            calculationDetails.divisor = divisor;
            break;
          case 'commission':
            const userProjects = projectsInPeriod.filter(p => p.assigned_to === user.email);
            commissionEarned = userProjects.reduce((sum, p) => sum + (p.actual_cost || 0), 0) * (user.commission_rate || 0);
            grossPay = commissionEarned;
            calculationDetails.commission_rate = user.commission_rate;
            calculationDetails.revenue = userProjects.reduce((sum, p) => sum + (p.actual_cost || 0), 0);
            break;
          default:
            grossPay = 0;
        }
        
        totalGrossPay += grossPay;

        payrollRecords.push({
          payroll_run_id: newRun.id,
          user_email: user.email,
          user_full_name: user.full_name,
          pay_period: `${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`,
          payment_type: user.payment_type,
          gross_pay: grossPay,
          total_hours: totalHours,
          total_mileage: totalMileage,
          mileage_pay: mileagePay,
          commission_earned: commissionEarned,
          deductions: 0, // Placeholder
          net_pay: grossPay, // Placeholder
          calculation_details: calculationDetails
        });
      }

      // 3. Bulk create payroll records
      if (payrollRecords.length > 0) {
        await Payroll.bulkCreate(payrollRecords);
      }

      // 4. Update the PayrollRun
      await PayrollRun.update(newRun.id, {
        status: 'completed',
        total_gross_pay: totalGrossPay,
        total_employees: allUsers.length,
      });

      // 5. Refresh the list (both payroll runs and work logs)
      loadData();

    } catch (error) {
      console.error('Error running payroll:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleUpdateLog = async (logData, logId) => {
    if (!logId) return;
    try {
      await WorkLog.update(logId, logData);
      setShowEditForm(false);
      setEditingLog(null);
      loadData(); // Reload all data after update
    } catch (error) {
      console.error('Error updating work log:', error);
    }
  };

  const getFilteredLogs = () => {
    return workLogs.filter(log => {
      const userMatch = filteredUser === 'all' || log.user_email === filteredUser;
      const projectMatch = filteredProject === 'all' || log.project_id === filteredProject;
      return userMatch && projectMatch;
    });
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  const getLocationDisplay = (location) => {
    if (!location) return 'No location';
    if (location.address) return location.address;
    if (location.latitude && location.longitude) return `${location.latitude?.toFixed(6)}, ${location.longitude?.toFixed(6)}`;
    return 'Unknown location';
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Payroll & Time Tracking</h1>
            <p className="text-slate-600">Manage payroll calculations and monitor work log entries.</p>
          </div>
        </div>

        <Tabs defaultValue="payroll" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Employee Payroll
            </TabsTrigger>
            <TabsTrigger value="subcontractors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Subcontractor Payroll
            </TabsTrigger>
            <TabsTrigger value="worklogs" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Work Log Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payroll" className="space-y-8">
            {/* Employee Payroll Runner */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Run New Payroll</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row items-center gap-4">
                <Select value={schedule} onValueChange={setSchedule}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-64 justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(payPeriod.from, 'MMM d, yyyy')} - {format(payPeriod.to, 'MMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={payPeriod.from}
                      onSelect={handleDateChange}
                    />
                  </PopoverContent>
                </Popover>
                <Button onClick={runPayroll} disabled={isCalculating} className="bg-emerald-600 hover:bg-emerald-700">
                  {isCalculating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Calculating...</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Run Payroll</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Past Payroll Runs */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Employee Payroll History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <p>Loading history...</p> : (
                  <div className="space-y-4">
                    {payrollRuns.length > 0 ? payrollRuns.map(run => (
                      <Link to={createPageUrl(`PayrollRunDetail?id=${run.id}`)} key={run.id} className="block">
                        <div className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-800">
                                Pay Period: {format(new Date(run.start_date), 'MMM d, yyyy')} - {format(new Date(run.end_date), 'MMM d, yyyy')}
                              </p>
                              <p className="text-sm text-slate-500">Run on: {format(new Date(run.run_date), 'MMM d, h:mm a')}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-lg font-bold text-emerald-600">${(run.total_gross_pay || 0).toLocaleString()}</p>
                               <p className="text-sm text-slate-500">{run.total_employees} employees</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )) : <p className="text-center text-slate-500 py-8">No payroll history found.</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subcontractors" className="space-y-6">
            <SubcontractorPayroll />
          </TabsContent>

          <TabsContent value="worklogs" className="space-y-6">
            {/* Filters */}
            {currentUser?.role === 'admin' && (
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <Select value={filteredUser} onValueChange={setFilteredUser}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.email}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Select value={filteredProject} onValueChange={setFilteredProject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by project" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                            {project.title}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            )}

            {/* Work Logs */}
            <div className="space-y-4">
              {isLoading ? <p>Loading work logs...</p> : (
                <>
                  {filteredLogs.map(log => (
                    <Card key={log.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg">{getProjectName(log.project_id)}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 mt-1">
                              <div className="flex items-center gap-1">
                                <UserIcon className="w-4 h-4" />
                                <span>{getUserName(log.user_email)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{format(new Date(log.start_time), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex items-center">
                            {log.duration_hours && (
                              <Badge className="bg-blue-100 text-blue-800">
                                {log.duration_hours.toFixed(2)} hrs
                              </Badge>
                            )}
                            {log.total_mileage && (
                              <Badge className="bg-green-100 text-green-800 ml-2">
                                {log.total_mileage.toFixed(1)} miles
                              </Badge>
                            )}
                            {currentUser?.role === 'admin' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="ml-2"
                                onClick={() => {
                                  setEditingLog(log);
                                  setShowEditForm(true);
                                }}
                              >
                                <Edit className="w-4 h-4 text-slate-500" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm text-slate-700 mb-1">Clock In</h4>
                              <p className="text-sm">{format(new Date(log.start_time), 'h:mm a')}</p>
                              {log.start_location && (
                                <div className="flex items-start gap-1 text-xs text-slate-500 mt-1">
                                  <span>{getLocationDisplay(log.start_location)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm text-slate-700 mb-1">Clock Out</h4>
                              <p className="text-sm">
                                {log.end_time ? format(new Date(log.end_time), 'h:mm a') : 'Still active'}
                              </p>
                              {log.end_location && (
                                <div className="flex items-start gap-1 text-xs text-slate-500 mt-1">
                                  <span>{getLocationDisplay(log.end_location)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {log.notes && (
                          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                            <h4 className="font-semibold text-sm text-slate-700 mb-1">Notes</h4>
                            <p className="text-sm text-slate-600">{log.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {filteredLogs.length === 0 && (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 text-lg">No work logs found</p>
                      <p className="text-slate-400">Time entries will appear here once users start clocking in.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {showEditForm && editingLog && (
          <WorkLogForm
            worklog={editingLog}
            users={users}
            projects={projects}
            onSubmit={handleUpdateLog}
            onCancel={() => {
              setShowEditForm(false);
              setEditingLog(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
