const fs = require('fs');
const path = require('path');

const pages = [
  'Faq.tsx',
  'SeasonalCalendar.tsx',
  'LooseItems.tsx',
  'Pedidos.tsx',
  'Scripts.tsx'
];

const basePath = 'e:\\site-hortibless\\client\\src\\pages';

pages.forEach(page => {
  const filePath = path.join(basePath, page);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove useSiteSettings import
  content = content.replace(/import { useSiteSettings } from "@\/hooks\/useSiteSettings";\n/, '');

  // 2. Add DashboardSidebar import if not present
  if (!content.includes('DashboardSidebar')) {
    const importMatch = content.match(/(import .+ from "lucide-react";)/);
    if (importMatch) {
      content = content.replace(importMatch[1], `${importMatch[1]}\nimport { DashboardSidebar } from "@/components/DashboardSidebar";`);
    }
  }

  // 3. Remove useSiteSettings() call
  content = content.replace(/\s+const { settings } = useSiteSettings\(\);?\n/, '\n');

  // 4. Change useLocation to capture location
  content = content.replace(/const \[, setLocation\] = useLocation\(\);/, 'const [location, setLocation] = useLocation();');

  // 5. Replace logoutMutation with handleLogout function
  const logoutMutationRegex = /const logoutMutation = useMutation\(\{[\s\S]*?onSuccess: \(\) => \{[\s\S]*?setLocation\("\/login"\);[\s\S]*?\},[\s\S]*?\}\);/;
  const handleLogoutReplacement = `const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };`;

  if (logoutMutationRegex.test(content)) {
    content = content.replace(logoutMutationRegex, handleLogoutReplacement);
  }

  // Save the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${page}`);
});

console.log('All pages updated with imports and logout handler!');
