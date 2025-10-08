import { type User, type InsertUser, type UpdateUser, type ContactMessage, type SiteSettings, type UpdateSiteSettings, type ContactInfo, type UpdateContactInfo, type Banner, type InsertBanner, type GalleryItem, type InsertGalleryItem, type Testimonial, type InsertTestimonial, type ServiceRegion, type InsertServiceRegion, type Faq, type InsertFaq, type SeasonalCalendar, type InsertSeasonalCalendar, type ComparativeTable, type InsertComparativeTable, type LooseItem, type InsertLooseItem, type Basket, type InsertBasket, type BasketItem, type InsertBasketItem } from "@shared/schema";
import { db } from "./db";
import { users, siteSettings, contactInfo, banners, gallery, testimonials, serviceRegions, faqs, seasonalCalendar, comparativeTables, looseItems, baskets, basketItems } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

interface StoredContactMessage extends ContactMessage {
  id: string;
  timestamp: Date;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: UpdateUser): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  verifyPassword(username: string, password: string): Promise<User | null>;
  saveContactMessage(message: ContactMessage): Promise<string>;
  getContactMessages(): Promise<StoredContactMessage[]>;
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
  deleteFaq(id: number): Promise<boolean>;
  getAllSeasonalCalendarItems(): Promise<SeasonalCalendar[]>;
  getActiveSeasonalCalendarItems(): Promise<SeasonalCalendar[]>;
  createSeasonalCalendarItem(item: InsertSeasonalCalendar): Promise<SeasonalCalendar>;
  deleteSeasonalCalendarItem(id: number): Promise<boolean>;
  getAllComparativeTables(): Promise<ComparativeTable[]>;
  getActiveComparativeTables(): Promise<ComparativeTable[]>;
  createComparativeTable(item: InsertComparativeTable): Promise<ComparativeTable>;
  deleteComparativeTable(id: number): Promise<boolean>;
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
}

export class MySQLStorage implements IStorage {
  private contactMessages: Map<string, StoredContactMessage>;

  constructor() {
    this.contactMessages = new Map();
  }

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
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async saveContactMessage(message: ContactMessage): Promise<string> {
    const id = crypto.randomUUID();
    const storedMessage: StoredContactMessage = {
      ...message,
      id,
      timestamp: new Date(),
    };
    this.contactMessages.set(id, storedMessage);
    return id;
  }

  async getContactMessages(): Promise<StoredContactMessage[]> {
    return Array.from(this.contactMessages.values());
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
      isActive: insertFaq.isActive !== undefined ? insertFaq.isActive : true,
    }).$returningId();

    const [created] = await db.select().from(faqs).where(eq(faqs.id, faq.id)).limit(1);
    return created;
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
}

export const storage = new MySQLStorage();
