const express = require('express');
const router = express.Router();
const _ = require("lodash");
const {authUser} = require('../middleware/auth');


/*Requiring post and email model here */

const Post= require('../models/post');

const Email= require('../models/email');

/*this is handling all the messges */
const Message = require('../models/customerMessage');

/*<><><><>< static pages <><><><><*/

router.get("/", (req, res) => {


  res.render("index");
})

router.get("/about", function(req, res) {
  res.render("about");
});

router.get("/contact", function(req, res) {
  res.render("contact", {
    contact: "contactContent"
  });
});

router.get("/thanks", function(req, res) {
  res.render("thanks");
});

/*error page*/
router.get("/404", (req, res) => {
  res.render("404");
})

/*for contributor*/
router.get("/register-form", (req, res) => {
  res.render("registerformforcontributor");
});


/*_____________________Static page ends here_________*/



/*____________________________________________________________________________________*/

/*Page related to database*/

/*creating note when there are no posts in content*/
router.get("/content", function(req, res) {
  Post.find({}, function(err, foundposts) {
    if (!err) {
      res.render("home", {
        allposts: foundposts.slice(0, 10)
      });
    }
  })
});



/*for posts*/
router.get("/allposts/:postId", function(req, res) {
  const requestedPostId = req.params.postId;
  /*const requestedPostId = req.params.postId.toString();*/
  console.log(requestedPostId + "tt");
  Post.findOne({
    _id: requestedPostId
  }, function(err, foundpost) {
    if (err) {
      console.log(err);
    } else {
      res.render("post", {
        posttitle: foundpost.posttitle,
        postbody: foundpost.postbody
      });
      console.log(foundpost + " err From posts/route");
    }
  });
});

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/*Handling all related post route*/



router.get("/topics/related/:topicName", function(req, res) {
  console.log(req.params.topicName);
  const requestedtopicName = _.capitalize(req.params.topicName);
  console.log(requestedtopicName);
  Post.find({
    topic: requestedtopicName
  }, function(err, foundtopic) {
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
          allposts: "No Post related to this topic available"
        });
      } else {
        res.render("specifictopic", {
          topic: foundtopic.topic,
          allposts: foundtopic
        });
      }
    }
  })
});

















router.post("/delete", (req, res) => {
  console.log(req.body);
  const checkedItemid = req.body.checkboxfordelete;
  const checkItemName = req.body.checkboxforedit;
  Post.findByIdAndRemove(checkedItemid, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Deleted Successfully");
    }
  });
  res.redirect("/content");
});



/*<L><<><><><<><><><><<><<><><><<><><><><><><><>*/

/*To create a post */
router.post("/compose", function(req, res) {
  const post = new Post({
    topic: req.body.topic,
    posttitle: req.body.posttitle,
    postbody: req.body.postbody
  });
  post.save(function(err) {
    if (!err) {
      res.redirect("/admin/compose");
    }
  });
});


/*To handle a contact message */
router.post("/CustomerMessage", (req, res) => {
  var customermessages = {
    email2: req.body.customerEmail,
    fullname: req.body.customerFullname,
    message: req.body.customerDescription
  }
  customerMessage.create(customermessages, (err, item) => {
    console.log(customermessages);
    console.log(item + "item");
    if (err) {
      console.log(err);
    } else { // item.save();
      res.redirect('/thanks');
    }
  });
});












/*===========================strictly for admin only ============*/


router.get("/AdminDashboard", authUser, (req, res) => {

  var postQuery;
  Post.find({}, function(err, foundposts) {
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

  console.log("Loggin form admin route " + postQuery);
  Email.find({},
    function(err, foundemails) {
      countEmails = foundemails.length;
      console.log(countEmails);
      if (!err) {
        res.render("admindashboard1", {
          emails: foundemails,
          allposts: postQuery,
          postCount: postCount,
          countEmails: countEmails,
          messageCount: messageCount

        });
      }
    })
});














router.get("/admin/compose", authUser, function(req, res) {
  res.render("compose", {
    topic: req.body.topic
  });
})

router.get("/admin/allmessages", (req, res) => {
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

/*This is to get the link of all clients*/
router.get("/allsubscriber", (req, res) => {
  Email.find({},
    function(err, foundemails) {
      if (!err) {
        res.render("subscriber", {
          emails: foundemails
        });
      }
    });
});




/*This is to delete and manage the posts*/
router.get("/allpostsforadminonly", (req, res) => {
  Post.find({}, function(err, foundposts) {
    if (err) {
      console.log(err);
    } else {
      res.render("allpostsadmin", {
        allposts: foundposts
      });
    }
  });
});


/*This is a newsletter route*/

router.post("/ournewsletter", (req, res) => {
  const email = req.body.email;
  console.log(email);
  const email1 = new Email({
    email: email
  });
  email1.save();
  res.redirect("/thanks");
});






module.exports = router;
