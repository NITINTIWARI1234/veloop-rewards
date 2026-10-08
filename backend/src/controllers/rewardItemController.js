const RewardItem = require("../models/RewardItem");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const getRewardItems = async (req, res) => {
  try {
    const rewardItems = await RewardItem.find({
      isActive: true,
    }).sort({ cost: 1 });

    res.json({
      success: true,
      rewards: rewardItems,
    });
  } catch (error) {
    console.error("Get reward items error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const redeemReward = async (req, res) => {
  const session = await RewardItem.startSession();

  try {
    const { userId, rewardId } = req.body;

    if (!userId || !rewardId) {
      return res.status(400).json({
        success: false,
        message: "userId and rewardId are required",
      });
    }

    session.startTransaction();

    const user = await User.findById(userId).session(session);

    if (!user) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const reward = await RewardItem.findOne({
      _id: rewardId,
      isActive: true,
    }).session(session);

    if (!reward) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Reward not found",
      });
    }

    if (user.gems < reward.cost) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Not enough Gems",
      });
    }

    user.gems -= reward.cost;

    await user.save({ session });

    await Transaction.create(
      [
        {
          userId: user._id,
          type: "REDEEM",
          amount: reward.cost,
          source: "REWARD",
          description: `Redeemed ${reward.name}`,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: `Successfully redeemed ${reward.name}.`,
      gems: user.gems,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Redeem reward error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getRewardItems,
  redeemReward,
};