import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  totalPoints: Number,
  problemsSolved: Number,
  rank: Number,

  updatedAt: {
    type: Date,
    default: Date.now
  }

});

leaderboardSchema.index({ rank: 1 });

export default mongoose.model("Leaderboard", leaderboardSchema);