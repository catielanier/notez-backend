const express = require("express");
const router = express.Router();
const userService = require("../users/userServices");
const inviteService = require("./inviteServices");
const middleWare = require("../../_middleware");
const { applyMiddleware } = require("../../_utils");
const {
  MJ_APIKEY_PRIVATE,
  MJ_APIKEY_PUBLIC,
} = require("../../_utils/constants");
const mailjet = require("node-mailjet").connect(
  MJ_APIKEY_PUBLIC,
  MJ_APIKEY_PRIVATE
);

applyMiddleware(middleWare, router);

router.route("/").post(async (req, res) => {
  const { email } = req.body.data;
  try {
    const user = await userService.findUser(email);
    if (user) {
      res.status(401).send("A user with this email already exists.");
    } else {
      const newInvite = {
        email,
      };
      const finished = await inviteService.createInvite(newInvite);
      // write email for sending invites
      const messageBody = `
        <h3>NoteZ</h3>
        <h5>Hello!</h5>
        <p>You've been invited to our service! Come join everyone in taking notes to help improve your game!</p>
        <p>Please click <a href="https://checkthenotez.com/invite/${finished._id}">here</a> to get started.</p>
        <p>Regards,<br />The NoteZ Team</p>
      `;
      const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: "no-reply@checkthenotez.com",
              Name: "NoteZ",
            },
            To: [
              {
                Email: email,
              },
            ],
            Subject: "You've been invited to NoteZ!",
            HTMLPart: messageBody,
          },
        ],
      });
      request
        .then((result) => {
          console.log(result.body);
        })
        .catch((err) => {
          console.log(err.statusCode);
        });
      res.status(201).json({
        data: finished,
      });
    }
  } catch (e) {
    res.status(401).send(e);
  }
});

router.route("/:id").get(async (req, res) => {
  const { id } = req.params;
  // get invite
  try {
    const invite = await inviteService.getInvite(id);
    res.status(200).json({
      data: invite,
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.route("/signup").post(async (req, res) => {
  const { data: newUser } = req.body;
  const { token } = newUser;
  delete newUser.token;
  newUser.premium = true;
  newUser.active = true;
  try {
    const invite = await inviteService.getInvite(token);
    if (invite) {
      const user = await userService.createUser(newUser);
      if (user) {
        const finished = await inviteService.deleteInvite(token);
        if (finished) {
          res.status(201).json({
            data: user,
          });
        }
      }
    }
  } catch (e) {
    res.status(401).send(e);
  }
});

exports.router = router;
