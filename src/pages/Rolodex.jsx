
import React, { useState, useEffect } from 'react';
import { ProfessionalContact, User, BusinessSettings } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  Filter, 
  BookUser, // Changed from Users to BookUser
  Building, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  DollarSign,
  Calendar,
  Star,
  FileText,
  Calculator,
  AlertTriangle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import ProfessionalContactForm from '../components/rolodex/ProfessionalContactForm';
import ContactCard from '../components/rolodex/ContactCard';
import SuggestedItems from '../components/ads/SuggestedItems';

const CATEGORY_COLORS = {
  accounting: 'bg-blue-100 text-blue-800 border-blue-200',
  tax_services: 'bg-green-100 text-green-800 border-green-200',
  legal: 'bg-purple-100 text-purple-800 border-purple-200',
  insurance: 'bg-red-100 text-red-800 border-red-200',
  banking: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  marketing: 'bg-pink-100 text-pink-800 border-pink-200',
  it_services: 'bg-gray-100 text-gray-800 border-gray-200',
  custodial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  security: 'bg-orange-100 text-orange-800 border-orange-200',
  maintenance: 'bg-teal-100 text-teal-800 border-teal-200',
  consulting: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  software_subscriptions: 'bg-violet-100 text-violet-800 border-violet-200',
  equipment_rental: 'bg-amber-100 text-amber-800 border-amber-200',
  utilities: 'bg-slate-100 text-slate-800 border-slate-200',
  other: 'bg-neutral-100 text-neutral-800 border-neutral-200'
};

const CATEGORY_LABELS = {
  accounting: 'Accounting',
  tax_services: 'Tax Services',
  legal: 'Legal Services',
  insurance: 'Insurance',
  banking: 'Banking',
  marketing: 'Marketing',
  it_services: 'IT Services',
  custodial: 'Custodial',
  security: 'Security',
  maintenance: 'Maintenance',
  consulting: 'Consulting',
  software_subscriptions: 'Software Subscriptions',
  equipment_rental: 'Equipment Rental',
  utilities: 'Utilities',
  other: 'Other'
};

