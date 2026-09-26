const express = require("express");

const { getCaptcha } = require("../controllers/captchaController");

const router = express.Router();

router.get("/", getCaptcha);

module.exports = router;