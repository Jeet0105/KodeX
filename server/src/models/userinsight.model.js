import mongoose from "mongoose";

const weakTopicSchema = new mongoose.Schema({
  topic: String,
  totalAttempts: Number,
  failedAttempts: Number,
  failureRate: Number,
}, { _id: false });

const verdictStatsSchema = new mongoose.Schema({
  AC: { type: Number, default: 0 },
  WA: { type: Number, default: 0 },
  TLE: { type: Number, default: 0 },
  MLE: { type: Number, default: 0 },
  CE: { type: Number, default: 0 },
}, { _id: false });

const userInsightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
  },

  totalSubmissions: { type: Number, default: 0 },
  acceptanceRate: { type: Number, default: 0 },

  verdictStats: verdictStatsSchema,
  weakTopics: [weakTopicSchema],

  lastAnalyzedAt: Date,

}, { timestamps: true });

export default mongoose.model("UserInsight", userInsightSchema);