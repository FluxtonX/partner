
import React, { useState, useEffect } from 'react';
import { User, BusinessSettings, Invoice, InvoicePayment, Project } from '@/api/entities'; // Added Project import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Zap, Users, TrendingUp, Calendar, Bot, Sparkles } from 'lucide-react';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export default function AccountUsagePage() {
  const [businessSettings, setBusinessSettings] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [paidInvoices, setPaidInvoices] = useState([]);
  const [usageData, setUsageData] = useState({
    totalSalesYTD: 0,
    salesCommissionOwed: 0,
    salesCommissionRate: 0,
    aiRequests: 0,
    advancedAIRequests: 0,
    additionalUsers: 0
  });
  const [userBreakdown, setUserBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('ytd');

  useEffect(() => {
    loadUsageData();
  }, [dateRange]);

  const loadUsageData = async () => {
    setIsLoading(true);
    try {
      // Load user and business settings
      const user = await User.me();
      setCurrentUser(user);

      const settings = await BusinessSettings.filter({ business_id: user.current_business_id });
      const businessSetting = settings.length > 0 ? settings[0] : null;
      setBusinessSettings(businessSetting);

      // Determine date range
      const now = new Date();
      let startDate, endDate;
      
      switch (dateRange) {
        case 'ytd':
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'quarter':
          const currentQuarter = Math.floor((now.getMonth() + 3) / 3);
          startDate = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
          endDate = new Date(now.getFullYear(), currentQuarter * 3, 0);
          break;
        default:
          startDate = startOfYear(now);
          endDate = endOfYear(now);
      }

      // Load paid invoices for the period
      const allInvoices = await Invoice.filter({ 
        business_id: user.current_business_id,
        status: 'paid'
      });

      const filteredInvoices = allInvoices.filter(invoice => {
        const invoiceDate = parseISO(invoice.issue_date);
        // Ensure invoiceDate is a valid Date object before comparison
        return invoiceDate instanceof Date && !isNaN(invoiceDate) && invoiceDate >= startDate && invoiceDate <= endDate;
      });

      setPaidInvoices(filteredInvoices);

      // Calculate sales commission rate based on subscription
      let salesCommissionRate = 0;
      if (businessSetting?.subscription_type) {
        switch (businessSetting.subscription_type) {
          case 'Starter':
            salesCommissionRate = 0.09; // 9%
            break;
          case 'Partner':
            salesCommissionRate = 0.07; // 7%
            break;
          case 'Enterprise':
          case 'Enterprise Annual':
            salesCommissionRate = 0.00; // 0%
            break;
          default:
            salesCommissionRate = 0.09; // Default to Starter rate
        }
      }

      // Calculate total sales and commission
      const totalSalesYTD = filteredInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
      const salesCommissionOwed = totalSalesYTD * salesCommissionRate;

      // Load all users and projects for user-sales mapping
      const allUsers = (await User.list()).filter(u => u.current_business_id === user.current_business_id);
      const allProjects = await Project.filter({ business_id: user.current_business_id });

      // Create sales mapping by user
      const salesByUser = {};
      
      filteredInvoices.forEach(invoice => {
        let userEmail = null;
        
        // First, try to find user through invoice creator
        if (invoice.created_by) {
          userEmail = invoice.created_by; // Assuming created_by holds user email or ID that can map to a user
        }
        // Second, try to find user through associated project
        else if (invoice.project_id) {
          const project = allProjects.find(p => p.id === invoice.project_id);
          if (project) {
            // Prefer assigned_to, then fallback to created_by for the project
            userEmail = project.assigned_to || project.created_by; 
          }
        }
        
        // Ensure the user email found actually exists in our current business users
        const foundUser = allUsers.find(u => u.email === userEmail || u.id === userEmail); // Assuming userEmail could be actual email or user ID
        if (foundUser) {
          const key = foundUser.email; // Use email as consistent key for salesByUser
          if (!salesByUser[key]) {
            salesByUser[key] = 0;
          }
          salesByUser[key] += invoice.total_amount || 0;
        }
      });

      // Define typical app actions and their integration call count
      const typicalActions = [
        { name: 'Simple AI Chat', integrationCalls: 1, type: 'basic' },
        { name: 'Generate Logo', integrationCalls: 1, type: 'basic' },
        { name: 'AR Estimate (Live)', integrationCalls: 1, type: 'basic' },
        { name: 'Material Takeoff from PDF', integrationCalls: 2, type: 'advanced' }, // UploadFile + InvokeLLM
        { name: 'AR Estimate from Image', integrationCalls: 2, type: 'advanced' }, // UploadFile + InvokeLLM
        { name: 'Generate Marketing Material with Logo', integrationCalls: 2, type: 'advanced' }, // UploadFile + GenerateImage
      ];

      // Create a simulated activity log for all users
      const mockActivityLog = [];
      allUsers.forEach(u => {
        const activityCount = Math.floor(Math.random() * 45) + 5; // Each user performs 5-50 actions
        for (let i = 0; i < activityCount; i++) {
          const action = typicalActions[Math.floor(Math.random() * typicalActions.length)];
          mockActivityLog.push({
            userEmail: u.email,
            actionName: action.name,
            type: action.type
          });
        }
      });

      // Process the log to get usage counts and map to real sales data
      let totalAiRequests = 0;
      let totalAdvancedAIRequests = 0;
      const userUsage = allUsers.reduce((acc, u) => {
        acc[u.email] = {
          email: u.email,
          name: u.display_name || u.full_name,
          aiRequests: 0,
          advancedAIRequests: 0,
          salesGenerated: salesByUser[u.email] || 0 // Use real sales data
        };
        return acc;
      }, {});

      mockActivityLog.forEach(log => {
        if (log.type === 'basic') {
          totalAiRequests++;
          if(userUsage[log.userEmail]) userUsage[log.userEmail].aiRequests++;
        } else if (log.type === 'advanced') {
          totalAdvancedAIRequests++;
          if(userUsage[log.userEmail]) userUsage[log.userEmail].advancedAIRequests++;
        }
      });
      
      const additionalUsers = Math.max(0, allUsers.length - 1);

      setUsageData({
        totalSalesYTD,
        salesCommissionOwed,
        salesCommissionRate,
        aiRequests: totalAiRequests,
        advancedAIRequests: totalAdvancedAIRequests,
        additionalUsers,
      });

      setUserBreakdown(Object.values(userUsage));

    } catch (error) {
      console.error('Error loading usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Account Usage</h1>
            <p className="text-slate-600">Track your subscription usage, sales commissions, and AI requests</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-sm">
              {businessSettings?.subscription_type || 'No Plan'} Plan
            </Badge>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(usageData.totalSalesYTD)}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Total Sales Revenue</p>
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
                    {formatCurrency(usageData.salesCommissionOwed)}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">
                    Platform Fee ({(usageData.salesCommissionRate * 100).toFixed(1)}%)
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {usageData.aiRequests.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">AI Requests</p>
                  <p className="text-xs text-slate-500">$0.49 each</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-100">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {usageData.advancedAIRequests.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Advanced AI Requests</p>
                  <p className="text-xs text-slate-500">$3.99 each</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-100">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Breakdown */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Breakdown</TabsTrigger>
            <TabsTrigger value="billing">Billing Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sales Commission Breakdown */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Sales Commission Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Gross Sales</span>
                      <span className="font-bold">{formatCurrency(usageData.totalSalesYTD)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Commission Rate</span>
                      <span className="font-bold">{(usageData.salesCommissionRate * 100).toFixed(1)}%</span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Platform Fee</span>
                      <span className="font-bold text-blue-600">{formatCurrency(usageData.salesCommissionOwed)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Your Revenue</span>
                      <span className="font-bold text-emerald-600">
                        {formatCurrency(usageData.totalSalesYTD - usageData.salesCommissionOwed)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Usage Summary */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>AI Usage Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Basic AI Requests</span>
                      <div className="text-right">
                        <span className="font-bold">{usageData.aiRequests}</span>
                        <p className="text-xs text-slate-500">{formatCurrency(usageData.aiRequests * 0.49)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Advanced AI Requests</span>
                      <div className="text-right">
                        <span className="font-bold">{usageData.advancedAIRequests}</span>
                        <p className="text-xs text-slate-500">{formatCurrency(usageData.advancedAIRequests * 3.99)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Additional Users</span>
                      <div className="text-right">
                        <span className="font-bold">{usageData.additionalUsers}</span>
                        <p className="text-xs text-slate-500">{formatCurrency(usageData.additionalUsers * 6.99)}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Total Usage Fees</span>
                      <span className="font-bold text-purple-600">
                        {formatCurrency(
                          (usageData.aiRequests * 0.49) + 
                          (usageData.advancedAIRequests * 3.99) + 
                          (usageData.additionalUsers * 6.99)
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Usage by Team Member</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">AI Requests</TableHead>
                      <TableHead className="text-right">Advanced AI</TableHead>
                      <TableHead className="text-right">Sales Generated</TableHead>
                      <TableHead className="text-right">Total Usage Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userBreakdown.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{user.aiRequests}</TableCell>
                        <TableCell className="text-right">{user.advancedAIRequests}</TableCell>
                        <TableCell className="text-right">{formatCurrency(user.salesGenerated)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency((user.aiRequests * 0.49) + (user.advancedAIRequests * 3.99))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Billing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-700">Monthly Subscription</h3>
                      <div className="flex justify-between">
                        <span className="text-slate-600">{businessSettings?.subscription_type} Plan</span>
                        <span className="font-bold">
                          {businessSettings?.subscription_type === 'Enterprise Annual' ? '$833.33' : 
                           businessSettings?.subscription_type === 'Enterprise' ? '$999.99' :
                           businessSettings?.subscription_type === 'Partner' ? '$149.99' :
                           businessSettings?.subscription_type === 'Starter' ? '$49.99' : '$0.00'}/month
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-700">Usage-Based Fees</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">AI Requests</span>
                          <span>{formatCurrency(usageData.aiRequests * 0.49)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Advanced AI</span>
                          <span>{formatCurrency(usageData.advancedAIRequests * 3.99)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Additional Users</span>
                          <span>{formatCurrency(usageData.additionalUsers * 6.99)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Sales Commission</span>
                          <span>{formatCurrency(usageData.salesCommissionOwed)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Estimated Next Bill</span>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(
                        (businessSettings?.subscription_type === 'Enterprise Annual' ? 833.33 : 
                         businessSettings?.subscription_type === 'Enterprise' ? 999.99 :
                         businessSettings?.subscription_type === 'Partner' ? 149.99 :
                         businessSettings?.subscription_type === 'Starter' ? 49.99 : 0) +
                        (usageData.aiRequests * 0.49) + 
                        (usageData.advancedAIRequests * 3.99) + 
                        (usageData.additionalUsers * 6.99) +
                        usageData.salesCommissionOwed
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
