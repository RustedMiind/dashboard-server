const Doctor = require("../models/Doctor");
const jwt = require("jsonwebtoken");
const DoctorToken = require("../models/DoctorToken");
const Ticket = require("../models/Ticket");

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

module.exports.getnewtickets = function (req, res) {
  const token = req.cookies.doctorjwt;
  // Error code 401 Unauthorized
  if (!token) return res.status(406).json({ message: "No login token found" });
  jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
    if (err) {
      res.cookie("doctorjwt", "temp", {
        maxAge: 100,
        ...{ sameSite: "none", secure: true },
      });
      // Not Acceptable
      return res.status(401).json({ message: "Not acceptable token" });
    } else {
      // Look for the token on the database
      DoctorToken.findById(decodedToken.id)
        .then((result) => {
          // Look if the token refers to a real account or not
          if (!result) {
            res.status(403).json({
              message:
                "Login Session Expired or This account is logged in on another device",
            });
          } else {
            Ticket.find({ doctor: result.doctorId, approved: false })
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
        .catch(() => {
          res.status(403).json({ message: "No Login" });
        });
    }
  });
};

module.exports.approveticket = function (req, res) {
  const ticketId = req.params.id;
  Ticket.findByIdAndUpdate(ticketId, { approved: true }, { new: true })
    .then((result) => {
      Ticket.find({ doctor: result.doctor, approved: false })
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
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};
module.exports.deleteTicket = function (req, res) {
  const ticketId = req.params.id;
  Ticket.findById(ticketId)
    .then((result) => {
      Ticket.findByIdAndDelete(ticketId).then(() => {
        Ticket.find({ doctor: result.doctor, approved: false })
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
      });
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};

module.exports.testcheck = (req, res) => {
  res.cookie("temp", "01095574449", {
    maxAge: 100000,
    ...{ sameSite: "none", secure: true },
  });
  res.status(200).json({ data: "Hello" });
};

module.exports.checkdoctor = (req, res) => {
  const token = req.cookies.doctorjwt;
  // Error code 401 Unauthorized
  if (!token) return res.status(406).json({ message: "No login token found" });
  jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
    if (err) {
      res.cookie("doctorjwt", "temp", {
        maxAge: 100,
        ...{ sameSite: "none", secure: true },
      });
      // Not Acceptable
      return res.status(401).json({ message: "Not acceptable token" });
    } else {
      // Look for the token on the database
      DoctorToken.findById(decodedToken.id)
        .then((result) => {
          // Look if the token refers to a real account or not
          if (!result) {
            res.status(403).json({
              message:
                "Login Session Expired or This account is logged in on another device",
            });
          } else {
            Doctor.findById(result.doctorId)
              .then((doctor) => {
                if (doctor) {
                  res.status(200).json(doctorUI(doctor));
                } // Need to add banned check here
                // Error code 403 Forbidden
                else res.status(403).json({ message: "Doctor is banned" });
              })
              .catch((err) => {
                res
                  .status(403)
                  .json({ message: "No Login" })
                  .cookie("doctorjwt", "temp", {
                    maxAge: 100,
                  });
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

module.exports.login = (req, res) => {
  const { username, password } = req.body;
  Doctor.login(username, password)
    .then((doctor) => {
      res
        .status(200)
        .cookie("doctorjwt", doctor.token, {
          maxAge: DAY,
          ...{ sameSite: "none", secure: true },
        })
        .json(doctor.doctor);
    })
    .catch((err) => {
      res.status(400).json(handleErrors(err));
    });
};
module.exports.update = (req, res) => {
  const token = req.cookies.doctorjwt;
  // Error code 401 Unauthorized
  if (!token) return res.status(406).json({ message: "No login token found" });
  jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
    if (err) {
      res.cookie("doctorjwt", "temp", {
        maxAge: 100,
        ...{ sameSite: "none", secure: true },
      });
      // Not Acceptable
      return res.status(401).json({ message: "Not acceptable token" });
    } else {
      // Look for the token on the database
      DoctorToken.findById(decodedToken.id)
        .then((result) => {
          // Look if the token refers to a real account or not
          if (!result) {
          } else {
            Doctor.findByIdAndUpdate(result.doctorId, req.body, { new: true })
              .then((doctor) => {
                if (doctor) {
                  res.status(200).json(doctorUI(doctor));
                } // Need to add banned check here
                // Error code 403 Forbidden
                else res.status(403).json({ message: "Doctor is banned" });
              })
              .catch((err) => {
                res.status(403).json({ message: "No Login" });
                res.cookie("doctorjwt", "temp", {
                  maxAge: 100,
                  ...{ sameSite: "none", secure: true },
                });
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
  const doctor = new Doctor(req.body);
  try {
    const response = await doctor.save();
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json(handleErrors(error));
  }
};

function doctorUI(doctor) {
  const { password, createdAt, updatedAt, ...data } = doctor._doc;
  return data;
}
