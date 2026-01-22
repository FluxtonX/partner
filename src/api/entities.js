// Stub file - base44 APIs removed, running locally only
// TODO: Replace with actual backend API when ready

// Dummy data for local development
const dummyClients = [
  {
    id: '1',
    company_name: 'Acme Corporation',
    contact_person: 'John Doe',
    email: 'john@acme.com',
    phone: '555-0100',
    status: 'active',
    industry: 'Construction',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
  {
    id: '2',
    company_name: 'BuildTech Inc',
    contact_person: 'Jane Smith',
    email: 'jane@buildtech.com',
    phone: '555-0200',
    status: 'estimate',
    industry: 'Technology',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip_code: '90001',
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
];

const dummyProjects = [
  {
    id: '1',
    title: 'Office Renovation',
    description: 'Complete office space renovation',
    status: 'active',
    client_id: '1',
    estimated_cost: 50000,
    actual_cost: 45000,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Warehouse Expansion',
    description: 'Warehouse expansion project',
    status: 'planning',
    client_id: '2',
    estimated_cost: 150000,
    actual_cost: 0,
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
];

const dummyUser = {
  id: '1',
  email: 'demo@example.com',
  first_name: 'Demo',
  last_name: 'User',
  role: 'admin',
  current_business_id: '1',
};

// Stub entities - return dummy data for local development
export const Client = {
  list: async () => dummyClients,
  get: async (id) => dummyClients.find(c => c.id === id) || null,
  create: async (data) => {
    const newClient = { ...data, id: String(Date.now()), created_date: new Date().toISOString(), updated_date: new Date().toISOString() };
    dummyClients.push(newClient);
    return newClient;
  },
  update: async (id, data) => {
    const index = dummyClients.findIndex(c => c.id === id);
    if (index !== -1) {
      dummyClients[index] = { ...dummyClients[index], ...data, updated_date: new Date().toISOString() };
      return dummyClients[index];
    }
    return null;
  },
  delete: async (id) => {
    const index = dummyClients.findIndex(c => c.id === id);
    if (index !== -1) {
      dummyClients.splice(index, 1);
      return true;
    }
    return false;
  },
  filter: async (filters, sort) => {
    // Simple filter implementation
    let results = dummyClients.filter(client => {
      return Object.keys(filters).every(key => {
        if (key.includes('__in')) {
          const field = key.replace('__in', '');
          return filters[key].includes(client[field]);
        }
        return client[key] === filters[key];
      });
    });
    // Simple sort implementation (just return as is for now)
    return results;
  },
  bulkCreate: async (items) => {
    const newItems = items.map((item, idx) => ({
      ...item,
      id: String(Date.now() + idx),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    }));
    dummyClients.push(...newItems);
    return newItems;
  },
};

export const Project = {
  list: async () => dummyProjects,
  get: async (id) => dummyProjects.find(p => p.id === id) || null,
  create: async (data) => {
    const newProject = { ...data, id: String(Date.now()), created_date: new Date().toISOString(), updated_date: new Date().toISOString() };
    dummyProjects.push(newProject);
    return newProject;
  },
  update: async (id, data) => {
    const index = dummyProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      dummyProjects[index] = { ...dummyProjects[index], ...data, updated_date: new Date().toISOString() };
      return dummyProjects[index];
    }
    return null;
  },
  delete: async (id) => {
    const index = dummyProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      dummyProjects.splice(index, 1);
      return true;
    }
    return false;
  },
  filter: async (filters, sort) => {
    let results = dummyProjects.filter(project => {
      return Object.keys(filters).every(key => {
        if (key.includes('__in')) {
          const field = key.replace('__in', '');
          return filters[key].includes(project[field]);
        }
        return project[key] === filters[key];
      });
    });
    return results;
  },
};

export const Communication = {
  list: async () => [],
  get: async () => null,
  create: async (data) => {
    console.log('Would create communication:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async (filters, sort) => {
    // Return empty array for now
    return [];
  },
};

export const Expense = {
  list: async () => [],
  get: async () => null,
  create: async (data) => {
    console.log('Would create expense:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const ProductOrService = {
  list: async () => [
    {
      id: '1',
      name: 'Labor - General',
      type: 'labor',
      unit_price: 75,
      unit: 'hour',
      category: 'project',
      description: 'General labor services',
    },
    {
      id: '2',
      name: 'Concrete Mix',
      type: 'inventory_materials',
      unit_price: 150,
      unit: 'yard',
      category: 'materials',
      description: 'Ready-mix concrete',
    },
  ],
  get: async (id) => {
    const items = await ProductOrService.list();
    return items.find(item => item.id === id) || null;
  },
  create: async (data) => {
    console.log('Would create product/service:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async (id, data) => {
    console.log('Would update product/service:', id, data);
    return { ...data, id, updated_date: new Date().toISOString() };
  },
  delete: async () => null,
  filter: async () => [],
  bulkCreate: async (items) => {
    console.log('Would bulk create products/services:', items.length);
    return items.map((item, idx) => ({ ...item, id: String(Date.now() + idx) }));
  },
};

export const Invoice = {
  list: async (filtersOrSort) => {
    // Handle both list() and list({ status: 'paid' }) patterns
    if (typeof filtersOrSort === 'object' && filtersOrSort !== null && !filtersOrSort.startsWith('-')) {
      // It's a filter object, use filter method
      return Invoice.filter(filtersOrSort);
    }
    // Otherwise return empty array
    return [];
  },
  get: async () => null,
  create: async (data) => {
    console.log('Would create invoice:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async (filters, sort) => {
    // Return empty array for now, can add dummy invoices if needed
    return [];
  },
};

export const WorkLog = {
  list: async () => [],
  get: async () => null,
  create: async (data) => {
    console.log('Would create work log:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async (filters) => {
    // Return empty array for active logs (end_time: null)
    return [];
  },
};

export const Training = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const UserTrainingProgress = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const PayrollRun = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const Payroll = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const Post = {
  list: async () => [
    {
      id: '1',
      content: 'Welcome to the team! Excited to work on some great projects together.',
      user_email: 'demo@example.com',
      project_id: '1',
      created_date: new Date().toISOString(),
    },
    {
      id: '2',
      content: 'Just completed the office renovation project. Great work everyone!',
      user_email: 'demo@example.com',
      project_id: '1',
      created_date: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  get: async () => null,
  create: async (data) => {
    console.log('Would create post:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const PostComment = {
  list: async () => [],
  get: async () => null,
  create: async (data) => {
    console.log('Would create post comment:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async (filters) => {
    // Return comments for a specific post
    return [];
  },
};

export const PostLike = {
  list: async () => [],
  get: async () => null,
  create: async (data) => {
    console.log('Would create post like:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async (filters) => {
    // Return likes for a specific post
    return [];
  },
};

export const Alert = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const BusinessSettings = {
  list: async () => [
    {
      id: '1',
      business_id: '1',
      accreditation_expiry_notice_days: 90,
      created_date: new Date().toISOString(),
    },
  ],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async (filters) => {
    // Return dummy business settings
    return [
      {
        id: '1',
        business_id: filters?.business_id || '1',
        accreditation_expiry_notice_days: 90,
        created_date: new Date().toISOString(),
      },
    ];
  },
};

export const Asset = {
  list: async () => [
    {
      id: '1',
      name: 'Excavator',
      type: 'equipment',
      status: 'available',
      assigned_to: null,
      project_id: null,
      created_date: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Delivery Truck',
      type: 'vehicle',
      status: 'in_use',
      assigned_to: 'demo@example.com',
      project_id: '1',
      created_date: new Date().toISOString(),
    },
  ],
  get: async () => null,
  create: async (data) => {
    console.log('Would create asset:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const EstimateApproval = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const Accreditation = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const Contract = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const DocumentTemplate = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const CalendarEvent = {
  list: async () => [
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team sync',
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      project_id: '1',
      created_date: new Date().toISOString(),
    },
  ],
  get: async () => null,
  create: async (data) => {
    console.log('Would create calendar event:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const UserTask = {
  list: async () => [
    {
      id: '1',
      title: 'Review project plans',
      description: 'Review and approve project plans',
      status: 'pending',
      project_id: '1',
      assigned_to: 'demo@example.com',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_date: new Date().toISOString(),
    },
  ],
  get: async () => null,
  create: async (data) => {
    console.log('Would create task:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const InvoicePayment = {
  list: async (sort) => [],
  get: async () => null,
  create: async (data) => {
    console.log('Would create invoice payment:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const ClientCommunication = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const CommunicationTemplate = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const ChangeOrder = {
  list: async () => [],
  get: async () => null,
  create: async (data) => {
    console.log('Would create change order:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const Conversation = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const ConversationParticipant = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const Message = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const Business = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const UserBusiness = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const MarketplaceCatalog = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const MarketplaceItem = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const MarketplaceRating = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const MarketplacePurchase = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const EstimateRequest = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const EstimateBid = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const BusinessProfile = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const BusinessReview = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const Insurance = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const DeveloperNews = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const ProjectDocument = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const ActivityLog = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const TimeOffRequest = {
  list: async (sort) => [],
  get: async () => null,
  create: async (data) => {
    console.log('Would create time off request:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const CalendarBlock = {
  list: async (sort) => [],
  get: async () => null,
  create: async (data) => {
    console.log('Would create calendar block:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const HRComplaint = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const UserInvitation = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const WorkdayConfirmation = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const BusinessInsight = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const ProfessionalContact = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const EmailCampaign = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const EmailUnsubscribe = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const EmailCampaignRecipient = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const TrainingFAQ = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const InternalAdvertisement = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const AdImpression = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const VendorIntegration = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const VendorProduct = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const UserAgreement = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const AssetAssignmentLog = {
  list: async () => [],
  get: async () => null,
  create: async (data) => {
    console.log('Would create asset assignment log:', data);
    return { ...data, id: String(Date.now()), created_date: new Date().toISOString() };
  },
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const VendorAsset = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const AssetRental = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const VendorPayout = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const NewsView = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const SubcontractorBid = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const SubcontractorAssignment = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

export const SubcontractorContract = {
  list: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [],
};

// Auth stub with dummy user
export const User = {
  list: async () => [dummyUser],
  get: async (id) => id === '1' ? dummyUser : null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
  filter: async () => [dummyUser],
  me: async () => dummyUser,
};

