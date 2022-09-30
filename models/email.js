const mongoose = require("mongoose");

const emailSchema = {
    email: String
  };

  
const Email = new mongoose.model("Email", emailSchema);

module.exports = Email;