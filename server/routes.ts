import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contactMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = contactMessageSchema.parse(req.body);
      
      const messageId = await storage.saveContactMessage(validatedData);
      
      console.log("Contact message received:", {
        id: messageId,
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
      });
      
      res.json({ 
        success: true, 
        message: "Your message has been received. We'll get back to you soon!",
        id: messageId
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(400).json({ 
        success: false, 
        message: "Failed to send message. Please try again." 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
