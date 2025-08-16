import {
  User,
  Track,
  Product,
  CartItem,
  Playlist,
  Like,
  Follow,
  type InsertUser,
  type InsertTrack,
  type InsertProduct,
  type InsertCartItem,
  type InsertPlaylist,
  type InsertLike,
  type InsertFollow
} from "../shared/schema";

// User operations
export async function insertUser(userData: InsertUser) {
  const user = new User(userData);
  return await user.save();
}

export async function getUserById(id: string) {
  return await User.findById(id);
}

export async function getUserByEmail(email: string) {
  return await User.findOne({ email });
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const user = await User.findOne({ username }).lean();
  return user ? { ...user, id: user._id.toString() } : null;
}

export async function updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    return updatedUser ? { ...updatedUser, id: updatedUser._id.toString() } : null;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(id: string) {
  return await User.findByIdAndDelete(id);
}

// Track operations
export async function insertTrack(trackData: InsertTrack) {
  const track = new Track(trackData);
  return await track.save();
}

export async function getTrackById(id: string) {
  return await Track.findById(id).populate('creatorId', 'username firstName lastName');
}

export async function getTracksByCreator(creatorId: string) {
  return await Track.find({ creatorId }).populate('creatorId', 'username firstName lastName');
}

export async function getAllTracks() {
  return await Track.find().populate('creatorId', 'username firstName lastName');
}

export async function updateTrack(id: string, updates: Partial<InsertTrack>) {
  return await Track.findByIdAndUpdate(id, updates, { new: true });
}

export async function deleteTrack(id: string) {
  return await Track.findByIdAndDelete(id);
}

// Product operations
export async function insertProduct(productData: InsertProduct) {
  const product = new Product(productData);
  return await product.save();
}

export async function getProductById(id: string) {
  return await Product.findById(id).populate('creatorId', 'username firstName lastName');
}

export async function getProductsByCreator(creatorId: string) {
  return await Product.find({ creatorId }).populate('creatorId', 'username firstName lastName');
}

export async function getAllProducts() {
  return await Product.find().populate('creatorId', 'username firstName lastName');
}

export async function updateProduct(id: string, updates: Partial<InsertProduct>) {
  return await Product.findByIdAndUpdate(id, updates, { new: true });
}

export async function deleteProduct(id: string) {
  return await Product.findByIdAndDelete(id);
}

// Cart operations
export async function insertCartItem(cartData: InsertCartItem) {
  const cartItem = new CartItem(cartData);
  return await cartItem.save();
}

export async function getCartByUser(userId: string) {
  return await CartItem.find({ userId }).populate('productId');
}

export async function updateCartItem(id: string, updates: Partial<InsertCartItem>) {
  return await CartItem.findByIdAndUpdate(id, updates, { new: true });
}

export async function deleteCartItem(id: string) {
  return await CartItem.findByIdAndDelete(id);
}

export async function clearCart(userId: string) {
  return await CartItem.deleteMany({ userId });
}

// Playlist operations
export async function insertPlaylist(playlistData: InsertPlaylist) {
  const playlist = new Playlist(playlistData);
  return await playlist.save();
}

export async function getPlaylistById(id: string) {
  return await Playlist.findById(id).populate('trackIds').populate('userId', 'username');
}

export async function getPlaylistsByUser(userId: string) {
  return await Playlist.find({ userId }).populate('trackIds');
}

export async function updatePlaylist(id: string, updates: Partial<InsertPlaylist>) {
  return await Playlist.findByIdAndUpdate(id, updates, { new: true });
}

export async function deletePlaylist(id: string) {
  return await Playlist.findByIdAndDelete(id);
}

// Like operations
export async function insertLike(likeData: InsertLike) {
  const like = new Like(likeData);
  return await like.save();
}

export async function getLikesByUser(userId: string) {
  return await Like.find({ userId }).populate('trackId');
}

export async function getLikesByTrack(trackId: string) {
  return await Like.find({ trackId }).populate('userId', 'username');
}

export async function deleteLike(userId: string, trackId: string) {
  return await Like.findOneAndDelete({ userId, trackId });
}

// Follow operations
export async function insertFollow(followData: InsertFollow) {
  const follow = new Follow(followData);
  return await follow.save();
}

export async function getFollowers(userId: string) {
  return await Follow.find({ followingId: userId }).populate('followerId', 'username firstName lastName');
}

export async function getFollowing(userId: string) {
  return await Follow.find({ followerId: userId }).populate('followingId', 'username firstName lastName');
}

export async function deleteFollow(followerId: string, followingId: string) {
  return await Follow.findOneAndDelete({ followerId, followingId });
}

export async function isFollowing(followerId: string, followingId: string) {
  const follow = await Follow.findOne({ followerId, followingId });
  return !!follow;
}