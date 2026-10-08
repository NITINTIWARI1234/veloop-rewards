const express = require("express");

const {
  getTransactions,
  getRecentEarnings,
  getWalletSummary,
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/:userId", getTransactions);

router.get("/:userId/wallet-summary", getWalletSummary);

router.get("/:userId/recent-earnings", getRecentEarnings);

module.exports = router;