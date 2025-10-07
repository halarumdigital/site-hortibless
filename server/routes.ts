import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contactMessageSchema, loginSchema, insertUserSchema, updateUserSchema } from "@shared/schema";

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

      res.json({ 
        success: true, 
        message: "Login successful",
        user: req.session.user
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

  app.get("/api/me", requireAuth, async (req, res) => {
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
