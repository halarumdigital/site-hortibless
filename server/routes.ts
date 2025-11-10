import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, connection } from "./db";
import { contactMessageSchema, loginSchema, insertUserSchema, updateUserSchema, siteSettingsSchema, contactInfoSchema, bannerSchema, youtubeVideoSchema, testimonialSchema, serviceRegionSchema, faqSchema, seasonalCalendarSchema, comparativeTableSchema, productPortfolioSchema, looseItemSchema, basketSchema, basketItemSchema, orderSchema, oneTimePurchaseSchema, whatsappConnectionSchema, blogPostSchema, conversations, conversationMessages } from "@shared/schema";
import { desc } from "drizzle-orm";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { asaasService } from "./services/asaas.service";
import { evolutionService } from "./services/evolution.service";
import { aiService } from "./services/ai.service";
import * as fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storageMulter = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storageMulter,
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint para monitoramento
  app.get("/api/health", async (_req, res) => {
    try {
      // Testar conexão com banco de dados
      const conn = await connection.getConnection();
      await conn.ping();
      conn.release();

      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
        uptime: process.uptime()
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.verifyPassword(username, password);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }

      if (!user.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: "Account is inactive" 
        });
      }

      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to save session"
          });
        }

        console.log("POST /api/login - Session saved successfully");
        console.log("POST /api/login - Session ID:", req.sessionID);
        console.log("POST /api/login - User ID:", req.session.userId);

        res.json({
          success: true,
          message: "Login successful",
          user: req.session.user
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ 
        success: false, 
        message: "Login failed" 
      });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Logout failed" 
        });
      }
      res.json({ 
        success: true, 
        message: "Logout successful" 
      });
    });
  });

  app.get("/api/me", async (req, res) => {
    console.log("GET /api/me - Session ID:", req.sessionID);
    console.log("GET /api/me - User ID:", req.session.userId);
    console.log("GET /api/me - Session:", req.session);

    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({
      success: true,
      user: req.session.user
    });
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", requireAuth, requireAdmin, async (_req, res) => {
    try {
      // Calcular primeiro e último dia do mês atual
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Buscar todos os dados
      const allOrders = await storage.getAllOrders();
      const allPurchases = await storage.getAllOneTimePurchases();

      console.log("📊 Dashboard Stats Debug:");
      console.log("  - Data atual do servidor:", now.toISOString());
      console.log("  - Mês atual:", now.getMonth() + 1, "/", now.getFullYear());
      console.log("  - Primeiro dia do mês:", firstDayOfMonth.toISOString());
      console.log("  - Último dia do mês:", lastDayOfMonth.toISOString());
      console.log("  - Total de purchases no banco:", allPurchases.length);

      // Mostrar TODAS as datas dos purchases
      allPurchases.forEach((p, i) => {
        const pDate = new Date(p.createdAt);
        const isInRange = pDate >= firstDayOfMonth && pDate <= lastDayOfMonth;
        console.log(`  - Purchase ${i + 1}:`, {
          id: p.id,
          createdAt: p.createdAt,
          parsed: pDate.toISOString(),
          month: pDate.getMonth() + 1,
          year: pDate.getFullYear(),
          isInCurrentMonth: isInRange
        });
      });

      // Buscar clientes únicos (CPFs) de pedidos e compras
      const allCustomerCpfs = new Set<string>();
      allOrders.forEach(order => allCustomerCpfs.add(order.customerCpf));
      allPurchases.forEach(purchase => allCustomerCpfs.add(purchase.customerCpf));

      // Clientes novos (mês atual)
      const newCustomerCpfs = new Set<string>();
      allOrders
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= firstDayOfMonth && orderDate <= lastDayOfMonth;
        })
        .forEach(order => newCustomerCpfs.add(order.customerCpf));
      allPurchases
        .filter(purchase => {
          const purchaseDate = new Date(purchase.createdAt);
          return purchaseDate >= firstDayOfMonth && purchaseDate <= lastDayOfMonth;
        })
        .forEach(purchase => newCustomerCpfs.add(purchase.customerCpf));

      // Pedidos novos (mês atual) - total de pedidos (assinaturas + avulsos)
      const newOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= firstDayOfMonth && orderDate <= lastDayOfMonth;
      });
      const newPurchases = allPurchases.filter(purchase => {
        const purchaseDate = new Date(purchase.createdAt);
        return purchaseDate >= firstDayOfMonth && purchaseDate <= lastDayOfMonth;
      });
      const totalNewOrders = newOrders.length + newPurchases.length;

      // Pedidos avulsos (mês atual)
      const newOneTimePurchases = newPurchases.length;

      console.log("  - Purchases filtrados do mês atual:", newOneTimePurchases);
      console.log("  - Total de purchases (TODOS):", allPurchases.length);

      // SEMPRE mostra o total de purchases (DEBUGGING)
      const finalOneTimePurchases = allPurchases.length;

      // Valor total dos pedidos avulsos (30 dias)
      const totalOneTimePurchasesValue = newPurchases.reduce((total, purchase) => {
        const amount = parseFloat(purchase.totalAmount) || 0;
        return total + amount;
      }, 0);

      // Assinaturas novas (30 dias)
      const newSubscriptions = newOrders.length;

      const stats = {
        totalCustomers: allCustomerCpfs.size,
        newCustomers: newCustomerCpfs.size,
        newOrders: totalNewOrders,
        newOneTimePurchases: finalOneTimePurchases, // Usando o valor temporário
        totalOneTimePurchasesValue: totalOneTimePurchasesValue,
        newSubscriptions: newSubscriptions,
      };

      console.log("📤 STATS FINAIS RETORNADOS:", JSON.stringify(stats, null, 2));

      res.json({ success: true, stats });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard stats"
      });
    }
  });

  app.get("/api/users", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json({ success: true, users: sanitizedUsers });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch users" 
      });
    }
  });

  app.post("/api/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const { password, ...sanitizedUser } = user;
      
      res.json({ 
        success: true, 
        message: "User created successfully",
        user: sanitizedUser
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(400).json({ 
        success: false, 
        message: "Failed to create user" 
      });
    }
  });

  app.patch("/api/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = updateUserSchema.parse(req.body);
      
      const user = await storage.updateUser(id, userData);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }

      const { password, ...sanitizedUser } = user;
      res.json({ 
        success: true, 
        message: "User updated successfully",
        user: sanitizedUser
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(400).json({ 
        success: false, 
        message: "Failed to update user" 
      });
    }
  });

  app.delete("/api/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (req.session.userId === id) {
        return res.status(400).json({ 
          success: false, 
          message: "Cannot delete your own account" 
        });
      }

      await storage.deleteUser(id);
      res.json({ 
        success: true, 
        message: "User deleted successfully" 
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete user" 
      });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = contactMessageSchema.parse(req.body);

      const message = await storage.saveContactMessage(validatedData);

      console.log("Contact message received:", {
        id: message.id,
        name: validatedData.name,
        email: validatedData.email,
        whatsapp: validatedData.whatsapp,
      });

      res.json({
        success: true,
        message: "Your message has been received. We'll get back to you soon!",
        id: message.id
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to send message. Please try again."
      });
    }
  });

  // Contact Messages routes (for dashboard)
  app.get("/api/contact-messages", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json({ success: true, messages });
    } catch (error) {
      console.error("Get contact messages error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch contact messages"
      });
    }
  });

  app.patch("/api/contact-messages/:id/read", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.markContactMessageAsRead(id);

      res.json({
        success: true,
        message: "Message marked as read",
        data: message
      });
    } catch (error) {
      console.error("Mark message as read error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to mark message as read"
      });
    }
  });

  app.delete("/api/contact-messages/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContactMessage(id);

      res.json({
        success: true,
        message: "Message deleted successfully"
      });
    } catch (error) {
      console.error("Delete contact message error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete message"
      });
    }
  });

  app.get("/api/site-settings", async (_req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Get site settings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch site settings"
      });
    }
  });

  app.post("/api/site-settings", requireAuth, requireAdmin, upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "footerLogo", maxCount: 1 },
    { name: "favicon", maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const settingsData: any = {
        siteName: req.body.siteName,
      };

      if (files && files.logo && files.logo[0]) {
        settingsData.logoPath = `/uploads/${files.logo[0].filename}`;
      }

      if (files && files.footerLogo && files.footerLogo[0]) {
        settingsData.footerLogoPath = `/uploads/${files.footerLogo[0].filename}`;
      }

      if (files && files.favicon && files.favicon[0]) {
        settingsData.faviconPath = `/uploads/${files.favicon[0].filename}`;
      }

      console.log("Settings data to validate:", settingsData);
      const validatedData = siteSettingsSchema.parse(settingsData);
      console.log("Validated data:", validatedData);

      const settings = await storage.updateSiteSettings(validatedData);
      console.log("Updated settings:", settings);

      res.json({
        success: true,
        message: "Site settings updated successfully",
        settings
      });
    } catch (error: any) {
      console.error("Update site settings error:", error);
      console.error("Error details:", error.message, error.stack);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update site settings"
      });
    }
  });

  app.get("/api/contact-info", async (_req, res) => {
    try {
      const info = await storage.getContactInfo();
      res.json({ success: true, info });
    } catch (error) {
      console.error("Get contact info error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch contact info"
      });
    }
  });

  app.post("/api/contact-info", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log("Received contact info data:", req.body);
      const validatedData = contactInfoSchema.parse(req.body);
      console.log("Validated contact info data:", validatedData);
      const info = await storage.updateContactInfo(validatedData);
      console.log("Updated contact info:", info);

      res.json({
        success: true,
        message: "Contact info updated successfully",
        info
      });
    } catch (error: any) {
      console.error("Update contact info error:", error);
      console.error("Error details:", error.message, error.issues);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update contact info"
      });
    }
  });

  // Banner routes
  app.get("/api/banners", async (_req, res) => {
    try {
      const bannersList = await storage.getActiveBanners();
      res.json({ success: true, banners: bannersList });
    } catch (error) {
      console.error("Get banners error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch banners"
      });
    }
  });

  app.get("/api/banners/all", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const bannersList = await storage.getAllBanners();
      res.json({ success: true, banners: bannersList });
    } catch (error) {
      console.error("Get all banners error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch banners"
      });
    }
  });

  app.post("/api/banners", requireAuth, requireAdmin, upload.array("banners", 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded"
        });
      }

      if (files.length > 5) {
        return res.status(400).json({
          success: false,
          message: "Maximum 5 files allowed"
        });
      }

      const createdBanners = [];
      for (let i = 0; i < files.length; i++) {
        const banner = await storage.createBanner({
          imagePath: `/uploads/${files[i].filename}`,
          order: i,
          isActive: true,
        });
        createdBanners.push(banner);
      }

      res.json({
        success: true,
        message: "Banners uploaded successfully",
        banners: createdBanners
      });
    } catch (error: any) {
      console.error("Upload banners error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to upload banners"
      });
    }
  });

  app.delete("/api/banners/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBanner(id);

      res.json({
        success: true,
        message: "Banner deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete banner error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete banner"
      });
    }
  });

  // Gallery routes
  app.get("/api/gallery", async (_req, res) => {
    try {
      const items = await storage.getActiveGalleryItems();
      res.json({ success: true, items });
    } catch (error) {
      console.error("Get gallery error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch gallery items"
      });
    }
  });

  app.get("/api/gallery/all", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const items = await storage.getAllGalleryItems();
      res.json({ success: true, items });
    } catch (error) {
      console.error("Get all gallery error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch gallery items"
      });
    }
  });

  app.post("/api/gallery/images", requireAuth, requireAdmin, upload.array("images", 50), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded"
        });
      }

      const createdItems = [];
      for (let i = 0; i < files.length; i++) {
        const item = await storage.createGalleryItem({
          type: "image",
          path: `/uploads/${files[i].filename}`,
          title: req.body.title || "",
          description: req.body.description || "",
          order: i,
          isActive: true,
        });
        createdItems.push(item);
      }

      res.json({
        success: true,
        message: "Images uploaded successfully",
        items: createdItems
      });
    } catch (error: any) {
      console.error("Upload gallery images error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to upload images"
      });
    }
  });

  app.post("/api/gallery/video", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validatedData = youtubeVideoSchema.parse(req.body);

      // Extract video ID from YouTube URL
      let videoId = "";
      if (validatedData.youtubeUrl.includes("youtube.com")) {
        const url = new URL(validatedData.youtubeUrl);
        videoId = url.searchParams.get("v") || "";
      } else if (validatedData.youtubeUrl.includes("youtu.be")) {
        videoId = validatedData.youtubeUrl.split("/").pop()?.split("?")[0] || "";
      }

      const item = await storage.createGalleryItem({
        type: "video",
        path: validatedData.youtubeUrl,
        title: validatedData.title,
        description: validatedData.description,
        order: 0,
        isActive: true,
      });

      res.json({
        success: true,
        message: "Video added successfully",
        item
      });
    } catch (error: any) {
      console.error("Add gallery video error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add video"
      });
    }
  });

  app.delete("/api/gallery/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGalleryItem(id);

      res.json({
        success: true,
        message: "Gallery item deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete gallery item error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete gallery item"
      });
    }
  });

  // Testimonials routes
  app.get("/api/testimonials", async (_req, res) => {
    try {
      const items = await storage.getActiveTestimonials();
      res.json({ success: true, testimonials: items });
    } catch (error) {
      console.error("Get testimonials error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch testimonials"
      });
    }
  });

  app.get("/api/testimonials/all", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const items = await storage.getAllTestimonials();
      res.json({ success: true, testimonials: items });
    } catch (error) {
      console.error("Get all testimonials error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch testimonials"
      });
    }
  });

  app.post("/api/testimonials", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validatedData = testimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validatedData);

      res.json({
        success: true,
        message: "Testimonial created successfully",
        testimonial
      });
    } catch (error: any) {
      console.error("Create testimonial error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create testimonial"
      });
    }
  });

  app.delete("/api/testimonials/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTestimonial(id);

      res.json({
        success: true,
        message: "Testimonial deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete testimonial error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete testimonial"
      });
    }
  });

  // Service Regions endpoints
  app.get("/api/service-regions", async (_req, res) => {
    try {
      const regions = await storage.getActiveServiceRegions();
      res.json({ success: true, regions });
    } catch (error) {
      console.error("Get service regions error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch service regions"
      });
    }
  });

  app.get("/api/service-regions/all", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const regions = await storage.getAllServiceRegions();
      res.json({ success: true, regions });
    } catch (error) {
      console.error("Get all service regions error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch service regions"
      });
    }
  });

  app.post("/api/service-regions", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validatedData = serviceRegionSchema.parse(req.body);
      const region = await storage.createServiceRegion(validatedData);

      res.json({
        success: true,
        message: "Service region created successfully",
        region
      });
    } catch (error: any) {
      console.error("Create service region error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create service region"
      });
    }
  });

  app.delete("/api/service-regions/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServiceRegion(id);

      res.json({
        success: true,
        message: "Service region deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete service region error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete service region"
      });
    }
  });

  // FAQ endpoints
  app.get("/api/faqs", async (_req, res) => {
    try {
      const faqs = await storage.getActiveFaqs();
      res.json({ success: true, faqs });
    } catch (error) {
      console.error("Get FAQs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch FAQs"
      });
    }
  });

  app.get("/api/faqs/all", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const faqs = await storage.getAllFaqs();
      res.json({ success: true, faqs });
    } catch (error) {
      console.error("Get all FAQs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch FAQs"
      });
    }
  });

  app.post("/api/faqs", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validatedData = faqSchema.parse(req.body);
      const faq = await storage.createFaq(validatedData);

      res.json({
        success: true,
        message: "FAQ created successfully",
        faq
      });
    } catch (error: any) {
      console.error("Create FAQ error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create FAQ"
      });
    }
  });

  app.put("/api/faqs/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = faqSchema.partial().parse(req.body);
      const faq = await storage.updateFaq(id, validatedData);

      res.json({
        success: true,
        message: "FAQ updated successfully",
        faq
      });
    } catch (error: any) {
      console.error("Update FAQ error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update FAQ"
      });
    }
  });

  app.delete("/api/faqs/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFaq(id);

      res.json({
        success: true,
        message: "FAQ deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete FAQ error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete FAQ"
      });
    }
  });

  // Seasonal Calendar endpoints
  app.get("/api/seasonal-calendar", async (_req, res) => {
    try {
      const items = await storage.getActiveSeasonalCalendarItems();
      res.json({ success: true, items });
    } catch (error) {
      console.error("Get seasonal calendar error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch seasonal calendar items"
      });
    }
  });

  app.get("/api/seasonal-calendar/all", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const items = await storage.getAllSeasonalCalendarItems();
      res.json({ success: true, items });
    } catch (error) {
      console.error("Get all seasonal calendar error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch seasonal calendar items"
      });
    }
  });

  app.post("/api/seasonal-calendar", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required"
        });
      }

      const imagePath = `/uploads/${req.file.filename}`;

      const validatedData = seasonalCalendarSchema.parse({
        imagePath,
      });

      const item = await storage.createSeasonalCalendarItem(validatedData);

      res.json({
        success: true,
        message: "Seasonal calendar item created successfully",
        item
      });
    } catch (error: any) {
      console.error("Create seasonal calendar item error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create seasonal calendar item"
      });
    }
  });

  app.delete("/api/seasonal-calendar/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSeasonalCalendarItem(id);

      res.json({
        success: true,
        message: "Seasonal calendar item deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete seasonal calendar item error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete seasonal calendar item"
      });
    }
  });

  // Comparative Tables routes
  app.get("/api/comparative-tables", async (req, res) => {
    try {
      const items = await storage.getActiveComparativeTables();
      res.json({ success: true, items });
    } catch (error: any) {
      console.error("Get comparative tables error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get comparative tables"
      });
    }
  });

  app.get("/api/comparative-tables/all", requireAuth, requireAdmin, async (req, res) => {
    try {
      const items = await storage.getAllComparativeTables();
      res.json({ success: true, items });
    } catch (error: any) {
      console.error("Get all comparative tables error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get comparative tables"
      });
    }
  });

  app.post("/api/comparative-tables", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required"
        });
      }

      const imagePath = `/uploads/${req.file.filename}`;

      const validatedData = comparativeTableSchema.parse({
        imagePath,
      });

      const item = await storage.createComparativeTable(validatedData);

      res.json({
        success: true,
        message: "Comparative table created successfully",
        item
      });
    } catch (error: any) {
      console.error("Create comparative table error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create comparative table"
      });
    }
  });

  app.delete("/api/comparative-tables/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteComparativeTable(id);

      res.json({
        success: true,
        message: "Comparative table deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete comparative table error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete comparative table"
      });
    }
  });

  // Product Portfolio routes
  app.get("/api/product-portfolio", async (req, res) => {
    try {
      const items = await storage.getActiveProductPortfolio();
      res.json({ success: true, items });
    } catch (error: any) {
      console.error("Get product portfolio error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get product portfolio"
      });
    }
  });

  app.get("/api/product-portfolio/all", requireAuth, requireAdmin, async (req, res) => {
    try {
      const items = await storage.getAllProductPortfolio();
      res.json({ success: true, items });
    } catch (error: any) {
      console.error("Get all product portfolio error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get product portfolio"
      });
    }
  });

  app.post("/api/product-portfolio", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required"
        });
      }

      const imagePath = `/uploads/${req.file.filename}`;

      const validatedData = productPortfolioSchema.parse({
        imagePath,
      });

      const item = await storage.createProductPortfolio(validatedData);

      res.json({
        success: true,
        message: "Product portfolio created successfully",
        item
      });
    } catch (error: any) {
      console.error("Create product portfolio error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create product portfolio"
      });
    }
  });

  app.delete("/api/product-portfolio/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProductPortfolio(id);

      res.json({
        success: true,
        message: "Product portfolio deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete product portfolio error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete product portfolio"
      });
    }
  });

  // Loose Items routes
  app.get("/api/loose-items", async (req, res) => {
    try {
      const items = await storage.getActiveLooseItems();
      res.json({ success: true, items });
    } catch (error: any) {
      console.error("Get loose items error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get loose items"
      });
    }
  });

  app.get("/api/loose-items/all", requireAuth, requireAdmin, async (req, res) => {
    try {
      const items = await storage.getAllLooseItems();
      res.json({ success: true, items });
    } catch (error: any) {
      console.error("Get all loose items error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get loose items"
      });
    }
  });

  app.post("/api/loose-items", requireAuth, requireAdmin, async (req, res) => {
    try {
      const validatedData = looseItemSchema.parse(req.body);
      const item = await storage.createLooseItem(validatedData);

      res.json({
        success: true,
        message: "Loose item created successfully",
        item
      });
    } catch (error: any) {
      console.error("Create loose item error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create loose item"
      });
    }
  });

  app.delete("/api/loose-items/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLooseItem(id);

      res.json({
        success: true,
        message: "Loose item deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete loose item error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete loose item"
      });
    }
  });

  // Baskets routes
  app.get("/api/baskets", async (req, res) => {
    try {
      const baskets = await storage.getActiveBaskets();
      res.json({ success: true, baskets });
    } catch (error: any) {
      console.error("Get baskets error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get baskets"
      });
    }
  });

  app.get("/api/baskets/all", requireAuth, requireAdmin, async (req, res) => {
    try {
      const baskets = await storage.getAllBaskets();
      res.json({ success: true, baskets });
    } catch (error: any) {
      console.error("Get all baskets error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get baskets"
      });
    }
  });

  app.get("/api/baskets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const basket = await storage.getBasket(id);

      if (!basket) {
        return res.status(404).json({
          success: false,
          message: "Basket not found"
        });
      }

      const items = await storage.getBasketItems(id);
      res.json({ success: true, basket, items });
    } catch (error: any) {
      console.error("Get basket error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get basket"
      });
    }
  });

  app.post("/api/baskets", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
    try {
      let imagePath = req.body.imagePath;

      if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
      }

      const validatedData = basketSchema.parse({
        name: req.body.name,
        description: req.body.description,
        priceLoose: req.body.priceLoose,
        priceSubscription: req.body.priceSubscription,
        imagePath,
        isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
      });

      const basket = await storage.createBasket(validatedData);

      res.json({
        success: true,
        message: "Basket created successfully",
        basket
      });
    } catch (error: any) {
      console.error("Create basket error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create basket"
      });
    }
  });

  app.put("/api/baskets/:id", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let updateData: any = {
        name: req.body.name,
        description: req.body.description,
        priceLoose: req.body.priceLoose,
        priceSubscription: req.body.priceSubscription,
        isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
      };

      if (req.file) {
        updateData.imagePath = `/uploads/${req.file.filename}`;
      }

      const basket = await storage.updateBasket(id, updateData);

      res.json({
        success: true,
        message: "Basket updated successfully",
        basket
      });
    } catch (error: any) {
      console.error("Update basket error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update basket"
      });
    }
  });

  app.delete("/api/baskets/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBasket(id);

      res.json({
        success: true,
        message: "Basket deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete basket error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete basket"
      });
    }
  });

  // Basket Items routes
  app.post("/api/baskets/:basketId/items", requireAuth, requireAdmin, async (req, res) => {
    try {
      const basketId = parseInt(req.params.basketId);
      const validatedData = basketItemSchema.parse({
        basketId,
        looseItemId: req.body.looseItemId,
        quantity: req.body.quantity,
      });

      const item = await storage.addBasketItem(validatedData);

      res.json({
        success: true,
        message: "Item added to basket successfully",
        item
      });
    } catch (error: any) {
      console.error("Add basket item error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add item to basket"
      });
    }
  });

  app.delete("/api/basket-items/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeBasketItem(id);

      res.json({
        success: true,
        message: "Item removed from basket successfully"
      });
    } catch (error: any) {
      console.error("Remove basket item error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to remove item from basket"
      });
    }
  });

  // Tracking Scripts routes
  app.get("/api/tracking-scripts", requireAuth, requireAdmin, async (req, res) => {
    try {
      const scripts = await storage.getTrackingScripts();
      res.json(scripts || {});
    } catch (error: any) {
      console.error("Get tracking scripts error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get tracking scripts"
      });
    }
  });

  app.put("/api/tracking-scripts", requireAuth, requireAdmin, async (req, res) => {
    try {
      const scripts = await storage.updateTrackingScripts(req.body);
      res.json(scripts);
    } catch (error: any) {
      console.error("Update tracking scripts error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update tracking scripts"
      });
    }
  });

  // Orders routes
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = orderSchema.parse(req.body);

      // Verificar se o Asaas está configurado
      if (!asaasService.isConfigured()) {
        console.warn("⚠️  Asaas não configurado. Salvando pedido sem processar pagamento.");
        const order = await storage.createOrder(validatedData);
        return res.json({
          success: true,
          message: "Pedido registrado (Asaas não configurado)",
          order
        });
      }

      // 1. Buscar informações da cesta
      const basket = await storage.getBasket(validatedData.basketId);
      if (!basket) {
        return res.status(404).json({
          success: false,
          message: "Cesta não encontrada"
        });
      }

      // 2. Extrair informações do endereço
      const addressParts = validatedData.customerAddress.split(" - ");
      const streetAndNumber = addressParts[0]?.split(", ");
      const street = streetAndNumber[0] || "";
      const number = streetAndNumber[1] || "";
      const neighborhood = addressParts[1] || "";
      const postalCode = validatedData.customerAddress.match(/CEP:\s*(\d{5}-?\d{3})/)?.[1]?.replace("-", "") || "";

      // 3. Criar ou buscar cliente no Asaas
      console.log("🔍 Verificando cliente no Asaas...");
      let asaasCustomer = await asaasService.getCustomerByCpfCnpj(validatedData.customerCpf);

      if (!asaasCustomer) {
        console.log("👤 Cliente não encontrado. Criando novo cliente...");
        asaasCustomer = await asaasService.createCustomer({
          name: validatedData.customerName,
          cpfCnpj: validatedData.customerCpf,
          email: validatedData.customerEmail,
          mobilePhone: validatedData.customerWhatsapp,
          address: street,
          addressNumber: number,
          province: neighborhood,
          postalCode,
          notificationDisabled: false,
        });
      } else {
        console.log("✅ Cliente já existe no Asaas:", asaasCustomer.id);
      }

      // 4. A cobrança é SEMPRE MENSAL, independente da frequência de entrega
      const cycle = "MONTHLY";

      // 5. Calcular próxima data de vencimento (HOJE - primeira cobrança imediata)
      const nextDueDate = new Date();
      // Primeira cobrança é hoje, depois será mensal automaticamente
      const nextDueDateStr = nextDueDate.toISOString().split('T')[0];

      // 6. Calcular valor TOTAL MENSAL baseado na frequência de entregas
      const unitPrice = basket.priceSubscription ? parseFloat(basket.priceSubscription.toString()) : 0;

      let subscriptionValue = unitPrice;
      if (validatedData.frequency === "semanal") {
        subscriptionValue = unitPrice * 4; // 4 entregas por mês
      } else if (validatedData.frequency === "quinzenal") {
        subscriptionValue = unitPrice * 2; // 2 entregas por mês
      }
      // Para mensal, mantém o valor unitário (1 entrega)

      console.log("💳 Criando assinatura com cartão no Asaas...");
      console.log("📊 Detalhes da assinatura:");
      console.log("  - Valor por entrega:", unitPrice);
      console.log("  - Frequência:", validatedData.frequency);
      console.log("  - Entregas por mês:", validatedData.frequency === "semanal" ? 4 : validatedData.frequency === "quinzenal" ? 2 : 1);
      console.log("  - Valor TOTAL MENSAL:", subscriptionValue);
      console.log("  - Ciclo de cobrança:", cycle, "(SEMPRE MENSAL)");
      console.log("  - Próximo vencimento:", nextDueDateStr);

      const description = `Assinatura ${validatedData.frequency} - ${validatedData.customerName} - ${basket.name}`;

      // Extrair mês e ano do cartão
      const [expiryMonth, expiryYear] = validatedData.cardExpiry?.split("/") || ["", ""];

      const asaasSubscription = await asaasService.createSubscription({
        customer: asaasCustomer.id,
        billingType: "CREDIT_CARD",
        cycle: cycle,
        value: subscriptionValue,
        nextDueDate: nextDueDateStr,
        description: description,
        creditCard: {
          holderName: validatedData.cardName || "",
          number: validatedData.cardNumber?.replace(/\s/g, "") || "",
          expiryMonth: expiryMonth,
          expiryYear: expiryYear,
          ccv: validatedData.cardCvv || "",
        },
        creditCardHolderInfo: {
          name: validatedData.customerName,
          email: validatedData.customerEmail,
          cpfCnpj: validatedData.customerCpf,
          postalCode: postalCode,
          addressNumber: number,
          phone: validatedData.customerWhatsapp,
        },
      });

      console.log("✅ Assinatura criada no Asaas:", asaasSubscription.id);

      // 7. Salvar pedido no banco com dados do Asaas
      const orderData: any = {
        ...validatedData,
        asaasCustomerId: asaasCustomer.id,
        asaasSubscriptionId: asaasSubscription.id,
        status: asaasSubscription.status === "ACTIVE" ? "active" : "pending",
      };

      const order = await storage.createOrder(orderData);

      // 8. Retornar resposta
      res.json({
        success: true,
        message: "Assinatura criada com sucesso!",
        order: {
          id: order.id,
          status: order.status,
          frequency: order.frequency,
        },
      });

    } catch (error: any) {
      console.error("❌ Create order error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Falha ao criar pedido"
      });
    }
  });

  app.get("/api/orders", requireAuth, requireAdmin, async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json({ success: true, orders: allOrders });
    } catch (error: any) {
      console.error("Get orders error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get orders"
      });
    }
  });

  app.get("/api/orders/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      res.json({ success: true, order });
    } catch (error: any) {
      console.error("Get order error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get order"
      });
    }
  });

  app.patch("/api/orders/:id/status", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required"
        });
      }

      const validStatuses = ["pending", "active", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status"
        });
      }

      const order = await storage.updateOrderStatus(id, status);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      res.json({
        success: true,
        message: "Status updated successfully",
        order
      });
    } catch (error: any) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update status"
      });
    }
  });

  // One-time purchases routes
  app.post("/api/one-time-purchases", async (req, res) => {
    try {
      const validatedData = oneTimePurchaseSchema.parse(req.body);

      // Verificar se o Asaas está configurado
      if (!asaasService.isConfigured()) {
        console.warn("⚠️  Asaas não configurado. Salvando compra sem processar pagamento.");
        const purchase = await storage.createOneTimePurchase(validatedData);
        return res.json({
          success: true,
          message: "Compra registrada (Asaas não configurado)",
          purchase
        });
      }

      // 1. Buscar informações da cesta
      const basket = await storage.getBasket(validatedData.basketId);
      if (!basket) {
        return res.status(404).json({
          success: false,
          message: "Cesta não encontrada"
        });
      }

      // 2. Extrair informações do endereço
      const addressParts = validatedData.customerAddress.split(" - ");
      const streetAndNumber = addressParts[0]?.split(", ");
      const street = streetAndNumber[0] || "";
      const number = streetAndNumber[1] || "";
      const neighborhood = addressParts[1] || "";
      const postalCode = validatedData.customerAddress.match(/CEP:\s*(\d{5}-?\d{3})/)?.[1]?.replace("-", "") || "";

      // 2. Criar ou buscar cliente no Asaas
      console.log("🔍 Verificando cliente no Asaas...");
      let asaasCustomer = await asaasService.getCustomerByCpfCnpj(validatedData.customerCpf);

      if (!asaasCustomer) {
        console.log("👤 Cliente não encontrado. Criando novo cliente...");
        asaasCustomer = await asaasService.createCustomer({
          name: validatedData.customerName,
          cpfCnpj: validatedData.customerCpf,
          email: validatedData.customerEmail,
          mobilePhone: validatedData.customerWhatsapp,
          address: street,
          addressNumber: number,
          province: neighborhood,
          postalCode,
          notificationDisabled: false,
        });
      } else {
        console.log("✅ Cliente já existe no Asaas:", asaasCustomer.id);
      }

      // 3. Criar cobrança no Asaas
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3); // Vencimento em 3 dias
      const dueDateStr = dueDate.toISOString().split('T')[0];

      let asaasPayment;
      const paymentValue = parseFloat(validatedData.totalAmount);
      const description = `${validatedData.customerName} - ${basket.name}`;

      if (validatedData.paymentMethod === "cartao") {
        // Pagamento com cartão de crédito
        console.log("💳 Processando pagamento com cartão...");

        // Extrair mês e ano do cartão
        const [expiryMonth, expiryYear] = validatedData.cardExpiry?.split("/") || ["", ""];

        asaasPayment = await asaasService.createPayment({
          customer: asaasCustomer.id,
          billingType: "CREDIT_CARD",
          value: paymentValue,
          dueDate: dueDateStr,
          description: description,
          creditCard: {
            holderName: validatedData.cardName || "",
            number: validatedData.cardNumber?.replace(/\s/g, "") || "",
            expiryMonth: expiryMonth,
            expiryYear: expiryYear,
            ccv: validatedData.cardCvv || "",
          },
          creditCardHolderInfo: {
            name: validatedData.customerName,
            email: validatedData.customerEmail,
            cpfCnpj: validatedData.customerCpf,
            postalCode: postalCode,
            addressNumber: number,
            phone: validatedData.customerWhatsapp,
          },
        });
      } else if (validatedData.paymentMethod === "boleto") {
        // Pagamento com boleto
        console.log("📄 Gerando boleto...");
        asaasPayment = await asaasService.createPayment({
          customer: asaasCustomer.id,
          billingType: "BOLETO",
          value: paymentValue,
          dueDate: dueDateStr,
          description: description,
        });
      } else {
        // Pagamento com PIX
        console.log("📱 Gerando PIX...");
        asaasPayment = await asaasService.createPayment({
          customer: asaasCustomer.id,
          billingType: "PIX",
          value: paymentValue,
          dueDate: dueDateStr,
          description: description,
        });
      }

      console.log("✅ Pagamento criado no Asaas:", asaasPayment.id);

      // 4. Salvar compra no banco com dados do Asaas
      const purchaseData: any = {
        ...validatedData,
        asaasCustomerId: asaasCustomer.id,
        asaasPaymentId: asaasPayment.id,
        status: asaasPayment.status === "CONFIRMED" ? "paid" : "pending",
      };

      // Adicionar URLs específicas por método de pagamento
      if (validatedData.paymentMethod === "boleto" && asaasPayment.bankSlipUrl) {
        purchaseData.asaasBankSlipUrl = asaasPayment.bankSlipUrl;
      } else if (validatedData.paymentMethod === "pix") {
        // Buscar QR Code PIX usando endpoint específico
        console.log("🔍 Buscando QR Code PIX...");
        try {
          const pixQrCode = await asaasService.getPixQrCode(asaasPayment.id);
          purchaseData.asaasPixQrCode = pixQrCode.encodedImage;
          purchaseData.asaasPixPayload = pixQrCode.payload;
          console.log("✅ QR Code e Payload recebidos com sucesso!");
          console.log("📷 QR Code tamanho:", pixQrCode.encodedImage?.length || 0);
          console.log("📋 Payload tamanho:", pixQrCode.payload?.length || 0);
        } catch (error) {
          console.error("❌ Erro ao buscar QR Code PIX:", error);
          // Continua mesmo se o QR Code não estiver disponível ainda
        }
      }

      const purchase = await storage.createOneTimePurchase(purchaseData);

      // 5. Retornar resposta com informações de pagamento
      const response: any = {
        success: true,
        message: "Compra realizada com sucesso",
        purchase: {
          id: purchase.id,
          status: purchase.status,
          paymentMethod: purchase.paymentMethod,
        },
      };

      // Adicionar informações específicas por método de pagamento
      if (validatedData.paymentMethod === "boleto") {
        response.bankSlipUrl = asaasPayment.bankSlipUrl || purchase.asaasBankSlipUrl;
        response.message = "Boleto gerado com sucesso! Acesse o link para pagar.";
        console.log("🧾 Boleto URL:", response.bankSlipUrl);
      } else if (validatedData.paymentMethod === "pix") {
        // Usar dados salvos no banco primeiro, depois da API
        const pixQrCode = purchase.asaasPixQrCode || asaasPayment.pixTransaction?.qrCode?.encodedImage;
        const pixPayload = purchase.asaasPixPayload || asaasPayment.pixTransaction?.qrCode?.payload;

        console.log("🔍 Dados PIX do banco:");
        console.log("  - QR Code no banco:", !!purchase.asaasPixQrCode);
        console.log("  - Payload no banco:", !!purchase.asaasPixPayload);
        console.log("🔍 Dados PIX da API:");
        console.log("  - QR Code na API:", !!asaasPayment.pixTransaction?.qrCode?.encodedImage);
        console.log("  - Payload na API:", !!asaasPayment.pixTransaction?.qrCode?.payload);

        if (pixQrCode) {
          // Formatar QR Code com prefixo data:image
          response.pixQrCode = pixQrCode.startsWith('data:')
            ? pixQrCode
            : `data:image/png;base64,${pixQrCode}`;
          console.log("✅ QR Code formatado:", response.pixQrCode.substring(0, 80) + "...");
        } else {
          console.error("❌ QR Code não encontrado!");
        }

        if (pixPayload) {
          response.pixPayload = pixPayload;
          console.log("✅ Payload encontrado:", pixPayload.substring(0, 50) + "...");
        } else {
          console.error("❌ Payload não encontrado!");
        }

        response.message = "PIX gerado com sucesso! Use o QR Code para pagar.";
      } else if (validatedData.paymentMethod === "cartao") {
        response.message = asaasPayment.status === "CONFIRMED"
          ? "Pagamento aprovado com sucesso!"
          : "Pagamento em processamento.";
      }

      res.json(response);
    } catch (error: any) {
      console.error("❌ Create purchase error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Falha ao realizar compra"
      });
    }
  });

  app.get("/api/one-time-purchases", requireAuth, requireAdmin, async (req, res) => {
    try {
      const purchases = await storage.getAllOneTimePurchases();
      res.json({ success: true, purchases });
    } catch (error: any) {
      console.error("Get purchases error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get purchases"
      });
    }
  });

  app.get("/api/one-time-purchases/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const purchase = await storage.getOneTimePurchase(id);

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: "Purchase not found"
        });
      }

      res.json({ success: true, purchase });
    } catch (error: any) {
      console.error("Get purchase error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get purchase"
      });
    }
  });

  app.patch("/api/one-time-purchases/:id/status", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required"
        });
      }

      const validStatuses = ["pending", "confirmed", "paid", "processing", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status"
        });
      }

      const purchase = await storage.updateOneTimePurchaseStatus(id, status);

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: "Purchase not found"
        });
      }

      res.json({
        success: true,
        message: "Status updated successfully",
        purchase
      });
    } catch (error: any) {
      console.error("Update purchase status error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update status"
      });
    }
  });

  // Endpoint de teste simplificado
  app.get("/api/test/purchases-count", async (req, res) => {
    try {
      const allPurchases = await storage.getAllOneTimePurchases();
      console.log("🔍 TEST: Total purchases:", allPurchases.length);
      res.json({
        success: true,
        total: allPurchases.length,
        purchases: allPurchases.map(p => ({
          id: p.id,
          customerName: p.customerName,
          createdAt: p.createdAt
        }))
      });
    } catch (error: any) {
      console.error("❌ Test error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Endpoint de DEBUG para listar compras com asaasPaymentId
  app.get("/api/debug/purchases", async (req, res) => {
    try {
      console.log("🔍 DEBUG: Buscando compras no banco de dados...");
      const purchases = await storage.getAllOneTimePurchases();
      console.log("📊 Total de compras encontradas:", purchases.length);

      const debug = purchases.map(p => ({
        id: p.id,
        customerName: p.customerName,
        paymentMethod: p.paymentMethod,
        status: p.status,
        asaasCustomerId: p.asaasCustomerId,
        asaasPaymentId: p.asaasPaymentId,
        createdAt: p.createdAt
      }));

      console.log("📋 Compras processadas:", JSON.stringify(debug, null, 2));

      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, total: purchases.length, purchases: debug });
    } catch (error: any) {
      console.error("❌ Erro ao buscar compras:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Endpoint de teste para verificar se o webhook está acessível
  app.get("/api/webhooks/asaas/test", async (req, res) => {
    console.log("🔍 Teste de webhook recebido via GET");
    res.json({
      success: true,
      message: "Webhook está acessível e funcionando!",
      timestamp: new Date().toISOString(),
      method: "GET"
    });
  });

  app.post("/api/webhooks/asaas/test", async (req, res) => {
    console.log("🔍 Teste de webhook recebido via POST");
    console.log("📦 Body recebido:", JSON.stringify(req.body, null, 2));
    res.json({
      success: true,
      message: "Webhook recebeu os dados com sucesso!",
      receivedData: req.body,
      timestamp: new Date().toISOString(),
      method: "POST"
    });
  });

  // Webhook do Asaas para receber notificações de pagamento e assinatura
  app.post("/api/webhooks/asaas", async (req, res) => {
    try {
      console.log("📩 =================================");
      console.log("📩 WEBHOOK ASAAS CHAMADO!");
      console.log("📩 Timestamp:", new Date().toISOString());
      console.log("📩 Headers:", JSON.stringify(req.headers, null, 2));
      console.log("📩 Body completo:", JSON.stringify(req.body, null, 2));
      console.log("📩 =================================");

      const event = req.body.event;
      const payment = req.body.payment;
      const subscription = req.body.subscription;

      console.log("📩 Webhook Asaas processando:", {
        event,
        paymentId: payment?.id,
        subscriptionId: subscription?.id,
        status: payment?.status || subscription?.status,
      });

      // Validar se o evento tem dados válidos
      if (!event) {
        console.warn("⚠️  Webhook inválido: evento ausente");
        return res.status(400).json({
          success: false,
          message: "Invalid webhook data: missing event"
        });
      }

      // ===== PROCESSAR EVENTOS DE ASSINATURA =====
      if (subscription) {
        console.log("🔄 Processando evento de assinatura:", subscription.id);

        // Buscar pedido pelo ID da assinatura Asaas
        const allOrders = await storage.getAllOrders();
        const order = allOrders.find(o => o.asaasSubscriptionId === subscription.id);

        if (!order) {
          console.warn("⚠️  Pedido não encontrado para a assinatura:", subscription.id);
          // Retorna sucesso mesmo assim para não ficar reenviando
          return res.json({
            success: true,
            message: "Subscription not found, but acknowledged"
          });
        }

        console.log("📦 Pedido encontrado:", {
          orderId: order.id,
          currentStatus: order.status,
          customer: order.customerName,
        });

        // Mapear eventos de assinatura para status internos
        let newStatus = order.status;

        switch (event) {
          case "SUBSCRIPTION_CREATED":
            newStatus = subscription.status === "ACTIVE" ? "active" : "pending";
            console.log("✅ Assinatura criada! Status:", subscription.status);
            break;

          case "SUBSCRIPTION_UPDATED":
            if (subscription.status === "ACTIVE") {
              newStatus = "active";
            } else if (subscription.status === "INACTIVE" || subscription.status === "EXPIRED") {
              newStatus = "cancelled";
            }
            console.log("🔄 Assinatura atualizada! Novo status:", subscription.status);
            break;

          case "SUBSCRIPTION_DELETED":
            newStatus = "cancelled";
            console.log("❌ Assinatura cancelada!");
            break;

          default:
            console.log("ℹ️  Evento de assinatura não mapeado:", event);
        }

        // Atualizar status se houver mudança
        if (newStatus !== order.status) {
          await storage.updateOrderStatus(order.id, newStatus);
          console.log("✅ Status do pedido atualizado:", {
            orderId: order.id,
            oldStatus: order.status,
            newStatus: newStatus,
          });
        }

        return res.json({
          success: true,
          message: "Subscription webhook processed successfully"
        });
      }

      // ===== PROCESSAR EVENTOS DE PAGAMENTO =====
      if (payment) {
        console.log("💳 Processando evento de pagamento:", payment.id);

        // Verificar se o pagamento está vinculado a uma assinatura
        if (payment.subscription) {
          console.log("🔄 Pagamento vinculado à assinatura:", payment.subscription);

          // Buscar pedido (assinatura) pelo ID da assinatura Asaas
          const allOrders = await storage.getAllOrders();
          const order = allOrders.find(o => o.asaasSubscriptionId === payment.subscription);

          if (!order) {
            console.warn("⚠️  Pedido (assinatura) não encontrado:", payment.subscription);
            return res.json({
              success: true,
              message: "Subscription order not found, but acknowledged"
            });
          }

          console.log("📦 Pedido (assinatura) encontrado:", {
            orderId: order.id,
            currentStatus: order.status,
            customer: order.customerName,
          });

          // Mapear eventos de pagamento de assinatura para status internos
          let newStatus = order.status;

          switch (event) {
            case "PAYMENT_RECEIVED":
            case "PAYMENT_CONFIRMED":
              newStatus = "active";
              console.log("✅ Pagamento de assinatura confirmado! Atualizando status para 'active'");
              break;

            case "PAYMENT_UPDATED":
              if (payment.status === "CONFIRMED" || payment.status === "RECEIVED") {
                newStatus = "active";
                console.log("✅ Pagamento de assinatura atualizado para confirmado! Status: 'active'");
              }
              break;

            case "PAYMENT_OVERDUE":
              console.log("⚠️  Pagamento de assinatura vencido");
              // Mantém o status atual
              break;

            case "PAYMENT_DELETED":
            case "PAYMENT_REFUNDED":
              newStatus = "cancelled";
              console.log("❌ Pagamento de assinatura cancelado/reembolsado! Status: 'cancelled'");
              break;

            default:
              console.log("ℹ️  Evento de pagamento de assinatura não mapeado:", event);
          }

          // Atualizar status se houver mudança
          if (newStatus !== order.status) {
            await storage.updateOrderStatus(order.id, newStatus);
            console.log("✅ Status do pedido (assinatura) atualizado:", {
              orderId: order.id,
              oldStatus: order.status,
              newStatus: newStatus,
            });
          }

          return res.json({
            success: true,
            message: "Subscription payment webhook processed successfully"
          });
        }

        // Se não tem subscription, é uma compra avulsa
        console.log("💳 Pagamento de compra avulsa:", payment.id);

        // Buscar compra pelo ID do pagamento Asaas
        const purchases = await storage.getAllOneTimePurchases();
        const purchase = purchases.find(p => p.asaasPaymentId === payment.id);

        if (!purchase) {
          console.warn("⚠️  Compra não encontrada para o pagamento:", payment.id);
          // Retorna sucesso mesmo assim para não ficar reenviando
          return res.json({
            success: true,
            message: "Payment not found, but acknowledged"
          });
        }

        console.log("📦 Compra encontrada:", {
          purchaseId: purchase.id,
          currentStatus: purchase.status,
          paymentMethod: purchase.paymentMethod,
        });

        // Mapear eventos do Asaas para status internos
        let newStatus = purchase.status;

        switch (event) {
          case "PAYMENT_RECEIVED":
          case "PAYMENT_CONFIRMED":
            newStatus = "paid";
            console.log("✅ Pagamento confirmado! Atualizando status para 'paid'");
            break;

          case "PAYMENT_UPDATED":
            if (payment.status === "CONFIRMED" || payment.status === "RECEIVED") {
              newStatus = "paid";
              console.log("✅ Pagamento atualizado para confirmado! Atualizando status para 'paid'");
            }
            break;

          case "PAYMENT_OVERDUE":
            console.log("⚠️  Pagamento vencido");
            // Mantém o status atual para pagamentos vencidos
            break;

          case "PAYMENT_DELETED":
          case "PAYMENT_REFUNDED":
            newStatus = "cancelled";
            console.log("❌ Pagamento cancelado/reembolsado! Atualizando status para 'cancelled'");
            break;

          default:
            console.log("ℹ️  Evento de pagamento não mapeado:", event);
        }

        // Atualizar status se houver mudança
        if (newStatus !== purchase.status) {
          await storage.updateOneTimePurchaseStatus(purchase.id, newStatus);
          console.log("✅ Status da compra atualizado:", {
            purchaseId: purchase.id,
            oldStatus: purchase.status,
            newStatus: newStatus,
          });
        }

        return res.json({
          success: true,
          message: "Payment webhook processed successfully"
        });
      }

      // Se não tem payment nem subscription
      console.warn("⚠️  Webhook sem dados de pagamento ou assinatura");
      return res.status(400).json({
        success: false,
        message: "Invalid webhook data: missing payment or subscription"
      });

    } catch (error: any) {
      console.error("❌ Erro ao processar webhook Asaas:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to process webhook"
      });
    }
  });

  // Webhook do WhatsApp (Evolution API) - Handler principal
  const handleWhatsAppWebhook = async (req: any, res: any) => {
    try {
      console.log("📱 =================================");
      console.log("📱 WEBHOOK WHATSAPP CHAMADO!");
      console.log("📱 Timestamp:", new Date().toISOString());
      console.log("📱 URL:", req.url);
      console.log("📱 Body:", JSON.stringify(req.body, null, 2));
      console.log("📱 =================================");

      const { event, instance, data } = req.body;

      // Validar evento
      if (!event || !instance || !data) {
        console.warn("⚠️  Webhook inválido: dados ausentes");
        return res.status(200).json({ success: true }); // Retorna 200 para não reenviar
      }

      // Processar apenas eventos de mensagens recebidas
      // Aceita tanto "messages.upsert" quanto "MESSAGES_UPSERT"
      const eventLower = event.toLowerCase().replace(/_/g, '.');
      if (eventLower !== "messages.upsert") {
        console.log("ℹ️  Evento ignorado:", event);
        return res.status(200).json({ success: true });
      }

      // Pegar informações da mensagem
      // A estrutura pode variar: data.messages[0] ou diretamente data
      const message = data.messages?.[0] || data;

      console.log("🔍 Estrutura da mensagem:", {
        hasMessages: !!data.messages,
        hasKey: !!message.key,
        hasMessage: !!message.message,
      });

      if (!message.key) {
        console.warn("⚠️  Mensagem não encontrada no webhook (sem key)");
        return res.status(200).json({ success: true });
      }

      // Ignorar mensagens do próprio bot
      if (message.key.fromMe) {
        console.log("ℹ️  Mensagem enviada pelo bot, ignorando");
        return res.status(200).json({ success: true });
      }

      // Extrair dados da mensagem
      const from = message.key.remoteJid; // Número do remetente
      const messageId = message.key.id;

      // Extrair informações do remetente
      const senderNumber = from.replace('@s.whatsapp.net', '').replace('@g.us', '');
      const senderName = message.pushName || senderNumber;

      // Buscar a conexão pelo instanceName
      const connections = await storage.getAllWhatsappConnections();
      const connection = connections.find(c => c.instanceName === instance);

      if (!connection) {
        console.warn("⚠️  Conexão não encontrada para a instância:", instance);
        return res.status(200).json({ success: true });
      }

      // Criar ou buscar conversa existente
      const conversation = await storage.createOrGetConversation(senderNumber, senderName);
      console.log("💬 Conversa:", conversation.id, "- Cliente:", conversation.customerName);

      // Verificar se é uma mensagem de áudio
      const isAudio = !!message.message?.audioMessage;
      let messageText = "";

      if (isAudio) {
        console.log("🎤 Mensagem de áudio detectada!");
        console.log("🔍 Campos do audioMessage:", Object.keys(message.message.audioMessage));
        console.log("🔍 Campos do data:", Object.keys(data));

        try {
          const audioMessage = message.message.audioMessage;
          let audioBuffer: Buffer;

          // Usar a Evolution API para baixar e decodificar o áudio
          console.log("📥 Baixando áudio via Evolution API...");
          audioBuffer = await evolutionService.downloadMedia(instance, message);

          // Salvar temporariamente
          const tempDir = './temp';
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }

          // Salvar como .ogg (formato original do WhatsApp)
          const tempFilePath = `${tempDir}/audio_${messageId}.ogg`;
          fs.writeFileSync(tempFilePath, audioBuffer);

          console.log(`💾 Áudio salvo em: ${tempFilePath}`);

          // Transcrever o áudio
          messageText = await aiService.transcribeAudio(tempFilePath);

          console.log(`📝 Transcrição: ${messageText}`);

          // Deletar arquivo temporário
          fs.unlinkSync(tempFilePath);

        } catch (error: any) {
          console.error('❌ Erro ao processar áudio:', error);
          await evolutionService.sendTextMessage(
            instance,
            from,
            "Desculpe, não consegui processar seu áudio. Por favor, tente novamente."
          );
          return res.status(200).json({ success: true });
        }
      } else {
        // Mensagem de texto
        messageText = message.message?.conversation ||
                     message.message?.extendedTextMessage?.text ||
                     "";
      }

      if (!messageText) {
        console.log("ℹ️  Mensagem sem texto ou áudio, ignorando");
        return res.status(200).json({ success: true });
      }

      console.log("📩 Mensagem recebida:", {
        from,
        text: messageText,
        instance: instance,
        isAudio: isAudio,
      });

      // Salvar mensagem do usuário no banco
      await storage.createConversationMessage({
        conversationId: conversation.id,
        sender: 'user',
        senderName: senderName,
        message: messageText,
        messageType: isAudio ? 'audio' : 'text',
      });
      console.log("💾 Mensagem do usuário salva no banco");

      // Verificar se a IA está habilitada
      if (!connection.aiEnabled) {
        console.log("ℹ️  IA não está habilitada para esta conexão");

        // Salvar mensagem de sistema indicando que IA está desabilitada
        await storage.createConversationMessage({
          conversationId: conversation.id,
          sender: 'system',
          message: 'IA desabilitada para esta conexão',
          messageType: 'text',
        });

        return res.status(200).json({ success: true });
      }

      console.log("🤖 Gerando resposta com IA...");

      // Buscar histórico de mensagens da conversa
      const conversationHistory = await storage.getConversationMessages(conversation.id);
      console.log(`📚 Histórico carregado: ${conversationHistory.length} mensagens anteriores`);

      // Pegar as últimas mensagens do assistente para evitar duplicação
      const lastAssistantMessages = conversationHistory
        .filter(msg => msg.sender === 'agent')
        .slice(-3)
        .map(msg => msg.message);

      // Gerar resposta com IA usando histórico
      const aiResponse = await aiService.generateResponseWithHistory(
        messageText,
        {
          aiModel: connection.aiModel || "gpt-4o-mini",
          aiTemperature: connection.aiTemperature || "0.7",
          aiMaxTokens: connection.aiMaxTokens || 1000,
          aiPrompt: connection.aiPrompt || "Você é um assistente virtual útil e amigável.",
        },
        conversationHistory,
        lastAssistantMessages
      );

      console.log("✅ Resposta gerada com histórico:", aiResponse);

      // Verificar se a resposta não é duplicada antes de salvar
      const isDuplicate = lastAssistantMessages.some(
        lastMsg => lastMsg.toLowerCase().trim() === aiResponse.toLowerCase().trim()
      );

      if (isDuplicate) {
        console.log("⚠️  Resposta duplicada detectada após geração. Algo deu errado.");
      }

      // Salvar resposta da IA no banco
      await storage.createConversationMessage({
        conversationId: conversation.id,
        sender: 'agent',
        senderName: 'IA Assistant',
        message: aiResponse,
        messageType: 'text',
      });
      console.log("💾 Resposta da IA salva no banco (sem duplicação)");

      // Enviar resposta via Evolution API
      await evolutionService.sendTextMessage(instance, from, aiResponse);

      console.log("📤 Resposta enviada com sucesso!");

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("❌ Erro ao processar webhook WhatsApp:", error);
      // Retorna 200 mesmo com erro para não reenviar
      return res.status(200).json({ success: true, error: error.message });
    }
  };

  // Registrar rotas do webhook (múltiplas rotas para compatibilidade)
  app.post("/api/webhook/whatsapp", handleWhatsAppWebhook);
  app.post("/api/webhook/whatsapp/messages-upsert", handleWhatsAppWebhook);
  app.post("/api/webhook/whatsapp/:event", handleWhatsAppWebhook);

  // Conversations API
  app.get("/api/conversations", requireAuth, async (req, res) => {
    try {
      const allConversations = await db.select()
        .from(conversations)
        .orderBy(desc(conversations.lastMessageAt));

      console.log(`📊 [GET /api/conversations] Returning ${allConversations.length} conversations`);
      allConversations.forEach((conv: any) => {
        console.log(`  - Conv ${conv.id}: ${conv.customerName} - Status: "${conv.status}"`);
      });

      res.json({ success: true, conversations: allConversations });
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get("/api/conversations/:id", requireAuth, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversation(conversationId);

      if (!conversation) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
      }

      const messages = await storage.getConversationMessages(conversationId);
      await storage.markMessagesAsRead(conversationId);

      res.json({ success: true, conversation, messages });
    } catch (error: any) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Update conversation status
  app.patch("/api/conversations/:id/status", requireAuth, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { status } = req.body;

      console.log(`📝 [PATCH /api/conversations/${conversationId}/status] Updating to status: "${status}"`);

      if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
      }

      const updatedConversation = await storage.updateConversationStatus(conversationId, status);

      if (!updatedConversation) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
      }

      console.log(`✅ [PATCH] Conversation ${conversationId} updated. New status in DB: "${updatedConversation.status}"`);

      res.json({ success: true, conversation: updatedConversation });
    } catch (error: any) {
      console.error("Error updating conversation status:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { message, sender = 'agent' } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, message: "Message is required" });
      }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
      }

      // Se é a primeira mensagem do agente, mudar status para in_progress
      if (sender === 'agent' && conversation.status !== 'in_progress' && conversation.status !== 'closed') {
        await storage.updateConversationStatus(conversationId, 'in_progress');
      }

      const newMessage = await storage.createConversationMessage({
        conversationId,
        sender,
        senderName: req.session.user?.name || 'Agent',
        message,
        messageType: 'text',
      });

      res.json({ success: true, message: newMessage });
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // WhatsApp Connections routes
  app.get("/api/whatsapp-connections", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const connections = await storage.getAllWhatsappConnections();
      res.json(connections);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to fetch WhatsApp connections"
      });
    }
  });

  app.post("/api/whatsapp-connections", requireAuth, requireAdmin, async (req, res) => {
    try {
      const data = whatsappConnectionSchema.parse(req.body);

      // Usar o nome fornecido como instanceName (limpar caracteres especiais)
      const instanceName = data.name.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/^_+|_+$/g, '') // Remove underscores no início e fim
        .substring(0, 100); // Limita tamanho

      console.log(`🔌 Criando instância na Evolution API: ${instanceName}`);

      // Criar instância na Evolution API
      let evolutionResponse;
      try {
        evolutionResponse = await evolutionService.createInstance(
          instanceName,
          data.phoneNumber
        );
        console.log('✅ Instância criada na Evolution API:', evolutionResponse);
      } catch (evolutionError: any) {
        console.error('❌ Erro ao criar instância na Evolution API:', evolutionError);
        return res.status(500).json({
          message: `Erro ao criar instância no WhatsApp: ${evolutionError.message}`,
          error: evolutionError.message
        });
      }

      // Salvar conexão no banco de dados
      const connection = await storage.createWhatsappConnection({
        ...data,
        instanceName,
        status: 'pending', // Status inicial é pending, aguardando QR Code
      });

      // Tentar obter QR Code para conexão
      try {
        const connectResponse = await evolutionService.connectInstance(instanceName);
        console.log('🔗 QR Code gerado:', connectResponse);

        // Atualizar conexão com QR Code se disponível
        if (connectResponse?.qrcode?.base64) {
          await storage.updateWhatsappConnectionQrCode(
            connection.id,
            connectResponse.qrcode.base64
          );
          connection.qrCode = connectResponse.qrcode.base64;
        }
      } catch (qrError: any) {
        console.warn('⚠️  Não foi possível gerar QR Code imediatamente:', qrError.message);
        // Não bloqueia a criação se o QR Code falhar
      }

      res.status(201).json(connection);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error('❌ Erro ao criar conexão WhatsApp:', error);
      res.status(500).json({
        message: error.message || "Failed to create WhatsApp connection"
      });
    }
  });

  app.get("/api/whatsapp-connections/:id/qrcode", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const connections = await storage.getAllWhatsappConnections();
      const connection = connections.find(c => c.id === id);

      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }

      if (!connection.instanceName) {
        return res.status(400).json({ message: "Connection does not have an instance" });
      }

      try {
        const connectResponse = await evolutionService.connectInstance(connection.instanceName);
        console.log('🔗 QR Code gerado:', connectResponse);

        // A Evolution API pode retornar o base64 em diferentes formatos
        const qrCodeBase64 = connectResponse?.base64 || connectResponse?.qrcode?.base64;

        if (qrCodeBase64) {
          await storage.updateWhatsappConnectionQrCode(
            connection.id,
            qrCodeBase64
          );
          res.json({ qrCode: qrCodeBase64 });
        } else {
          console.error('❌ Resposta sem QR Code:', connectResponse);
          res.status(500).json({
            message: "Failed to generate QR Code",
            debug: connectResponse
          });
        }
      } catch (error: any) {
        console.error('❌ Erro ao gerar QR Code:', error);
        res.status(500).json({
          message: error.message || "Failed to generate QR Code"
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Failed to get QR Code"
      });
    }
  });

  app.get("/api/whatsapp-connections/:id/status", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const connections = await storage.getAllWhatsappConnections();
      const connection = connections.find(c => c.id === id);

      if (!connection) {
        return res.status(404).json({ message: "Conexão não encontrada" });
      }

      if (!connection.instanceName) {
        return res.status(400).json({ message: "Conexão não possui uma instância" });
      }

      try {
        const statusResponse = await evolutionService.connectionState(connection.instanceName);
        console.log(`📊 Status da conexão ${connection.instanceName}:`, statusResponse);

        // Mapear o status da Evolution API para nosso sistema
        let newStatus = "disconnected";
        if (statusResponse?.instance?.state === "open" || statusResponse?.state === "open") {
          newStatus = "connected";
        } else if (statusResponse?.instance?.state === "connecting" || statusResponse?.state === "connecting") {
          newStatus = "pending";
        }

        // Atualizar status no banco se mudou
        if (connection.status !== newStatus) {
          await storage.updateWhatsappConnectionStatus(id, newStatus);
        }

        res.json({
          status: newStatus,
          details: statusResponse
        });
      } catch (error: any) {
        console.error(`❌ Erro ao verificar status:`, error);
        res.status(500).json({
          message: error.message || "Erro ao verificar status"
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Erro ao buscar status"
      });
    }
  });

  app.post("/api/whatsapp-connections/:id/configure", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const connections = await storage.getAllWhatsappConnections();
      const connection = connections.find(c => c.id === id);

      if (!connection) {
        return res.status(404).json({ message: "Conexão não encontrada" });
      }

      if (!connection.instanceName) {
        return res.status(400).json({ message: "Conexão não possui uma instância" });
      }

      // Configurações padrão do WhatsApp
      const settings = {
        rejectCall: true,
        msgCall: "Não aceito chamadas",
        groupsIgnore: true,
        alwaysOnline: true,
        readMessages: true,
        syncFullHistory: false,
        readStatus: true
      };

      try {
        console.log(`⚙️  Configurando WhatsApp para: ${connection.instanceName}`);
        const result = await evolutionService.setSettings(connection.instanceName, settings);
        console.log('✅ Configurações aplicadas:', result);

        res.json({
          success: true,
          message: "Configurações aplicadas com sucesso!",
          settings: settings
        });
      } catch (error: any) {
        console.error('❌ Erro ao configurar WhatsApp:', error);
        res.status(500).json({
          message: error.message || "Erro ao aplicar configurações"
        });
      }
    } catch (error: any) {
      console.error('❌ Erro geral:', error);
      res.status(500).json({
        message: error.message || "Erro ao configurar WhatsApp"
      });
    }
  });

  app.post("/api/whatsapp-connections/:id/configure-ia", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const connections = await storage.getAllWhatsappConnections();
      const connection = connections.find(c => c.id === id);

      if (!connection) {
        return res.status(404).json({ message: "Conexão não encontrada" });
      }

      if (!connection.instanceName) {
        return res.status(400).json({ message: "Conexão não possui uma instância" });
      }

      if (connection.status !== "connected") {
        return res.status(400).json({ message: "A conexão precisa estar conectada antes de configurar a IA" });
      }

      // Obter a URL do webhook da variável de ambiente ou usar uma padrão
      const webhookUrl = process.env.WEBHOOK_URL || "https://webhook.site";
      const webhookToken = process.env.WEBHOOK_TOKEN || "Bearer TOKEN";

      // Configurações do webhook para IA
      const webhookConfig = {
        enabled: true,
        url: webhookUrl,
        headers: {
          "authorization": webhookToken,
          "Content-Type": "application/json"
        },
        byEvents: true,
        base64: true,
        events: [
          "MESSAGES_SET",
          "MESSAGES_UPSERT",
          "MESSAGES_UPDATE",
          "MESSAGES_DELETE"
        ]
      };

      try {
        console.log(`🤖 Configurando IA (webhook) para: ${connection.instanceName}`);
        console.log(`📡 Webhook URL: ${webhookUrl}`);
        const result = await evolutionService.setWebhook(connection.instanceName, webhookConfig);
        console.log('✅ Webhook configurado:', result);

        res.json({
          success: true,
          message: "IA configurada com sucesso! O webhook está ativo.",
          webhookUrl: webhookUrl,
          events: webhookConfig.events
        });
      } catch (error: any) {
        console.error('❌ Erro ao configurar webhook:', error);
        res.status(500).json({
          message: error.message || "Erro ao configurar IA"
        });
      }
    } catch (error: any) {
      console.error('❌ Erro geral:', error);
      res.status(500).json({
        message: error.message || "Erro ao configurar IA"
      });
    }
  });

  app.delete("/api/whatsapp-connections/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      // Buscar conexão para obter instanceName
      const connections = await storage.getAllWhatsappConnections();
      const connection = connections.find(c => c.id === id);

      if (connection && connection.instanceName) {
        // Tentar excluir instância na Evolution API
        try {
          console.log(`🗑️  Excluindo instância ${connection.instanceName} na Evolution API`);
          await evolutionService.deleteInstance(connection.instanceName);
          console.log('✅ Instância excluída da Evolution API');
        } catch (evolutionError: any) {
          console.warn('⚠️  Não foi possível excluir a instância na Evolution API:', evolutionError.message);
          // Continua com a exclusão do banco mesmo se falhar na Evolution API
        }
      }

      await storage.deleteWhatsappConnection(id);
      res.json({ success: true, message: "Connection deleted successfully" });
    } catch (error: any) {
      console.error('❌ Erro ao excluir conexão:', error);
      res.status(500).json({
        message: error.message || "Failed to delete WhatsApp connection"
      });
    }
  });

  // Atualizar configurações de IA
  app.patch("/api/whatsapp-connections/:id/ai-config", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { aiEnabled, aiModel, aiTemperature, aiMaxTokens, aiPrompt } = req.body;

      await storage.updateWhatsappAiConfig(id, {
        aiEnabled,
        aiModel,
        aiTemperature,
        aiMaxTokens,
        aiPrompt,
      });

      res.json({ success: true, message: "AI configuration saved successfully" });
    } catch (error: any) {
      console.error('❌ Erro ao salvar configurações de IA:', error);
      res.status(500).json({
        message: error.message || "Failed to save AI configuration"
      });
    }
  });

  // Testar IA
  app.post("/api/whatsapp-connections/:id/test-ai", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { message, config } = req.body;

      if (!message || !config) {
        return res.status(400).json({
          message: "Message and config are required"
        });
      }

      // Importar OpenAI dinamicamente
      const { OpenAI } = await import("openai");

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: config.aiModel || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: config.aiPrompt || "Você é um assistente virtual útil e amigável.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: parseFloat(config.aiTemperature || "0.7"),
        max_tokens: config.aiMaxTokens || 1000,
      });

      const response = completion.choices[0]?.message?.content || "Sem resposta";

      res.json({ success: true, response });
    } catch (error: any) {
      console.error('❌ Erro ao testar IA:', error);
      res.status(500).json({
        message: error.message || "Failed to test AI"
      });
    }
  });

  // Blog Posts Routes
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json({ success: true, posts });
    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ message: error.message || "Failed to fetch blog posts" });
    }
  });

  app.post("/api/blog-posts", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
    try {
      const data = blogPostSchema.parse({
        title: req.body.title,
        content: req.body.content,
        imagePath: req.file ? `/uploads/${req.file.filename}` : undefined,
        isActive: req.body.isActive === "true" || req.body.isActive === true,
      });

      const post = await storage.createBlogPost(data);
      res.json({ success: true, post });
    } catch (error: any) {
      console.error('Error creating blog post:', error);
      res.status(400).json({ message: error.message || "Failed to create blog post" });
    }
  });

  app.put("/api/blog-posts/:id", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = blogPostSchema.parse({
        title: req.body.title,
        content: req.body.content,
        imagePath: req.file ? `/uploads/${req.file.filename}` : req.body.imagePath,
        isActive: req.body.isActive === "true" || req.body.isActive === true,
      });

      const post = await storage.updateBlogPost(id, data);
      res.json({ success: true, post });
    } catch (error: any) {
      console.error('Error updating blog post:', error);
      res.status(400).json({ message: error.message || "Failed to update blog post" });
    }
  });

  app.delete("/api/blog-posts/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.json({ success: true, message: "Blog post deleted successfully" });
    } catch (error: any) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ message: error.message || "Failed to delete blog post" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
