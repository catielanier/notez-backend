const express = require("express");
const router = express.Router();
const tokenService = require("../../../_utils/tokenService");
const userServices = require("../../users/userServices");
const gameNoteServices = require("./gameNoteServices");
const middleWare = require("../../../_middleware");
const { applyMiddleware } = require("../../../_utils");

applyMiddleware(middleWare, router);

router.route("/").post(async (req, res) => {
  const { note, token, user: id } = req.body;
  try {
    const loggedIn = await tokenService.verifyToken(token);
    if (!loggedIn) {
      res.status(503).send("You are not logged in.");
    }
    const user = await userServices.getUserById(id);
    if (user.role === "Banned") {
      res.status(503).send("You are banned and cannot use our service.");
    }
    const newNote = await gameNoteServices.createNote(note);
    if (newNote) {
      const noteId = newNote._id;
      const relationship = await gameNoteServices.linkNoteToUser(id, noteId);
      if (relationship) {
        const fullNote = await gameNoteServices.getNoteById(noteId);
        res.status(201).json({
          data: fullNote,
        });
      }
    }
  } catch (e) {
    res.status(401).send(e);
  }
});

router.route("/").delete(async (req, res) => {
  const { user: userId, token, noteId } = req.body;
  try {
    Promise.all(async () => {
      const loggedIn = await tokenService.verifyToken(token);
      if (!loggedIn) {
        res.status(503).send("You are not logged in.");
      }
      const user = await userServices.getUserById(userId);
      const relationship = await gameNoteServices.unlinkGameNote(
        userId,
        noteId
      );
    });
    const note = await gameNoteServices.deleteNote(noteId);
    res.status(200).json({
      data: note,
    });
  } catch (e) {
    res.status(401).send(e);
  }
});

router.route("/:id").put(async (req, res) => {
  const { id: noteId } = req.params;
  const { token, note, filter } = req.body;
  try {
    const loggedIn = await tokenService.verifyToken(token);
    if (!loggedIn) {
      res.status(503).send("You are not logged in.");
    }
    const results = await gameNoteServices.updateNote(noteId, note, filter);
    if (results) {
      const updatedNote = await gameNoteServices.getNoteById(noteId);
      res.status(201).json({
        data: updatedNote,
      });
    }
  } catch (e) {
    res.status(401).send(e);
  }
});

exports.router = router;
