const express = require("express");
const router = express.Router();
const userServices = require("../users/userServices");
const tokenService = require("../../_utils/tokenService");
const characterServices = require("./characterServices");
const middleWare = require("../../_middleware");
const { applyMiddleware } = require("../../_utils");

applyMiddleware(middleWare, router);

router.route("/new").post(async (req, res) => {
  // Grab the token, user id, and game from frontend.
  const { token, user: id, character } = req.body;
  try {
    // Check if the login is valid
    const loggedIn = await tokenService.verifyToken(token);
    if (!loggedIn) {
      res.status(503).send("You are not logged in.");
    }
    // Query the user and check for admin privileges.
    const user = await userServices.getUserById(id);
    if (user.role !== "Admin") {
      res.status(503).send("Only admins can create characters.");
    }
    // Create new game.
    const newCharacter = await characterServices.createCharacter(character);
    res.status(201).json({
      data: newCharacter,
    });
  } catch (e) {
    res.status(401).send(e);
  }
});

router.route("/").get(async (_, res) => {
  try {
    const characters = await characterServices.getAllCharacters();
    if (characters) {
      res.status(200).json({
        data: characters,
      });
    }
  } catch (e) {
    res.status(201).send(e);
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
    character,
  } = req.body.data;

  const loggedIn = await tokenService.verifyToken(token);
  if (!loggedIn) {
    res.status(503).send("You are not logged in.");
  }
  // Query the user and check for admin privileges.
  const user = await userServices.getUserById(id);
  if (user.role !== "Admin") {
    res.status(503).send("Only admins can create characters.");
  }

  const result = await characterServices.updateCharacter(
    character,
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
