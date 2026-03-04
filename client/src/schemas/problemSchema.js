import { z } from "zod"

export const problemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),

  description: z.string().min(10, "Description is too short"),

  difficulty: z.enum(["easy", "medium", "hard"]),

  topics: z.string().optional(),

  constraints: z
    .array(z.string().min(1, "Constraint cannot be empty"))
    .min(1, "At least one constraint required"),

  examples: z
    .array(
      z.object({
        input: z.string().min(1, "Example input required"),
        output: z.string().min(1, "Example output required"),
        explanation: z.string().optional()
      })
    )
    .min(1, "At least one example required"),

  hints: z.array(z.string()).optional(),

  editorial: z.string().optional(),

  visibleTestcases: z
    .array(
      z.object({
        input: z.string().min(1),
        output: z.string().min(1)
      })
    )
    .min(1, "At least one visible testcase required"),

  hiddenTestcases: z
    .array(
      z.object({
        input: z.string().min(1),
        output: z.string().min(1)
      })
    )
    .min(1, "At least one hidden testcase required"),

  driverCode: z
    .array(
      z.object({
        language: z.string(),
        judge0LanguageId: z.number(),
        starterCode: z.string(),
        solutionWrapper: z
          .string()
          .refine(
            (val) => val.includes("{{USER_CODE}}"),
            "Wrapper must include {{USER_CODE}}"
          ),
        functionName: z.string().min(1, "Function name required"),
        timeLimit: z.number(),
        memoryLimit: z.number()
      })
    )
    .length(4, "All 4 languages required")
})