import Problem from "../models/problem.model.js";

const cleanTestcases = (arr = []) =>
  arr.filter(
    (tc) => tc && tc.input?.toString().trim() && tc.output?.toString().trim()
  )

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
    } = req.body

    if (!title || !description || !difficulty) {
      return res.status(400).json({
        message: "Title, description and difficulty are required",
      })
    }

    const requiredLanguages = ["cpp", "java", "python", "javascript"]

    if (!Array.isArray(driverCode) || driverCode.length !== requiredLanguages.length) {
      return res.status(400).json({
        message: "Driver code for all required languages is needed",
      })
    }

    const uniqueLanguages = [...new Set(driverCode.map((d) => d.language))]

    const missing = requiredLanguages.filter(
      (lang) => !uniqueLanguages.includes(lang)
    )

    if (missing.length) {
      return res.status(400).json({
        message: `Missing driver code for: ${missing.join(", ")}`,
      })
    }

    const problem = await Problem.create({
      title: title.trim(),
      description,
      difficulty,
      topics,
      constraints,
      examples,
      hints,
      editorial,
      visibleTestcases: cleanTestcases(visibleTestcases),
      hiddenTestcases: cleanTestcases(hiddenTestcases),
      driverCode,
      createdBy: req.user._id,
      isPublished: false,
    })

    return res.status(201).json({
      message: "Problem created successfully",
      problem,
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Problem with this title already exists",
      })
    }

    console.error(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).select(
      "+driverCode +hiddenTestcases"
    )

    if (!problem || problem.isDeleted) {
      return res.status(404).json({ message: "Problem not found" })
    }

    if (problem.isPublished) {
      return res.status(400).json({
        message: "Unpublish the problem before editing it",
      })
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
    ]

    allowedFields.forEach((field) => {
      if (req.body[field] === undefined) return

      if (field === "visibleTestcases" || field === "hiddenTestcases") {
        problem[field] = cleanTestcases(req.body[field])
      } else {
        problem[field] = req.body[field]
      }
    })

    await problem.save()

    res.status(200).json({
      message: "Problem updated successfully",
      problem,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

export const unpublishProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)

    if (!problem || problem.isDeleted) {
      return res.status(404).json({ message: "Problem not found" })
    }

    if (!problem.isPublished) {
      return res.status(400).json({ message: "Problem is already unpublished" })
    }

    problem.isPublished = false
    await problem.save()

    res.status(200).json({ message: "Problem unpublished successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

export const publishProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).select(
      "+driverCode +hiddenTestcases"
    )

    if (!problem || problem.isDeleted) {
      return res.status(404).json({ message: "Problem not found" })
    }

    if (problem.isPublished) {
      return res.status(400).json({ message: "Problem is already published" })
    }

    if (!problem.hiddenTestcases?.length) {
      return res.status(400).json({
        message: "Hidden testcases are required before publishing",
      })
    }

    if (!problem.driverCode?.length) {
      return res.status(400).json({
        message: "Driver code is required before publishing",
      })
    }

    if (!problem.examples?.length) {
      return res.status(400).json({
        message: "At least one example is required",
      })
    }

    problem.isPublished = true
    await problem.save()

    res.status(200).json({
      message: "Problem published successfully",
      problemId: problem._id,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)

    if (!problem || problem.isDeleted) {
      return res.status(404).json({ message: "Problem not found" })
    }

    if (problem.isPublished) {
      return res.status(400).json({
        message: "Unpublish the problem before deleting it",
      })
    }

    problem.isDeleted = true
    await problem.save()

    res.status(200).json({
      message: "Problem deleted successfully",
      problemId: problem._id,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

export const getProblems = async (req, res) => {
  try {
    let { page = 1, limit = 20, difficulty, topic, search } = req.query

    page = Number(page)
    limit = Number(limit)

    const query = { isDeleted: false }

    if (req.user?.role !== "admin") {
      query.isPublished = true
    }

    if (difficulty) query.difficulty = difficulty.toLowerCase()
    if (topic) query.topics = { $regex: new RegExp(`^${topic}$`, "i") }
    if (search) query.$text = { $search: search }

    const skip = (page - 1) * limit

    const [problems, total] = await Promise.all([
      Problem.find(query)
        .select("-hiddenTestcases -driverCode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Problem.countDocuments(query),
    ])

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalProblems: total,
      problems,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = Problem.findById(id).select("+driverCode");
    
    if (req.user && req.user.role === "admin") {
      query = query.select("+hiddenTestcases");
    }

    const problem = await query.exec();

    if (!problem || problem.isDeleted) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (!problem.isPublished && !(req.user && req.user.role === "admin")) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.status(200).json({ problem });
  } catch (error) {
    console.error("Error fetching problem by ID: " + error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProblemMetadata = async (req, res) => {
  try {
    const stats = await Problem.aggregate([
      { $match: { isPublished: true, isDeleted: false } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } }
    ]);

    const counts = { easy: 0, medium: 0, hard: 0 };
    let total = 0;
    stats.forEach(s => {
      counts[s._id] = s.count;
      total += s.count;
    });

    res.status(200).json({ counts, totalProblems: total });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};