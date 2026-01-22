
import React, { useState, useEffect } from "react";
// Removed base44 API imports - running locally only
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, LayoutGrid, KanbanSquare, Zap, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from '@/components/providers/LanguageContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import ProjectCard from "../components/projects/ProjectCard";
import ProjectForm from "../components/projects/ProjectForm";
import KanbanBoard from "../components/projects/KanbanBoard";
import ChangeOrderBuilder from "../components/change-orders/ChangeOrderBuilder";
import QuickProjectForm from "../components/projects/QuickProjectForm";
// Removed base44 function imports - running locally only

export default function ProjectsPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showChangeOrderBuilder, setShowChangeOrderBuilder] = useState(false);
  const [selectedProjectForChangeOrder, setSelectedProjectForChangeOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // Changed default view to 'list'
  const [showQuickProjectForm, setShowQuickProjectForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const quickProject = urlParams.get('quick_project');
    if (status) {
      setStatusFilter(status);
    }
    if (quickProject === 'true') {
        setShowQuickProjectForm(true);
    }
    loadData();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter, clientFilter, assigneeFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Using stub API with dummy data - running locally only
      const [projectsData, clientsData, usersData] = await Promise.all([
        Project.list("-updated_date"),
        Client.list(),
        User.list()
      ]);
      setProjects(projectsData);
      setClients(clientsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(t('failed_to_load_data'));
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (clientFilter !== "all") {
      filtered = filtered.filter(project => project.client_id === clientFilter);
    }

    if (assigneeFilter !== "all") {
      filtered = filtered.filter(project => project.assigned_to === assigneeFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleSubmit = async (projectData) => {
    try {
      // Stubbed out API calls - running locally only
      if (editingProject) {
        // await Project.update(editingProject.id, projectData);
        console.log("Would update project:", editingProject.id, projectData);
        toast.success("Project updated (local mode - not persisted)");
      } else {
        // await Project.create(projectData);
        console.log("Would create project:", projectData);
        toast.success("Project created (local mode - not persisted)");
      }
      setShowForm(false);
      setEditingProject(null);
      // loadData();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project. Please try again.");
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = async (projectId) => {
    setDeletingProject(projectId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingProject) return;
    
    try {
      // Stubbed out API call - running locally only
      // await Project.delete(deletingProject);
      console.log("Would delete project:", deletingProject);
      toast.success("Project deleted (local mode - not persisted)");
      // Remove from local state
      setProjects(prev => prev.filter(p => p.id !== deletingProject));
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project. Please try again.");
    } finally {
      setShowDeleteConfirm(false);
      setDeletingProject(null);
    }
  };

  const handleCreateChangeOrder = (project) => {
    setSelectedProjectForChangeOrder(project);
    setShowChangeOrderBuilder(true);
  };

  const handleChangeOrderSubmit = () => {
    setShowChangeOrderBuilder(false);
    setSelectedProjectForChangeOrder(null);
    loadData();
    toast.success("Change order created successfully");
  };

  const handleQuickProjectSubmit = async (data) => {
    try {
      await handleQuickProjectCreation(data);
      toast.success("Quick project created successfully");
      loadData();
    } catch (error) {
      console.error("Error creating quick project:", error);
      toast.error("Failed to create quick project. Please try again.");
    } finally {
      setShowQuickProjectForm(false);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.company_name || client?.contact_person || `${client?.first_name || ''} ${client?.last_name || ''}`.trim() || 'Unknown Client';
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.display_name || user?.full_name || email;
  };

  const projectTitleMap = projects.reduce((map, p) => ({ ...map, [p.id]: p.title }), {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header and Filters - Always visible */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('projects_title')}</h1>
            <p className="text-slate-600">{t('projects_subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowQuickProjectForm(true)}
              variant="outline"
              className="border-yellow-400 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              {t('quick_project')}
            </Button>
            <div className="flex items-center bg-slate-200 rounded-lg p-1">
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('list')}
                className="flex items-center gap-1"
              >
                <LayoutGrid className="w-4 h-4" />
                {t('list')}
              </Button>
              <Button 
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('kanban')}
                className="flex items-center gap-1"
              >
                <KanbanSquare className="w-4 h-4" />
                {t('kanban')}
              </Button>
            </div>
            <Button 
              onClick={() => { setEditingProject(null); setShowForm(true); }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('new_project')}
            </Button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder={t('search_projects')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white/70">
                  <SelectValue placeholder={t('filter_by_status')} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">{t('all_statuses')}</SelectItem>
                  <SelectItem value="estimate">{t('estimates')}</SelectItem>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="service">{t('service')}</SelectItem>
                  <SelectItem value="completed">{t('completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-40 bg-white/70">
                  <SelectValue placeholder={t('filter_by_client')} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">{t('all')} {t('clients')}</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-40 bg-white/70">
                  <SelectValue placeholder={t('filter_by_assignee')} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">{t('all')} Assignees</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.email}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Conditional View */}
        {isLoading ? (
          <div className="text-center py-12">{t('loading')}...</div>
        ) : (
          viewMode === 'kanban' ? (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pb-4">
              <KanbanBoard 
                projects={filteredProjects}
                clients={clients}
                users={users}
                onEdit={handleEdit}
                onProjectUpdate={loadData}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  clientName={getClientName(project.client_id)}
                  parentTitle={projectTitleMap[project.parent_project_id]}
                  assignedUser={getUserName(project.assigned_to)}
                  client={clients.find(c => c.id === project.client_id)}
                  onEdit={handleEdit}
                  onDelete={() => handleDelete(project.id)}
                  onCreateChangeOrder={handleCreateChangeOrder}
                  onView={() => {}}
                />
              ))}
            </div>
          )
        )}

        {filteredProjects.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-500 mb-2">{t('no_projects_found')}</h3>
            <p className="text-slate-400">{t('adjust_search_criteria')}</p>
          </div>
        )}

        {/* Modals */}
        {showForm && (
          <ProjectForm
            isOpen={showForm}
            project={editingProject}
            clients={clients}
            users={users}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingProject(null);
            }}
          />
        )}
        
        {showQuickProjectForm && (
            <QuickProjectForm
                clients={clients}
                isOpen={showQuickProjectForm}
                onClose={() => setShowQuickProjectForm(false)}
                onSubmit={handleQuickProjectSubmit}
            />
        )}

        {showChangeOrderBuilder && selectedProjectForChangeOrder && (
          <ChangeOrderBuilder
            project={selectedProjectForChangeOrder}
            onSubmit={handleChangeOrderSubmit}
            onCancel={() => {
              setShowChangeOrderBuilder(false);
              setSelectedProjectForChangeOrder(null);
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this project? This action cannot be undone and will also delete all associated data including communications, expenses, and invoices.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
