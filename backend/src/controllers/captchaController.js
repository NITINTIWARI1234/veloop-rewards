const Captcha = require("../models/Captcha");

const getCaptcha = async (req, res) => {
  try {
    const captcha = await Captcha.findOne({
      isActive: true,
    });

    if (!captcha) {
      return res.status(404).json({
        success: false,
        message: "No CAPTCHA available",
      });
    }

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