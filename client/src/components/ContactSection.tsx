import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();

  const contactMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return await res.json() as { success: boolean; message: string; id: string };
    },
    onSuccess: (data) => {
      toast({
        title: "Message Sent!",
        description: data.message || "Thank you for your message. We'll get back to you soon.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    contactMutation.mutate(formData);
  };

  return (
    <section className="bg-[#EFF6EF] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-[#79B42A] font-semibold mb-2">GET IN TOUCH</p>
          <h2 className="text-4xl font-bold text-[#2E593F] mb-4">Contact Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions? We're here to help you get started with hydroponic farming.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Your Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#79B42A]" 
                    placeholder="John Doe"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#79B42A]" 
                    placeholder="john@example.com"
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#79B42A]" 
                  placeholder="How can we help?"
                  data-testid="input-subject"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Message</label>
                <textarea 
                  rows={5} 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#79B42A]" 
                  placeholder="Tell us more about your project..."
                  data-testid="textarea-message"
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#79B42A] text-white py-3 rounded-lg font-semibold hover:bg-[#6a9f24] transition-colors"
                data-testid="button-send-message"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information & Map */}
          <div>
            <div className="bg-white rounded-xl p-8 shadow-lg mb-6">
              <h3 className="text-2xl font-bold text-[#2E593F] mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start" data-testid="contact-address">
                  <span className="iconify text-[#79B42A] mr-4 mt-1" data-icon="mdi:map-marker" data-width="24"></span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Address</h4>
                    <p className="text-gray-600">123 Hydroponic Avenue, Green City, GC 12345</p>
                  </div>
                </div>
                <div className="flex items-start" data-testid="contact-phone">
                  <span className="iconify text-[#79B42A] mr-4 mt-1" data-icon="mdi:phone" data-width="24"></span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Phone</h4>
                    <p className="text-gray-600">(123) 234-1234</p>
                  </div>
                </div>
                <div className="flex items-start" data-testid="contact-email">
                  <span className="iconify text-[#79B42A] mr-4 mt-1" data-icon="mdi:email" data-width="24"></span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Email</h4>
                    <p className="text-gray-600">awesomeconsult@email.com</p>
                  </div>
                </div>
                <div className="flex items-start" data-testid="contact-hours">
                  <span className="iconify text-[#79B42A] mr-4 mt-1" data-icon="mdi:clock" data-width="24"></span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Business Hours</h4>
                    <p className="text-gray-600">Mon - Fri: 9:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-200 rounded-xl overflow-hidden h-64" data-testid="map-placeholder">
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <span className="iconify mb-2" data-icon="mdi:map" data-width="48"></span>
                  <p>Map Integration</p>
                  <p className="text-sm">Google Maps or similar service would be integrated here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