export default function RolodexPage() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [viewingContact, setViewingContact] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [totalMonthlyExpenses, setTotalMonthlyExpenses] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    calculateTotalExpenses();
  }, [filteredContacts]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      if (user.current_business_id) {
        const contactsData = await ProfessionalContact.filter({ 
          business_id: user.current_business_id 
        }, '-updated_date');
        setContacts(contactsData);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load professional contacts.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = [...contacts];

    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.services_provided?.some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(contact => contact.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
  };

  const calculateTotalExpenses = () => {
    const total = filteredContacts.reduce((sum, contact) => {
      let monthlyAmount = contact.monthly_expense || 0;
      
      // Convert to monthly if different frequency
      switch (contact.payment_frequency) {
        case 'quarterly':
          monthlyAmount = monthlyAmount / 3;
          break;
        case 'semi_annually':
          monthlyAmount = monthlyAmount / 6;
          break;
        case 'annually':
          monthlyAmount = monthlyAmount / 12;
          break;
        default:
          // Monthly or as_needed stays as is
          break;
      }
      
      return sum + monthlyAmount;
    }, 0);
    
    setTotalMonthlyExpenses(total);
  };

  const handleSubmit = async (contactData) => {
    try {
      const dataWithBusiness = {
        ...contactData,
        business_id: currentUser.current_business_id
      };

      if (editingContact) {
        await ProfessionalContact.update(editingContact.id, dataWithBusiness);
        toast.success('Professional contact updated successfully!');
      } else {
        await ProfessionalContact.create(dataWithBusiness);
        toast.success('Professional contact added successfully!');
      }
      
      setShowForm(false);
      setEditingContact(null);
      loadData();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error('Failed to save contact. Please try again.');
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleView = (contact) => {
    setViewingContact(contact);
    setShowDetails(true);
  };

  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this professional contact?')) {
      try {
        await ProfessionalContact.delete(contactId);
        toast.success('Professional contact deleted successfully!');
        loadData();
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast.error('Failed to delete contact.');
      }
    }
  };

  const updateIndirectCostRate = async () => {
    try {
      const businessSettings = await BusinessSettings.filter({ 
        business_id: currentUser.current_business_id 
      });
      
      if (businessSettings.length > 0) {
        const settings = businessSettings[0];
        // Update the indirect rate to include these professional service costs
        await BusinessSettings.update(settings.id, {
          last_calculated_indirect_rate: totalMonthlyExpenses / 160 // Assuming 160 work hours per month
        });
        
        toast.success('Indirect cost rate updated with professional service expenses!');
      }
    } catch (error) {
      console.error('Error updating indirect cost rate:', error);
      toast.error('Failed to update indirect cost rate.');
    }
  };

  const getCategoryStats = () => {
    const stats = {};
    contacts.forEach(contact => {
      const category = contact.category;
      if (!stats[category]) {
        stats[category] = { count: 0, totalExpense: 0 };
      }
      stats[category].count++;
      
      let monthlyAmount = contact.monthly_expense || 0;
      switch (contact.payment_frequency) {
        case 'quarterly':
          monthlyAmount = monthlyAmount / 3;
          break;
        case 'semi_annually':
          monthlyAmount = monthlyAmount / 6;
          break;
        case 'annually':
          monthlyAmount = monthlyAmount / 12;
          break;
      }
      stats[category].totalExpense += monthlyAmount;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 rounded"></div>
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
            <div className="flex items-center gap-3 mb-2">
              <BookUser className="w-8 h-8 text-slate-700" /> {/* Changed icon */}
              <h1 className="text-3xl font-bold text-slate-900">Professional Rolodex</h1>
            </div>
            <p className="text-slate-600">Manage your essential business service providers and track monthly expenses.</p>
          </div>
          <Button 
            onClick={() => { setEditingContact(null); setShowForm(true); }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Professional Contact
          </Button>
        </div>

        {/* Suggested Items */}
        <SuggestedItems placement="rolodex" maxItems={2} className="mb-8" />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{contacts.length}</p>
                  <p className="text-sm text-slate-600 font-medium">Total Contacts</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100">
                  <BookUser className="w-6 h-6 text-blue-600" /> {/* Changed icon */}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${totalMonthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Monthly Expenses</p>
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
                  <p className="text-2xl font-bold text-amber-600">
                    ${(totalMonthlyExpenses * 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Annual Expenses</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-100">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    ${(totalMonthlyExpenses / 160).toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">Per Hour Cost</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-100">
                  <Calculator className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Indirect Cost Integration */}
        {totalMonthlyExpenses > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-blue-50 border-l-4 border-l-emerald-500 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Indirect Cost Integration</h3>
                  <p className="text-slate-600 mb-3">
                    These professional service costs (${totalMonthlyExpenses.toFixed(2)}/month) can be factored into your estimate pricing 
                    to ensure accurate profit margins.
                  </p>
                  <p className="text-sm text-slate-500">
                    Hourly impact: ${(totalMonthlyExpenses / 160).toFixed(2)} per billable hour
                  </p>
                </div>
                <Button 
                  onClick={updateIndirectCostRate}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Update Indirect Rate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search contacts, companies, or services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/70"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48 bg-white/70">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-white/70">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contacts">Contact Directory</TabsTrigger>
            <TabsTrigger value="analytics">Expense Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            {/* Contacts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-slate-300 mb-4">
                    <BookUser className="w-16 h-16 mx-auto" /> {/* Changed icon */}
                  </div>
                  <p className="text-slate-500 text-lg">No professional contacts found</p>
                  <p className="text-slate-400">Add your first contact to get started</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            {/* Category Analytics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(categoryStats).map(([category, stats]) => (
                <Card key={category} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={CATEGORY_COLORS[category]}>
                        {CATEGORY_LABELS[category]}
                      </Badge>
                      <span className="text-2xl font-bold text-slate-900">{stats.count}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Monthly Cost:</span>
                        <span className="font-semibold text-emerald-600">
                          ${stats.totalExpense.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Annual Cost:</span>
                        <span className="font-semibold text-slate-700">
                          ${(stats.totalExpense * 12).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Avg. per Contact:</span>
                        <span className="font-semibold text-slate-500">
                          ${(stats.totalExpense / stats.count).toFixed(2)}/mo
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Form Modal */}
        {showForm && (
          <ProfessionalContactForm
            contact={editingContact}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingContact(null);
            }}
          />
        )}

        {/* Contact Details Modal */}
        {showDetails && viewingContact && (
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {viewingContact.company_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <BookUser className="w-4 h-4 text-slate-500" /> {/* Changed icon */}
                        <span>{viewingContact.contact_person}</span>
                      </div>
                      {viewingContact.title && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {viewingContact.title}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <a href={`mailto:${viewingContact.email}`} className="text-blue-600 hover:underline">
                          {viewingContact.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <a href={`tel:${viewingContact.phone}`} className="text-blue-600 hover:underline">
                          {viewingContact.phone}
                        </a>
                      </div>
                      {viewingContact.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-slate-500" />
                          <a 
                            href={viewingContact.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Service Details</h4>
                    <div className="space-y-2">
                      <Badge className={CATEGORY_COLORS[viewingContact.category]}>
                        {CATEGORY_LABELS[viewingContact.category]}
                      </Badge>
                      
                      <div className="text-sm">
                        <span className="text-slate-600">Monthly Cost: </span>
                        <span className="font-semibold text-emerald-600">
                          ${viewingContact.monthly_expense?.toFixed(2) || '0.00'}
                        </span>
                        <span className="text-slate-500 ml-1">
                          ({viewingContact.payment_frequency})
                        </span>
                      </div>

                      {viewingContact.rating && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < viewingContact.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-slate-600 ml-2">
                            {viewingContact.rating}/5
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Services Provided */}
                {viewingContact.services_provided?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Services Provided</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingContact.services_provided.map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contract Info */}
                {(viewingContact.contract_start_date || viewingContact.contract_end_date) && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Contract Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {viewingContact.contract_start_date && (
                        <div>
                          <span className="text-slate-600">Start Date: </span>
                          <span>{format(new Date(viewingContact.contract_start_date), 'PPP')}</span>
                        </div>
                      )}
                      {viewingContact.contract_end_date && (
                        <div>
                          <span className="text-slate-600">End Date: </span>
                          <span>{format(new Date(viewingContact.contract_end_date), 'PPP')}</span>
                        </div>
                      )}
                      {viewingContact.auto_renew && (
                        <div className="col-span-2">
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Auto-Renewing
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {viewingContact.notes && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Notes</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {viewingContact.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetails(false);
                      handleEdit(viewingContact);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Contact
                  </Button>
                  <Button onClick={() => setShowDetails(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
