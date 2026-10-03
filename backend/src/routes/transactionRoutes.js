const express = require("express");

const {
  getTransactions,
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/:userId", getTransactions);

module.exports = router;