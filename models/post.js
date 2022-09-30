
const mongoose = require("mongoose");




const postSchema = {
    topic: String,
    posttitle: String,
    postbody: String
  };


  const Post = new mongoose.model("Post", postSchema);

  module.exports= Post;