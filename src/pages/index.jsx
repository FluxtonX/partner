import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Projects from "./Projects";

import ProductsServices from "./ProductsServices";

import ProjectDetail from "./ProjectDetail";

import InvoiceEditor from "./InvoiceEditor";

import Clients from "./Clients";

import Estimates from "./Estimates";

import Financials from "./Financials";

import ClientDetail from "./ClientDetail";

import Training from "./Training";

import Payroll from "./Payroll";

import PayrollRunDetail from "./PayrollRunDetail";

import Feed from "./Feed";

import Alerts from "./Alerts";

import BusinessSettings from "./BusinessSettings";

import Assets from "./Assets";

import Accreditations from "./Accreditations";

import Contracts from "./Contracts";

import DocumentCustomizer from "./DocumentCustomizer";

import Calendar from "./Calendar";

import WorkLogDashboard from "./WorkLogDashboard";

import LiveMap from "./LiveMap";

import Subscription from "./Subscription";

import Messenger from "./Messenger";

import Marketplace from "./Marketplace";

import CustomerPortal from "./CustomerPortal";

import Getstimate from "./Getstimate";

import BidRequests from "./BidRequests";

import Insurance from "./Insurance";

import DeveloperNews from "./DeveloperNews";

import DeveloperNewsDetail from "./DeveloperNewsDetail";

import PaymentSettings from "./PaymentSettings";

import Inventory from "./Inventory";

import Users from "./Users";

import AREstimator from "./AREstimator";

import CompanyAssets from "./CompanyAssets";

import Rolodex from "./Rolodex";

import Marketing from "./Marketing";

import Invoices from "./Invoices";

import AdManager from "./AdManager";

import SupportChat from "./SupportChat";

import VendorManagement from "./VendorManagement";

import UserAgreements from "./UserAgreements";

import MaterialTakeoff from "./MaterialTakeoff";

import AIMarketingMaterials from "./AIMarketingMaterials";

import AccountUsage from "./AccountUsage";

import DataIntegrity from "./DataIntegrity";

import SubcontractorPortal from "./SubcontractorPortal";

import YourPartner from "./YourPartner";

import JoinTeam from "./JoinTeam";

import SubcontractorSetup from "./SubcontractorSetup";

