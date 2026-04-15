import { runAllTestCases } from "../services/codeExecution.service.js";
import Problem from "../models/problem.model.js";
import User from "../models/user.model.js";
import Submission from "../models/submission.model.js";
import { refreshLeaderboard } from "./user.controller.js";

/**
 * RUN — Execute on visible test cases only, no DB storage
 */
export const runCode = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;

    if (!problemId || !language || !code) {
      return res.status(400).json({ message: "problemId, language and code are required" });
    }

    // Fetch problem with driverCode (select: false so need explicit select)
    const problem = await Problem.findOne({
      _id: problemId,
      isPublished: true,
      isDeleted: false,
    }).select("+driverCode visibleTestcases");

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Find driver config for selected language
    const driver = problem.driverCode.find(
      (d) => d.language === language.toLowerCase()
    );

    if (!driver) {
      return res.status(400).json({ message: `No driver code found for language: ${language}` });
    }

    // Wrap user code with solution wrapper
    const wrappedCode = driver.solutionWrapper.replace("{{USER_CODE}}", code);

    const testCases = problem.visibleTestcases.map((tc) => ({
      input: tc.input,
      expected_output: tc.output,
    }));

    const { allPassed, results } = await runAllTestCases({
      source_code: wrappedCode,
      language_id: driver.judge0LanguageId,
      testCases,
    });

    return res.status(200).json({
      message: allPassed ? "All test cases passed" : "Some test cases failed",
      allPassed,
      results,
    });
  } catch (error) {
    console.error("Run Code Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

/**
 * SUBMIT — Execute on hidden test cases, store result in DB
 */
export const submitCode = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;
    const userId = req.user.id; // from auth middleware

    if (!problemId || !language || !code) {
      return res.status(400).json({ message: "problemId, language and code are required" });
    }

    const problem = await Problem.findOne({
      _id: problemId,
      isPublished: true,
      isDeleted: false,
    }).select("+driverCode +hiddenTestcases");

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const driver = problem.driverCode.find(
      (d) => d.language === language.toLowerCase()
    );

    if (!driver) {
      return res.status(400).json({ message: `No driver code found for language: ${language}` });
    }

    const wrappedCode = driver.solutionWrapper.replace("{{USER_CODE}}", code);

    const testCases = problem.hiddenTestcases.map((tc) => ({
      input: tc.input,
      expected_output: tc.output,
    }));

    const { allPassed, results } = await runAllTestCases({
      source_code: wrappedCode,
      language_id: driver.judge0LanguageId,
      testCases,
      timeLimit: driver.timeLimit,
      memoryLimit: driver.memoryLimit,
    });

    // ---- Compute verdict ----
    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;

    const totalRuntime = results.reduce((sum, r) => sum + (parseFloat(r.time) || 0), 0);
    const totalMemory = results.reduce((sum, r) => sum + (r.memory || 0), 0);

    let verdict;
    let detailedVerdict;

    const hasCompileError = results.some((r) => r.status.id === 6);
    const hasTLE = results.some((r) => r.status.id === 5);
    const hasMLE = results.some((r) => r.status.id === 15);
    const hasRuntimeError = results.some((r) => r.status.id >= 7 && r.status.id <= 14);

    if (hasCompileError) {
      verdict = "CE";
      detailedVerdict = "Compilation Error";
    } else if (hasTLE) {
      verdict = "TLE";
      detailedVerdict = "Time Limit Exceeded";
    } else if (hasMLE) {
      verdict = "MLE";
      detailedVerdict = "Memory Limit Exceeded";
    } else if (hasRuntimeError) {
      verdict = "WA";
      detailedVerdict = "Runtime Error";
    } else if (allPassed) {
      verdict = "AC";
      detailedVerdict = null;
    } else {
      verdict = "WA";
      // Distinguish partial/full WA
      if (passedCount === 0) {
        detailedVerdict = "Hidden Testcase Failure";
      } else {
        detailedVerdict = "Partial Accepted";
      }
    }

    // ---- Build testCaseResults for DB ----
    const testCaseResults = results.map((r) => ({
      status: r.passed ? "passed" : "failed",
      isHidden: true,
      isEdgeCase: false,
      runtime: parseFloat(r.time) || 0,
      memory: r.memory || 0,
    }));

    // ---- Save submission ----
    const submission = await Submission.create({
      user: userId,
      problem: problemId,
      language: language.toLowerCase(),
      code,
      verdict,
      detailedVerdict,
      passedCount,
      totalCount,
      totalRuntime: parseFloat(totalRuntime.toFixed(3)),
      totalMemory,
      testCaseResults,
    });

    // ---- Update Problem Stats ----
    await Problem.findByIdAndUpdate(problemId, {
      $inc: {
        totalSubmissions: 1,
        acceptedSubmissions: verdict === "AC" ? 1 : 0
      }
    });

    // ---- If AC, add to user's solvedProblems (no duplicates) ----
    if (verdict === "AC") {
      const currentUser = await User.findById(userId);
      const alreadySolved = currentUser.solvedProblems?.some(
        (pid) => pid.toString() === problemId.toString()
      );

      if (!alreadySolved) {
        // Only award points on first AC for this problem
        await User.findByIdAndUpdate(userId, {
          $addToSet: { solvedProblems: problemId },
          $inc: { totalPoints: problem.points || 0 },
        });
      }

      // Refresh leaderboard ranks (runs async, don't block response)
      refreshLeaderboard().catch((err) =>
        console.error("Leaderboard refresh error:", err)
      );
    }

    return res.status(201).json({
      message: verdict === "AC" ? "Accepted" : detailedVerdict || "Wrong Answer",
      verdict,
      detailedVerdict,
      passedCount,
      totalCount,
      totalRuntime: parseFloat(totalRuntime.toFixed(3)),
      totalMemory,
      submissionId: submission._id,
      results, // detailed per-test breakdown
    });
  } catch (error) {
    console.error("Submit Code Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getUserSubmissions = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;

    const submissions = await Submission.find({
      user: userId,
      problem: problemId,
    })
      .select("-code -testCaseResults")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({ submissions });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    let { page = 1, limit = 20, search, verdict, language } = req.query;
    page = Number(page);
    limit = Number(limit);

    const query = { user: userId };

    if (verdict && verdict !== "all") {
      query.verdict = verdict;
    }

    if (language && language !== "all") {
      query.language = language;
    }

    const skip = (page - 1) * limit;

    const total = await Submission.countDocuments(query);

    let submissions = await Submission.find(query)
      .populate("problem", "title difficulty")
      .select("-code -testCaseResults")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (search) {
      const s = search.toLowerCase();
      submissions = submissions.filter((sub) =>
        sub.problem?.title?.toLowerCase().includes(s)
      );
    }

    return res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalSubmissions: total,
      submissions,
    });
  } catch (error) {
    console.error("Get All User Submissions Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id).populate("problem", "title difficulty");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.status(200).json({ submission });
  } catch (error) {
    console.error("Get Submission Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};