import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface SiteSettings {
  id: number;
  siteName: string;
  logoPath?: string;
  footerLogoPath?: string;
  faviconPath?: string;
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

  useEffect(() => {
    if (data?.settings?.faviconPath) {
      // Update or create favicon link
      let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;

      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.type = 'image/x-icon';
        document.head.appendChild(faviconLink);
      }

      faviconLink.href = data.settings.faviconPath;

      // Update or create apple-touch-icon
      let appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;

      if (!appleTouchIcon) {
        appleTouchIcon = document.createElement('link');
        appleTouchIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleTouchIcon);
      }

      appleTouchIcon.href = data.settings.faviconPath;

      // Force browser to reload favicon
      const timestamp = new Date().getTime();
      faviconLink.href = `${data.settings.faviconPath}?v=${timestamp}`;
    }
  }, [data?.settings?.faviconPath]);

  return {
    settings: data?.settings,
    isLoading,
    error,
  };
}
