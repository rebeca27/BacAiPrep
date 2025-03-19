import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Subjects from "@/pages/Subjects";
import Learning from "@/pages/Learning";
import ExamSimulator from "@/pages/ExamSimulator";
import Analytics from "@/pages/Analytics";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";

function Router() {
  const [location] = useLocation();

  // Initialize the demo data when the app loads
  useEffect(() => {
    const initDemoData = async () => {
      try {
        await fetch("/api/init-demo-data", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Failed to initialize demo data:", error);
      }
    };

    initDemoData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPath={location} />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/subjects" component={Subjects} />
          <Route path="/learning/:subjectId" component={Learning} />
          <Route path="/exam-simulator" component={ExamSimulator} />
          <Route path="/analytics" component={Analytics} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
