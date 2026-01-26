import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createPageUrl } from "@/utils";
import {
  DollarSign,
  Clock,
  Users,
  FolderOpen,
  Plus,
  ArrowUpRight,
  Calculator,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageContext";

import MetricsCards from "../components/dashboard/MetricsCards";
import ProjectStatusChart from "../components/dashboard/ProjectStatusChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import UpcomingDeadlines from "../components/dashboard/UpcomingDeadlines";
import NewsFeedWidget from "../components/news/NewsFeedWidget";
import BusinessInsightsWidget from "../components/dashboard/BusinessInsightsWidget";
import DashboardNewsWidget from "../components/news/DashboardNewsWidget";

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, currentBusiness } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Extract user name from email or user metadata
  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    return user?.email?.split("@")[0] || "User";
  };

  // Get user's first initial for avatar
  const getUserInitial = () => {
    return getUserDisplayName().charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section with User Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  Welcome back,{" "}
                  <span className="text-blue-600">{getUserDisplayName()}</span>!
                  👋
                </h1>
                <div className="space-y-2">
                  <p className="text-slate-700">
                    <span className="font-semibold">Business:</span>{" "}
                    {currentBusiness?.name || "Loading your business..."}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold">Email:</span> {user?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {getUserInitial()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Header with Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {t("dashboard_header_title") || "Dashboard Overview"}
              </h2>
              <p className="text-slate-600 mt-1">
                {t("dashboard_header_subtitle") || "Manage your business"}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl("Estimates")}>
                <Button variant="outline" className="hover:bg-slate-50">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("new_estimate") || "New Estimate"}
                </Button>
              </Link>
              <Link to={createPageUrl("Projects")}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  {t("view_projects") || "View Projects"}
                </Button>
              </Link>
            </div>
          </div>

          {/* Platform News */}
          <div className="mb-8">
            <DashboardNewsWidget />
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricsCards
              title={t("active_projects") || "Active Projects"}
              value="0"
              icon={FolderOpen}
              change="+0%"
              changeType="neutral"
            />
            <MetricsCards
              title={t("total_revenue") || "Total Revenue"}
              value="$0.00"
              icon={DollarSign}
              change="+0%"
              changeType="neutral"
            />
            <MetricsCards
              title={t("pending_estimates") || "Pending Estimates"}
              value="0"
              icon={Clock}
              change="+0"
              changeType="neutral"
            />
            <MetricsCards
              title={t("active_clients") || "Active Clients"}
              value="0"
              icon={Users}
              change="+0"
              changeType="neutral"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <ProjectStatusChart projects={[]} isLoading={isLoading} />
            </div>
            <div>
              <UpcomingDeadlines projects={[]} isLoading={isLoading} />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <BusinessInsightsWidget />
            <RecentActivity
              communications={[]}
              projects={[]}
              isLoading={isLoading}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-bold text-slate-900">
                  {t("quick_actions") || "Quick Actions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={createPageUrl("Estimates")}>
                  <Button
                    variant="outline"
                    className="w-full justify-between hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      {t("review_pending_estimates") ||
                        "Review Pending Estimates"}
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link to={createPageUrl("Clients")}>
                  <Button
                    variant="outline"
                    className="w-full justify-between hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t("manage_clients") || "Manage Clients"}
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link to={createPageUrl("Financials")}>
                  <Button
                    variant="outline"
                    className="w-full justify-between hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {t("financial_reports") || "Financial Reports"}
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link to={createPageUrl("Projects")}>
                  <Button
                    variant="outline"
                    className="w-full justify-between hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      {t("active_projects") || "Active Projects"}
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <NewsFeedWidget />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
