const Ticket = require("../models/Ticket");
const UserToken = require("../models/UserToken");
const jwt = require("jsonwebtoken");

module.exports.newticket = async function (req, res) {
  const { doctor, patient } = req.body;
  const token = req.cookies.jwt;
  // Error code 401 Unauthorized
  if (!token) return res.status(406).json({ message: "No login token found" });
  jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
    if (err) {
      res.cookie("jwt", "temp", { httpOnly: true, maxAge: 100 });
      // Not Acceptable
      return res.status(401).json({ message: "Not acceptable token" });
    } else {
      // Look for the token on the database
      UserToken.findById(decodedToken.id)
        .then((result) => {
          const ticket = new Ticket({
            doctor,
            patient: result.userId,
            approved: false,
          });
          ticket
            .save()
            .then((result) => {
              res.status(200).json(result);
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        })
        .catch((err) => {
          res.status(404).json(err);
        });
    }
  });
};
module.exports.update = function (req, res) {
  let tokenId;
  if (req.body && req.body.id) {
    tokenId = req.body.id;
    const { id, ...dataToUpdate } = req.body;
    Ticket.findByIdAndUpdate(tokenId, { dataToUpdate }, { new: true })
      .then((ticket) => {
        res.status(200).json(ticket);
      })
      .catch((err) => {
        res.status(401).json(err);
      });
  } else {
    res.json({ error: "Invalid Data Provided" });
  }
};
