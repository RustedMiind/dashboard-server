const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("./db");
const cors = require("cors");
require("dotenv").config();
// Importing Routes and Models
const userRoutes = require("./routes/userRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

// Defining App
const app = express();

// Middlewares :
app.use(
  cors({
    preflightContinue: true,
    origin: ["http://localhost:3000", "https://labdigitalsystem-lds.web.app"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  })
);
app.use(function (req, res, next) {
  res.header("Set-Cookie: cross-site-cookie=whatever; SameSite=None; Secure");
  next();
});
app.use(cookieParser());
app.use(express.json());

// Connect to Database :
db((err) => {
  if (err) {
    console.log(err);
    return;
  }
  app.listen(3100);
  console.log(
    "||||||||||||  LISTENING ON http://localhost:3100/  ||||||||||||"
  );
});

app.use("/api", userRoutes);
app.use("/controlpanel", doctorRoutes);
app.use("/ticket", ticketRoutes);
