const express = require("express");
const mongoose = require("mongoose");
const { router: userRouter } = require("./_routes/users/userRoutes");
const { MONGODB_URI } = process.env; // set up db connection

mongoose.connect(MONGODB_URI);
mongoose.Promise = global.Promise;

const app = express(); // no need to route only /book requests; that's done in now.json

app.use("/api/users", userRouter); // just export the app instead of starting up the server

module.exports = app;
