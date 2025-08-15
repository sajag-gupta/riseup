
import mongoose from 'mongoose';
import { z } from 'zod';

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['fan', 'creator'], default: 'fan' },
  firstName: String,
  lastName: String,
  profilePicture: String,
  bio: String,
  monthlyListeners: { type: Number, default: 0 },
  totalEarnings: { type: String, default: "0.00" },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

// Track Schema
const trackSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  title: { type: String, required: true, maxlength: 200 },
  album: { type: String, maxlength: 200 },
  genre: { type: String, maxlength: 100 },
  audioUrl: { type: String, required: true },
  coverUrl: String,
  videoUrl: String,
  duration: Number,
  plays: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  price: String,
  isAdminTrack: { type: Boolean, default: false },
  artistName: String // For admin tracks without creator
}, { timestamps: true });

export const Track = mongoose.model('Track', trackSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, maxlength: 200 },
  description: String,
  price: { type: String, required: true },
  imageUrl: String,
  category: { type: String, required: true, maxlength: 100 },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);

// Cart Items Schema
const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 }
}, { timestamps: true });

export const CartItem = mongoose.model('CartItem', cartItemSchema);

// Playlist Schema
const playlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, maxlength: 100 },
  description: String,
  isPublic: { type: Boolean, default: false },
  trackIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }]
}, { timestamps: true });

export const Playlist = mongoose.model('Playlist', playlistSchema);

// Likes Schema
const likeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true }
}, { timestamps: true });

export const Like = mongoose.model('Like', likeSchema);

// Follows Schema
const followSchema = new mongoose.Schema({
  followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  followingId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Follow = mongoose.model('Follow', followSchema);

// Zod validation schemas for API
export const insertUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(1),
  password: z.string().min(6),
  userType: z.enum(['fan', 'creator']).default('fan'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profilePicture: z.string().optional(),
  bio: z.string().optional()
});

export const insertTrackSchema = z.object({
  creatorId: z.string(),
  title: z.string().max(200),
  album: z.string().max(200).optional(),
  genre: z.string().max(100).optional(),
  audioUrl: z.string(),
  coverUrl: z.string().optional(),
  duration: z.number().optional(),
  price: z.string().optional()
});

export const insertProductSchema = z.object({
  creatorId: z.string(),
  name: z.string().max(200),
  description: z.string().optional(),
  price: z.string(),
  imageUrl: z.string().optional(),
  category: z.string().max(100)
});

export const insertCartItemSchema = z.object({
  userId: z.string(),
  productId: z.string(),
  quantity: z.number().default(1)
});

export const insertPlaylistSchema = z.object({
  userId: z.string(),
  name: z.string().max(100),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  trackIds: z.array(z.string()).default([])
});

export const insertLikeSchema = z.object({
  userId: z.string(),
  trackId: z.string()
});

export const insertFollowSchema = z.object({
  followerId: z.string(),
  followingId: z.string()
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
