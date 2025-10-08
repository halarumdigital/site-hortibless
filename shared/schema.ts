import { sql } from "drizzle-orm";
import { mysqlTable, varchar, text, int, timestamp, boolean } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;

export const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export const siteSettings = mysqlTable("site_settings", {
  id: int("id").primaryKey().autoincrement(),
  siteName: varchar("site_name", { length: 255 }).notNull().default("Meu Site"),
  logoPath: varchar("logo_path", { length: 500 }),
  footerLogoPath: varchar("footer_logo_path", { length: 500 }),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  logoPath: z.string().optional(),
  footerLogoPath: z.string().optional(),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type UpdateSiteSettings = z.infer<typeof siteSettingsSchema>;

export const contactInfo = mysqlTable("contact_info", {
  id: int("id").primaryKey().autoincrement(),
  whatsapp: varchar("whatsapp", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  instagram: varchar("instagram", { length: 255 }),
  facebook: varchar("facebook", { length: 255 }),
  tiktok: varchar("tiktok", { length: 255 }),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const contactInfoSchema = z.object({
  whatsapp: z.string().optional().or(z.literal("")),
  email: z.string().optional().or(z.literal("")).refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Invalid email address",
  }),
  address: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  tiktok: z.string().optional().or(z.literal("")),
});

export type ContactInfo = typeof contactInfo.$inferSelect;
export type UpdateContactInfo = z.infer<typeof contactInfoSchema>;

export const banners = mysqlTable("banners", {
  id: int("id").primaryKey().autoincrement(),
  imagePath: varchar("image_path", { length: 500 }).notNull(),
  order: int("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const bannerSchema = z.object({
  imagePath: z.string().min(1, "Image path is required"),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = z.infer<typeof bannerSchema>;

export const gallery = mysqlTable("gallery", {
  id: int("id").primaryKey().autoincrement(),
  type: varchar("type", { length: 20 }).notNull(), // 'image' or 'video'
  path: varchar("path", { length: 500 }).notNull(), // image path or youtube URL
  title: varchar("title", { length: 255 }),
  description: text("description"),
  order: int("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const galleryItemSchema = z.object({
  type: z.enum(["image", "video"]),
  path: z.string().min(1, "Path is required"),
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const youtubeVideoSchema = z.object({
  youtubeUrl: z.string().url("Invalid URL").refine((url) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  }, "Must be a valid YouTube URL"),
  title: z.string().optional(),
  description: z.string().optional(),
});

export type GalleryItem = typeof gallery.$inferSelect;
export type InsertGalleryItem = z.infer<typeof galleryItemSchema>;
export type YoutubeVideo = z.infer<typeof youtubeVideoSchema>;

export const testimonials = mysqlTable("testimonials", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  text: text("text").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  text: z.string().min(1, "Testimonial text is required"),
  isActive: z.boolean().optional(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof testimonialSchema>;

export const serviceRegions = mysqlTable("service_regions", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const serviceRegionSchema = z.object({
  name: z.string().min(1, "Region name is required"),
  isActive: z.boolean().optional(),
});

export type ServiceRegion = typeof serviceRegions.$inferSelect;
export type InsertServiceRegion = z.infer<typeof serviceRegionSchema>;

export const faqs = mysqlTable("faqs", {
  id: int("id").primaryKey().autoincrement(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  isActive: z.boolean().optional(),
});

export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = z.infer<typeof faqSchema>;

export const seasonalCalendar = mysqlTable("seasonal_calendar", {
  id: int("id").primaryKey().autoincrement(),
  imagePath: varchar("image_path", { length: 500 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const seasonalCalendarSchema = z.object({
  imagePath: z.string().min(1, "Image path is required"),
  isActive: z.boolean().optional(),
});

export type SeasonalCalendar = typeof seasonalCalendar.$inferSelect;
export type InsertSeasonalCalendar = z.infer<typeof seasonalCalendarSchema>;

export const comparativeTables = mysqlTable("comparative_tables", {
  id: int("id").primaryKey().autoincrement(),
  imagePath: varchar("image_path", { length: 500 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const comparativeTableSchema = z.object({
  imagePath: z.string().min(1, "Image path is required"),
  isActive: z.boolean().optional(),
});

export type ComparativeTable = typeof comparativeTables.$inferSelect;
export type InsertComparativeTable = z.infer<typeof comparativeTableSchema>;

export const looseItems = mysqlTable("loose_items", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const looseItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.enum(["Frutas", "Legumes", "Verduras", "Temperos"], {
    required_error: "Category is required",
  }),
  isActive: z.boolean().optional(),
});

export type LooseItem = typeof looseItems.$inferSelect;
export type InsertLooseItem = z.infer<typeof looseItemSchema>;

export const baskets = mysqlTable("baskets", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  priceLoose: varchar("price_loose", { length: 50 }),
  priceSubscription: varchar("price_subscription", { length: 50 }),
  imagePath: varchar("image_path", { length: 500 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const basketItems = mysqlTable("basket_items", {
  id: int("id").primaryKey().autoincrement(),
  basketId: int("basket_id").notNull(),
  looseItemId: int("loose_item_id").notNull(),
  quantity: int("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const basketSchema = z.object({
  name: z.string().min(1, "Basket name is required"),
  description: z.string().optional(),
  priceLoose: z.string().optional(),
  priceSubscription: z.string().optional(),
  imagePath: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const basketItemSchema = z.object({
  basketId: z.number(),
  looseItemId: z.number(),
  quantity: z.number().min(1).optional(),
});

export type Basket = typeof baskets.$inferSelect;
export type InsertBasket = z.infer<typeof basketSchema>;
export type BasketItem = typeof basketItems.$inferSelect;
export type InsertBasketItem = z.infer<typeof basketItemSchema>;
