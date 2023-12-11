const express = require("express");
const router = express.Router();
const _ = require("lodash");
const {
  authUser,
  authRole,
  checkAuthenticated,
  checkNotAuthenticated,
  adminUser,
} = require("../middleware/auth");

/*Requiring post and email model here */

const Post = require("../models/post");

const Email = require("../models/email");

/*this is handling all the messges */
const Message = require("../models/customerMessage");

const User = require("../models/user");

/*<><><><>< static pages <><><><><*/

router.get("/", (req, res) => {
  res.render("index", {
    errmsgfromsubscribeform: "",
  });
});

router.get("/about", function (req, res) {
  res.render("about");
});

router.get("/contact", function (req, res) {
  res.render("contact", {
    contact: "contactContent",
  });
});

router.get("/thanks", function (req, res) {
  res.render("thanks");
});

/*error page*/
router.get("/404", (req, res) => {
  res.render("404");
});

/*for contributor*/
router.get("/register-form", (req, res) => {
  res.render("registerformforcontributor");
});


/*_____________________Static page ends here_________*/

/*____________________________________________________________________________________*/

/*Page related to database*/

/*creating note when there are no posts in content*/
router.get("/content", function (req, res) {
  Post.find({}, function (err, foundposts) {
    if (!err) {
      res.render("home", {
        allposts: foundposts.slice(0, 10),
      });
    }
  });
});

/*getting all in one */

router.get("/allpostsinone", function (req, res) {
  Post.find({}, function (err, foundposts) {
    if (!err) {
      res.render("allposts", {
        allposts: foundposts,
      });
    }
  });
});

/*for posts*/
router.get("/allposts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;
  /*const requestedPostId = req.params.postId.toString();*/
  console.log(requestedPostId + "tt");
  Post.findOne(
    {
      _id: requestedPostId,
    },
    function (err, foundpost) {
      if (err) {
        console.log(err);
      } else {
        res.render("post", {
          posttitle: foundpost.posttitle,
          postbody: foundpost.postbody,
        });
        console.log(foundpost + " err From posts/route");
      }
    }
  );
});

/*Editing a document*/

router.post("/edit", (req, res) => {
  const checkItemName = req.body.checkboxforedit;
  Post.update(
    {
      _id: checkItemName,
    },
    {
      $set: {
        posttitle: req.body.posttitle,
        postbody: req.body.postbody,
      },
    },
    function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log("Post Updated successfully");
        res.render("", {errmsgfromsubscribeform:""});
      }
    }
  );
});
/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/*Handling all related post route*/

router.get("/topics/related/:topicName", function (req, res) {
  console.log(req.params.topicName);
  const requestedtopicName = _.capitalize(req.params.topicName);
  console.log(requestedtopicName);
  Post.find(
    {
      topic: requestedtopicName,
    },
    function (err, foundtopic) {
      console.log(foundtopic);
      if (err) {
        console.log(err);
      } else {
        if (!foundtopic) {
          console.log("doesnot exists");
          res.redirect("/404");
        } else if (foundtopic.length === 0) {
          res.render("nocontent", {
            topic: "No post Found",
            allposts: "No Post related to this topic available",
          });
        } else {
          res.render("specifictopic", {
            topic: foundtopic.topic,
            allposts: foundtopic,
          });
        }
      }
    }
  );
});

router.post("/delete", checkAuthenticated, (req, res) => {
  console.log(req.body);
  const checkedItemid = req.body.checkboxfordelete;
  const checkItemName = req.body.checkboxforedit;
  Post.findByIdAndRemove(checkedItemid, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Deleted Successfully");
    }
  });
  res.redirect("/allpostsforadminonly");
});

/*<L><<><><><<><><><><<><<><><><<><><><><><><><>*/

/*To create a post */
router.post("/compose", checkAuthenticated, function (req, res) {
  const post = new Post({
    topic: req.body.topic,
    posttitle: req.body.posttitle,
    postbody: req.body.postbody,
    postedby: req.body.username,
  });
  post.save(function (err) {
    if (!err) {
      console.log("Created Successfully");
      req.flash("success", "Post created Successfully");
      res.redirect("/admin/compose");
    }
  });
});

