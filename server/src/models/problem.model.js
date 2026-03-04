import mongoose from "mongoose";

/* ---------------- TEST CASE ---------------- */
const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
  },
  { _id: false }
);

/* ---------------- EXAMPLE ---------------- */
const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: String,
  },
  { _id: false }
);

/* ---------------- DRIVER CODE ---------------- */
const driverCodeSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      enum: ["cpp", "java", "python", "javascript"],
      required: true,
    },

    judge0LanguageId: { type: Number, required: true },

    starterCode: { type: String, required: true },
    solutionWrapper: { type: String, required: true },
    functionName: { type: String, required: true },

    timeLimit: { type: Number, default: 2 },
    memoryLimit: { type: Number, default: 128000 },
  },
  { _id: false }
);

/* ---------------- PROBLEM ---------------- */
const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: { type: String, required: true },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    topics: [{ type: String }],

    constraints: {
      type: [String],
      required: true,
    },

    examples: {
      type: [exampleSchema],
      required: true,
    },

    hints: [{ type: String }],

    editorial: String,

    visibleTestcases: {
      type: [testCaseSchema],
      required: true,
    },

    hiddenTestcases: {
      type: [testCaseSchema],
      required: true,
      select: false,
    },

    driverCode: {
      type: [driverCodeSchema],
      required: true,
      validate: {
        validator: function (value) {
          const languages = value.map(v => v.language);
          return new Set(languages).size === languages.length;
        },
        message: "Duplicate driverCode languages not allowed"
      },
      select: false,
    },

    points: Number,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

/* ---------------- AUTO POINT CALC ---------------- */
problemSchema.pre("save", function () {
  const difficultyPoints = {
    easy: 1,
    medium: 2,
    hard: 5,
  };

  if (this.isModified("difficulty")) {
    this.points = difficultyPoints[this.difficulty];
  }
});

/* ---------------- INDEXES ---------------- */
problemSchema.index({ title: "text", description: "text" });
problemSchema.index({ difficulty: 1, isPublished: 1 });
problemSchema.index({ topics: 1, isPublished: 1 });

export default mongoose.model("Problem", problemSchema);