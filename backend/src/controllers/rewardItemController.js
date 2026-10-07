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
    try {
        const { userId, rewardId } = req.body;

        if (!userId || !rewardId) {
            return res.status(400).json({
                success: false,
                message: "userId and rewardId are required",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const reward = await RewardItem.findOne({
            _id: rewardId,
            isActive: true,
        });

        if (!reward) {
            return res.status(404).json({
                success: false,
                message: "Reward not found",
            });
        }

        if (user.gems < reward.cost) {
            return res.status(400).json({
                success: false,
                message: "Not enough Gems",
            });
        }

        user.gems -= reward.cost;

        await user.save();

        await Transaction.create({
            userId: user._id,
            type: "REDEEM",
            amount: reward.cost,
            source: "REWARD",
            description: `Redeemed ${reward.name}`,
        });

        res.json({
            success: true,
            message: `Successfully redeemed ${reward.name}.`,
            gems: user.gems,
        });
    } catch (error) {
        console.error("Redeem reward error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = {
    getRewardItems,
    redeemReward,
};