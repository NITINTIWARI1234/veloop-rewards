const mongoose = require("mongoose");

const captchaSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length === 4;
        },
        message: "CAPTCHA must have exactly 4 options",
      },
    },

    correctAnswer: {
      type: String,
      required: true,
    },

    reward: {
      type: Number,
      default: 1,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Captcha", captchaSchema);