"use strict";

// Imports and defs
const mongoose = require("mongoose");
const express = require("express");
const http = require("http");
const router = express();

// Middleware
require("dotenv").config({ path: __dirname + "/.env" });
const { URL, PORT } = require("./_utils/constants");
const middleWare = require("./_middleware");
const { applyMiddleware } = require("./_utils");

applyMiddleware(middleWare, router);

// Routes
const { router: userRouter } = require("./_routes/users/userRoutes");
const { router: gameRouter } = require("./_routes/games/gameRoutes");
const {
  router: characterRouter,
} = require("./_routes/characters/characterRoutes");
const { router: filterRouter } = require("./_routes/filters/filterRoutes");
const {
  router: gameNoteRouter,
} = require("./_routes/notes/games/gameNoteRoutes");
const {
  router: playerNoteRouter,
} = require("./_routes/notes/players/playerNoteRoutes");
const { router: inviteRouter } = require("./_routes/invites/inviteRoutes");

router.use("/api/users", userRouter);
router.use("/api/games", gameRouter);
router.use("/api/characters", characterRouter);
router.use("/api/filters", filterRouter);
router.use("/api/notes/game", gameNoteRouter);
router.use("/api/notes/player", playerNoteRouter);
router.use("/api/invites", inviteRouter);

// Setup server
const server = http.createServer(router);

// Connect to MongoDB
mongoose
  .connect(URL, { useNewUrlParser: true })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
