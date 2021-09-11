"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;
const filterSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
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
  },
  playerFilter: {
    type: Boolean,
    default: false,
    required: true
  }
});

exports.model = mongoose.model("Filter", filterSchema);
