"use strict";
const { model: Character } = require("../../characters/characterModel");
const { model: Filter } = require("../../filters/filterModel");
const { model: Game } = require("../../games/gameModel");

const mongoose = require("mongoose");
const { Schema } = mongoose;
const gameNoteSchema = new Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Game,
    required: true
  },
  myCharacter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Character,
    required: true
  },
  opponentCharacter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Character
  },
  universal: {
    type: Boolean,
    required: true,
    default: false
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

exports.model = mongoose.model("GameNote", gameNoteSchema);
