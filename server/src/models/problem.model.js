import mongoose from "mongoose";

/* Test Case */
const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
  },
  { _id: false }
);

/* Driver Code */
const driverCodeSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      enum: ["cpp", "java", "python", "javascript"],
      required: true,
    },
    starterCode: { type: String, required: true },
    solutionWrapper: { type: String, required: true },
    functionName: { type: String, required: true },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    topics: [{ type: String }],

    visibleTestcases: {
      type: [testCaseSchema],
      required: true,
    },

    hiddenTestcases: {
      type: [testCaseSchema],
      required: true,
    },

    driverCode: {
      type: [driverCodeSchema],
      required: true,
    },

    points: {
      type: Number,
      default: function () {
        return this.difficulty === "easy"
          ? 1
          : this.difficulty === "medium"
          ? 2
          : 5;
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* Indexing */
problemSchema.index({ difficulty: 1, topics: 1 });
problemSchema.index({ title: "text" });

const Problem = mongoose.model("Problem", problemSchema);
export default Problem;
