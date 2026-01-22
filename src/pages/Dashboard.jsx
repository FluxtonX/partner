
import React, { useState, useEffect } from "react";
// Removed base44 API imports - running locally only
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  FolderOpen,
  Plus,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  Calculator
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { motion } from "framer-motion";
import { useLanguage } from '@/components/providers/LanguageContext';

import MetricsCards from "../components/dashboard/MetricsCards";
import ProjectStatusChart from "../components/dashboard/ProjectStatusChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import UpcomingDeadlines from "../components/dashboard/UpcomingDeadlines";
import NewsFeedWidget from "../components/news/NewsFeedWidget";
import BusinessInsightsWidget from '../components/dashboard/BusinessInsightsWidget';
import DashboardNewsWidget from '../components/news/DashboardNewsWidget';

export default function Dashboard() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initDashboard = async () => {
      // Stubbed out API calls - running locally only
      // const user = await User.me().catch(() => null);
      setCurrentUser(null);
      
      // Load general dashboard data
      await loadDashboardData();
      
      // Check accreditation expiries (stubbed out)
      // await checkAccreditationExpiries();
    };
    initDashboard();
  }, []);

  const checkAccreditationExpiries = async () => {
    // Stubbed out - running locally only
    // TODO: Implement when backend is ready
    console.log("Accreditation expiry check stubbed out");
  };

  const loadDashboardData = async () => {
    try {
      // Using stub API with dummy data - running locally only
      const [projectsData, clientsData, communicationsData, expensesData] = await Promise.all([
        Project.list("-updated_date"),
        Client.list("-updated_date"),
        Communication.list("-created_date", 10),
        Expense.list("-created_date")
      ]);
      
      setProjects(projectsData);
      setClients(clientsData);
      setCommunications(communicationsData);
      setExpenses(expensesData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMetrics = () => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    // Summing actual_cost if available, otherwise estimated_cost
    const totalRevenue = projects.reduce((sum, p) => sum + (p.actual_cost || p.estimated_cost || 0), 0);
    const pendingEstimates = projects.filter(p => p.status === 'estimate').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    return {
      activeProjects,
      totalRevenue,
      pendingEstimates,
      completedProjects
    };
  };

  const metrics = getMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('dashboard_header_title')}</h1>
            <p className="text-slate-600">{t('dashboard_header_subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("Estimates")}>
              <Button variant="outline" className="hover:bg-slate-50">
                <Plus className="w-4 h-4 mr-2" />
                {t('new_estimate')}
              </Button>
            </Link>
            <Link to={createPageUrl("Projects")}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <FolderOpen className="w-4 h-4 mr-2" />
                {t('view_projects')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Platform News - Prominently Displayed at Top */}
        <div className="mb-8">
          <DashboardNewsWidget />
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCards 
            title={t('active_projects')}
            value={metrics.activeProjects}
            icon={FolderOpen}
            change="+12%"
            changeType="positive"
          />
          <MetricsCards 
            title={t('total_revenue')}
            value={`$${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            change="+8.2%"
            changeType="positive"
          />
          <MetricsCards 
            title={t('pending_estimates')}
            value={metrics.pendingEstimates}
            icon={Clock}
            change="-2"
            changeType="neutral"
          />
          <MetricsCards 
            title={t('active_clients')}
            value={clients.filter(c => c.status === 'active').length}
            icon={Users}
            change="+3"
            changeType="positive"
          />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ProjectStatusChart projects={projects} isLoading={isLoading} />
          </div>
          <div>
            <UpcomingDeadlines projects={projects} isLoading={isLoading} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* BusinessInsightsWidget is now always rendered */}
          <BusinessInsightsWidget /> 
          <RecentActivity communications={communications} projects={projects} isLoading={isLoading} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-bold text-slate-900">{t('quick_actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to={createPageUrl("Estimates")}>
                <Button variant="outline" className="w-full justify-between hover:bg-slate-50">
                  <span className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    {t('review_pending_estimates')}
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
              
              <Link to={createPageUrl("Clients")}>
                <Button variant="outline" className="w-full justify-between hover:bg-slate-50">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('manage_clients')}
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
              
              <Link to={createPageUrl("Financials")}>
                <Button variant="outline" className="w-full justify-between hover:bg-slate-50">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {t('financial_reports')}
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
              
              <Link to={createPageUrl("Projects")}>
                <Button variant="outline" className="w-full justify-between hover:bg-slate-50">
                  <span className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    {t('active_projects')}
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          <NewsFeedWidget />
        </div>
      </div>
    </div>
  );
}
