const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const postSchema = {
postedby:String,
  topic: String,
  posttitle: String,
  postbody: String,
  date: {
    type: Date,
    default: Date.now
  },

};


const Post = new mongoose.model("Post", postSchema);

module.exports = Post;
