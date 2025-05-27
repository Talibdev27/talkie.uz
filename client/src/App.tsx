import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import CreateWedding from "@/pages/create-wedding";
import WeddingSite from "@/pages/wedding-site";
import AdminDashboard from "@/pages/admin-dashboard-new";
import AdminLogin from "@/pages/admin-login";
import DemoWedding from "@/pages/demo-wedding";

function Router() {
  return (
    <Switch>
      {/* Landing page */}
      <Route path="/" component={Landing} />
      
      {/* Wedding creation flow */}
      <Route path="/create-wedding" component={CreateWedding} />
      
      {/* Demo wedding site */}
      <Route path="/demo" component={DemoWedding} />
      
      {/* Individual wedding sites */}
      <Route path="/wedding/:uniqueUrl" component={WeddingSite} />
      
      {/* Admin login and dashboard */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/:uniqueUrl" component={AdminDashboard} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
