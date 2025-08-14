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

// Placeholder for requireAuth middleware if not globally defined
// Assume it's defined elsewhere and checks for req.session.userId
const requireAuth = (req: AuthenticatedRequest, res, next) => {
  if (req.session?.userId) {
    req.userId = req.session.userId; // Attach userId to request
    next();
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
};

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

      // Fetch user stats
      const { Track, Like, Playlist, User } = await import("../shared/schema");
      const likedSongsCount = await Like.countDocuments({ userId });
      const playlistsCount = await Playlist.countDocuments({ userId });
      const memberSince = user.createdAt; // Assuming user object has createdAt field

      return res.json({
        ...user,
        likedSongsCount,
        playlistsCount,
        memberSince
      });
    } catch (err) {
      console.error("Get user error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user profile
  app.put("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const { firstName, lastName, username, bio, profilePicture } = req.body;
      const User = (await import("../shared/schema")).User; // Import User model

      const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        { firstName, lastName, username, bio, profilePicture },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
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
  app.get("/api/liked-songs", async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { Like, Track } = await import("../shared/schema");
      const likes = await Like.find({ userId }).populate({
        path: 'trackId',
        populate: {
          path: 'creatorId',
          select: 'username'
        }
      }).sort({ createdAt: -1 });

      const likedTracks = likes
        .filter(like => like.trackId) // Filter out null tracks
        .map(like => ({
          _id: like.trackId._id,
          title: like.trackId.title,
          artistName: like.trackId.creatorId?.username || 'Unknown Artist',
          album: like.trackId.album,
          audioUrl: like.trackId.audioUrl,
          coverUrl: like.trackId.coverUrl,
          duration: like.trackId.duration,
          plays: like.trackId.plays || 0,
          likedAt: like.createdAt
        }));

      res.json(likedTracks);
    } catch (error) {
      console.error("Error fetching liked songs:", error);
      res.status(500).json({ error: "Failed to fetch liked songs" });
    }
  });

  // Get playlists
  app.get("/api/playlists", async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { Playlist } = await import("../shared/schema");
      const playlists = await Playlist.find({ userId }).lean();
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ error: "Failed to fetch playlists" });
    }
  });

  // Create playlist
  app.post("/api/playlists", async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { name, description, isPublic } = req.body;
      const { Playlist } = await import("../shared/schema");

      const playlist = await Playlist.create({
        userId,
        name,
        description,
        isPublic: !!isPublic,
        trackIds: []
      });

      res.json(playlist);
    } catch (error) {
      console.error("Error creating playlist:", error);
      res.status(500).json({ error: "Failed to create playlist" });
    }
  });

  // Add track to playlist
  app.post("/api/playlists/:playlistId/tracks", async (req: AuthenticatedRequest, res) => {
    try {
      const { playlistId } = req.params;
      const { trackId } = req.body;

      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (!trackId) {
        return res.status(400).json({ error: "Track ID is required" });
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(trackId)) {
        return res.status(400).json({ error: "Invalid playlist or track ID" });
      }

      const { Playlist, Track } = await import("../shared/schema"); // Import necessary schemas

      const playlist = await Playlist.findOne({
        _id: playlistId,
        userId: userId // Use userId from session
      });

      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found or you don't own it" });
      }

      // Check if track exists
      const track = await Track.findById(trackId);
      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }

      // Check if track is already in playlist
      if (playlist.trackIds.includes(trackId)) {
        return res.status(400).json({ message: "Track already in playlist" });
      }

      playlist.trackIds.push(trackId);
      await playlist.save();

      res.json({ message: "Track added to playlist successfully" });
    } catch (error) {
      console.error("Error adding track to playlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Register admin routes
  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}