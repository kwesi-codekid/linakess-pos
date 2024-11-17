import mongoose from "mongoose";

const VisitSchema = new mongoose.Schema({
  ipAddress: String,
  userAgent: String,
  timestamp: Date,
  // Other fields you may want to track
});

export { VisitSchema };
