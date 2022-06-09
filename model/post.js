// Model Post
const mongoose = require("mongoose");
// Model user
const postSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  category: { type: String },
  title: { type: String },
  comments: { type: String },
  created_at: { type: Date },
  ckeditor: { type: String },
  urlImage: { type: String },
  description: { type: String },
});
postSchema.index({ "$**": "text" });
module.exports = mongoose.model("post", postSchema);
