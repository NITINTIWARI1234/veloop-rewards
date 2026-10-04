const User = require("../models/User");
const Transaction = require("../models/Transaction");

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        gems: user.gems,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error("Get user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getDailyProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const completed = await Transaction.countDocuments({
      userId,
      type: "EARN",
      source: "CAPTCHA",
      createdAt: { $gte: startOfDay },
    });

    const limit = 5;
    const remaining = Math.max(limit - completed, 0);

    res.json({
      success: true,
      progress: {
        completed,
        limit,
        remaining,
      },
    });
  } catch (error) {
    console.error("Daily progress error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getUser,
  getDailyProgress,
};