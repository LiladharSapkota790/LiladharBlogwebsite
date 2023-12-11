const express = require('express');
const adminrouter = express.Router();
const mongoose = require("mongoose");

const Message = require('../models/customerMessage');

const {
  authUser,
  checkAuthenticated,
  checkNotAuthenticated,
  authRole,
  adminUser
} = require("../middleware/auth");


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

  adminrouter.route('/subscriber')

  .get(checkAuthenticated, (req, res) => {
    Email.find({},
      function(err, foundemails) {
        if (!err) {
          if (foundemails.length > 0) {
            res.render("subscriber", {
              emailnotfound: "Subscriber Found",
              emails: foundemails
            });
          } else {
            res.render("subscriber", {
              emails: foundemails,
              emailnotfound: " No Subscriber  found"
            });
          }
        }
      });
  })

  .post((req, res) => {
    const email = req.body.email;
    console.log(email);
    const email1 = new Email({
      email: email
    });
    email1.save();
    res.redirect("/thanks");
  })







  module.exports= adminrouter;
