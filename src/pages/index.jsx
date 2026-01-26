import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
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

import LandingPage from "./LandingPage.jsx";
import SignupPage from "./SignupPage";
import LoginPage from "./LoginPage";
import OnboardingPage from "./OnboardingPage";
import AuthCallbackPage from "./AuthCallbackPage";

import ProtectedRoute from "../components/ProtectedRoute";

function PagesContent() {
  const location = useLocation();
  const { user, loading } = useAuth();

  // If user is logged in and tries to access public pages, redirect to dashboard
  if (
    user &&
    !loading &&
    (location.pathname === "/" ||
      location.pathname === "/login" ||
      location.pathname === "/signup")
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Onboarding Route - MUST come before the catch-all route */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Protected App Pages (with Layout) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Projects"
        element={
          <ProtectedRoute>
            <Layout>
              <Projects />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ProductsServices"
        element={
          <ProtectedRoute>
            <Layout>
              <ProductsServices />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ProjectDetail"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/InvoiceEditor"
        element={
          <ProtectedRoute>
            <Layout>
              <InvoiceEditor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Clients"
        element={
          <ProtectedRoute>
            <Layout>
              <Clients />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Estimates"
        element={
          <ProtectedRoute>
            <Layout>
              <Estimates />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Financials"
        element={
          <ProtectedRoute>
            <Layout>
              <Financials />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ClientDetail"
        element={
          <ProtectedRoute>
            <Layout>
              <ClientDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Training"
        element={
          <ProtectedRoute>
            <Layout>
              <Training />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Payroll"
        element={
          <ProtectedRoute>
            <Layout>
              <Payroll />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/PayrollRunDetail"
        element={
          <ProtectedRoute>
            <Layout>
              <PayrollRunDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Feed"
        element={
          <ProtectedRoute>
            <Layout>
              <Feed />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Alerts"
        element={
          <ProtectedRoute>
            <Layout>
              <Alerts />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/BusinessSettings"
        element={
          <ProtectedRoute>
            <Layout>
              <BusinessSettings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Assets"
        element={
          <ProtectedRoute>
            <Layout>
              <Assets />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Accreditations"
        element={
          <ProtectedRoute>
            <Layout>
              <Accreditations />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Contracts"
        element={
          <ProtectedRoute>
            <Layout>
              <Contracts />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/DocumentCustomizer"
        element={
          <ProtectedRoute>
            <Layout>
              <DocumentCustomizer />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Calendar"
        element={
          <ProtectedRoute>
            <Layout>
              <Calendar />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/WorkLogDashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <WorkLogDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/LiveMap"
        element={
          <ProtectedRoute>
            <Layout>
              <LiveMap />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Subscription"
        element={
          <ProtectedRoute>
            <Layout>
              <Subscription />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Messenger"
        element={
          <ProtectedRoute>
            <Layout>
              <Messenger />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Marketplace"
        element={
          <ProtectedRoute>
            <Layout>
              <Marketplace />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/CustomerPortal"
        element={
          <ProtectedRoute>
            <Layout>
              <CustomerPortal />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Getstimate"
        element={
          <ProtectedRoute>
            <Layout>
              <Getstimate />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/BidRequests"
        element={
          <ProtectedRoute>
            <Layout>
              <BidRequests />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Insurance"
        element={
          <ProtectedRoute>
            <Layout>
              <Insurance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/DeveloperNews"
        element={
          <ProtectedRoute>
            <Layout>
              <DeveloperNews />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/DeveloperNewsDetail"
        element={
          <ProtectedRoute>
            <Layout>
              <DeveloperNewsDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/PaymentSettings"
        element={
          <ProtectedRoute>
            <Layout>
              <PaymentSettings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Inventory"
        element={
          <ProtectedRoute>
            <Layout>
              <Inventory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Users"
        element={
          <ProtectedRoute>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/AREstimator"
        element={
          <ProtectedRoute>
            <Layout>
              <AREstimator />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/CompanyAssets"
        element={
          <ProtectedRoute>
            <Layout>
              <CompanyAssets />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Rolodex"
        element={
          <ProtectedRoute>
            <Layout>
              <Rolodex />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Marketing"
        element={
          <ProtectedRoute>
            <Layout>
              <Marketing />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Invoices"
        element={
          <ProtectedRoute>
            <Layout>
              <Invoices />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/AdManager"
        element={
          <ProtectedRoute>
            <Layout>
              <AdManager />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/SupportChat"
        element={
          <ProtectedRoute>
            <Layout>
              <SupportChat />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/VendorManagement"
        element={
          <ProtectedRoute>
            <Layout>
              <VendorManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/UserAgreements"
        element={
          <ProtectedRoute>
            <Layout>
              <UserAgreements />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/MaterialTakeoff"
        element={
          <ProtectedRoute>
            <Layout>
              <MaterialTakeoff />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/AIMarketingMaterials"
        element={
          <ProtectedRoute>
            <Layout>
              <AIMarketingMaterials />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/AccountUsage"
        element={
          <ProtectedRoute>
            <Layout>
              <AccountUsage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/DataIntegrity"
        element={
          <ProtectedRoute>
            <Layout>
              <DataIntegrity />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/SubcontractorPortal"
        element={
          <ProtectedRoute>
            <Layout>
              <SubcontractorPortal />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/YourPartner"
        element={
          <ProtectedRoute>
            <Layout>
              <YourPartner />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/JoinTeam"
        element={
          <ProtectedRoute>
            <Layout>
              <JoinTeam />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/SubcontractorSetup"
        element={
          <ProtectedRoute>
            <Layout>
              <SubcontractorSetup />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/MyPortal"
        element={
          <ProtectedRoute>
            <Layout>
              <MyPortal />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function Pages() {
  return <PagesContent />;
}
