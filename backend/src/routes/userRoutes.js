const express = require("express");

const {
  getUser,
  getDailyProgress,
} = require("../controllers/userController");

const router = express.Router();

router.get("/:userId", getUser);

router.get("/:userId/daily-progress", getDailyProgress);

module.exports = router;