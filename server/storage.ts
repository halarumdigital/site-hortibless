import { type User, type InsertUser, type UpdateUser, type ContactMessage, type InsertContactMessage, type SiteSettings, type UpdateSiteSettings, type ContactInfo, type UpdateContactInfo, type Banner, type InsertBanner, type GalleryItem, type InsertGalleryItem, type Testimonial, type InsertTestimonial, type ServiceRegion, type InsertServiceRegion, type Faq, type InsertFaq, type SeasonalCalendar, type InsertSeasonalCalendar, type ComparativeTable, type InsertComparativeTable, type ProductPortfolio, type InsertProductPortfolio, type LooseItem, type InsertLooseItem, type Basket, type InsertBasket, type BasketItem, type InsertBasketItem, type TrackingScripts, type UpdateTrackingScripts, type Order, type InsertOrder, type OneTimePurchase, type InsertOneTimePurchase, type WhatsappConnection, type InsertWhatsappConnection, type UpdateWhatsappAiConfig, type BlogPost, type InsertBlogPost, type Conversation, type InsertConversation, type ConversationMessage, type InsertConversationMessage } from "@shared/schema";
import { db, connection } from "./db";
import { users, siteSettings, contactInfo, contactMessages, banners, gallery, testimonials, serviceRegions, faqs, seasonalCalendar, comparativeTables, productPortfolio, looseItems, baskets, basketItems, trackingScripts, orders, oneTimePurchases, whatsappConnections, blogPosts, conversations, conversationMessages } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: UpdateUser): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  verifyPassword(username: string, password: string): Promise<User | null>;
  saveContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  markContactMessageAsRead(id: number): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<boolean>;
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: UpdateSiteSettings): Promise<SiteSettings>;
  getContactInfo(): Promise<ContactInfo | undefined>;
  updateContactInfo(info: UpdateContactInfo): Promise<ContactInfo>;
  getAllBanners(): Promise<Banner[]>;
  getActiveBanners(): Promise<Banner[]>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  deleteBanner(id: number): Promise<boolean>;
  updateBannerOrder(id: number, order: number): Promise<Banner | undefined>;
  getAllGalleryItems(): Promise<GalleryItem[]>;
  getActiveGalleryItems(): Promise<GalleryItem[]>;
  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  deleteGalleryItem(id: number): Promise<boolean>;
  updateGalleryItemOrder(id: number, order: number): Promise<GalleryItem | undefined>;
  getAllTestimonials(): Promise<Testimonial[]>;
  getActiveTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  deleteTestimonial(id: number): Promise<boolean>;
  getAllServiceRegions(): Promise<ServiceRegion[]>;
  getActiveServiceRegions(): Promise<ServiceRegion[]>;
  createServiceRegion(region: InsertServiceRegion): Promise<ServiceRegion>;
  deleteServiceRegion(id: number): Promise<boolean>;
  getAllFaqs(): Promise<Faq[]>;
  getActiveFaqs(): Promise<Faq[]>;
  createFaq(faq: InsertFaq): Promise<Faq>;
  updateFaq(id: number, faq: Partial<InsertFaq>): Promise<Faq | undefined>;
  deleteFaq(id: number): Promise<boolean>;
  getAllSeasonalCalendarItems(): Promise<SeasonalCalendar[]>;
  getActiveSeasonalCalendarItems(): Promise<SeasonalCalendar[]>;
  createSeasonalCalendarItem(item: InsertSeasonalCalendar): Promise<SeasonalCalendar>;
  deleteSeasonalCalendarItem(id: number): Promise<boolean>;
  getAllComparativeTables(): Promise<ComparativeTable[]>;
  getActiveComparativeTables(): Promise<ComparativeTable[]>;
  createComparativeTable(item: InsertComparativeTable): Promise<ComparativeTable>;
  deleteComparativeTable(id: number): Promise<boolean>;
  getAllProductPortfolio(): Promise<ProductPortfolio[]>;
  getActiveProductPortfolio(): Promise<ProductPortfolio[]>;
  createProductPortfolio(item: InsertProductPortfolio): Promise<ProductPortfolio>;
  deleteProductPortfolio(id: number): Promise<boolean>;
  getAllLooseItems(): Promise<LooseItem[]>;
  getActiveLooseItems(): Promise<LooseItem[]>;
  createLooseItem(item: InsertLooseItem): Promise<LooseItem>;
  deleteLooseItem(id: number): Promise<boolean>;
  getAllBaskets(): Promise<Basket[]>;
  getActiveBaskets(): Promise<Basket[]>;
  getBasket(id: number): Promise<Basket | undefined>;
  createBasket(basket: InsertBasket): Promise<Basket>;
  updateBasket(id: number, basket: Partial<InsertBasket>): Promise<Basket | undefined>;
  deleteBasket(id: number): Promise<boolean>;
  getBasketItems(basketId: number): Promise<BasketItem[]>;
  addBasketItem(item: InsertBasketItem): Promise<BasketItem>;
  removeBasketItem(id: number): Promise<boolean>;
  getTrackingScripts(): Promise<TrackingScripts | undefined>;
  updateTrackingScripts(scripts: UpdateTrackingScripts): Promise<TrackingScripts | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  getAllOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  createOneTimePurchase(purchase: InsertOneTimePurchase): Promise<OneTimePurchase>;
  getAllOneTimePurchases(): Promise<OneTimePurchase[]>;
  getOneTimePurchase(id: number): Promise<OneTimePurchase | undefined>;
  updateOneTimePurchaseStatus(id: number, status: string): Promise<OneTimePurchase | undefined>;
  getAllWhatsappConnections(): Promise<WhatsappConnection[]>;
  createWhatsappConnection(connection: InsertWhatsappConnection & { instanceName?: string; status?: string }): Promise<WhatsappConnection>;
  updateWhatsappConnectionQrCode(id: number, qrCode: string): Promise<WhatsappConnection | undefined>;
  updateWhatsappConnectionStatus(id: number, status: string): Promise<WhatsappConnection | undefined>;
  updateWhatsappAiConfig(id: number, config: UpdateWhatsappAiConfig): Promise<WhatsappConnection | undefined>;
  deleteWhatsappConnection(id: number): Promise<boolean>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  getActiveBlogPosts(): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: InsertBlogPost): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  // Conversations
  createOrGetConversation(whatsapp: string, customerName?: string): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByWhatsapp(whatsapp: string): Promise<Conversation | undefined>;
  updateConversationStatus(id: number, status: string): Promise<Conversation | undefined>;
  createConversationMessage(message: InsertConversationMessage): Promise<ConversationMessage>;
  getConversationMessages(conversationId: number): Promise<ConversationMessage[]>;
  markMessagesAsRead(conversationId: number): Promise<void>;
}

