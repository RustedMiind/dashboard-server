const mongoose = require("mongoose");

const doctorTokenSchema = mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
    unique: true,
  },
});

const DoctorToken = mongoose.model("doctorToken", doctorTokenSchema);

module.exports = DoctorToken;
