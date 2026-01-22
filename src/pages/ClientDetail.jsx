
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Client, Project, Communication, User, Invoice } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Edit, ArrowLeft, Building, Users, FolderOpen, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

import ClientDetailHeader from '../components/clients/detail/ClientDetailHeader';
import ClientProjectsList from '../components/clients/detail/ClientProjectsList';
import ClientCommunicationFeed from '../components/clients/detail/ClientCommunicationFeed';
import ClientForm from '../components/clients/ClientForm';
import EstimateBuilder from '../components/estimates/EstimateBuilder';
import ClientFinancialsTab from '../components/clients/detail/ClientFinancialsTab';

export default function ClientDetailPage() {
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEstimateBuilder, setShowEstimateBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const location = useLocation();
  const clientId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    if (clientId) {
      loadData();
    }
  }, [clientId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clientData, projectsData, usersData, invoicesData] = await Promise.all([
        Client.get(clientId),
        Project.filter({ client_id: clientId }, '-updated_date'),
        User.list(),
        Invoice.filter({ client_id: clientId }, '-issue_date')
      ]);

      setClient(clientData);
      setProjects(projectsData);
      setUsers(usersData);
      setInvoices(invoicesData);

      if (projectsData.length > 0) {
        const projectIds = projectsData.map((p) => p.id);
        const commsData = await Communication.filter({ project_id__in: projectIds }, '-created_date');
        setCommunications(commsData);
      } else {
        setCommunications([]);
      }
    } catch (error) {
      console.error('Error loading client details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (clientData) => {
    try {
      await Client.update(client.id, clientData);
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!client) return;

    const oldStatus = client.status;
    // Optimistic update
    setClient(prevClient => ({ ...prevClient, status: newStatus }));

    try {
      await Client.update(client.id, { status: newStatus });
      toast.success(`Client status updated to "${newStatus.replace('_', ' ')}"`);
    } catch (error) {
      // Revert on failure
      setClient(prevClient => ({ ...prevClient, status: oldStatus }));
      console.error("Error updating client status:", error);
      toast.error("Failed to update client status.");
    }
  };

  const handleEditClient = () => {
    setShowForm(true);
  };

  const handleCreateEstimate = () => {
    setShowEstimateBuilder(true);
  };

  const handleEstimateSubmit = async (estimateData) => {
    try {
      const newEstimate = await Project.create({
        ...estimateData,
        status: 'estimate',
        client_id: client.id
      });
      const barcode = `EST-${newEstimate.id}`;
      await Project.update(newEstimate.id, { barcode });
      setShowEstimateBuilder(false);
      loadData();
    } catch (error) {
      console.error('Error creating estimate:', error);
    }
  };

  const handleCreateProject = () => {
    if (client) {
      const url = createPageUrl(`ProjectForm?client_id=${client.id}`);
      window.location.href = url;
    }
  };

  const clientStats = {
    totalProjects: projects.length
  };

  if (isLoading || !client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <ClientDetailHeader
          client={client}
          projects={projects}
          onEdit={handleEditClient}
          onCreateEstimate={handleCreateEstimate}
          onStatusChange={handleStatusChange}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-700">Contact Person</h3>
                  <p>{client.contact_person || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700">Email</h3>
                  <p>{client.email || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700">Phone</h3>
                  <p>{client.phone || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700">Address</h3>
                  <p>{client.address || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700">Industry</h3>
                  <p className="capitalize">{client.industry || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <ClientProjectsList
              projects={projects}
              client={client}
              onCreateProject={handleCreateProject} />

          </TabsContent>

          <TabsContent value="communications">
            <ClientCommunicationFeed
              client={client}
              onUpdate={loadData} />

          </TabsContent>

          <TabsContent value="financials">
            <ClientFinancialsTab invoices={invoices} />
          </TabsContent>

          <TabsContent value="documents">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Client Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-500">Client documents and files will be listed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showForm && (
          <ClientForm
            client={client}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}

        {showEstimateBuilder && (
          <EstimateBuilder
            estimate={{ client_id: client.id }}
            clients={[client]}
            users={users}
            onSubmit={handleEstimateSubmit}
            onCancel={() => setShowEstimateBuilder(false)}
          />
        )}
      </div>
    </div>
  );
}
