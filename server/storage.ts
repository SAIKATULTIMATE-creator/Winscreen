import { type Room, type InsertRoom, type Participant, type InsertParticipant } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Room management
  createRoom(room: InsertRoom): Promise<Room>;
  getRoomByCode(code: string): Promise<Room | undefined>;
  updateRoomStatus(code: string, isActive: boolean): Promise<void>;
  deleteRoom(code: string): Promise<void>;
  
  // Participant management
  addParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipantsByRoom(roomId: string): Promise<Participant[]>;
  updateParticipantConnection(participantId: string, isConnected: boolean): Promise<void>;
  removeParticipant(participantId: string): Promise<void>;
  getParticipantByDeviceAndRoom(deviceId: string, roomId: string): Promise<Participant | undefined>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;
  private participants: Map<string, Participant>;

  constructor() {
    this.rooms = new Map();
    this.participants = new Map();
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const room: Room = { 
      ...insertRoom, 
      id, 
      createdAt: new Date(),
      isActive: "true"
    };
    this.rooms.set(id, room);
    return room;
  }

  async getRoomByCode(code: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(room => room.code === code);
  }

  async updateRoomStatus(code: string, isActive: boolean): Promise<void> {
    const room = await this.getRoomByCode(code);
    if (room) {
      room.isActive = isActive ? "true" : "false";
      this.rooms.set(room.id, room);
    }
  }

  async deleteRoom(code: string): Promise<void> {
    const room = await this.getRoomByCode(code);
    if (room) {
      // Remove all participants first
      const participants = await this.getParticipantsByRoom(room.id);
      for (const participant of participants) {
        this.participants.delete(participant.id);
      }
      this.rooms.delete(room.id);
    }
  }

  async addParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = randomUUID();
    const participant: Participant = {
      ...insertParticipant,
      id,
      joinedAt: new Date(),
      isConnected: "true"
    };
    this.participants.set(id, participant);
    return participant;
  }

  async getParticipantsByRoom(roomId: string): Promise<Participant[]> {
    return Array.from(this.participants.values()).filter(p => p.roomId === roomId);
  }

  async updateParticipantConnection(participantId: string, isConnected: boolean): Promise<void> {
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.isConnected = isConnected ? "true" : "false";
      this.participants.set(participantId, participant);
    }
  }

  async removeParticipant(participantId: string): Promise<void> {
    this.participants.delete(participantId);
  }

  async getParticipantByDeviceAndRoom(deviceId: string, roomId: string): Promise<Participant | undefined> {
    return Array.from(this.participants.values()).find(p => p.deviceId === deviceId && p.roomId === roomId);
  }
}

export const storage = new MemStorage();
