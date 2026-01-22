
import React, { useState, useEffect } from 'react';
import { Client, Project, User, Invoice } from '@/api/entities';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Megaphone, Users, DollarSign, Percent, BarChart, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageContext';

import MarketingMetrics from '../components/marketing/MarketingMetrics';
import ChannelIntegrations from '../components/marketing/ChannelIntegrations';
import ReferralPerformanceTable from '../components/marketing/ReferralPerformanceTable';
import EmailTemplateManager from '../components/marketing/EmailTemplateManager';
import EmailCampaignManager from '../components/marketing/EmailCampaignManager';
import SuggestedItems from '../components/ads/SuggestedItems';

export default function MarketingPage() {
  const { t } = useLanguage();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clientsData, projectsData, invoicesData] = await Promise.all([
        Client.list(),
        Project.list(),
        Invoice.list({ status: 'paid' }) // Fetch only paid invoices for efficiency
      ]);
      setClients(clientsData);
      setProjects(projectsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Error loading marketing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Megaphone className="w-8 h-8 text-slate-700" />
              <h1 className="text-3xl font-bold text-slate-900">Marketing Hub</h1>
            </div>
            <p className="text-slate-600">Monitor marketing performance and manage your digital presence.</p>
          </div>
        </div>

        {/* Suggested Items */}
        <SuggestedItems placement="marketing" maxItems={2} className="mb-8" />

        {/* Metrics Overview */}
        <MarketingMetrics clients={clients} projects={projects} invoices={invoices} isLoading={isLoading} />

        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Performance Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
            <TabsTrigger value="channels">Channel Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ReferralPerformanceTable clients={clients} projects={projects} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
            <EmailCampaignManager />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <EmailTemplateManager />
          </TabsContent>

          <TabsContent value="channels" className="mt-6">
            <ChannelIntegrations />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
