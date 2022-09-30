//jshint esversion:6

/*create .env file in route directory  */
require('dotenv').config();


const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const _ = require("lodash");


// using of Router as a middleware

// const router = require('./routes');



/*now usig mongoose database for myblog*/
const mongoose = require("mongoose");

const {
  ObjectId
} = require('mongodb');


mongoose.connect(process.env.Mongo_Cloud, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then( () => {
    console.log('Connection to the Atlas Cluster is successful!')
  })
  .catch( (err) => console.error(err));



const homeStartingContent = "Welcome to Study Resource Center";
const aboutContent = "About Us";
const contactContent = " Contact Us";
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.static("public"));


const postSchema = {
  topic: String,
  posttitle: String,
  postbody: String
};

const emailSchema = {
  email: String
};

const Email = mongoose.model("Email", emailSchema);


const Post = mongoose.model("Post", postSchema);





/*Requiring customerMessagemodel here*/
const customerMessage = require('./models/customerMessage');
const Message = require("./models/customerMessage");


// Handling post request from customer message
app.post("/CustomerMessage", (req, res) => {
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


app.get("/admin/allmessages", (req, res) => {

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



app.get("/", (req, res) => {
  res.render("index");
})


/*creating note when there are no posts in content*/

app.get("/content", function(req, res) {
  /*now we are rendering all posts inside home page from database by using modelname.find({},callback fucntion)*/
  /*Select * from Post;*/
  Post.find({}, function(err, foundposts) {
    if (!err) {
      res.render("home", {
        Home: homeStartingContent,
        allposts: foundposts.slice(0, 10)
      });
    }
  })
});





app.get("/about", function(req, res) {
  res.render("about", {
    about: aboutContent
  });
});




app.get("/contact", function(req, res) {
  res.render("contact", {
    contact: contactContent
  });
});




app.get("/admin/compose", function(req, res) {
  res.render("compose", {
    topic: req.body.topic
  });
})




app.post("/compose", function(req, res) {
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
  /*  post.save(function(err) {
      if (!err) {
        res.redirect("/compose");
      }
    });*/
});





app.get("/topics/related/:topicName", function(req, res) {
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





/*error page*/
app.get("/404", (req, res) => {
  res.render("404");
})




/*for posts*/
app.get("/allposts/:postId", function(req, res) {
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






app.post("/delete", (req, res) => {
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






app.post("/ournewsletter", (req, res) => {
  const email = req.body.email;
  console.log(email);
  const email1 = new Email({
    email: email
  });
  email1.save();
  res.redirect("/thanks");
});





app.get("/thanks", function(req, res) {
  res.render("thanks");
});



app.get("/AdminDashboard", (req, res) => {

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





/*This is to get the link of all clients*/
app.get("/allsubscriber", (req, res) => {
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
app.get("/allpostsforadminonly", (req, res) => {
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









/*for contributor*/
app.get("/register-form", (req, res) => {
  res.render("registerformforcontributor");
});





app.get("*", (req, res) => {
  res.render("404");
});




app.listen(process.env.PORT || 6790, function() {
  console.log("Server started on port  ");
});
