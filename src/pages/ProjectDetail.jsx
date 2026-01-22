
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Project, Client, Communication, Expense, Invoice, ActivityLog, User, ChangeOrder, UserBusiness, Asset } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, MessageSquare, DollarSign, FileText, Activity, ListChecks, Folder, History, Video, Users } from 'lucide-react';

// Import tab components
import ProjectDetailHeader from '../components/project_detail/ProjectDetailHeader';
import CommunicationFeed from '../components/project_detail/CommunicationFeed';
import FinancialsTab from '../components/project_detail/FinancialsTab';
import InvoicesTab from '../components/project_detail/InvoicesTab';
import ProjectForm from '../components/projects/ProjectForm';
import DocumentManager from '../components/projects/DocumentManager';
import ActivityFeed from '../components/projects/ActivityFeed';
import ChangeOrderBuilder from '../components/change-orders/ChangeOrderBuilder';
import TasksAndMaterialsTab from '../components/project_detail/TasksAndMaterialsTab';
import LiveFeedTab from '../components/project_detail/LiveFeedTab';
import UsersTab from '../components/project_detail/UsersTab';
import AssetsTab from '../components/project_detail/AssetsTab';
import MilestonesTab from "../components/project_detail/MilestonesTab"; // New import

export default function ProjectDetail() {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [parentProject, setParentProject] = useState(null);
  const [client, setClient] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [changeOrders, setChangeOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showChangeOrderBuilder, setShowChangeOrderBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // Changed default tab from 'feed' to 'overview'
  const [currentUser, setCurrentUser] = useState(null);
  const [isProjectManager, setIsProjectManager] = useState(false);

  const location = useLocation();
  const projectId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    if (projectId) {
      loadData();
    } else {
      navigate(createPageUrl('Projects'));
    }
  }, [projectId, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectData, user] = await Promise.all([
        Project.get(projectId),
        User.me()
      ]);
      setProject(projectData);
      setCurrentUser(user);

      if (projectData.parent_project_id) {
        try {
          const parentData = await Project.get(projectData.parent_project_id);
          setParentProject(parentData);
        } catch (error) {
          console.warn('Parent project not found:', error);
          setParentProject(null);
        }
      } else {
        setParentProject(null);
      }
      
      // Load client data with comprehensive error handling
      if (projectData.client_id) {
        try {
          const clientData = await Client.get(projectData.client_id);
          setClient(clientData);
        } catch (error) {
          console.warn('Client not found:', projectData.client_id, error);
          // Set a placeholder client object when client is not found
          const placeholderClient = {
            id: projectData.client_id,
            company_name: 'Client Not Found',
            contact_person: 'Unknown Client',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zip_code: ''
          };
          setClient(placeholderClient);
        }
      } else {
        // No client assigned to project
        setClient(null);
      }
      
      // Load other data - using Promise.allSettled to handle individual failures
      const dataPromises = [
        Communication.filter({ project_id: projectId }, "-created_date"), // 0
        Expense.filter({ project_id: projectId }), // 1
        Invoice.filter({ project_id: projectId }), // 2
        ChangeOrder.filter({ project_id: projectId }), // 3
        User.list(), // 4
        UserBusiness.filter({ business_id: user.current_business_id, user_email: user.email }), // 5
        Asset.list() // 6 - Fetch all assets
      ];

      const results = await Promise.allSettled(dataPromises);
      
      // Extract results with error handling
      setCommunications(results[0].status === 'fulfilled' ? (results[0].value || []) : []);
      setExpenses(results[1].status === 'fulfilled' ? (results[1].value || []) : []);
      setInvoices(results[2].status === 'fulfilled' ? (results[2].value || []) : []);
      setChangeOrders(results[3].status === 'fulfilled' ? (results[3].value || []) : []);
      setUsers((results[4].status === 'fulfilled' && Array.isArray(results[4].value)) ? results[4].value : []);
      setAssets(results[6].status === 'fulfilled' ? (results[6].value || []) : []);

      if (results[5].status === 'fulfilled' && results[5].value.length > 0) {
        const userRole = results[5].value[0].role;
        setIsProjectManager(userRole === 'admin' || userRole === 'owner');
      }
      
      // Log any failed data loads
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const dataTypes = ['communications', 'expenses', 'invoices', 'changeOrders', 'all_users', 'userBusiness', 'assets'];
          console.warn(`Failed to load ${dataTypes[index]}:`, result.reason);
        }
      });
      
    } catch (error) {
      console.error('Error loading project details:', error);
      // If project itself is not found, redirect to projects list
      if (error.toString().includes('Object not found') || 
          error.toString().includes('404') || 
          error.toString().includes('ObjectNotFoundError')) {
        navigate(createPageUrl('Projects'));
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSubmit = async (data) => {
    if (project && project.id) {
      await Project.update(project.id, data);
      
      // Log the activity
      if (currentUser) {
        await ActivityLog.create({
          project_id: project.id,
          user_email: currentUser.email,
          user_name: currentUser.full_name || currentUser.email,
          action_type: 'project_updated',
          action_description: `Updated project details`,
          metadata: {
            updated_fields: Object.keys(data)
          },
          visible_to_client: true
        });
      }
      
      setShowEditForm(false);
      loadData();
    }
  };

  const handleServiceSubmit = async (data) => {
    const newServiceProject = await Project.create(data);
    
    // Log the activity
    if (currentUser) {
      await ActivityLog.create({
        project_id: newServiceProject.id,
        user_email: currentUser.email,
        user_name: currentUser.full_name || currentUser.email,
        action_type: 'project_created',
        action_description: `Created service project: ${data.title}`,
        metadata: {
          project_type: 'service',
          parent_project_id: project.id
        },
        visible_to_client: true
      });
    }
    
    setShowServiceForm(false);
    loadData();
  };

  const handleCreateChangeOrder = () => {
    setShowChangeOrderBuilder(true);
  };

  const handleChangeOrderSubmit = () => {
    setShowChangeOrderBuilder(false);
    loadData();
  };

  const handleCreateServiceProject = () => {
    setShowServiceForm(true);
  };
  
  const handleStatusUpdate = async (newStatus) => {
    if (!project || !currentUser) {
      console.warn("Project or currentUser not available for status update.");
      return;
    }
    try {
      const oldStatus = project.status;
      await Project.update(project.id, { status: newStatus });
      
      // Log the activity
      await ActivityLog.create({
        project_id: project.id,
        user_email: currentUser.email,
        user_name: currentUser.full_name || currentUser.email,
        action_type: 'status_changed',
        action_description: `Changed project status from '${oldStatus}' to '${newStatus}'`,
        old_values: { status: oldStatus },
        new_values: { status: newStatus },
        metadata: {
          old_status: oldStatus,
          new_status: newStatus
        },
        visible_to_client: true
      });

      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Removed the 'tabs' array as the TabsList is now static.

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="text-center text-lg text-slate-700">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link to={createPageUrl('Projects')}>
          <Button className="mt-4">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const approvedChangeOrders = changeOrders.filter(co => co.status === 'approved');
  const totalChangeOrderValue = approvedChangeOrders.reduce((sum, co) => sum + (co.total_after_adjustments || 0), 0);
  const totalChangeOrderInternalCost = approvedChangeOrders.reduce((sum, co) => sum + (co.internal_cost_total || 0), 0);

  const stats = {
    totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    totalInvoiced: invoices.reduce((sum, i) => sum + i.total_amount, 0),
    totalChangeOrderValue: totalChangeOrderValue,
  };

  const internalCostStats = {
    totalChangeOrderInternalCost: totalChangeOrderInternalCost,
    totalChangeOrderSalesValue: totalChangeOrderValue,
  };

  const serviceInitialData = {
    parent_project_id: project.id,
    client_id: project.client_id,
    title: `Service for: ${project.title}`,
    description: `Follow-up service for project: ${project.title}`,
    status: 'service',
    priority: project.priority,
    project_type: 'maintenance',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="mb-6">
          <Link to={createPageUrl('Projects')} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to All Projects
          </Link>
        </div>

        <ProjectDetailHeader
          project={project}
          parentTitle={parentProject?.title}
          client={client}
          stats={stats}
          onEdit={() => setShowEditForm(true)}
          onCreateServiceProject={handleCreateServiceProject}
          onCreateChangeOrder={handleCreateChangeOrder}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks & Materials</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="users">Team</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview" className="space-y-6">
            {currentUser && (
              <>
                <CommunicationFeed 
                  project={project} 
                  communications={communications} 
                  users={users}
                  client={client}
                  currentUser={currentUser}
                  onNewPost={loadData}
                />
                <ActivityFeed 
                  project={project} 
                  currentUser={currentUser} 
                  projectId={project.id} 
                />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-6">
            <TasksAndMaterialsTab 
              project={project} 
              users={users} 
              onUpdate={loadData} 
            />
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <MilestonesTab project={project} />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <UsersTab 
              project={project} 
              allUsers={users}
              onUpdate={loadData} 
            />
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <AssetsTab 
              project={project} 
              allAssets={assets} 
              onUpdate={loadData} 
            />
          </TabsContent>

          <TabsContent value="financials" className="space-y-6">
            <FinancialsTab 
              project={project} 
              expenses={expenses} 
              changeOrders={changeOrders}
              invoices={invoices} 
              currentUser={currentUser}
              isProjectManager={isProjectManager}
              internalCostStats={internalCostStats}
              onUpdate={loadData}
            />
          </TabsContent>
          
          <TabsContent value="invoices" className="space-y-6">
            <InvoicesTab invoices={invoices} onUpdate={loadData} project={project} client={client} />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            {currentUser && (
              <DocumentManager project={project} currentUser={currentUser} onUpdate={loadData} />
            )}
          </TabsContent>

          {/* LiveFeedTab is no longer part of the main navigation */}
          {/*
          <TabsContent value="live_feed">
            <LiveFeedTab 
              project={project} 
              currentUser={currentUser}
              onProjectUpdate={async (updates) => {
                await Project.update(project.id, updates);
                loadData();
              }}
            />
          </TabsContent>
          */}
        </Tabs>

        {showEditForm && (
          <ProjectForm
            project={project}
            clients={client ? [client] : []}
            users={users}
            onSubmit={handleProjectSubmit}
            onCancel={() => setShowEditForm(false)}
            isOpen={showEditForm}
          />
        )}

        {showServiceForm && (
          <ProjectForm
            project={serviceInitialData}
            clients={client ? [client] : []}
            users={users}
            onSubmit={handleServiceSubmit}
            onCancel={() => setShowServiceForm(false)}
            isOpen={showServiceForm}
          />
        )}

        {showChangeOrderBuilder && (
          <ChangeOrderBuilder
            project={project}
            onSubmit={handleChangeOrderSubmit}
            onCancel={() => setShowChangeOrderBuilder(false)}
          />
        )}
      </div>
    </div>
  );
}
