const Transaction = require("../models/Transaction");
const User = require("../models/User");

const getTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({ userId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Transaction error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getRecentEarnings = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({
      userId,
      type: "EARN",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      earnings: transactions,
    });
  } catch (error) {
    console.error("Recent earnings error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getWalletSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
        },
      },
      {
        $group: {
          _id: "$type",
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    let totalEarned = 0;
    let totalRedeemed = 0;

    summary.forEach((item) => {
      if (item._id === "EARN") {
        totalEarned = item.total;
      }

      if (item._id === "REDEEM") {
        totalRedeemed = item.total;
      }
    });

    res.json({
      success: true,
      wallet: {
        currentGems: user.gems,
        totalEarned,
        totalRedeemed,
        calculatedBalance: totalEarned - totalRedeemed,
      },
    });
  } catch (error) {
    console.error("Wallet summary error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getTransactions,
  getWalletSummary,
  getRecentEarnings,
};