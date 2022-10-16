const express = require('express');
const adminrouter = express.Router();
const mongoose = require("mongoose");

const Message = require('../models/customerMessage');


adminrouter.get('/contact', (req, res) => {
res.render("contact",{
    contact: "contactContent"
});
})




adminrouter.get("/admin/allmessages", (req, res) => {
    Message.find({}, (err, foundMessage) => {
      if (err) {
        console.log(err);
      } else {
        res.render("allmessages", {
          allmessage: foundMessage,
          messageCount: foundMessage.length
        });
      }
    });
  })








  module.exports= adminrouter;
