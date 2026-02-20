import mongoose from "mongoose";

const testCaseResultSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["passed", "failed"],
  },

  isEdgeCase: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false },

  runtime: Number,
  memory: Number,
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },

  language: {
    type: String,
    enum: ["cpp", "java", "python", "javascript"],
  },

  code: String,

  verdict: {
    type: String,
    enum: ["AC", "WA", "TLE", "MLE", "CE"],
  },

  detailedVerdict: {
    type: String,
    enum: [
      "Partial Accepted",
      "Edge Case Failure",
      "Hidden Testcase Failure",
      "Compilation Error",
      "Runtime Error",
      "Time Limit Exceeded",
      "Memory Limit Exceeded"
    ]
  },

  passedCount: Number,
  totalCount: Number,

  totalRuntime: Number,
  totalMemory: Number,

  testCaseResults: [testCaseResultSchema],

}, { timestamps: true });

submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ problem: 1, verdict: 1 });

export default mongoose.model("Submission", submissionSchema);