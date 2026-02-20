import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
  },

  recommendedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem"
  }],

  basedOnTopic: String,

  generatedAt: Date,

});

export default mongoose.model("Recommendation", recommendationSchema);