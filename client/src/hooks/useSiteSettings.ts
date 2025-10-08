import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface SiteSettings {
  id: number;
  siteName: string;
  logoPath?: string;
  footerLogoPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useSiteSettings() {
  const { data, isLoading, error } = useQuery<{ success: boolean; settings: SiteSettings }>({
    queryKey: ["/api/site-settings"],
  });

  useEffect(() => {
    if (data?.settings?.siteName) {
      document.title = data.settings.siteName;
    }
  }, [data?.settings?.siteName]);

  return {
    settings: data?.settings,
    isLoading,
    error,
  };
}
