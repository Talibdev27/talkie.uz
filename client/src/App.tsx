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
import UserLogin from "@/pages/user-login";
import DemoWedding from "@/pages/demo-wedding";
import { PaymentPage } from "@/pages/payment";

function Router() {
  return (
    <Switch>
      {/* Landing page */}
      <Route path="/" component={Landing} />

      {/* User authentication */}
      <Route path="/login" component={UserLogin} />
      <Route path="/register" component={UserLogin} />

      {/* Wedding creation flow */}
      <Route path="/create-wedding" component={CreateWedding} />

      {/* Demo wedding site */}
      <Route path="/demo" component={DemoWedding} />

      {/* Individual wedding sites */}
      <Route path="/wedding/:uniqueUrl" component={WeddingSite} />

      {/* Admin login and dashboard - hidden/secure routes */}
      <Route path="/system/auth" component={AdminLogin} />
      <Route path="/system/dashboard" component={AdminDashboard} />
      <Route path="/system/:uniqueUrl" component={AdminDashboard} />

      {/* Payment Route */}
      <Route path="/payment" component={PaymentPage} />

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