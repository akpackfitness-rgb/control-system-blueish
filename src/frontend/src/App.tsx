import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Layout from "./components/Layout";
import SplashScreen from "./components/SplashScreen";
import { AppProvider } from "./context/AppContext";

const queryClient = new QueryClient();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        <Layout />
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}
