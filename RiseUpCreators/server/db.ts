import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const MONGODB_URI =
  process.env.DATABASE_URL ||
  "mongodb+srv://sajag:urHyCMEosGgXBGRj@cluster1.l89vj.mongodb.net/riseup?retryWrites=true&w=majority&authSource=admin";

let client: MongoClient;
let db: any;

export async function connectDB() {
  try {
    // Connect with Mongoose for schema-based operations
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas with Mongoose");

    // Also connect with native MongoDB driver for direct operations
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db("riseup");
    console.log("Connected to MongoDB Atlas with native driver");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export { db };
export default mongoose;