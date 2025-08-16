import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import createMemoryStore from "memorystore";
import { z } from "zod";
import * as storage from "./storage";
import {
  hashPassword,
  verifyPassword,
  sendPasswordOtp,
  verifyPasswordOtp,
  resetPasswordWithOtp,
  type AuthenticatedRequest,
} from "./auth";
import { registerAdminRoutes } from "./admin-routes";
import { db } from "./db";
import { ObjectId } from "mongodb";
import mongoose from "mongoose"; // Import mongoose for ObjectId validation

// Extend session with OTP fields (must match auth.ts exactly)
declare module "express-session" {
  interface SessionData {
    userId?: string;
    userType?: string;
    email?: string;
    username?: string;
    otpEmail?: string;
    otp?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const MemoryStore = createMemoryStore(session);
  const store = new MemoryStore({ checkPeriod: 1000 * 60 * 60 * 24 });

  app.use(
    session({
      store,
      secret: process.env.SESSION_SECRET || "fallback-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  // OTP routes
  app.post("/api/auth/send-otp", sendPasswordOtp);
  app.post("/api/auth/verify-otp", verifyPasswordOtp);
  app.post("/api/auth/reset-password", resetPasswordWithOtp);

  // Signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const signupData = z
        .object({
          email: z.string().email(),
          username: z.string().min(3),
          password: z.string().min(6),
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          userType: z.enum(["fan", "creator"]),
        })
        .parse(req.body);

      if (await storage.getUserByEmail(signupData.email)) {
        return res.status(400).json({ message: "User already exists" });
      }
      if (await storage.getUserByUsername(signupData.username)) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const hashedPassword = await hashPassword(signupData.password);
      const user = await storage.insertUser({
        ...signupData,
        password: hashedPassword,
      });

      return res.status(201).json({
        message: "User created successfully",
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error("Signup error:", err);
      return res.status(400).json({ message: "Invalid data" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = z
        .object({
          email: z.string().email(),
          password: z.string(),
        })
        .parse(req.body);

      const user = await storage.getUserByEmail(loginData.email);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const ok = await verifyPassword(loginData.password, user.password);
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

      req.session.userId = user.id;
      req.session.userType = user.userType;
      req.session.email = user.email || "";
      req.session.username = user.username || "";


      return res.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          userType: user.userType,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(400).json({ message: "Invalid data" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Could not log out" });
      return res.json({ message: "Logout successful" });
    });
  });

  // Current user
  app.get("/api/auth/user", async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });

      const user = await storage.getUserById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      return res.json(user);
    } catch (err) {
      console.error("Get user error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update profile
  app.put("/api/profile", async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });

      const updateData = z
        .object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          username: z.string().min(3),
          bio: z.string().optional(),
          profilePicture: z.string().url().optional().or(z.literal("")),
        })
        .parse(req.body);

      // Check if username is already taken by another user
      const existingUser = await storage.getUserByUsername(updateData.username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json(updatedUser);
    } catch (err) {
      console.error("Update profile error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data provided" });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all tracks (use Mongoose Track model for consistency)
  app.get("/api/tracks", async (req, res) => {
    try {
      // Import Track model dynamically to avoid circular dependency
      const { Track } = await import("../shared/schema");

      const tracks = await Track.find()
        .sort({ createdAt: -1 })
        .lean(); // Use lean() for better performance

      const formattedTracks = tracks.map(track => ({
        ...track,
        _id: track._id.toString(),
        creator: { username: track.artistName }
      }));

      res.json(formattedTracks);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      res.status(500).json({ error: "Failed to fetch tracks" });
    }
  });

  // Search tracks (must come before :id route)
  app.get("/api/tracks/search", async (req, res) => {
    try {
      const { q, genre } = req.query;
      const { Track } = await import("../shared/schema");
      let filter: any = {};

      if (q && typeof q === 'string') {
        filter.$or = [
          { title: { $regex: q, $options: 'i' } },
          { artistName: { $regex: q, $options: 'i' } },
          { album: { $regex: q, $options: 'i' } },
          { genre: { $regex: q, $options: 'i' } }
        ];
      }

      if (genre && typeof genre === 'string' && genre !== 'all') {
        filter.genre = { $regex: genre, $options: 'i' };
      }

      const tracks = await Track.find(filter).lean();
      const formattedTracks = tracks.map(track => ({
        ...track,
        _id: track._id.toString(),
        creator: { username: track.artistName }
      }));

      res.json(formattedTracks);
    } catch (error) {
      console.error("Error searching tracks:", error);
      res.status(500).json({ error: "Failed to search tracks" });
    }
  });

  // Get individual track by ID
  app.get("/api/tracks/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Validate ObjectId format
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid track ID format" });
      }

      const { Track } = await import("../shared/schema");
      const track = await Track.findById(id).lean();

      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }

      const formattedTrack = {
        ...track,
        _id: track._id.toString(),
        creator: { username: track.artistName }
      };

      res.json(formattedTrack);
    } catch (error) {
      console.error("Error fetching track:", error);
      res.status(500).json({ error: "Failed to fetch track" });
    }
  });

  // Like/Unlike track
  app.post("/api/tracks/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Validate ObjectId format
      if (!id || id === 'undefined' || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid track ID format" });
      }

      const { Track, Like } = await import("../shared/schema");
      const track = await Track.findById(id);
      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }

      // Check if already liked
      const existingLike = await Like.findOne({ userId, trackId: id });

      if (existingLike) {
        // Unlike
        await Like.deleteOne({ userId, trackId: id });
        res.json({ success: true, liked: false, message: "Track removed from liked songs" });
      } else {
        // Like
        await Like.create({ userId, trackId: id });
        res.json({ success: true, liked: true, message: "Track liked successfully" });
      }
    } catch (error) {
      console.error("Error liking track:", error);
      res.status(500).json({ error: "Failed to like track" });
    }
  });

  // Get liked songs
  app.get("/api/liked-songs", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { Like, Track } = await import("../shared/schema");
      const likes = await Like.find({ userId }).populate('trackId').lean();

      const likedTracks = likes.map(like => ({
        ...like.trackId,
        likedAt: like.createdAt
      }));

      res.json(likedTracks);
    } catch (error) {
      console.error("Error fetching liked songs:", error);
      res.status(500).json({ error: "Failed to fetch liked songs" });
    }
  });

  // Get user's playlists
  app.get("/api/playlists", (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const playlists = storage.getPlaylistsByUserId(req.session.userId);
      res.json(Array.isArray(playlists) ? playlists : []);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ error: "Failed to fetch playlists" });
    }
  });

  // Create playlist
  app.post("/api/playlists", (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { name, trackIds = [], isPublic = false } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({ error: "Playlist name is required" });
      }

      const playlist = storage.createPlaylist({
        name: name.trim(),
        userId: req.session.userId,
        trackIds,
        isPublic,
      });

      res.status(201).json(playlist);
    } catch (error) {
      console.error("Error creating playlist:", error);
      res.status(500).json({ error: "Failed to create playlist" });
    }
  });

  // Add track to playlist
  app.post("/api/playlists/:playlistId/tracks", (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { playlistId } = req.params;
      const { trackId } = req.body;

      if (!trackId) {
        return res.status(400).json({ error: "Track ID is required" });
      }

      const playlist = storage.getPlaylistById(playlistId);
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }

      if (playlist.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Check if track already exists in playlist
      if (playlist.trackIds.includes(trackId)) {
        return res.status(400).json({ error: "Track already exists in this playlist" });
      }

      const updatedPlaylist = storage.addTrackToPlaylist(playlistId, trackId);
      res.json(updatedPlaylist);
    } catch (error) {
      console.error("Error adding track to playlist:", error);
      res.status(500).json({ error: "Failed to add track to playlist" });
    }
  });

  // Register admin routes
  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}