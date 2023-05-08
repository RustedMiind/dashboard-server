const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const db = require("./db");
require("dotenv").config();
// Importing Routes and Models
const userRoutes = require("./routes/userRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

// Defining App
const app = express();

// Middlewares :
app.use(express.json());
app.use(cookieParser());

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
