const mongoose = require("mongoose");

const emailSchema = {
  email: String,
  date: {
    type: Date,
    default: Date.now
  }
};


const Email = new mongoose.model("Email", emailSchema);

module.exports = Email;
