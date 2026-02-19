import mongoose from "mongoose";

const testCaseResultSchema = new mongoose.Schema({
    status: {
      type: String,
      enum: ["passed", "failed"],
      required: true,
    },
    runtime: Number,
    memory: Number,
  },
  { _id: false });

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
      required: true,
    },
    code: {
      type: String,
      required: true,
    },

    verdict: {
      type: String,
      enum: ["AC", "WA", "TLE", "MLE", "CE"],
      required: true,
    },

    compileError: {
      type: String,
    },

    totalRuntime: Number,
    totalMemory: Number,

    testCaseResults: [testCaseResultSchema],
  },
  { timestamps: true }
);

/* Indexes */
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ problem: 1, verdict: 1 });
submissionSchema.index({ user: 1, problem: 1 });

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
