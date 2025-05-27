import { 
  users, weddings, guests, photos, guestBookEntries, invitations, guestCollaborators,
  type User, type InsertUser,
  type Wedding, type InsertWedding,
  type Guest, type InsertGuest,
  type Photo, type InsertPhoto,
  type GuestBookEntry, type InsertGuestBookEntry,
  type Invitation, type InsertInvitation,
  type GuestCollaborator, type InsertGuestCollaborator,
  type RSVPUpdate
} from "@shared/schema";
import { nanoid } from "nanoid";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Weddings
  createWedding(userId: number, wedding: InsertWedding): Promise<Wedding>;
  getWeddingByUrl(uniqueUrl: string): Promise<Wedding | undefined>;
  getWeddingsByUserId(userId: number): Promise<Wedding[]>;
  updateWedding(id: number, updates: Partial<InsertWedding>): Promise<Wedding | undefined>;

  // Guests
  createGuest(guest: InsertGuest): Promise<Guest>;
  getGuestsByWeddingId(weddingId: number): Promise<Guest[]>;
  updateGuestRSVP(guestId: number, update: RSVPUpdate): Promise<Guest | undefined>;

  // Photos
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  getPhotosByWeddingId(weddingId: number): Promise<Photo[]>;
  deletePhoto(id: number): Promise<boolean>;

  // Guest Book
  createGuestBookEntry(entry: InsertGuestBookEntry): Promise<GuestBookEntry>;
  getGuestBookEntriesByWeddingId(weddingId: number): Promise<GuestBookEntry[]>;

  // Stats
  getWeddingStats(weddingId: number): Promise<{
    totalGuests: number;
    confirmedGuests: number;
    pendingGuests: number;
    declinedGuests: number;
    totalPhotos: number;
    guestBookEntries: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private weddings: Map<number, Wedding>;
  private guests: Map<number, Guest>;
  private photos: Map<number, Photo>;
  private guestBookEntries: Map<number, GuestBookEntry>;
  private currentUserId: number;
  private currentWeddingId: number;
  private currentGuestId: number;
  private currentPhotoId: number;
  private currentGuestBookId: number;

  constructor() {
    this.users = new Map();
    this.weddings = new Map();
    this.guests = new Map();
    this.photos = new Map();
    this.guestBookEntries = new Map();
    this.currentUserId = 1;
    this.currentWeddingId = 1;
    this.currentGuestId = 1;
    this.currentPhotoId = 1;
    this.currentGuestBookId = 1;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createWedding(userId: number, insertWedding: InsertWedding): Promise<Wedding> {
    const id = this.currentWeddingId++;
    const uniqueUrl = nanoid(10);
    const wedding: Wedding = {
      ...insertWedding,
      id,
      userId,
      uniqueUrl,
      createdAt: new Date(),
    };
    this.weddings.set(id, wedding);
    return wedding;
  }

  async getWeddingByUrl(uniqueUrl: string): Promise<Wedding | undefined> {
    return Array.from(this.weddings.values()).find(wedding => wedding.uniqueUrl === uniqueUrl);
  }

  async getWeddingsByUserId(userId: number): Promise<Wedding[]> {
    return Array.from(this.weddings.values()).filter(wedding => wedding.userId === userId);
  }

  async updateWedding(id: number, updates: Partial<InsertWedding>): Promise<Wedding | undefined> {
    const wedding = this.weddings.get(id);
    if (!wedding) return undefined;

    const updatedWedding: Wedding = { ...wedding, ...updates };
    this.weddings.set(id, updatedWedding);
    return updatedWedding;
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const id = this.currentGuestId++;
    const guest: Guest = {
      ...insertGuest,
      id,
      createdAt: new Date(),
      respondedAt: null,
    };
    this.guests.set(id, guest);
    return guest;
  }

  async getGuestsByWeddingId(weddingId: number): Promise<Guest[]> {
    return Array.from(this.guests.values()).filter(guest => guest.weddingId === weddingId);
  }

  async updateGuestRSVP(guestId: number, update: RSVPUpdate): Promise<Guest | undefined> {
    const guest = this.guests.get(guestId);
    if (!guest) return undefined;

    const updatedGuest: Guest = {
      ...guest,
      ...update,
      respondedAt: new Date(),
    };
    this.guests.set(guestId, updatedGuest);
    return updatedGuest;
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.currentPhotoId++;
    const photo: Photo = {
      ...insertPhoto,
      id,
      uploadedAt: new Date(),
    };
    this.photos.set(id, photo);
    return photo;
  }

  async getPhotosByWeddingId(weddingId: number): Promise<Photo[]> {
    return Array.from(this.photos.values()).filter(photo => photo.weddingId === weddingId);
  }

  async deletePhoto(id: number): Promise<boolean> {
    return this.photos.delete(id);
  }

  async createGuestBookEntry(insertEntry: InsertGuestBookEntry): Promise<GuestBookEntry> {
    const id = this.currentGuestBookId++;
    const entry: GuestBookEntry = {
      ...insertEntry,
      id,
      createdAt: new Date(),
    };
    this.guestBookEntries.set(id, entry);
    return entry;
  }

  async getGuestBookEntriesByWeddingId(weddingId: number): Promise<GuestBookEntry[]> {
    return Array.from(this.guestBookEntries.values())
      .filter(entry => entry.weddingId === weddingId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getWeddingStats(weddingId: number): Promise<{
    totalGuests: number;
    confirmedGuests: number;
    pendingGuests: number;
    declinedGuests: number;
    totalPhotos: number;
    guestBookEntries: number;
  }> {
    const guests = await this.getGuestsByWeddingId(weddingId);
    const photos = await this.getPhotosByWeddingId(weddingId);
    const guestBookEntries = await this.getGuestBookEntriesByWeddingId(weddingId);

    return {
      totalGuests: guests.length,
      confirmedGuests: guests.filter(g => g.rsvpStatus === "confirmed").length,
      pendingGuests: guests.filter(g => g.rsvpStatus === "pending").length,
      declinedGuests: guests.filter(g => g.rsvpStatus === "declined").length,
      totalPhotos: photos.length,
      guestBookEntries: guestBookEntries.length,
    };
  }
}

export class DatabaseStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createWedding(userId: number, insertWedding: any): Promise<Wedding> {
    try {
      console.log("Creating wedding with data:", { ...insertWedding, userId });
      const [wedding] = await db
        .insert(weddings)
        .values({ ...insertWedding, userId })
        .returning();
      return wedding;
    } catch (error) {
      console.error("Database wedding creation error:", error);
      throw error;
    }
  }

  async getWeddingByUrl(uniqueUrl: string): Promise<Wedding | undefined> {
    const [wedding] = await db.select().from(weddings).where(eq(weddings.uniqueUrl, uniqueUrl));
    return wedding || undefined;
  }

  async getWeddingsByUserId(userId: number): Promise<Wedding[]> {
    return await db.select().from(weddings).where(eq(weddings.userId, userId));
  }

  async updateWedding(id: number, updates: Partial<InsertWedding>): Promise<Wedding | undefined> {
    const [wedding] = await db
      .update(weddings)
      .set(updates)
      .where(eq(weddings.id, id))
      .returning();
    return wedding || undefined;
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const [guest] = await db
      .insert(guests)
      .values(insertGuest)
      .returning();
    return guest;
  }

  async getGuestsByWeddingId(weddingId: number): Promise<Guest[]> {
    return await db.select().from(guests).where(eq(guests.weddingId, weddingId));
  }

  async updateGuestRSVP(guestId: number, update: RSVPUpdate): Promise<Guest | undefined> {
    const [guest] = await db
      .update(guests)
      .set(update)
      .where(eq(guests.id, guestId))
      .returning();
    return guest || undefined;
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const [photo] = await db
      .insert(photos)
      .values(insertPhoto)
      .returning();
    return photo;
  }

  async getPhotosByWeddingId(weddingId: number): Promise<Photo[]> {
    return await db.select().from(photos).where(eq(photos.weddingId, weddingId));
  }

  async deletePhoto(id: number): Promise<boolean> {
    const result = await db.delete(photos).where(eq(photos.id, id));
    return result.rowCount > 0;
  }

  async createGuestBookEntry(insertEntry: InsertGuestBookEntry): Promise<GuestBookEntry> {
    const [entry] = await db
      .insert(guestBookEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async getGuestBookEntriesByWeddingId(weddingId: number): Promise<GuestBookEntry[]> {
    return await db.select().from(guestBookEntries).where(eq(guestBookEntries.weddingId, weddingId));
  }

  async getWeddingStats(weddingId: number): Promise<{
    totalGuests: number;
    confirmedGuests: number;
    pendingGuests: number;
    declinedGuests: number;
    totalPhotos: number;
    guestBookEntries: number;
  }> {
    const guestsList = await db.select().from(guests).where(eq(guests.weddingId, weddingId));
    const photoCount = await db.select().from(photos).where(eq(photos.weddingId, weddingId));
    const guestBookCount = await db.select().from(guestBookEntries).where(eq(guestBookEntries.weddingId, weddingId));

    const totalGuests = guestsList.length;
    const confirmedGuests = guestsList.filter(g => g.rsvpStatus === 'confirmed').length;
    const pendingGuests = guestsList.filter(g => g.rsvpStatus === 'pending').length;
    const declinedGuests = guestsList.filter(g => g.rsvpStatus === 'declined').length;

    return {
      totalGuests,
      confirmedGuests,
      pendingGuests,
      declinedGuests,
      totalPhotos: photoCount.length,
      guestBookEntries: guestBookCount.length,
    };
  }
}

export const storage = new MemStorage();
