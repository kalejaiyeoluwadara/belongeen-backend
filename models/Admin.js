const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const adminSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});
module.exports = Admin = model("Admin", adminSchema);
