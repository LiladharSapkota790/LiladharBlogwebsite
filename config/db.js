const mongoose = require("mongoose");

const connectDB = async () => {

  try {
    await mongoose.connect(process.env.Mongo_Cloud, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connection to the Atlas Cluster is successful! 👍");

  } catch (err) {
    console.log("database errrorr!! " + err);
  }




};

module.exports = connectDB;
