import { useEffect, useState } from 'react';
import { HelpModule } from '@/components/modules/HelpModule';
import { LegalModule } from '@/components/modules/LegalModule';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { AuthGate } from '@/components/AuthGate';
import { Dashboard } from '@/components/modules/Dashboard';
import { Projects } from '@/components/modules/Projects';
import { IncomeModule } from '@/components/modules/IncomeModule';
import { ExpensesModule } from '@/components/modules/ExpensesModule';
import { PayrollModule } from '@/components/modules/PayrollModule';
import { ProcurementModule } from '@/components/modules/ProcurementModule';
import { StoresModule } from '@/components/modules/StoresModule';
import { SiteDiaryModule } from '@/components/modules/SiteDiaryModule';
import { VATModule } from '@/components/modules/VATModule';
import { ReportsModule } from '@/components/modules/ReportsModule';
import { SettingsModule } from '@/components/modules/SettingsModule';
import { UsersModule } from '@/components/modules/UsersModule';
import { SubcontractorsModule } from '@/components/modules/SubcontractorsModule';
import { InvoicesModule } from '@/components/modules/InvoicesModule';
import { useAppStore } from '@/hooks/useAppStore';

const Index = () => {
  const { 
    activeModule, 
    sidebarCollapsed, 
    authUser,
    fetchProjects,
    fetchIncome,
    fetchExpenses,
    fetchInvoices,
    fetchPurchaseOrders,
    fetchSuppliers,
    fetchWorkers,
    fetchWorkerCategories,
    fetchPayrollRecords,
    fetchApprovedItems,
    fetchSupplies,
    fetchStoreTransactions,
    fetchSiteDiaryEntries,
    fetchSubcontractors,
    fetchQuotations,
    fetchCompanySettings,
    fetchCurrencySettings
  } = useAppStore();
  
  const [isLoading, setIsLoading] = useState(true);

  // Load all data when user is authenticated
  useEffect(() => {
    if (authUser) {
      const loadAllData = async () => {
        setIsLoading(true);
        try {
          await Promise.all([
            fetchProjects(),
            fetchIncome(),
            fetchExpenses(),
            fetchInvoices(),
            fetchPurchaseOrders(),
            fetchSuppliers(),
            fetchWorkers(),
            fetchWorkerCategories(),
            fetchPayrollRecords(),
            fetchApprovedItems(),
            fetchSupplies(),
            fetchStoreTransactions(),
            fetchSiteDiaryEntries(),
            fetchSubcontractors(),
            fetchQuotations(),
            fetchCompanySettings(),
            fetchCurrencySettings()
          ]);
          console.log('All data loaded successfully');
        } catch (error) {
          console.error('Failed to load data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadAllData();
    } else {
      setIsLoading(false);
    }
  }, [authUser]);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard />;
      case 'projects': return <Projects />;
      case 'income': return <IncomeModule />;
      case 'expenses': return <ExpensesModule />;
      case 'payroll': return <PayrollModule />;
      case 'procurement': return <ProcurementModule />;
      case 'stores': return <StoresModule />;
      case 'sitediary': return <SiteDiaryModule />;
      case 'vat': return <VATModule />;
      case 'reports': return <ReportsModule />;
      case 'settings': return <SettingsModule />;
      case 'users': return <UsersModule />;
      case 'subcontractors': return <SubcontractorsModule />;
      case 'invoices': return <InvoicesModule />;
      case 'help': return <HelpModule />;
      case 'legal': return <LegalModule />;
      default: return <Dashboard />;
    }
  };

  // Show loading spinner while data is being fetched
  if (isLoading && authUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGate>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`sidebar-transition ${sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'}`}>
          <TopBar />
          <main className="p-6">{renderModule()}</main>
        </div>
      </div>
    </AuthGate>
  );
};

export default Index;