"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const inviteSchema = new Schema({
  email: {
    type: "String",
    unique: true,
    required: true,
  },
});

exports.model = mongoose.model("Invite", inviteSchema);
