import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Menu, Code } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export default function Scripts() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [facebookPixel, setFacebookPixel] = useState("");
  const [googleAnalytics, setGoogleAnalytics] = useState("");
  const [googleTagManager, setGoogleTagManager] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response = await fetch("/api/tracking-scripts");
        if (response.ok) {
          const data = await response.json();
          setFacebookPixel(data.facebookPixel || "");
          setGoogleAnalytics(data.googleAnalytics || "");
          setGoogleTagManager(data.googleTagManager || "");
        }
      } catch (error) {
        console.error("Failed to fetch scripts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchScripts();
    }
  }, [user]);

  const updateScriptsMutation = useMutation({
    mutationFn: async (data: { facebookPixel: string; googleAnalytics: string; googleTagManager: string }) => {
      const response = await fetch("/api/tracking-scripts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update scripts");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Scripts atualizados com sucesso" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar scripts",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSave = () => {
    updateScriptsMutation.mutate({
      facebookPixel,
      googleAnalytics,
      googleTagManager
    });
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <DashboardSidebar
        user={user}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        currentPath={location}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scripts de Rastreamento</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Facebook Pixel</CardTitle>
                <CardDescription>
                  Cole o código completo do Facebook Pixel (incluindo as tags &lt;script&gt;)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="facebook-pixel">Código do Facebook Pixel</Label>
                  <Textarea
                    id="facebook-pixel"
                    placeholder="<!-- Facebook Pixel Code -->&#10;<script>&#10;!function(f,b,e,v,n,t,s)...&#10;</script>"
                    value={facebookPixel}
                    onChange={(e) => setFacebookPixel(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Google Analytics</CardTitle>
                <CardDescription>
                  Cole o código completo do Google Analytics (incluindo as tags &lt;script&gt;)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="google-analytics">Código do Google Analytics</Label>
                  <Textarea
                    id="google-analytics"
                    placeholder="<!-- Google Analytics -->&#10;<script async src='https://www.googletagmanager.com/gtag/js?id=...'></script>"
                    value={googleAnalytics}
                    onChange={(e) => setGoogleAnalytics(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Google Tag Manager</CardTitle>
                <CardDescription>
                  Cole o código completo do Google Tag Manager (incluindo as tags &lt;script&gt;)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="google-tag-manager">Código do Google Tag Manager</Label>
                  <Textarea
                    id="google-tag-manager"
                    placeholder="<!-- Google Tag Manager -->&#10;<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-...');</script>"
                    value={googleTagManager}
                    onChange={(e) => setGoogleTagManager(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={updateScriptsMutation.isPending || loading}
                className="bg-[#133903] hover:bg-[#6a9e24]"
              >
                {updateScriptsMutation.isPending ? "Salvando..." : "Salvar Scripts"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
