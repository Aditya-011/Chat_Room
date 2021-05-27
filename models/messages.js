const mongoose = require("mongoose");
const msgSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  messages: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const Msg = mongoose.model("msg", msgSchema);
module.exports = Msg;
//mongodb://localhost:27017
