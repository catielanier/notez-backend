"use strict";

const { model: GameNote } = require("../notes/games/gameNoteModel");
const { model: PlayerNote } = require("../notes/players/playerNoteModel");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;
const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    required: true,
    default: false
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  role: {
    type: String,
    required: true,
    default: "User",
    enum: ["Admin", "User", "Banned"]
  },
  joinDate: {
    type: Date,
    required: true,
    default: Date.now()
  },
  country: {
    type: String
  },
  realName: {
    type: String
  },
  verification: {
    type: String
  },
  forgotPassword: {
    type: String
  },
  premium: {
    type: Boolean,
    default: false,
    required: true
  },
  gameNotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: GameNote
    }
  ],
  playerNotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: PlayerNote
    }
  ]
});

userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password") || user.isNew) {
    try {
      const hash = await bcrypt.hash(user.password, 10);
      user.password = hash;
      return next();
    } catch (e) {
      return next(e);
    }
  } else {
    return next();
  }
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

exports.model = mongoose.model("User", userSchema);
