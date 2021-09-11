"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;
const characterSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  name_ja: {
    type: String
  },
  name_ko: {
    type: String
  },
  "name_zh-cn": {
    type: String
  },
  "name_zh-tw": {
    type: String
  },
  "name_zh-hk": {
    type: String
  }
});

exports.model = mongoose.model("Character", characterSchema);
