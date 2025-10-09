import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contactMessageSchema, loginSchema, insertUserSchema, updateUserSchema, siteSettingsSchema, contactInfoSchema, bannerSchema, youtubeVideoSchema, testimonialSchema, serviceRegionSchema, faqSchema, seasonalCalendarSchema, comparativeTableSchema, looseItemSchema, basketSchema, basketItemSchema, orderSchema, oneTimePurchaseSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

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
      const order = await storage.createOrder(validatedData);

      res.json({
        success: true,
        message: "Pedido criado com sucesso",
        order
      });
    } catch (error: any) {
      console.error("Create order error:", error);
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

  // One-time purchases routes
  app.post("/api/one-time-purchases", async (req, res) => {
    try {
      const validatedData = oneTimePurchaseSchema.parse(req.body);
      const purchase = await storage.createOneTimePurchase(validatedData);

      res.json({
        success: true,
        message: "Compra realizada com sucesso",
        purchase
      });
    } catch (error: any) {
      console.error("Create purchase error:", error);
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

  const httpServer = createServer(app);

  return httpServer;
}
