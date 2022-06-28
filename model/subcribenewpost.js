// Model Post
const mongoose = require("mongoose");
// Model user
const subscribeNewPost = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    dropDups: true,
  },
  email: { type: String, unique: true },
});
subscribeNewPost.index({ "$**": "text" });
module.exports = mongoose.model("subscribenewpost", subscribeNewPost);
