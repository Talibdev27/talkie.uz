import { 
  users, weddings, guests, photos, guestBookEntries, invitations, guestCollaborators, weddingAccess,
  type User, type InsertUser,
  type Wedding, type InsertWedding,
  type Guest, type InsertGuest,
  type Photo, type InsertPhoto,
  type GuestBookEntry, type InsertGuestBookEntry,
  type Invitation, type InsertInvitation,
  type GuestCollaborator, type InsertGuestCollaborator,
  type WeddingAccess, type InsertWeddingAccess,
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
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Weddings
  createWedding(userId: number, wedding: InsertWedding): Promise<Wedding>;
  getWeddingByUrl(uniqueUrl: string): Promise<Wedding | undefined>;
  getWeddingsByUserId(userId: number): Promise<Wedding[]>;
  updateWedding(id: number, updates: Partial<InsertWedding>): Promise<Wedding | undefined>;
  deleteWedding(id: number): Promise<boolean>;

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

  // Invitations
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  getInvitationsByWeddingId(weddingId: number): Promise<Invitation[]>;
  getInvitationsByGuestId(guestId: number): Promise<Invitation[]>;
  updateInvitationStatus(id: number, status: string, errorMessage?: string): Promise<Invitation | undefined>;
  sendInvitationReminder(id: number): Promise<boolean>;

  // Guest Collaborators
  createGuestCollaborator(collaborator: InsertGuestCollaborator): Promise<GuestCollaborator>;
  getCollaboratorsByWeddingId(weddingId: number): Promise<GuestCollaborator[]>;
  updateCollaboratorStatus(id: number, status: string): Promise<GuestCollaborator | undefined>;
  acceptCollaboratorInvite(email: string, weddingId: number): Promise<GuestCollaborator | undefined>;

  // Wedding Access Management
  grantWeddingAccess(access: InsertWeddingAccess): Promise<WeddingAccess>;
  getWeddingAccess(userId: number, weddingId: number): Promise<WeddingAccess | undefined>;
  getUserWeddingAccess(userId: number): Promise<WeddingAccess[]>;
  updateWeddingAccess(id: number, updates: Partial<InsertWeddingAccess>): Promise<WeddingAccess | undefined>;
  revokeWeddingAccess(id: number): Promise<boolean>;
  checkUserPermission(userId: number, weddingId: number, permission: keyof WeddingAccess['permissions']): Promise<boolean>;

  // Stats
  getWeddingStats(weddingId: number): Promise<{
    totalGuests: number;
    confirmedGuests: number;
    pendingGuests: number;
    declinedGuests: number;
    totalPhotos: number;
    guestBookEntries: number;
    pendingInvitations: number;
    sentInvitations: number;
    activeCollaborators: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private weddings: Map<number, Wedding>;
  private guests: Map<number, Guest>;
  private photos: Map<number, Photo>;
  private guestBookEntries: Map<number, GuestBookEntry>;
  private invitations: Map<number, Invitation>;
  private guestCollaborators: Map<number, GuestCollaborator>;
  private currentUserId: number;
  private currentWeddingId: number;
  private currentGuestId: number;
  private currentPhotoId: number;
  private currentGuestBookId: number;
  private currentInvitationId: number;
  private currentCollaboratorId: number;

  constructor() {
    this.users = new Map();
    this.weddings = new Map();
    this.guests = new Map();
    this.photos = new Map();
    this.guestBookEntries = new Map();
    this.invitations = new Map();
    this.guestCollaborators = new Map();
    this.currentUserId = 1;
    this.currentWeddingId = 1;
    this.currentGuestId = 1;
    this.currentPhotoId = 1;
    this.currentGuestBookId = 1;
    this.currentInvitationId = 1;
    this.currentCollaboratorId = 1;
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

  // Invitations
  async createInvitation(insertInvitation: InsertInvitation): Promise<Invitation> {
    const id = this.currentInvitationId++;
    const invitation: Invitation = {
      ...insertInvitation,
      id,
      createdAt: new Date(),
    };
    this.invitations.set(id, invitation);
    return invitation;
  }

  async getInvitationsByWeddingId(weddingId: number): Promise<Invitation[]> {
    return Array.from(this.invitations.values())
      .filter(invitation => invitation.weddingId === weddingId);
  }

  async getInvitationsByGuestId(guestId: number): Promise<Invitation[]> {
    return Array.from(this.invitations.values())
      .filter(invitation => invitation.guestId === guestId);
  }

  async updateInvitationStatus(id: number, status: string, errorMessage?: string): Promise<Invitation | undefined> {
    const invitation = this.invitations.get(id);
    if (!invitation) return undefined;

    const updatedInvitation: Invitation = {
      ...invitation,
      status,
      errorMessage: errorMessage || invitation.errorMessage,
      sentAt: status === 'sent' ? new Date() : invitation.sentAt,
      deliveredAt: status === 'delivered' ? new Date() : invitation.deliveredAt,
      openedAt: status === 'opened' ? new Date() : invitation.openedAt,
    };

    this.invitations.set(id, updatedInvitation);
    return updatedInvitation;
  }

  async sendInvitationReminder(id: number): Promise<boolean> {
    const invitation = this.invitations.get(id);
    if (!invitation) return false;

    const updatedInvitation: Invitation = {
      ...invitation,
      reminderSentAt: new Date(),
    };

    this.invitations.set(id, updatedInvitation);
    return true;
  }

  // Guest Collaborators
  async createGuestCollaborator(insertCollaborator: InsertGuestCollaborator): Promise<GuestCollaborator> {
    const id = this.currentCollaboratorId++;
    const collaborator: GuestCollaborator = {
      ...insertCollaborator,
      id,
      invitedAt: new Date(),
    };
    this.guestCollaborators.set(id, collaborator);
    return collaborator;
  }

  async getCollaboratorsByWeddingId(weddingId: number): Promise<GuestCollaborator[]> {
    return Array.from(this.guestCollaborators.values())
      .filter(collaborator => collaborator.weddingId === weddingId);
  }

  async updateCollaboratorStatus(id: number, status: string): Promise<GuestCollaborator | undefined> {
    const collaborator = this.guestCollaborators.get(id);
    if (!collaborator) return undefined;

    const updatedCollaborator: GuestCollaborator = {
      ...collaborator,
      status,
      acceptedAt: status === 'active' ? new Date() : collaborator.acceptedAt,
      lastActiveAt: status === 'active' ? new Date() : collaborator.lastActiveAt,
    };

    this.guestCollaborators.set(id, updatedCollaborator);
    return updatedCollaborator;
  }

  async acceptCollaboratorInvite(email: string, weddingId: number): Promise<GuestCollaborator | undefined> {
    const collaborator = Array.from(this.guestCollaborators.values())
      .find(c => c.email === email && c.weddingId === weddingId);
    
    if (!collaborator) return undefined;

    const updatedCollaborator: GuestCollaborator = {
      ...collaborator,
      status: 'active',
      acceptedAt: new Date(),
      lastActiveAt: new Date(),
    };

    this.guestCollaborators.set(collaborator.id, updatedCollaborator);
    return updatedCollaborator;
  }

  async getWeddingStats(weddingId: number): Promise<{
    totalGuests: number;
    confirmedGuests: number;
    pendingGuests: number;
    declinedGuests: number;
    totalPhotos: number;
    guestBookEntries: number;
    pendingInvitations: number;
    sentInvitations: number;
    activeCollaborators: number;
  }> {
    const guests = await this.getGuestsByWeddingId(weddingId);
    const photos = await this.getPhotosByWeddingId(weddingId);
    const guestBookEntries = await this.getGuestBookEntriesByWeddingId(weddingId);
    const invitations = await this.getInvitationsByWeddingId(weddingId);
    const collaborators = await this.getCollaboratorsByWeddingId(weddingId);

    return {
      totalGuests: guests.length,
      confirmedGuests: guests.filter(g => g.rsvpStatus === "confirmed").length,
      pendingGuests: guests.filter(g => g.rsvpStatus === "pending").length,
      declinedGuests: guests.filter(g => g.rsvpStatus === "declined").length,
      totalPhotos: photos.length,
      guestBookEntries: guestBookEntries.length,
      pendingInvitations: invitations.filter(i => i.status === "pending").length,
      sentInvitations: invitations.filter(i => i.status === "sent" || i.status === "delivered").length,
      activeCollaborators: collaborators.filter(c => c.status === "active").length,
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // First, delete all weddings and related data for this user
      const userWeddings = await db.select().from(weddings).where(eq(weddings.userId, id));
      
      for (const wedding of userWeddings) {
        await this.deleteWedding(wedding.id);
      }
      
      // Then delete the user
      const result = await db.delete(users).where(eq(users.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
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

  async deleteWedding(id: number): Promise<boolean> {
    try {
      // Delete related data first to avoid foreign key constraints
      await db.delete(guestBookEntries).where(eq(guestBookEntries.weddingId, id));
      await db.delete(photos).where(eq(photos.weddingId, id));
      await db.delete(guests).where(eq(guests.weddingId, id));
      await db.delete(invitations).where(eq(invitations.weddingId, id));
      await db.delete(guestCollaborators).where(eq(guestCollaborators.weddingId, id));
      
      // Now delete the wedding itself
      const result = await db.delete(weddings).where(eq(weddings.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Delete wedding error:', error);
      return false;
    }
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

  // Invitations
  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const [newInvitation] = await db
      .insert(invitations)
      .values(invitation)
      .returning();
    return newInvitation;
  }

  async getInvitationsByWeddingId(weddingId: number): Promise<Invitation[]> {
    return await db.select().from(invitations).where(eq(invitations.weddingId, weddingId));
  }

  async getInvitationsByGuestId(guestId: number): Promise<Invitation[]> {
    return await db.select().from(invitations).where(eq(invitations.guestId, guestId));
  }

  async updateInvitationStatus(id: number, status: string, errorMessage?: string): Promise<Invitation | undefined> {
    const updateData: any = { status };
    if (status === 'sent') updateData.sentAt = new Date();
    if (status === 'delivered') updateData.deliveredAt = new Date();
    if (status === 'opened') updateData.openedAt = new Date();
    if (errorMessage) updateData.errorMessage = errorMessage;

    const [invitation] = await db
      .update(invitations)
      .set(updateData)
      .where(eq(invitations.id, id))
      .returning();
    return invitation || undefined;
  }

  async sendInvitationReminder(id: number): Promise<boolean> {
    const [invitation] = await db
      .update(invitations)
      .set({ reminderSentAt: new Date() })
      .where(eq(invitations.id, id))
      .returning();
    return !!invitation;
  }

  // Guest Collaborators
  async createGuestCollaborator(collaborator: InsertGuestCollaborator): Promise<GuestCollaborator> {
    const [newCollaborator] = await db
      .insert(guestCollaborators)
      .values(collaborator)
      .returning();
    return newCollaborator;
  }

  async getCollaboratorsByWeddingId(weddingId: number): Promise<GuestCollaborator[]> {
    return await db.select().from(guestCollaborators).where(eq(guestCollaborators.weddingId, weddingId));
  }

  async updateCollaboratorStatus(id: number, status: string): Promise<GuestCollaborator | undefined> {
    const updateData: any = { status };
    if (status === 'active') {
      updateData.acceptedAt = new Date();
      updateData.lastActiveAt = new Date();
    }

    const [collaborator] = await db
      .update(guestCollaborators)
      .set(updateData)
      .where(eq(guestCollaborators.id, id))
      .returning();
    return collaborator || undefined;
  }

  async acceptCollaboratorInvite(email: string, weddingId: number): Promise<GuestCollaborator | undefined> {
    const [collaborator] = await db
      .update(guestCollaborators)
      .set({ 
        status: 'active',
        acceptedAt: new Date(),
        lastActiveAt: new Date()
      })
      .where(and(eq(guestCollaborators.email, email), eq(guestCollaborators.weddingId, weddingId)))
      .returning();
    return collaborator || undefined;
  }

  async getWeddingStats(weddingId: number): Promise<{
    totalGuests: number;
    confirmedGuests: number;
    pendingGuests: number;
    declinedGuests: number;
    totalPhotos: number;
    guestBookEntries: number;
    pendingInvitations: number;
    sentInvitations: number;
    activeCollaborators: number;
  }> {
    const guestsList = await db.select().from(guests).where(eq(guests.weddingId, weddingId));
    const photoCount = await db.select().from(photos).where(eq(photos.weddingId, weddingId));
    const guestBookCount = await db.select().from(guestBookEntries).where(eq(guestBookEntries.weddingId, weddingId));
    const invitationsList = await db.select().from(invitations).where(eq(invitations.weddingId, weddingId));
    const collaboratorsList = await db.select().from(guestCollaborators).where(eq(guestCollaborators.weddingId, weddingId));

    const totalGuests = guestsList.length;
    const confirmedGuests = guestsList.filter(g => g.rsvpStatus === 'confirmed').length;
    const pendingGuests = guestsList.filter(g => g.rsvpStatus === 'pending').length;
    const declinedGuests = guestsList.filter(g => g.rsvpStatus === 'declined').length;
    const pendingInvitations = invitationsList.filter(i => i.status === 'pending').length;
    const sentInvitations = invitationsList.filter(i => i.status === 'sent' || i.status === 'delivered').length;
    const activeCollaborators = collaboratorsList.filter(c => c.status === 'active').length;

    return {
      totalGuests,
      confirmedGuests,
      pendingGuests,
      declinedGuests,
      totalPhotos: photoCount.length,
      guestBookEntries: guestBookCount.length,
      pendingInvitations,
      sentInvitations,
      activeCollaborators,
    };
  }
}

export const storage = new DatabaseStorage();
