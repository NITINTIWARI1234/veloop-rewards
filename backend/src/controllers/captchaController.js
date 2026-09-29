const Captcha = require("../models/Captcha");

const getCaptcha = async (req, res) => {
  try {
    // Temporary CAPTCHA for frontend testing
    const captcha = {
      question: "AB7K9",
      correctAnswer: "AB7K9",
      reward: 1,
    };

    res.json({
      success: true,
      captcha,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getCaptcha,
};