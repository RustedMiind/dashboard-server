const Doctor = require("../models/Doctor");
const User = require("../models/User");
const UserToken = require("../models/UserToken");
const bcrypt = require("bcrypt");
const Ticket = require("../models/Ticket");
const jwt = require("jsonwebtoken");

const userUI = (user) => {
  const { password, createdAt, updatedAt, ...data } = user._doc;
  return data;
};

const handleErrors = function (err) {
  const error = { message: err };
  if (typeof err === "string") {
    return error;
  }
  // return error;
  if (err.code === 11000 && err.keyPattern.phone === 1) {
    error.message = "This phone number is registered already";
  } else if (err.code === 11000 && err.keyPattern.userId === 1) {
    error.message =
      "This user has another login session, do you want to login anyways?";
  } else if (err.message.includes("fName")) {
    error.message = "Your first name is Required";
  } else if (err.message.includes("fName")) {
    error.message = "Your last name is Required";
  } else if (err.message.includes("phone")) {
    error.message = "Your phone number is Required";
  } else if (err.message.includes("address")) {
    error.message = "Your address is Required";
  } else if (err.message.includes("city")) {
    error.message = "The city is Required";
  }
  return { error };
};

// Create Json Web token function
const DAY = 1000 * 60 * 60 * 24;
const createToken = (id, days = 1) => {
  return jwt.sign({ id }, process.env.SECRET, {
    expiresIn: DAY * days,
  });
};

module.exports.login = (req, res) => {
  const { phone, password } = req.body;
  User.login(phone, password)
    .then((user) => {
      res.cookie("jwt", user.token, { maxAge: DAY });
      res.json(user.user);
    })
    .catch((err) => {
      res.json(handleErrors(err));
    });
};

module.exports.getusertickets = function (req, res) {
  const token = req.cookies.jwt;
  // Error code 401 Unauthorized
  if (!token) return res.status(406).json({ message: "No login token found" });
  jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
    if (err) {
      res.cookie("jwt", "temp", { maxAge: 100 });
      // Not Acceptable
      return res.status(401).json({ message: "Not acceptable token" });
    } else {
      // Look for the token on the database
      UserToken.findById(decodedToken.id)
        .then((result) => {
          // Look if the token refers to a real account or not
          if (!result) {
            res.status(403).json({
              message:
                "Login Session Expired or This account is logged in on another device",
            });
          } else {
            Ticket.find({ patient: result.userId, approved: false })
              .then((tickets) => {
                if (tickets) {
                  res.status(200).json(tickets);
                } // Need to add banned check here
                // Error code 403 Forbidden
                else res.status(403).json({ message: "Doctor is banned" });
              })
              .catch((err) => {
                res.status(403).json({ message: "No Tickets" });
              });
          }
        })
        .catch((err) => {
          res.status(403).json({ message: "No Login" });
          console.log(err);
        });
    }
  });
};

module.exports.logout = (req, res) => {
  res.cookie("jwt", "LogOutTokennnn", { maxAge: 100 });
  res.status(200).json({ message: "Logged out successfully" });
};
module.exports.forcelogin = (req, res) => {
  const { phone, password } = req.body;
  User.forcelogin(phone, password)
    .then((user) => {
      res.cookie("jwt", user.token, { maxAge: DAY });
      res.json(user.user);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
module.exports.checkuser = (req, res) => {
  const token = req.cookies.jwt;
  // Error code 401 Unauthorized
  if (!token) return res.status(406).json({ message: "No login token found" });
  jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
    if (err) {
      res.cookie("jwt", "temp", { maxAge: 100 });
      // Not Acceptable
      return res.status(401).json({ message: "Not acceptable token" });
    } else {
      // Look for the token on the database
      UserToken.findById(decodedToken.id)
        .then((result) => {
          // Look if the token refers to a real account or not
          if (!result) {
          } else {
            User.findById(result.userId)
              .then((user) => {
                if (user) {
                  res.status(200).json(userUI(user));
                } // Need to add banned check here
                // Error code 403 Forbidden
                else res.status(403).json({ message: "User is banned" });
              })
              .catch((err) => {
                res.status(403).json({ message: "No Login" });
                res.cookie("jwt", "temp", { maxAge: 100 });
                console.log(err);
              });
          }
        })
        .catch(() => {
          res.status(403).json({ message: "No Login" });
        });
    }
  });
};
module.exports.register = async (req, res) => {
  const user = new User({
    fName: req.body.fName,
    lName: req.body.lName,
    password: req.body.password,
    phone: req.body.phone,
    address: req.body.address,
    city: req.body.city,
  });
  try {
    const response = await user.save();
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json(handleErrors(error));
  }
};
module.exports.getalldoctors = async (req, res) => {
  const doctors = await Doctor.find({});
  try {
    res
      .status(200)
      .json(doctors.map((doctor) => ({ name: doctor.name, _id: doctor._id })));
  } catch (error) {
    res.status(400).json(error);
  }
};
module.exports.getall = async (req, res) => {
  const users = await User.find({});
  try {
    res.json(users);
  } catch (error) {
    res.json(error);
  }
};
