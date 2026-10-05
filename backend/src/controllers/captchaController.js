const Captcha = require("../models/Captcha");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const getCaptcha = async (req, res) => {
  try {
    const captcha = await Captcha.findOne({
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!captcha) {
      return res.status(404).json({
        success: false,
        message: "No CAPTCHA available",
      });
    }

    res.json({
      success: true,
      captcha: {
        id: captcha._id,
        question: captcha.question,
        options: captcha.options,
        reward: captcha.reward,
        expiresAt: captcha.expiresAt,
      },
    });
  } catch (error) {
    console.error("CAPTCHA error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const verifyCaptcha = async (req, res) => {
  try {
    const { captchaId, answer, userId } = req.body;

    if (!captchaId || !answer || !userId) {
      return res.status(400).json({
        success: false,
        message: "captchaId, answer and userId are required",
      });
    }

    const captcha = await Captcha.findById(captchaId);

    if (!captcha) {
      return res.status(404).json({
        success: false,
        message: "CAPTCHA not found",
      });
    }

    if (!captcha.isActive || captcha.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "CAPTCHA has expired",
      });
    }

    if (captcha.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "CAPTCHA does not belong to this user",
      });
    }

    if (
      answer.trim().toUpperCase() !==
      captcha.correctAnswer.trim().toUpperCase()
    ) {
      return res.status(400).json({
        success: false,
        message: "Wrong CAPTCHA",
      });
    }

    // Check daily CAPTCHA limit
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const DAILY_LIMIT = 5;

    const todayCompletedChecks = await Transaction.countDocuments({
      userId,
      type: "EARN",
      source: "CAPTCHA",
      createdAt: { $gte: startOfDay },
    });

    if (todayCompletedChecks >= DAILY_LIMIT) {
      return res.status(400).json({
        success: false,
        message: "Daily CAPTCHA limit reached. Come back tomorrow.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.gems += captcha.reward;

    const now = new Date();

    if (!user.lastCompletedAt) {
      // First completed challenge
      user.streak = 1;
    } else {
      const lastDate = new Date(user.lastCompletedAt);

      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const lastCompletedDay = new Date(
        lastDate.getFullYear(),
        lastDate.getMonth(),
        lastDate.getDate()
      );

      const differenceInDays =
        (today - lastCompletedDay) / (1000 * 60 * 60 * 24);

      if (differenceInDays === 1) {
        // Completed on the next consecutive day
        user.streak += 1;
      } else if (differenceInDays > 1) {
        // Missed one or more days
        user.streak = 1;
      }

      // Same-day completion keeps the streak unchanged
    }

    user.lastCompletedAt = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: "EARN",
      amount: captcha.reward,
      source: "CAPTCHA",
      description: "Completed CAPTCHA challenge",
    });

    captcha.isActive = false;
    await captcha.save();

    res.json({
      success: true,
      message: `Correct! You earned +${captcha.reward} Gem.`,
      gems: user.gems,
      streak: user.streak,
    });
  } catch (error) {
    console.error("Verify CAPTCHA error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getCaptcha,
  verifyCaptcha,
};