/*To handle a contact message */
router.post("/CustomerMessage", (req, res) => {
  var customermessages = {
    email2: req.body.customerEmail,
    fullname: req.body.customerFullname,
    message: req.body.customerDescription,
  };

  console.log(customermessages);
  Message.create(customermessages, (err, item) => {
    console.log(customermessages);
    console.log(item + "item");
    if (err) {
      console.log(err);
    } else {
      // item.save();
      res.redirect("/thanks");
    }
  });
});

/*===========================strictly for admin only ============*/

router.get("/admindashboard", checkAuthenticated, (req, res) => {
  var postQuery;
  Post.find({}, function (err, foundposts) {
    if (err) {
      console.log(err);
    }

    postQuery = foundposts;
    postCount = foundposts.length;
    /*console.log(foundposts);*/
  });

  var messageQuery;
  Message.find({}, (err, foundMessages) => {
    if (err) {
      console.log(err);
    }
    messageQuery = foundMessages;
    messageCount = foundMessages.length;
  });

  var emailsQuery;

  Email.find({}, function (err, foundemails) {
    countEmails = foundemails.length;
    console.log(countEmails);
    if (err) {
      console.log(err);
    }
    emailsQuery = foundemails;
    countEmails = emailsQuery.length;
  });

  res.render("admindashboard1", {
    user: req.user.username,
    postCount: postCount,
    countEmails: countEmails,
    messageCount: messageCount,
  });
});

router.get("/admin/compose", checkAuthenticated, function (req, res) {
  res.render("compose", {
    topic: req.body.topic,
  });
});

router.get("/admin/allmessages", checkAuthenticated, (req, res) => {
  Message.find({}, (err, foundMessage) => {
    if (err) {
      console.log(err);
    } else {
      res.render("allmessages", {
        allmessage: foundMessage,
        messageCount: foundMessage.length,
      });
    }
  });
});

router
  .route("/subscriber")
  .get(checkAuthenticated, (req, res) => {
    Email.find({}, function (err, foundemails) {
      if (!err) {
        if (foundemails.length > 0) {
          res.render("subscriber", {
            emailnotfound: "Subscriber Found",
            emails: foundemails,
          });
        } else {
          res.render("subscriber", {
            emails: foundemails,
            emailnotfound: " No Subscriber  found",
          });
        }
      }
    });
  })

  .post((req, res) => {
    const email = req.body.email;
    console.log(email);

    Email.findOne(
      {
        email: email,
      },
      function (err, result) {
        if (err) throw err;
        if (result) {
          console.log("Email exists" + result);
          res.render("index", {
            errmsgfromsubscribeform:
              "This Email " + result.email + " already exists. ",
          });
        } else {
          console.log("Email does not exist");
          const email1 = new Email({
            email: email,
          });
          email1.save();
          res.redirect("/thanks");
        }
      }
    );

    /*  const email1 = new Email({
        email: email
      });
      email1.save();*/
  });

router.post("/subscriber/delete", checkAuthenticated, (req, res) => {
  console.log(req.body);

  const checkItemId = req.body.checkboxofsubscriberdelete;

  Email.findByIdAndRemove(checkItemId, function (err) {
    if (err) {
      console.log(err);
    } else {
      req.flash("success", "deleted");
      req.render("subscriber");
    }
  });
  return;
  res.redirect("/subscriber");
});

/*<><><<><><><><*/

/*Getting posts by usernaem*/

router.get(
  "/users/posts/postedby/:username",
  checkAuthenticated,
  (req, res) => {
    /*const requestedusername = _.capitalize(req.params.username);*/
    console.log(req.user);
    console.log(req.user.username);
    const requestedusername = req.user.username;
    console.log(requestedusername);
    Post.find(
      {
        postedby: requestedusername,
      },
      function (err, foundpost) {
        if (err) {
          console.log(err);
        } else {
          res.render("allpostsadmin", {
            allposts: foundpost,
            nopostfound: "",
          });
        }
      }
    );
  }
);

/*This is to delete and manage the posts*/
router.get("/allpostsforadminonly", checkAuthenticated, (req, res) => {
  Post.find({}, function (err, foundposts) {
    if (err) {
      console.log(err);
    } else {
      res.render("allpostsadmin", {
        allposts: foundposts,
      });
    }
  });
});

module.exports = router;
