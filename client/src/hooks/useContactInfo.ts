import { useEffect, useState } from "react";
import type { ContactInfo } from "@db/schema";

export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch("/api/contact-info");
        if (response.ok) {
          const data = await response.json();
          console.log("Contact info fetched:", data);
          setContactInfo(data.info);
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  return { contactInfo, loading };
}
