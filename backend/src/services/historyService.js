import mongoose from "mongoose";
import Query from "../models/Query.js";
const memory = [];
export async function saveHistory(item) {
  if (mongoose.connection.readyState === 1) return await Query.create(item);
  memory.unshift(item); if (memory.length > 100) memory.pop(); return item;
}
export async function getHistory() {
  if (mongoose.connection.readyState === 1) return await Query.find().sort({createdAt:-1}).limit(100).lean();
  return memory;
}
