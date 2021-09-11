const express = require("express");
const router = express.Router();
const userServices = require("../users/userServices");
const tokenService = require("../../_utils/tokenService");
const gameServices = require("./gameServices");
const middleWare = require("../../_middleware");
const { applyMiddleware } = require("../../_utils");

applyMiddleware(middleWare, router);

router.route("/new").post(async (req, res) => {
  // Grab the token, user id, and game from frontend.
  const { token, user: id, game } = req.body;
  try {
    // Check if the login is valid
    const loggedIn = await tokenService.verifyToken(token);
    if (!loggedIn) {
      res.status(503).send("You are not logged in.");
    }
    // Query the user and check for admin privileges.
    const user = await userServices.getUserById(id);
    if (user.role !== "Admin") {
      res.status(503).send("Only admins can create games.");
    }
    // Create new game.
    const newGame = await gameServices.createGame(game);
    res.status(201).json({
      data: newGame,
    });
  } catch (e) {
    res.status(401).send(e);
  }
});

router.route("/").get(async (_, res) => {
  try {
    const games = await gameServices.getAllGames();
    if (games) {
      res.status(200).json({
        data: games,
      });
    }
  } catch (e) {
    res.status(201).send(e);
  }
});

router.route("/:id").get(async (req, res) => {});

router.route("/:id").put(async (req, res) => {});

router.route("/:id/character").put(async (req, res) => {
  // Grab the token, user id, and game from frontend.
  const { token, user: id, characters, game } = req.body;
  try {
    // Check if the login is valid
    const loggedIn = await tokenService.verifyToken(token);
    if (!loggedIn) {
      res.status(503).send("You are not logged in.");
    }
    // Query the user and check for admin privileges.
    const user = await userServices.getUserById(id);
    if (user.role !== "Admin") {
      res.status(503).send("Only admins can link characters to games.");
    }
    // Take the game and characters to update the character array on the document
    const update = gameServices.linkCharacters(game, characters);
    if (update) {
      res.status(201).json({
        data: update,
      });
    }
  } catch (e) {
    res.status(401).send(e);
  }
});

router.route("/:id/filter").put(async (req, res) => {
  // Grab the token, user id, and game from frontend.
  const { token, user: id, filters, game } = req.body;
  try {
    // Check if the login is valid
    const loggedIn = await tokenService.verifyToken(token);
    if (!loggedIn) {
      res.status(503).send("You are not logged in.");
    }
    // Query the user and check for admin privileges.
    const user = await userServices.getUserById(id);
    if (user.role !== "Admin") {
      res.status(503).send("Only admins can link filters to games.");
    }
    // Take the game and characters to update the character array on the document
    const update = gameServices.linkFilters(game, filters);
    if (update) {
      res.status(201).json({
        data: update,
      });
    }
  } catch (e) {
    res.status(401).send(e);
  }
});

router.route("/").put(async (req, res) => {
  const {
    user: id,
    token,
    name_ja,
    name_ko,
    name,
    name_cn,
    name_tw,
    name_hk,
    game,
  } = req.body.data;

  console.log(name_cn, name_tw, name_hk);

  const loggedIn = await tokenService.verifyToken(token);
  if (!loggedIn) {
    res.status(503).send("You are not logged in.");
  }
  // Query the user and check for admin privileges.
  const user = await userServices.getUserById(id);
  if (user.role !== "Admin") {
    res.status(503).send("Only admins can create characters.");
  }

  const result = await gameServices.updateGame(
    game,
    name,
    name_ja,
    name_ko,
    name_cn,
    name_tw,
    name_hk
  );

  res.status(201).json({
    data: result,
  });
});

exports.router = router;
