const mongoose = require("mongoose");

const dbURI =
  "mongodb+srv://bodykoko2002:test123123@dashboard.8xh6dah.mongodb.net/?retryWrites=true&w=majority";
const connectDB = (cb) => {
  mongoose
    .connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then((result) => cb())
    .catch((err) => cb(err));
};

module.exports = connectDB;
