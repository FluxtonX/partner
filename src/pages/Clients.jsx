
import React, { useState, useEffect } from "react";
// Removed base44 API imports - running locally only
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, Building, Phone, Mail, MapPin, Filter, Upload, AlertCircle, RefreshCw, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// New imports for the table structure
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

// Removed ClientCard import as it's no longer used for display
import ClientForm from "../components/clients/ClientForm";
import ClientStats from "../components/clients/ClientStats";
import ClientImporter from "../components/clients/ClientImporter";
import ClientKanbanBoard from "../components/clients/ClientKanbanBoard";
import { LayoutGrid, List } from "lucide-react"; // Added view mode icons

export default function ClientsPage() { // Renamed from CRMPage to ClientsPage as per outline
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // New state variables for deletion dialogs and bulk operations
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [deletingClient, setDeletingClient] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]); // To manage selected clients for bulk actions
  const [viewMode, setViewMode] = useState('kanban'); // New state for view mode

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter, industryFilter]);

  const loadData = async (skipDelay = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add a small delay to prevent rate limiting on subsequent requests
      if (!skipDelay && retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 10000))); // Exponential backoff
      }

      // Using stub API with dummy data - running locally only
      const [clientsData, projectsData] = await Promise.all([
        Client.list("-updated_date"),
        Project.list()
      ]);
      
      setClients(clientsData);
      setProjects(projectsData);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error("Error loading clients:", error);
      setError(error);
      
      // If it's a rate limit error, we'll allow retry
      if (error.toString().includes('429') || error.toString().includes('Rate limit')) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    loadData(true); // Skip delay on manual retry
  };

  const filterClients = () => {
    let filtered = [...clients];

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    if (industryFilter !== "all") {
      filtered = filtered.filter(client => client.industry === industryFilter);
    }

    setFilteredClients(filtered);
  };

  const handleSubmit = async (clientData) => {
    try {
      // Stubbed out API calls - running locally only
      // TODO: Replace with local storage or backend API when ready
      if (editingClient) {
        // await Client.update(editingClient.id, clientData);
        console.log("Would update client:", editingClient.id, clientData);
      } else {
        // await Client.create(clientData);
        console.log("Would create client:", clientData);
      }
      setShowForm(false);
      setEditingClient(null);
      toast.success("Client saved (local mode - not persisted)");
      // loadData();
    } catch (error) {
      console.error("Error saving client:", error);
      toast.error("Failed to save client. Please try again.");
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  // New handleView function as per outline
  const handleView = (client) => {
    toast.info(`Viewing client: ${client.company_name || client.contact_person}`);
    // In a real application, you might navigate to a client detail page or open a detailed modal.
  };

  const handleQuickUpdate = async (clientId, updateData) => {
    // Store the current state for potential rollback on error
    const previousClients = [...clients];
    
    const clientToUpdate = clients.find(c => c.id === clientId);
    const clientName = clientToUpdate?.company_name || clientToUpdate?.contact_person || 'Client';

    // Optimistically update the UI for a fast user experience
    setClients(prevClients => 
      prevClients.map(client => 
        client.id === clientId ? { ...client, ...updateData } : client
      )
    );

    try {
      // Stubbed out API call - running locally only
      // await Client.update(clientId, updateData);
      console.log("Would update client:", clientId, updateData);
      const statusLabel = updateData.status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
      toast.success(`${clientName}'s status updated to "${statusLabel}" (local mode)`);
    } catch (error) {
      console.error("Error updating client:", error);
      // If the update fails, revert to the previous state
      setClients(previousClients);
      toast.error(`Failed to update ${clientName}'s status. Please try again.`);
    }
  };

  // Helper function to get client display name for dialogs
  const getClientDisplayName = (client) => {
    return client?.company_name || client?.contact_person || 'this client';
  };

  // Initiates the single client delete confirmation dialog
  const handleDelete = (client) => {
    setDeletingClient(client);
    setShowDeleteConfirm(true);
  };

  // Confirms and executes single client deletion
  const confirmDelete = async () => {
    if (!deletingClient) return;
    
    setIsDeleting(true);
    try {
      // Stubbed out API call - running locally only
      // await Client.delete(deletingClient.id);
      console.log("Would delete client:", deletingClient.id);
      toast.success(`${getClientDisplayName(deletingClient)} deleted (local mode - not persisted)`);
      // Remove from local state
      setClients(prev => prev.filter(c => c.id !== deletingClient.id));
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error(`Failed to delete ${getClientDisplayName(deletingClient)}.`);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeletingClient(null);
    }
  };

  // Initiates the bulk delete confirmation dialog
  const handleBulkDelete = () => {
    if (selectedClients.length === 0) {
      toast.info("No clients selected for bulk deletion.");
      return;
    }
    setShowBulkDeleteConfirm(true);
  };

  // Confirms and executes bulk client deletion
  const confirmBulkDelete = async () => {
    setIsBulkDeleting(true);
    setShowBulkDeleteConfirm(false); // Close dialog immediately
    
    const totalClientsToDelete = selectedClients.length;
    let deletedCount = 0;
    const startTime = Date.now();
    
    // Show initial toast for long operation
    toast.info(`Deleting ${totalClientsToDelete} clients. This may take a few minutes...`, {
      id: 'bulk-delete-progress', // Use an ID to update this toast later
      duration: Infinity, // Keep indefinitely until updated/dismissed
    });

    try {
      for (let i = 0; i < totalClientsToDelete; i++) {
        const clientId = selectedClients[i];
        try {
          // Stubbed out API call - running locally only
          // await Client.delete(clientId);
          console.log("Would delete client:", clientId);
          deletedCount++;
          // Update progress toast every few clients or percentage
          if (deletedCount % Math.ceil(totalClientsToDelete / 5) === 0 || deletedCount === 1) { // Update roughly 5 times
            toast.info(`Deleted ${deletedCount} of ${totalClientsToDelete} clients...`, {
              id: 'bulk-delete-progress',
              duration: Infinity,
            });
          }
          // Add a small delay between each deletion to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (individualError) {
          console.warn(`Failed to delete client ID ${clientId}:`, individualError);
          // Don't rethrow, continue with other deletions
        }
      }
      
      const endTime = Date.now();
      const durationSeconds = ((endTime - startTime) / 1000).toFixed(1);

      if (deletedCount === totalClientsToDelete) {
        toast.success(`Successfully deleted ${deletedCount} clients in ${durationSeconds} seconds!`, {
          id: 'bulk-delete-progress',
          duration: 5000,
        });
      } else if (deletedCount > 0) {
        toast.warning(`Completed bulk delete in ${durationSeconds} seconds. Deleted ${deletedCount} of ${totalClientsToDelete} clients. Some clients could not be deleted due to errors.`, {
          id: 'bulk-delete-progress',
          duration: 8000,
        });
      } else {
        toast.error(`Bulk delete failed for all ${totalClientsToDelete} clients. Please check console for details.`, {
          id: 'bulk-delete-progress',
          duration: 8000,
        });
      }

      setSelectedClients([]); // Clear selection after bulk operation
      // Remove from local state
      setClients(prev => prev.filter(c => !selectedClients.includes(c.id)));
    } catch (error) {
      // This catch block would only be hit if the overall loop setup failed, not individual deletions.
      console.error('Critical error during bulk delete setup:', error);
      toast.error("An unexpected error occurred during bulk deletion. Please try again.", {
        id: 'bulk-delete-progress',
        duration: 5000,
      });
    } finally {
      setIsBulkDeleting(false);
      // Make sure the toast is dismissed or replaced if it wasn't already
      toast.dismiss('bulk-delete-progress');
    }
  };

  const handleSelectClient = (clientId) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length && filteredClients.length > 0) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map((client) => client.id));
    }
  };

  // Helper function to get status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case "new_lead":
        return "bg-blue-100 text-blue-800";
      case "attempted_contact":
        return "bg-yellow-100 text-yellow-800";
      case "contacted":
        return "bg-purple-100 text-purple-800";
      case "estimate":
        return "bg-indigo-100 text-indigo-800";
      case "won":
        return "bg-green-100 text-green-800";
      case "lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to count projects for a client
  const getClientProjectCount = (clientId) => {
    return projects.filter(project => project.client_id === clientId).length;
  };

  const statusOptions = [
    { value: "new_lead", label: "New Lead" },
    { value: "attempted_contact", label: "Attempted Contact" },
    { value: "contacted", label: "Contacted" },
    { value: "estimate", label: "Estimate" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" }
  ];

  const statusCounts = statusOptions.reduce((acc, status) => {
    acc[status.value] = clients.filter(c => c.status === status.value).length;
    return acc;
  }, { all: clients.length });

  const industries = [...new Set(clients.map(c => c.industry).filter(Boolean))];

  // Show error state if there's a rate limit error
  if (error && (error.toString().includes('429') || error.toString().includes('Rate limit'))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">CRM</h1>
              <p className="text-slate-600">Manage your client relationships and project portfolios</p>
            </div>
          </div>

          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Rate Limit Exceeded</AlertTitle>
            <AlertDescription className="mt-2">
              Too many requests have been made. Please wait a moment and try again.
              {retryCount > 0 && (
                <div className="mt-2">
                  <span className="text-sm">Retry attempt: {retryCount}</span>
                </div>
              )}
            </AlertDescription>
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              className="mt-4"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Retrying...' : 'Try Again'}
            </Button>
          </Alert>
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">CRM</h1>
            <p className="text-slate-600">Manage your client relationships and project portfolios</p>
          </div>
          <div className="flex gap-2 items-center">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-lg p-1 border border-slate-200">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="px-3"
              >
                <LayoutGrid className="w-4 h-4 mr-1" />
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowImporter(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            {selectedClients.length > 0 && viewMode === 'list' && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedClients.length})
              </Button>
            )}
            <Button 
              onClick={() => { setEditingClient(null); setShowForm(true); }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
          </div>
        </div>

        {/* Client Stats Overview */}
        <ClientStats clients={clients} projects={projects} isLoading={isLoading} />

        {/* Filters - Show only in list view */}
        {viewMode === 'list' && (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search clients by company, contact, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/70"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48 bg-white/70">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="all">All Statuses ({statusCounts.all})</SelectItem>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} ({statusCounts[option.value]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="w-full sm:w-40 bg-white/70">
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="all">All Industries</SelectItem>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry.charAt(0).toUpperCase() + industry.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              {[
                { value: "all", label: "Total Clients" },
                ...statusOptions
              ].map((status) => (
                <motion.div
                  key={status.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/60 p-4 text-center cursor-pointer transition-all hover:shadow-md ${
                    statusFilter === status.value ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : ''
                  }`}
                  onClick={() => setStatusFilter(status.value)}
                >
                  <p className="text-2xl font-bold text-slate-900">{statusCounts[status.value]}</p>
                  <p className="text-sm text-slate-600 capitalize">{status.label}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* View Mode Content */}
        {viewMode === 'kanban' && (
          <div className="mb-8">
            {isLoading ? (
              <div className="text-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Loading clients...</p>
              </div>
            ) : (
              <ClientKanbanBoard
                clients={filteredClients}
                onEdit={handleEdit}
                onView={handleView}
                onDataReload={loadData}
                onUpdateStatus={handleQuickUpdate} // Pass the quick update handler for drag-and-drop
              />
            )}
          </div>
        )}

        {viewMode === 'list' && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Client Directory
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Loading clients...</p>
                </div>
              ) : filteredClients.length > 0 ? (
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={filteredClients.length > 0 && selectedClients.length === filteredClients.length}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all rows"
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Projects</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => (
                        <TableRow 
                          key={client.id}
                          data-state={selectedClients.includes(client.id) && "selected"}
                        >
                          <TableCell>
                             <Checkbox
                              checked={selectedClients.includes(client.id)}
                              onCheckedChange={() => handleSelectClient(client.id)}
                              aria-label={`Select client ${client.contact_person}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{client.contact_person}</div>
                            <div className="text-sm text-slate-500">{client.company_name}</div>
                          </TableCell>
                          <TableCell>
                            <div>{client.email}</div>
                            <div className="text-sm text-slate-500">{client.phone}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusStyle(client.status)}>
                              {client.status?.replace(/_/g, ' ') || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getClientProjectCount(client.id)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleView(client)}>View</Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(client)}>Edit</Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(client)} className="text-red-500 hover:text-red-600">Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="text-slate-300 mb-4">
                    <Users className="w-16 h-16 mx-auto" />
                  </div>
                  <p className="text-slate-500 text-lg">No clients found</p>
                  <p className="text-slate-400">Try adjusting your search or filter criteria or add a new client.</p>
                  <Button onClick={() => setShowForm(true)} className="mt-4">Add First Client</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Client Form Modal */}
        {showForm && (
          <ClientForm
            client={editingClient}
            clients={clients}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingClient(null);
            }}
          />
        )}

        {/* Client Importer Modal */}
        {showImporter && (
          <ClientImporter
            onClose={() => setShowImporter(false)}
            onImportSuccess={() => {
              setShowImporter(false);
              // Add delay before reloading after import
              setTimeout(() => loadData(), 1000);
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete <strong>{deletingClient && getClientDisplayName(deletingClient)}</strong>?</p>
              <p className="text-sm text-slate-600 mt-2">This action cannot be undone and will also delete all associated projects and communications.</p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Client'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Bulk Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete <strong>{selectedClients.length}</strong> selected clients?</p>
              <p className="text-sm text-slate-600 mt-2">This action cannot be undone and <strong>may take a few minutes</strong> to complete. All associated projects and communications will also be deleted.</p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={isBulkDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmBulkDelete}
                disabled={isBulkDeleting}
              >
                {isBulkDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete All Selected'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
