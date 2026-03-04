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
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    Object.assign(problem, req.body);
    await problem.save();

    res.json({
      message: "Problem updated successfully",
      problem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const publishProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true }
    );

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json({
      message: "Problem published successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};