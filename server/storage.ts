import { type User, type InsertUser, type ContactMessage } from "@shared/schema";
import { randomUUID } from "crypto";

interface StoredContactMessage extends ContactMessage {
  id: string;
  timestamp: Date;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveContactMessage(message: ContactMessage): Promise<string>;
  getContactMessages(): Promise<StoredContactMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contactMessages: Map<string, StoredContactMessage>;

  constructor() {
    this.users = new Map();
    this.contactMessages = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveContactMessage(message: ContactMessage): Promise<string> {
    const id = randomUUID();
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

export const storage = new MemStorage();
