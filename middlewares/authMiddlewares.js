const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserToken = require("../models/UserToken");
const Doctor = require("../models/Doctor");
const DoctorToken = require("../models/DoctorToken");

const handleErrors = (err) => {
  const error = { message: err.message };
};

function userAuth(req, res, next) {
  // Get jwt cookie from request
  // Return the encoded token if found or undefind if not
  const token = req.cookies.jwt;
  // Error code 401 Unauthorized
  if (!token) return res.status(406).json({ message: "Login to proceed" });
  jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
    if (err) {
      // Not Acceptable
      return res.status(401).json({ message: "Not acceptable token" });
    } else {
      // Look for the token on the database
      UserToken.findById(decodedToken.id)
        .then((result) => {
          // Look if the token refers to a real account or not
          User.findById(result.userId).then((user) => {
            if (user) next(); // Need to add banned check here
            // Error code 403 Forbidden
            else res.status(403).json({ message: "User is banned" });
          });
        })
        .catch((err) => {
          res.status(403).json({ message: "Invalid Token Login To Proceed" });
        });
    }
  });
}
function doctorAuth(req, res, next) {
  // Get jwt cookie from request
  // Return the encoded token if found or undefind if not
  const token = req.cookies.doctorjwt;
  // Error code 401 Unauthorized
  if (!token) res.status(406).json({ message: "Login to proceed" });
  jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
    if (err) {
      // Not Acceptable
      return res.status(401).json({ message: "Not acceptable token" });
    } else {
      // Look for the token on the database
      DoctorToken.findById(decodedToken.id)
        .then((result) => {
          // Look if the token refers to a real account or not
          Doctor.findById(result.doctorId)
            .then((doctor) => {
              if (doctor) next(); // Need to add banned check here
              // Error code 403 Forbidden
              else res.status(403).json({ message: "User is banned" });
            })
            .catch((err) => {
              res
                .status(403)

                .cookie("adminjwt", "", {
                  maxAge: 100,
                  ...{ sameSite: "none", secure: true },
                })
                .json({ message: "You dont have the role for this action" });
            });
        })
        .catch((err) => {
          res
            .status(403)
            .cookie("doctorjwt", "", {
              maxAge: 100,
              ...{ sameSite: "none", secure: true },
            })
            .json({ message: "Invalid Token Login To Proceed" });
        });
    }
  });
}

module.exports = { userAuth, doctorAuth };
