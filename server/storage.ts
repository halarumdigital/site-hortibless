import { type User, type InsertUser, type UpdateUser, type ContactMessage } from "@shared/schema";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
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
    if (updateUser.password) {
      updateUser.password = await bcrypt.hash(updateUser.password, 10);
    }
    
    await db.update(users).set(updateUser).where(eq(users.id, id));
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
}

export const storage = new MySQLStorage();
