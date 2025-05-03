import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ReceiptsPage from "@/pages/receipts";
import ProductsPage from "@/pages/products";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/receipts" component={ReceiptsPage} />
      <Route path="/products" component={ProductsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4">
            <Router />
          </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
