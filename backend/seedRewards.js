const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
require("dotenv").config();

const RewardItem = require("./src/models/RewardItem");

const rewards = [
  {
    name: "₹50 Amazon Voucher",
    description: "Redeem your Gems for a ₹50 Amazon voucher.",
    cost: 50,
    isActive: true,
  },
  {
    name: "₹100 Amazon Voucher",
    description: "Redeem your Gems for a ₹100 Amazon voucher.",
    cost: 100,
    isActive: true,
  },
  {
    name: "₹50 Flipkart Voucher",
    description: "Redeem your Gems for a ₹50 Flipkart voucher.",
    cost: 50,
    isActive: true,
  },
  {
    name: "₹100 Flipkart Voucher",
    description: "Redeem your Gems for a ₹100 Flipkart voucher.",
    cost: 100,
    isActive: true,
  },
];

async function seedRewards() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    await RewardItem.deleteMany({});

    const createdRewards = await RewardItem.insertMany(rewards);

    console.log(`${createdRewards.length} rewards created successfully`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Seed rewards error:", error.message);
    process.exit(1);
  }
}

seedRewards();