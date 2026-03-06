import Problem from "../models/problem.model.js";

export const createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      topics = [],
      constraints,
      examples,
      hints = [],
      editorial = "",
      visibleTestcases,
      hiddenTestcases,
      driverCode,
    } = req.body;

    if (!title || !description || !difficulty) {
      return res.status(400).json({
        message: "Title, description and difficulty are required",
      });
    }

    const requiredLanguages = ["cpp", "java", "python", "javascript"];

    if (!Array.isArray(driverCode) || driverCode.length !== requiredLanguages.length) {
      return res.status(400).json({
        message: "Driver code for all required languages is needed",
      });
    }

    const languages = driverCode.map((d) => d.language);

    const missing = requiredLanguages.filter(
      (lang) => !languages.includes(lang)
    );

    if (missing.length) {
      return res.status(400).json({
        message: `Missing driver code for: ${missing.join(", ")}`,
      });
    }

    const cleanTestcases = (arr = []) =>
      arr.filter(
        (tc) =>
          tc &&
          tc.input?.toString().trim() &&
          tc.output?.toString().trim()
      );

    const cleanedVisible = cleanTestcases(visibleTestcases);
    const cleanedHidden = cleanTestcases(hiddenTestcases);

    const problem = await Problem.create({
      title: title.trim(),
      description,
      difficulty,
      topics,
      constraints,
      examples,
      hints,
      editorial,
      visibleTestcases: cleanedVisible,
      hiddenTestcases: cleanedHidden,
      driverCode,
      createdBy: req.user._id,
      isPublished: false,
    });

    return res.status(201).json({
      message: "Problem created successfully",
      problem,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Problem with this title already exists",
      });
    }

    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).select("+driverCode +hiddenTestcases");

    if (!problem || problem.isDeleted) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (problem.isPublished) {
      return res.status(400).json({
        message: "Published problems cannot be edited",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "difficulty",
      "topics",
      "constraints",
      "examples",
      "hints",
      "editorial",
      "visibleTestcases",
      "hiddenTestcases",
      "driverCode",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        problem[field] = req.body[field];
      }
    });

    await problem.save();

    res.status(200).json({
      message: "Problem updated successfully",
      problem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const publishProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id)
      .select("+driverCode +hiddenTestcases");

    if (!problem || problem.isDeleted) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (problem.isPublished) {
      return res.status(400).json({
        message: "Problem is already published",
      });
    }

    if (!problem.hiddenTestcases?.length) {
      return res.status(400).json({
        message: "Hidden testcases are required before publishing",
      });
    }

    if (!problem.driverCode?.length) {
      return res.status(400).json({
        message: "Driver code is required before publishing",
      });
    }

    if (!problem.examples?.length) {
      return res.status(400).json({
        message: "At least one example is required",
      });
    }

    problem.isPublished = true;
    await problem.save();

    res.status(200).json({
      message: "Problem published successfully",
      problemId: problem._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id);

    if (!problem || problem.isDeleted) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    problem.isDeleted = true;
    await problem.save();

    res.status(200).json({
      message: "Problem deleted successfully",
      problemId: problem._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getProblems = async (req, res) => {
  try {
    let { page = 1, limit = 20, difficulty, topic, search } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {
      isPublished: true,
      isDeleted: false,
    };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (topic) {
      query.topics = topic;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [problems, total] = await Promise.all([
      Problem.find(query)
        .select("-hiddenTestcases -driverCode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Problem.countDocuments(query),
    ]);

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalProblems: total,
      problems,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};