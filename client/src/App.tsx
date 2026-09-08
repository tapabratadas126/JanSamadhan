import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { SignInPage, SignUpPage } from "./pages/Auth";
import DashboardPage from "./pages/Dashboard";
import ChallengeDetailPage from "./pages/ChallengeDetail";
import ChallengeFormPage from "./pages/ChallengeForm";
import ProposalFormPage from "./pages/ProposalForm";
import PartnershipFormPage from "./pages/PartnershipForm";
import NotFound from "./pages/NotFound";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/auth/sign-in" component={SignInPage} />
    <Route path="/auth/sign-up" component={SignUpPage} />
    <Route path="/challenge/:id" component={ChallengeDetailPage} />
    <Route path="/challenges/new" component={ChallengeFormPage} />
    <Route path="/challenges/:id/propose" component={ProposalFormPage} />
    <Route path="/proposals/:id/partner" component={PartnershipFormPage} />
    <Route path="/dashboard" component={DashboardPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
