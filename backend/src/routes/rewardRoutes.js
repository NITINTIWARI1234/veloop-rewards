const express = require("express");

const {
  getRewardItems,
  redeemReward,
} = require("../controllers/rewardItemController");

const router = express.Router();

router.get("/", getRewardItems);

router.post("/redeem", redeemReward);

module.exports = router;