const express = require("express");

const {
  getCaptcha,
  verifyCaptcha,
} = require("../controllers/captchaController");

const router = express.Router();

router.get("/", getCaptcha);

router.post("/verify", verifyCaptcha);

module.exports = router;