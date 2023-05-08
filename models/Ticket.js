const mongoose = require("mongoose");

const ticketSchema = mongoose.Schema(
  {
    doctor: {
      type: String,
      required: true,
    },
    patient: {
      type: String,
      required: true,
    },
    approved: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("ticket", ticketSchema);

module.exports = Ticket;
