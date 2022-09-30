const mongoose = require("mongoose");

const messageSchema = {
    email2: String,
    fullname: String,
    message: String
  };
  
  const Message = new mongoose.model("Message", messageSchema);


module.exports = Message;