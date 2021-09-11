"use strict";
const { model: Filter } = require("../../filters/filterModel");
const { model: Game } = require("../../games/gameModel");

const mongoose = require("mongoose");
const { Schema } = mongoose;
const playerNoteSchema = new Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Game,
    required: true
  },
  player: {
    type: String,
    required: true
  },
  filter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Filter,
    required: true
  },
  note: {
    type: String,
    required: true
  },
  noteDate: {
    type: Date,
    default: Date.now()
  }
});

exports.model = mongoose.model("PlayerNote", playerNoteSchema);