import MyPortal from "./MyPortal";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Projects: Projects,
    
    ProductsServices: ProductsServices,
    
    ProjectDetail: ProjectDetail,
    
    InvoiceEditor: InvoiceEditor,
    
    Clients: Clients,
    
    Estimates: Estimates,
    
    Financials: Financials,
    
    ClientDetail: ClientDetail,
    
    Training: Training,
    
    Payroll: Payroll,
    
    PayrollRunDetail: PayrollRunDetail,
    
    Feed: Feed,
    
    Alerts: Alerts,
    
    BusinessSettings: BusinessSettings,
    
    Assets: Assets,
    
    Accreditations: Accreditations,
    
    Contracts: Contracts,
    
    DocumentCustomizer: DocumentCustomizer,
    
    Calendar: Calendar,
    
    WorkLogDashboard: WorkLogDashboard,
    
    LiveMap: LiveMap,
    
    Subscription: Subscription,
    
    Messenger: Messenger,
    
    Marketplace: Marketplace,
    
    CustomerPortal: CustomerPortal,
    
    Getstimate: Getstimate,
    
    BidRequests: BidRequests,
    
    Insurance: Insurance,
    
    DeveloperNews: DeveloperNews,
    
    DeveloperNewsDetail: DeveloperNewsDetail,
    
    PaymentSettings: PaymentSettings,
    
    Inventory: Inventory,
    
    Users: Users,
    
    AREstimator: AREstimator,
    
    CompanyAssets: CompanyAssets,
    
    Rolodex: Rolodex,
    
    Marketing: Marketing,
    
    Invoices: Invoices,
    
    AdManager: AdManager,
    
    SupportChat: SupportChat,
    
    VendorManagement: VendorManagement,
    
    UserAgreements: UserAgreements,
    
    MaterialTakeoff: MaterialTakeoff,
    
    AIMarketingMaterials: AIMarketingMaterials,
    
    AccountUsage: AccountUsage,
    
    DataIntegrity: DataIntegrity,
    
    SubcontractorPortal: SubcontractorPortal,
    
    YourPartner: YourPartner,
    
    JoinTeam: JoinTeam,
    
    SubcontractorSetup: SubcontractorSetup,
    
    MyPortal: MyPortal,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/ProductsServices" element={<ProductsServices />} />
                
                <Route path="/ProjectDetail" element={<ProjectDetail />} />
                
                <Route path="/InvoiceEditor" element={<InvoiceEditor />} />
                
                <Route path="/Clients" element={<Clients />} />
                
                <Route path="/Estimates" element={<Estimates />} />
                
                <Route path="/Financials" element={<Financials />} />
                
                <Route path="/ClientDetail" element={<ClientDetail />} />
                
                <Route path="/Training" element={<Training />} />
                
                <Route path="/Payroll" element={<Payroll />} />
                
                <Route path="/PayrollRunDetail" element={<PayrollRunDetail />} />
                
                <Route path="/Feed" element={<Feed />} />
                
                <Route path="/Alerts" element={<Alerts />} />
                
                <Route path="/BusinessSettings" element={<BusinessSettings />} />
                
                <Route path="/Assets" element={<Assets />} />
                
                <Route path="/Accreditations" element={<Accreditations />} />
                
                <Route path="/Contracts" element={<Contracts />} />
                
                <Route path="/DocumentCustomizer" element={<DocumentCustomizer />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/WorkLogDashboard" element={<WorkLogDashboard />} />
                
                <Route path="/LiveMap" element={<LiveMap />} />
                
                <Route path="/Subscription" element={<Subscription />} />
                
                <Route path="/Messenger" element={<Messenger />} />
                
                <Route path="/Marketplace" element={<Marketplace />} />
                
                <Route path="/CustomerPortal" element={<CustomerPortal />} />
                
                <Route path="/Getstimate" element={<Getstimate />} />
                
                <Route path="/BidRequests" element={<BidRequests />} />
                
                <Route path="/Insurance" element={<Insurance />} />
                
                <Route path="/DeveloperNews" element={<DeveloperNews />} />
                
                <Route path="/DeveloperNewsDetail" element={<DeveloperNewsDetail />} />
                
                <Route path="/PaymentSettings" element={<PaymentSettings />} />
                
                <Route path="/Inventory" element={<Inventory />} />
                
                <Route path="/Users" element={<Users />} />
                
                <Route path="/AREstimator" element={<AREstimator />} />
                
                <Route path="/CompanyAssets" element={<CompanyAssets />} />
                
                <Route path="/Rolodex" element={<Rolodex />} />
                
                <Route path="/Marketing" element={<Marketing />} />
                
                <Route path="/Invoices" element={<Invoices />} />
                
                <Route path="/AdManager" element={<AdManager />} />
                
                <Route path="/SupportChat" element={<SupportChat />} />
                
                <Route path="/VendorManagement" element={<VendorManagement />} />
                
                <Route path="/UserAgreements" element={<UserAgreements />} />
                
                <Route path="/MaterialTakeoff" element={<MaterialTakeoff />} />
                
                <Route path="/AIMarketingMaterials" element={<AIMarketingMaterials />} />
                
                <Route path="/AccountUsage" element={<AccountUsage />} />
                
                <Route path="/DataIntegrity" element={<DataIntegrity />} />
                
                <Route path="/SubcontractorPortal" element={<SubcontractorPortal />} />
                
                <Route path="/YourPartner" element={<YourPartner />} />
                
                <Route path="/JoinTeam" element={<JoinTeam />} />
                
                <Route path="/SubcontractorSetup" element={<SubcontractorSetup />} />
                
                <Route path="/MyPortal" element={<MyPortal />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}