export class MySQLStorage implements IStorage {
  constructor() {}

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).$returningId();
    
    const createdUser = await this.getUser(user.id);
    if (!createdUser) throw new Error("User creation failed");
    return createdUser;
  }

  async updateUser(id: number, updateUser: UpdateUser): Promise<User | undefined> {
    const dataToUpdate = { ...updateUser };
    
    if (dataToUpdate.password && dataToUpdate.password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
    } else {
      delete dataToUpdate.password;
    }
    
    await db.update(users).set(dataToUpdate).where(eq(users.id, id));
    return this.getUser(id);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    try {
      // Usar conexão MySQL2 direta para evitar problemas com Drizzle em produção
      const [rows] = await connection.execute(
        'SELECT id, name, email, username, password, phone, role, is_active, created_at, updated_at FROM users WHERE username = ? LIMIT 1',
        [username]
      );

      const users = rows as any[];
      if (!users || users.length === 0) return null;

      const user = users[0];
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) return null;

      // Converter campos do MySQL para o formato esperado
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        password: user.password,
        phone: user.phone || null,
        role: user.role,
        isActive: user.is_active === 1 || user.is_active === true,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      console.error('Error in verifyPassword:', error);
      return null;
    }
  }

  async saveContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [result] = await db.insert(contactMessages).values(message).$returningId();
    const [createdMessage] = await db.select().from(contactMessages).where(eq(contactMessages.id, result.id)).limit(1);
    return createdMessage;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async markContactMessageAsRead(id: number): Promise<ContactMessage | undefined> {
    await db.update(contactMessages).set({ isRead: true }).where(eq(contactMessages.id, id));
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
    return message;
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return true;
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    return settings;
  }

  async updateSiteSettings(updateSettings: UpdateSiteSettings): Promise<SiteSettings> {
    const existingSettings = await this.getSiteSettings();

    if (existingSettings) {
      await db.update(siteSettings)
        .set(updateSettings)
        .where(eq(siteSettings.id, existingSettings.id));

      const [updated] = await db.select().from(siteSettings).where(eq(siteSettings.id, existingSettings.id)).limit(1);
      return updated;
    } else {
      const [newSettings] = await db.insert(siteSettings).values({
        siteName: updateSettings.siteName || "Meu Site",
        logoPath: updateSettings.logoPath,
        footerLogoPath: updateSettings.footerLogoPath,
        faviconPath: updateSettings.faviconPath,
      }).$returningId();

      const [created] = await db.select().from(siteSettings).where(eq(siteSettings.id, newSettings.id)).limit(1);
      return created;
    }
  }

  async getContactInfo(): Promise<ContactInfo | undefined> {
    const [info] = await db.select().from(contactInfo).limit(1);
    return info;
  }

  async updateContactInfo(updateInfo: UpdateContactInfo): Promise<ContactInfo> {
    const existingInfo = await this.getContactInfo();

    // Remove undefined values and convert empty strings to null
    const cleanedInfo: any = {};
    Object.entries(updateInfo).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanedInfo[key] = value === "" ? null : value;
      }
    });

    if (existingInfo) {
      await db.update(contactInfo)
        .set(cleanedInfo)
        .where(eq(contactInfo.id, existingInfo.id));

      const [updated] = await db.select().from(contactInfo).where(eq(contactInfo.id, existingInfo.id)).limit(1);
      return updated;
    } else {
      const [newInfo] = await db.insert(contactInfo).values({
        whatsapp: cleanedInfo.whatsapp || null,
        email: cleanedInfo.email || null,
        address: cleanedInfo.address || null,
        instagram: cleanedInfo.instagram || null,
        facebook: cleanedInfo.facebook || null,
        tiktok: cleanedInfo.tiktok || null,
      }).$returningId();

      const [created] = await db.select().from(contactInfo).where(eq(contactInfo.id, newInfo.id)).limit(1);
      return created;
    }
  }

  async getAllBanners(): Promise<Banner[]> {
    return await db.select().from(banners).orderBy(desc(banners.order));
  }

  async getActiveBanners(): Promise<Banner[]> {
    return await db.select().from(banners).where(eq(banners.isActive, true)).orderBy(desc(banners.order));
  }

  async createBanner(insertBanner: InsertBanner): Promise<Banner> {
    const [banner] = await db.insert(banners).values({
      imagePath: insertBanner.imagePath,
      order: insertBanner.order || 0,
      isActive: insertBanner.isActive !== undefined ? insertBanner.isActive : true,
    }).$returningId();

    const [created] = await db.select().from(banners).where(eq(banners.id, banner.id)).limit(1);
    return created;
  }

  async deleteBanner(id: number): Promise<boolean> {
    await db.delete(banners).where(eq(banners.id, id));
    return true;
  }

  async updateBannerOrder(id: number, order: number): Promise<Banner | undefined> {
    await db.update(banners).set({ order }).where(eq(banners.id, id));
    const [updated] = await db.select().from(banners).where(eq(banners.id, id)).limit(1);
    return updated;
  }

  async getAllGalleryItems(): Promise<GalleryItem[]> {
    return await db.select().from(gallery).orderBy(desc(gallery.order));
  }

  async getActiveGalleryItems(): Promise<GalleryItem[]> {
    return await db.select().from(gallery).where(eq(gallery.isActive, true)).orderBy(desc(gallery.order));
  }

  async createGalleryItem(insertItem: InsertGalleryItem): Promise<GalleryItem> {
    const [item] = await db.insert(gallery).values({
      type: insertItem.type,
      path: insertItem.path,
      title: insertItem.title,
      description: insertItem.description,
      order: insertItem.order || 0,
      isActive: insertItem.isActive !== undefined ? insertItem.isActive : true,
    }).$returningId();

    const [created] = await db.select().from(gallery).where(eq(gallery.id, item.id)).limit(1);
    return created;
  }

  async deleteGalleryItem(id: number): Promise<boolean> {
    await db.delete(gallery).where(eq(gallery.id, id));
    return true;
  }

  async updateGalleryItemOrder(id: number, order: number): Promise<GalleryItem | undefined> {
    await db.update(gallery).set({ order }).where(eq(gallery.id, id));
    const [updated] = await db.select().from(gallery).where(eq(gallery.id, id)).limit(1);
    return updated;
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  }

  async getActiveTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).where(eq(testimonials.isActive, true)).orderBy(desc(testimonials.createdAt));
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db.insert(testimonials).values({
      name: insertTestimonial.name,
      text: insertTestimonial.text,
      isActive: insertTestimonial.isActive !== undefined ? insertTestimonial.isActive : true,
    }).$returningId();

    const [created] = await db.select().from(testimonials).where(eq(testimonials.id, testimonial.id)).limit(1);
    return created;
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    await db.delete(testimonials).where(eq(testimonials.id, id));
    return true;
  }

  async getAllServiceRegions(): Promise<ServiceRegion[]> {
    return await db.select().from(serviceRegions).orderBy(desc(serviceRegions.createdAt));
  }

  async getActiveServiceRegions(): Promise<ServiceRegion[]> {
    return await db.select().from(serviceRegions).where(eq(serviceRegions.isActive, true)).orderBy(desc(serviceRegions.createdAt));
  }

  async createServiceRegion(insertRegion: InsertServiceRegion): Promise<ServiceRegion> {
    const [region] = await db.insert(serviceRegions).values({
      name: insertRegion.name,
      isActive: insertRegion.isActive !== undefined ? insertRegion.isActive : true,
    }).$returningId();

    const [created] = await db.select().from(serviceRegions).where(eq(serviceRegions.id, region.id)).limit(1);
    return created;
  }

  async deleteServiceRegion(id: number): Promise<boolean> {
    await db.delete(serviceRegions).where(eq(serviceRegions.id, id));
    return true;
  }

  async getAllFaqs(): Promise<Faq[]> {
    return await db.select().from(faqs).orderBy(desc(faqs.createdAt));
  }

  async getActiveFaqs(): Promise<Faq[]> {
    return await db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(desc(faqs.createdAt));
  }

  async createFaq(insertFaq: InsertFaq): Promise<Faq> {
    const [faq] = await db.insert(faqs).values({
      question: insertFaq.question,
      answer: insertFaq.answer,
      category: insertFaq.category || "GERAL",
      isActive: insertFaq.isActive !== undefined ? insertFaq.isActive : true,
    }).$returningId();

    const [created] = await db.select().from(faqs).where(eq(faqs.id, faq.id)).limit(1);
    return created;
  }

  async updateFaq(id: number, updateFaq: Partial<InsertFaq>): Promise<Faq | undefined> {
    await db.update(faqs).set(updateFaq).where(eq(faqs.id, id));
    const [updated] = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
    return updated;
  }

  async deleteFaq(id: number): Promise<boolean> {
    await db.delete(faqs).where(eq(faqs.id, id));
    return true;
  }

  async getAllSeasonalCalendarItems(): Promise<SeasonalCalendar[]> {
    return await db.select().from(seasonalCalendar).orderBy(desc(seasonalCalendar.createdAt));
  }

  async getActiveSeasonalCalendarItems(): Promise<SeasonalCalendar[]> {
    return await db.select().from(seasonalCalendar).where(eq(seasonalCalendar.isActive, true)).orderBy(desc(seasonalCalendar.createdAt));
  }

  async createSeasonalCalendarItem(insertItem: InsertSeasonalCalendar): Promise<SeasonalCalendar> {
    const [item] = await db.insert(seasonalCalendar).values({
      imagePath: insertItem.imagePath,
      isActive: insertItem.isActive !== undefined ? insertItem.isActive : true,
    }).$returningId();

    const [created] = await db.select().from(seasonalCalendar).where(eq(seasonalCalendar.id, item.id)).limit(1);
    return created;
  }

  async deleteSeasonalCalendarItem(id: number): Promise<boolean> {
    await db.delete(seasonalCalendar).where(eq(seasonalCalendar.id, id));
    return true;
  }

  async getAllComparativeTables(): Promise<ComparativeTable[]> {
    return await db.select().from(comparativeTables).orderBy(desc(comparativeTables.createdAt));
  }

  async getActiveComparativeTables(): Promise<ComparativeTable[]> {
    return await db.select().from(comparativeTables)
      .where(eq(comparativeTables.isActive, true))
      .orderBy(desc(comparativeTables.createdAt));
  }

  async createComparativeTable(insertItem: InsertComparativeTable): Promise<ComparativeTable> {
    const [item] = await db.insert(comparativeTables).values({
      imagePath: insertItem.imagePath,
      isActive: insertItem.isActive !== undefined ? insertItem.isActive : true,
    }).$returningId();

    const [created] = await db.select().from(comparativeTables).where(eq(comparativeTables.id, item.id)).limit(1);
    return created;
  }

  async deleteComparativeTable(id: number): Promise<boolean> {
    await db.delete(comparativeTables).where(eq(comparativeTables.id, id));
    return true;
  }

  async getAllProductPortfolio(): Promise<ProductPortfolio[]> {
    return await db.select().from(productPortfolio).orderBy(desc(productPortfolio.createdAt));
  }

  async getActiveProductPortfolio(): Promise<ProductPortfolio[]> {
    return await db.select().from(productPortfolio)
      .where(eq(productPortfolio.isActive, true))
      .orderBy(desc(productPortfolio.createdAt));
  }

  async createProductPortfolio(insertItem: InsertProductPortfolio): Promise<ProductPortfolio> {
    const [item] = await db.insert(productPortfolio).values({
      imagePath: insertItem.imagePath,
      isActive: insertItem.isActive !== undefined ? insertItem.isActive : true,
    }).$returningId();

    const [created] = await db.select().from(productPortfolio).where(eq(productPortfolio.id, item.id)).limit(1);
    return created;
  }

  async deleteProductPortfolio(id: number): Promise<boolean> {
    await db.delete(productPortfolio).where(eq(productPortfolio.id, id));
    return true;
  }

  async getAllLooseItems(): Promise<LooseItem[]> {
    return await db.select().from(looseItems).orderBy(desc(looseItems.createdAt));
  }

  async getActiveLooseItems(): Promise<LooseItem[]> {
    return await db.select().from(looseItems)
      .where(eq(looseItems.isActive, true))
      .orderBy(desc(looseItems.createdAt));
  }

  async createLooseItem(insertItem: InsertLooseItem): Promise<LooseItem> {
    const [item] = await db.insert(looseItems).values({
      name: insertItem.name,
      category: insertItem.category,
      isActive: insertItem.isActive !== undefined ? insertItem.isActive : true,
    }).$returningId();

    const [created] = await db.select().from(looseItems).where(eq(looseItems.id, item.id)).limit(1);
    return created;
  }

  async deleteLooseItem(id: number): Promise<boolean> {
    await db.delete(looseItems).where(eq(looseItems.id, id));
    return true;
  }

  async getAllBaskets(): Promise<Basket[]> {
    return await db.select().from(baskets).orderBy(desc(baskets.createdAt));
  }

  async getActiveBaskets(): Promise<Basket[]> {
    return await db.select().from(baskets)
      .where(eq(baskets.isActive, true))
      .orderBy(desc(baskets.createdAt));
  }

  async getBasket(id: number): Promise<Basket | undefined> {
    const [basket] = await db.select().from(baskets).where(eq(baskets.id, id)).limit(1);
    return basket;
  }

  async createBasket(insertBasket: InsertBasket): Promise<Basket> {
    const [basket] = await db.insert(baskets).values({
      name: insertBasket.name,
      description: insertBasket.description,
      priceLoose: insertBasket.priceLoose,
      priceSubscription: insertBasket.priceSubscription,
      imagePath: insertBasket.imagePath,
      isActive: insertBasket.isActive !== undefined ? insertBasket.isActive : true,
    }).$returningId();

    const [created] = await db.select().from(baskets).where(eq(baskets.id, basket.id)).limit(1);
    return created;
  }

  async updateBasket(id: number, updateBasket: Partial<InsertBasket>): Promise<Basket | undefined> {
    await db.update(baskets).set(updateBasket).where(eq(baskets.id, id));
    return this.getBasket(id);
  }

  async deleteBasket(id: number): Promise<boolean> {
    await db.delete(basketItems).where(eq(basketItems.basketId, id));
    await db.delete(baskets).where(eq(baskets.id, id));
    return true;
  }

  async getBasketItems(basketId: number): Promise<BasketItem[]> {
    return await db.select().from(basketItems).where(eq(basketItems.basketId, basketId));
  }

  async addBasketItem(insertItem: InsertBasketItem): Promise<BasketItem> {
    const [item] = await db.insert(basketItems).values({
      basketId: insertItem.basketId,
      looseItemId: insertItem.looseItemId,
      quantity: insertItem.quantity || 1,
    }).$returningId();

    const [created] = await db.select().from(basketItems).where(eq(basketItems.id, item.id)).limit(1);
    return created;
  }

  async removeBasketItem(id: number): Promise<boolean> {
    await db.delete(basketItems).where(eq(basketItems.id, id));
    return true;
  }

  async getTrackingScripts(): Promise<TrackingScripts | undefined> {
    const [scripts] = await db.select().from(trackingScripts).limit(1);
    return scripts;
  }

  async updateTrackingScripts(scriptsData: UpdateTrackingScripts): Promise<TrackingScripts | undefined> {
    const existing = await this.getTrackingScripts();

    if (existing) {
      await db.update(trackingScripts)
        .set({
          facebookPixel: scriptsData.facebookPixel,
          googleAnalytics: scriptsData.googleAnalytics,
          googleTagManager: scriptsData.googleTagManager,
        })
        .where(eq(trackingScripts.id, existing.id));

      const [updated] = await db.select().from(trackingScripts).where(eq(trackingScripts.id, existing.id)).limit(1);
      return updated;
    } else {
      const [inserted] = await db.insert(trackingScripts).values({
        facebookPixel: scriptsData.facebookPixel,
        googleAnalytics: scriptsData.googleAnalytics,
        googleTagManager: scriptsData.googleTagManager,
      }).$returningId();

      const [created] = await db.select().from(trackingScripts).where(eq(trackingScripts.id, inserted.id)).limit(1);
      return created;
    }
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values({
      ...insertOrder,
      status: insertOrder.status || "pending",
    }).$returningId();

    const createdOrder = await this.getOrder(order.id);
    if (!createdOrder) throw new Error("Order creation failed");
    return createdOrder;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
    return await this.getOrder(id);
  }

  async createOneTimePurchase(insertPurchase: InsertOneTimePurchase): Promise<OneTimePurchase> {
    const [purchase] = await db.insert(oneTimePurchases).values({
      ...insertPurchase,
      status: insertPurchase.status || "pending",
    }).$returningId();

    const createdPurchase = await this.getOneTimePurchase(purchase.id);
    if (!createdPurchase) throw new Error("Purchase creation failed");
    return createdPurchase;
  }

  async getAllOneTimePurchases(): Promise<OneTimePurchase[]> {
    return await db.select().from(oneTimePurchases).orderBy(desc(oneTimePurchases.createdAt));
  }

  async getOneTimePurchase(id: number): Promise<OneTimePurchase | undefined> {
    const [purchase] = await db.select().from(oneTimePurchases).where(eq(oneTimePurchases.id, id)).limit(1);
    return purchase;
  }

  async updateOneTimePurchaseStatus(id: number, status: string): Promise<OneTimePurchase | undefined> {
    await db.update(oneTimePurchases).set({ status }).where(eq(oneTimePurchases.id, id));
    return await this.getOneTimePurchase(id);
  }

  async getAllWhatsappConnections(): Promise<WhatsappConnection[]> {
    return await db.select().from(whatsappConnections).orderBy(desc(whatsappConnections.createdAt));
  }

  async createWhatsappConnection(connection: InsertWhatsappConnection & { instanceName?: string; status?: string }): Promise<WhatsappConnection> {
    const [newConnection] = await db.insert(whatsappConnections).values(connection).$returningId();
    const [created] = await db.select().from(whatsappConnections).where(eq(whatsappConnections.id, newConnection.id)).limit(1);
    return created;
  }

  async updateWhatsappConnectionQrCode(id: number, qrCode: string): Promise<WhatsappConnection | undefined> {
    await db.update(whatsappConnections).set({ qrCode }).where(eq(whatsappConnections.id, id));
    const [updated] = await db.select().from(whatsappConnections).where(eq(whatsappConnections.id, id)).limit(1);
    return updated;
  }

  async updateWhatsappConnectionStatus(id: number, status: string): Promise<WhatsappConnection | undefined> {
    await db.update(whatsappConnections).set({ status }).where(eq(whatsappConnections.id, id));
    const [updated] = await db.select().from(whatsappConnections).where(eq(whatsappConnections.id, id)).limit(1);
    return updated;
  }

  async updateWhatsappAiConfig(id: number, config: UpdateWhatsappAiConfig): Promise<WhatsappConnection | undefined> {
    await db.update(whatsappConnections).set(config).where(eq(whatsappConnections.id, id));
    const [updated] = await db.select().from(whatsappConnections).where(eq(whatsappConnections.id, id)).limit(1);
    return updated;
  }

  async deleteWhatsappConnection(id: number): Promise<boolean> {
    await db.delete(whatsappConnections).where(eq(whatsappConnections.id, id));
    return true;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getActiveBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts)
      .where(eq(blogPosts.isActive, true))
      .orderBy(desc(blogPosts.createdAt));
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values({
      title: insertPost.title,
      content: insertPost.content,
      imagePath: insertPost.imagePath,
      isActive: insertPost.isActive !== undefined ? insertPost.isActive : true,
    }).$returningId();

    const [created] = await db.select().from(blogPosts).where(eq(blogPosts.id, post.id)).limit(1);
    return created;
  }

  async updateBlogPost(id: number, updatePost: InsertBlogPost): Promise<BlogPost | undefined> {
    await db.update(blogPosts).set({
      title: updatePost.title,
      content: updatePost.content,
      imagePath: updatePost.imagePath,
      isActive: updatePost.isActive !== undefined ? updatePost.isActive : true,
    }).where(eq(blogPosts.id, id));

    const [updated] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return updated;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return true;
  }

  // Conversations implementation
  async createOrGetConversation(whatsapp: string, customerName?: string): Promise<Conversation> {
    // Check if conversation already exists
    const existing = await this.getConversationByWhatsapp(whatsapp);
    if (existing) {
      // Update last message time
      await db.update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, existing.id));
      return existing;
    }

    // Create new conversation
    const [newConversation] = await db.insert(conversations).values({
      customerWhatsapp: whatsapp,
      customerName: customerName || whatsapp,
      status: 'active',
      channel: 'whatsapp',
      lastMessageAt: new Date()
    }).$returningId();

    const created = await this.getConversation(newConversation.id);
    if (!created) throw new Error("Failed to create conversation");
    return created;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);
    return conversation;
  }

  async getConversationByWhatsapp(whatsapp: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select()
      .from(conversations)
      .where(eq(conversations.customerWhatsapp, whatsapp))
      .orderBy(desc(conversations.createdAt))
      .limit(1);
    return conversation;
  }

  async updateConversationStatus(id: number, status: string): Promise<Conversation | undefined> {
    await db.update(conversations)
      .set({ status })
      .where(eq(conversations.id, id));
    return await this.getConversation(id);
  }

  async createConversationMessage(message: InsertConversationMessage): Promise<ConversationMessage> {
    const [newMessage] = await db.insert(conversationMessages).values(message).$returningId();

    // Update conversation's last message time
    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    const [created] = await db.select()
      .from(conversationMessages)
      .where(eq(conversationMessages.id, newMessage.id))
      .limit(1);
    return created;
  }

  async getConversationMessages(conversationId: number): Promise<ConversationMessage[]> {
    return await db.select()
      .from(conversationMessages)
      .where(eq(conversationMessages.conversationId, conversationId))
      .orderBy(conversationMessages.createdAt);
  }

  async markMessagesAsRead(conversationId: number): Promise<void> {
    await db.update(conversationMessages)
      .set({ isRead: true })
      .where(eq(conversationMessages.conversationId, conversationId));
  }
}

export const storage = new MySQLStorage();
