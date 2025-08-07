import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertRoomSchema, insertParticipantSchema } from "@shared/schema";
import { randomBytes } from "crypto";

interface ExtendedWebSocket extends WebSocket {
  deviceId?: string;
  roomCode?: string;
  participantId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for signaling
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Generate room code
  function generateRoomCode(): string {
    return randomBytes(3).toString('hex').toUpperCase();
  }

  // Room management endpoints
  app.post("/api/rooms", async (req, res) => {
    try {
      const deviceId = req.body.deviceId || `device_${Date.now()}`;
      const code = generateRoomCode();
      
      const roomData = insertRoomSchema.parse({
        code,
        hostId: deviceId
      });

      const room = await storage.createRoom(roomData);
      
      // Add host as participant
      await storage.addParticipant({
        roomId: room.id,
        deviceId,
        role: "host"
      });

      res.json({ room, code });
    } catch (error) {
      res.status(400).json({ message: "Failed to create room" });
    }
  });

  app.post("/api/rooms/join", async (req, res) => {
    try {
      const { code, deviceId } = req.body;
      
      if (!code || !deviceId) {
        return res.status(400).json({ message: "Room code and device ID required" });
      }

      const room = await storage.getRoomByCode(code);
      if (!room || room.isActive === "false") {
        return res.status(404).json({ message: "Room not found or inactive" });
      }

      // Check if participant already exists
      const existingParticipant = await storage.getParticipantByDeviceAndRoom(deviceId, room.id);
      if (existingParticipant) {
        return res.json({ room, participant: existingParticipant });
      }

      // Add as viewer
      const participant = await storage.addParticipant({
        roomId: room.id,
        deviceId,
        role: "viewer"
      });

      res.json({ room, participant });
    } catch (error) {
      res.status(400).json({ message: "Failed to join room" });
    }
  });

  app.get("/api/rooms/:code/participants", async (req, res) => {
    try {
      const { code } = req.params;
      const room = await storage.getRoomByCode(code);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const participants = await storage.getParticipantsByRoom(room.id);
      res.json({ participants });
    } catch (error) {
      res.status(500).json({ message: "Failed to get participants" });
    }
  });

  app.post("/api/rooms/:code/leave", async (req, res) => {
    try {
      const { code } = req.params;
      const { deviceId } = req.body;

      const room = await storage.getRoomByCode(code);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const participant = await storage.getParticipantByDeviceAndRoom(deviceId, room.id);
      if (participant) {
        await storage.removeParticipant(participant.id);
        
        // If host leaves, end the session
        if (participant.role === "host") {
          await storage.updateRoomStatus(code, false);
          // Notify all participants that room is closed
          broadcastToRoom(code, {
            type: "room_closed",
            message: "Host has ended the session"
          });
        } else {
          // Notify room about participant leaving
          broadcastToRoom(code, {
            type: "participant_left",
            deviceId,
            participantId: participant.id
          });
        }
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to leave room" });
    }
  });

  // WebSocket connection handling
  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'join_room':
            ws.deviceId = data.deviceId;
            ws.roomCode = data.roomCode;
            ws.participantId = data.participantId;
            
            // Notify others in room about new participant
            if (data.role === 'viewer') {
              broadcastToRoom(data.roomCode, {
                type: 'participant_joined',
                deviceId: data.deviceId,
                participantId: data.participantId
              }, ws);
            }
            break;

          case 'webrtc_offer':
          case 'webrtc_answer':
          case 'webrtc_ice_candidate':
            // Forward WebRTC signaling messages
            broadcastToRoom(ws.roomCode!, data, ws);
            break;

          case 'screen_share_started':
            broadcastToRoom(ws.roomCode!, {
              type: 'host_started_sharing',
              deviceId: ws.deviceId
            }, ws);
            break;

          case 'screen_share_stopped':
            broadcastToRoom(ws.roomCode!, {
              type: 'host_stopped_sharing',
              deviceId: ws.deviceId
            }, ws);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      if (ws.participantId) {
        await storage.updateParticipantConnection(ws.participantId, false);
        
        // Notify room about disconnection
        if (ws.roomCode) {
          broadcastToRoom(ws.roomCode, {
            type: 'participant_disconnected',
            deviceId: ws.deviceId,
            participantId: ws.participantId
          }, ws);
        }
      }
    });
  });

  function broadcastToRoom(roomCode: string, message: any, sender?: ExtendedWebSocket) {
    wss.clients.forEach((client: ExtendedWebSocket) => {
      if (client !== sender && 
          client.roomCode === roomCode && 
          client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  return httpServer;
}
