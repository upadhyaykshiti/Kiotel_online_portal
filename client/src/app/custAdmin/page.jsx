
'use client';

import AdminLayout from './admin-layout';
import DashboardSection from './sections/DashboardSection';
import PropertiesSection from './sections/PropertiesSection';
import ServicePlansSection from './sections/ServicePlansSection';
import PropertyLinksSection from './sections/PropertyLinksSection';
import PlanRequestsSection from './sections/PlanRequestsSection';

export default function AdminPage() {
  const renderSection = ({ activeTab, user }) => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardSection user={user} />;
      case 'properties':
        return <PropertiesSection user={user} />;
      case 'service-plans':
        return <ServicePlansSection user={user} />;
      case 'property-links':
        return <PropertyLinksSection user={user} />;
      case 'plan-requests':
        return <PlanRequestsSection user={user} />;
      default:
        return <DashboardSection user={user} />;
    }
  };

  return <AdminLayout>{renderSection}</AdminLayout>;
}