// Model Contacts
const mongoose = require("mongoose");
// Model Contacts
const contactSchema = new mongoose.Schema({
  name: { type: String },
  phonenumber: { type: Number },
  demand: { type: String },
});
contactSchema.index({ "$**": "text" });
module.exports = mongoose.model("contact", contactSchema);
