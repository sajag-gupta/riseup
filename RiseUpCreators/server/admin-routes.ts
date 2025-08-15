
import type { Express } from "express";
import { z } from "zod";
import { upload, uploadToCloudinary } from "./cloudinary";
import { Track } from "../shared/schema";
import type { AuthenticatedRequest } from "./auth";
import { connectDB } from "./db";

export function registerAdminRoutes(app: Express) {
  // Middleware to check admin access
  const requireAdmin = (req: AuthenticatedRequest, res: any, next: any) => {
    // Only allow specific admin email
    const adminEmails = ['masterjacksharma@gmail.com'];
    if (!req.session?.email || !adminEmails.includes(req.session.email)) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Upload admin track
  app.post("/api/admin/tracks", requireAdmin, upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]), async (req: AuthenticatedRequest, res) => {
    try {
      const { title, album, genre, artistName, duration } = req.body;
      const files = req.files as any;

      if (!files?.audio?.[0]) {
        return res.status(400).json({ message: "Audio file is required" });
      }

      // Upload audio to Cloudinary
      const audioResult = await uploadToCloudinary(files.audio[0].buffer, 'admin-tracks/audio', 'video') as any;
      
      let coverUrl = '';
      if (files?.cover?.[0]) {
        const coverResult = await uploadToCloudinary(files.cover[0].buffer, 'admin-tracks/covers', 'image') as any;
        coverUrl = coverResult.secure_url;
      }

      let videoUrl = '';
      if (files?.video?.[0]) {
        const videoResult = await uploadToCloudinary(files.video[0].buffer, 'admin-tracks/videos', 'video') as any;
        videoUrl = videoResult.secure_url;
      }

      const track = new Track({
        title,
        album,
        genre,
        artistName,
        audioUrl: audioResult.secure_url,
        coverUrl,
        videoUrl,
        duration: duration ? parseInt(duration) : undefined,
        isAdminTrack: true,
        plays: 0,
        likes: 0
      });

      await track.save();

      res.json({ message: "Track uploaded successfully", track });
    } catch (error) {
      console.error("Admin track upload error:", error);
      res.status(500).json({ message: "Failed to upload track" });
    }
  });

  // Get all admin tracks
  app.get("/api/admin/tracks", requireAdmin, async (req, res) => {
    try {
      const tracks = await Track.find({ isAdminTrack: true }).sort({ createdAt: -1 });
      res.json(tracks);
    } catch (error) {
      console.error("Get admin tracks error:", error);
      res.status(500).json({ message: "Failed to get tracks" });
    }
  });

  // Get available genres
  app.get("/api/genres", async (req, res) => {
    try {
      const predefinedGenres = [
        "Rock", "Pop", "Hip Hop", "Electronic", "Jazz", "Classical", 
        "Folk", "Country", "R&B", "Reggae", "Blues", "Instrumental", "Ambient"
      ];
      res.json(predefinedGenres);
    } catch (error) {
      console.error("Get genres error:", error);
      res.status(500).json({ message: "Failed to get genres" });
    }
  });

  // Delete admin track
  app.delete("/api/admin/tracks/:id", requireAdmin, async (req, res) => {
    try {
      await Track.findByIdAndDelete(req.params.id);
      res.json({ message: "Track deleted successfully" });
    } catch (error) {
      console.error("Delete admin track error:", error);
      res.status(500).json({ message: "Failed to delete track" });
    }
  });

  // These routes are now handled in routes.ts to avoid duplication

  // Initialize default tracks (for development/testing)
  app.post("/api/admin/init-default-tracks", requireAdmin, async (req, res) => {
    try {
      // Check if Ocean Breeze already exists
      const existingTrack = await Track.findOne({ title: "Ocean Breeze" });
      if (existingTrack) {
        return res.json({ message: "Default tracks already exist" });
      }

      // Create Ocean Breeze track
      const oceanBreezeTrack = new Track({
        title: "Ocean Breeze",
        artistName: "JT Wayne",
        album: "Beat Collection",
        genre: "Instrumental",
        audioUrl: "/attached_assets/ocean-breeze-beat-by-jtwayne-213318_1755170104000.mp3",
        coverUrl: "",
        duration: 155, // 2:35 in seconds
        isAdminTrack: true,
        plays: 0,
        likes: 0
      });

      await oceanBreezeTrack.save();

      res.json({ message: "Default tracks initialized successfully", track: oceanBreezeTrack });
    } catch (error) {
      console.error("Init default tracks error:", error);
      res.status(500).json({ message: "Failed to initialize default tracks" });
    }
  });

  // Auto-initialize default tracks on server start
  app.get("/api/init-default", async (req, res) => {
    try {
      // Ensure database connection
      await connectDB();
      
      // Check if Ocean Breeze already exists
      const existingTrack = await Track.findOne({ title: "Ocean Breeze" });
      if (!existingTrack) {
        // Create Ocean Breeze track
        const oceanBreezeTrack = new Track({
          title: "Ocean Breeze",
          artistName: "JT Wayne",
          album: "Beat Collection",
          genre: "Instrumental",
          audioUrl: "/attached_assets/ocean-breeze-beat-by-jtwayne-213318_1755170104000.mp3",
          coverUrl: "",
          duration: 155, // 2:35 in seconds
          isAdminTrack: true,
          plays: 0,
          likes: 0
        });

        await oceanBreezeTrack.save();
        console.log("Default track 'Ocean Breeze' initialized");
      }

      res.json({ message: "Default tracks ready", tracksCount: await Track.countDocuments() });
    } catch (error) {
      console.error("Init default tracks error:", error);
      res.status(500).json({ message: "Failed to initialize default tracks" });
    }
  });
}
