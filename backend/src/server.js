
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const healthRoutes = require("./routes/healthRoutes");
const captchaRoutes = require("./routes/captchaRoutes");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/health", healthRoutes);
app.use("/api/captcha", captchaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "VELOop Rewards API is running",
  });
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect MongoDB
connectDB();
