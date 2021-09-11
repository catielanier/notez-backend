const express = require("express");
const router = express.Router();
const userServices = require("../users/userServices");
const tokenService = require("../../_utils/tokenService");
const filterServices = require("./filterServices");
const middleWare = require("../../_middleware");
const { applyMiddleware } = require("../../_utils");

applyMiddleware(middleWare, router);

router.route("/new").post(async (req, res) => {
  // Grab the token, user id, and game from frontend.
  const { token, user: id, filter } = req.body;
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
    // Create new filter.
    const newFilter = await filterServices.createFilter(filter);
    res.status(201).json({
      data: newFilter,
    });
  } catch (e) {
    res.status(401).send(e);
  }
});

router.route("/game").get(async (_, res) => {
  try {
    const filters = await filterServices.getAllGameFilters();
    if (filters) {
      res.status(200).json({
        data: filters,
      });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

router.route("/player").get(async (_, res) => {
  try {
    const filters = await filterServices.getAllPlayerFilters();
    if (filters) {
      res.status(200).json({
        data: filters,
      });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

router.route("/").get(async (_, res) => {
  try {
    const filters = await filterServices.getAllFilters();
    if (filters) {
      res.status(200).json({
        data: filters,
      });
    }
  } catch (e) {
    res.status(400).send(e);
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
    filter,
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

  const result = await filterServices.updateCharacter(
    filter,
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
