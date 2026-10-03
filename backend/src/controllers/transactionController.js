const Transaction = require("../models/Transaction");

const getTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 });

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

module.exports = {
  getTransactions,
};