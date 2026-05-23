import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { EndUserLayout } from "@/components/end-user-layout";
import { AuthProvider, useAuth } from "@/context/auth";
import Dashboard from "@/pages/dashboard";
import Assets from "@/pages/assets";
import AssetDetail from "@/pages/asset-detail";
import Tickets from "@/pages/tickets";
import TicketDetail from "@/pages/ticket-detail";
import Employees from "@/pages/employees";
import EmployeeDetail from "@/pages/employee-detail";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import MyTickets from "@/pages/end-user/my-tickets";
import SubmitTicket from "@/pages/end-user/submit-ticket";
import MyAssets from "@/pages/end-user/my-assets";
import { setBaseUrl } from "@workspace/api-client-react";

if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL as string);
}

const queryClient = new QueryClient();

function AdminPortal() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/assets" component={Assets} />
        <Route path="/assets/:id" component={AssetDetail} />
        <Route path="/tickets" component={Tickets} />
        <Route path="/tickets/:id" component={TicketDetail} />
        <Route path="/employees" component={Employees} />
        <Route path="/employees/:id" component={EmployeeDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function EndUserPortal() {
  return (
    <EndUserLayout>
      <Switch>
        <Route path="/" component={() => <Redirect to="/my-tickets" />} />
        <Route path="/my-tickets" component={MyTickets} />
        <Route path="/submit-ticket" component={SubmitTicket} />
        <Route path="/my-assets" component={MyAssets} />
        <Route component={NotFound} />
      </Switch>
    </EndUserLayout>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  if (user.role === "admin") {
    return <AdminPortal />;
  }

  return <EndUserPortal />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
