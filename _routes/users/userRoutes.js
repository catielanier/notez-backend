const express = require("express");
const router = express.Router();
const userService = require("./userServices");
const tokenService = require("../../_utils/tokenService");
const {
  MJ_APIKEY_PRIVATE,
  MJ_APIKEY_PUBLIC,
} = require("../../_utils/constants");
const mailjet = require("node-mailjet").connect(
  MJ_APIKEY_PUBLIC,
  MJ_APIKEY_PRIVATE
);
const middleWare = require("../../_middleware");
const { applyMiddleware } = require("../../_utils");

applyMiddleware(middleWare, router);

router.route("/signup").post(async (req, res, next) => {
  try {
    const newUser = req.body.data;
    const { language } = req.params;
    newUser.verification = await userService.addValidation();
    const user = await userService.createUser(newUser);

    const subject_en = "Welcome to NoteZ!";
    const subject_ja = "ノートZへようこそ！";
    const subject_ko = "노트Z 오신 것을 환영합니다!";
    const subject_cn = "欢迎使用笔记Z！";
    const subject_tw = "歡迎使用筆記Z！";
    const subject_hk = "歡迎使用筆記Z！";

    const sender_en = "NoteZ";
    const sender_ja = "ノートZ";
    const sender_ko = "노트Z";
    const sender_cn = "笔记Z";
    const sender_tw = "筆記Z";
    const sender_hk = "筆記Z";

    const messageBody_en = `
      <h3>NoteZ</h3>
      <h5>Welcome to NoteZ, ${newUser.username}!</h5>
      <p>We're happy to have you. Please click <a href="https://checkthenotez.com/verify/${newUser.verification}">here</a> to get underway.</p>
      <p>Regards,<br />The NoteZ Team</p>
    `;
    const messageBody_ja = `
      <h3>ノートZ</h3>
      <h5>ノートZへようこそ、${newUser.username}！</h5>
      <p>喜んでお迎えします。 <a href="https://checkthenotez.com/verify/${newUser.verification}">ここを</a>クリックして開始してください。</p>
      <p>よろしく、<br />ノートZチーム</p>
    `;
    const messageBody_ko = `
      <h3>노트Z</h3>
      <h5>노트Z 오신 것을 환영합니다, ${newUser.username}!</h5>
      <p>기꺼이 맞이합니다. <a href="https://checkthenotez.com/verify/${newUser.verification}">여기를</a> 클릭하여 시작하십시오.</p>
      <p>감사합니다,<br />노트Z 팀</p>
    `;
    const messageBody_cn = `
      <h3>笔记Z</h3>
      <h5>欢迎使用笔记Z，${newUser.username}！</h5>
      <p>我们很高兴欢迎您。单击<a href="https://checkthenotez.com/verify/${newUser.verification}">此处</a>开始。</p>
      <p>我们的问候，<br />笔记Z团队</p>
    `;
    const messageBody_tw = `
      <h3>筆記Z</h3>
      <h5>歡迎使用筆記Z，${newUser.username}！</h5>
      <p>我們很高興歡迎您。單擊<a href="https://checkthenotez.com/verify/${newUser.verification}">此處</a>開始。</p>
      <p>我們的問候，<br />筆記Z團隊</p>
    `;
    const messageBody_hk = `
      <h3>筆記Z</h3>
      <h5>歡迎使用筆記Z，${newUser.username}！</h5>
      <p>我哋好開心歡迎你。單擊<a href="https://checkthenotez.com/verify/${newUser.verification}">此處</a>開始。</p>
      <p>我哋嘅打招呼，<br />筆記Z團隊</p>
    `;

    let sender = ``;
    let subject = ``;
    let messageBody = ``;
    if (language === "ja") {
      messageBody = messageBody_ja;
      sender = sender_ja;
      subject = subject_ja;
    } else if (language === "ko") {
      messageBody = messageBody_ko;
      sender = sender_ko;
      subject = subject_ko;
    } else if (language === "zh-CN") {
      messageBody = messageBody_cn;
      sender = sender_cn;
      subject = subject_cn;
    } else if (language === "zh-TW" || "zh-SG") {
      messageBody = messageBody_tw;
      sender = sender_tw;
      subject = subject_tw;
    } else if (language === "zh-HK") {
      messageBody = messageBody_hk;
      sender = sender_hk;
      subject = subject_hk;
    } else {
      messageBody = messageBody_en;
      sender = sender_en;
      subject = subject_en;
    }

    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "no-reply@checkthenotez.com",
            Name: sender,
          },
          To: [
            {
              Email: newUser.email,
            },
          ],
          Subject: subject,
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
      data: [user],
    });
  } catch (e) {
    next(e);
  }
});

router.route("/login").post(async (req, res, next) => {
  try {
    const user = await userService.isUser(req.body.data);
    if (user) {
      if (user.active) {
        const token = await tokenService.issueToken(user);
        res.status(200).json({
          data: {
            token,
            id: user._id,
          },
        });
      } else {
        res
          .status(400)
          .send(
            "You have not activated your account yet. Please check your email to do so."
          );
      }
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
});

router.route("/:id").get(async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await userService.getUserById(id);
    res.status(200).json({
      data: user,
    });
  } catch (e) {
    next(e);
  }
});

router.route("/:id").put(async (req, res) => {
  const { id: user } = req.params;
  const {
    username,
    realName,
    newPassword,
    oldPassword,
    country,
    email,
    token,
  } = req.body;
  const loggedIn = await tokenService.verifyToken(token);
  if (loggedIn) {
    if (oldPassword) {
      const validPassword = await userService.verifyOldPassword(
        user,
        oldPassword
      );
      if (validPassword) {
        const passwordChange = await userService.updatePassword(
          user,
          newPassword
        );
        const userUpdate = await userService.updateUser(
          user,
          realName,
          username,
          country,
          email
        );
        if (userUpdate && passwordChange) {
          res.status(201).json({
            data: userUpdate,
          });
        } else {
          res.status(401).send("User did not update.");
        }
      } else {
        res
          .status(401)
          .send("Invalid password. Please confirm your old password.");
      }
    } else {
      const userUpdate = await userService.updateUser(
        user,
        realName,
        username,
        country,
        email
      );
      if (userUpdate) {
        res.status(201).json({
          data: userUpdate,
        });
      } else {
        res.status(401).send("User did not update.");
      }
    }
  } else {
    res.status(401).send("You are not logged in.");
  }
});

router.route("/").get(async (req, res) => {
  const { token, user: id } = req.query;
  const loggedIn = await tokenService.verifyToken(token);
  if (loggedIn) {
    const user = await userService.getUserById(id);
    if (user.role === "Admin") {
      const users = await userService.getAllUsers();
      if (users) {
        res.status(200).json({
          data: users,
        });
      }
    } else {
      res.status(503).send("You are not authorized to view all users");
    }
  } else {
    res.status(400).send("You are not logged in.");
  }
});

router.route("/role").put(async (req, res) => {
  const { token, user: userId, id, role } = req.body;
  const loggedIn = await tokenService.verifyToken(token);
  if (loggedIn) {
    const user = await userService.getUserById(userId);
    if (user.role === "Admin") {
      const updatedUser = await userService.updateRole(id, role);
      if (updatedUser) {
        res.status(201).json({
          data: updatedUser,
        });
      }
    } else {
      res.status(503).send("You are not authorized to update user roles.");
    }
  } else {
    res.status(401).send("You are not logged in.");
  }
});

router.route("/forgot").post(async (req, res) => {
  const { email, language } = req.body;
  try {
    const checkUser = await userService.findUser(email);
    if (checkUser) {
      const token = await userService.addValidation();
      const updated = await userService.setForgotToken(checkUser._id, token);

      const subject_en = "Password reset link";
      const subject_ja = "パスワードリセットリンク";
      const subject_ko = "비밀번호 재설정 링크";
      const subject_cn = "密码重置链接";
      const subject_tw = "密码重置链接";
      const subject_hk = "密码重置链接";

      const sender_en = "NoteZ";
      const sender_ja = "ノートZ";
      const sender_ko = "노트Z";
      const sender_cn = "笔记Z";
      const sender_tw = "筆記Z";
      const sender_hk = "筆記Z";

      const messageBody_en = `
        <h3>NoteZ</h3>
        <h5>Hello ${checkUser.username}:</h5>
        <p>It seems you have forgotten your password. Please click <a href="https://checkthenotez.com/forgot/${token}">here</a> to go in to reset it.</p>
        <p>Regards,<br />The NoteZ Team</p>
      `;

      const messageBody_ja = `
        <h3>ノートZ</h3>
        <h5>こんにちは${checkUser.username}:</h5>
        <p>パスワードを忘れたようです。<a href="https://checkthenotez.com/forgot/${token}">ここを</a>クリックしてリセットしてください。</p>
        <p>よろしく、<br />ノートZチーム</p>
      `;

      const messageBody_ko = `
        <h3>노트Z</h3>
        <h5>안녕하세요 ${checkUser.username}:</h5>
        <p>비밀번호를 잊어 같습니다. <a href="https://checkthenotez.com/forgot/${token}">여기를</a> 클릭하여 재설정하십시오.</p>
        <p>감사합니다,<br />노트Z 팀</p>
      `;

      const messageBody_cn = `
        <h3>笔记Z</h3>
        <h5>你好${checkUser.username}:</h5>
        <p>你好像忘记了密码。 单击<a href="https://checkthenotez.com/forgot/${token}">此处</a>重置。</p>
        <p>我们的问候，<br />笔记Z团队</p>
      `;

      const messageBody_tw = `
        <h3>筆記Z</h3>
        <h5>你好${checkUser.username}:</h5>
        <p>你好像忘記了密碼。 單擊<a href="https://checkthenotez.com/forgot/${token}">此處</a>重置。</p>
        <p>我們的問候，<br />筆記Z團隊</p>
      `;

      const messageBody_hk = `
        <h3>筆記Z</h3>
        <h5>你好${checkUser.username}:</h5>
        <p>你好似唔記得咗密碼。 單擊<a href="https://checkthenotez.com/forgot/${token}">此處</a>重置。</p>
        <p>我哋嘅打招呼，<br />筆記Z團隊</p>
      `;

      let sender = ``;
      let subject = ``;
      let messageBody = ``;
      if (language === "ja") {
        messageBody = messageBody_ja;
        sender = sender_ja;
        subject = subject_ja;
      } else if (language === "ko") {
        messageBody = messageBody_ko;
        sender = sender_ko;
        subject = subject_ko;
      } else if (language === "zh-CN") {
        messageBody = messageBody_cn;
        sender = sender_cn;
        subject = subject_cn;
      } else if (language === "zh-TW" || "zh-SG") {
        messageBody = messageBody_tw;
        sender = sender_tw;
        subject = subject_tw;
      } else if (language === "zh-HK") {
        messageBody = messageBody_hk;
        sender = sender_hk;
        subject = subject_hk;
      } else {
        messageBody = messageBody_en;
        sender = sender_en;
        subject = subject_en;
      }
      const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: "no-reply@checkthenotez.com",
              Name: sender,
            },
            To: [
              {
                Email: email,
              },
            ],
            Subject: subject,
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
        data: updated,
      });
    }
  } catch (e) {
    res.status(401).send("No user is associated with this email address.");
  }
});

router.route("/verify").post(async (req, res) => {
  const { key } = req.body;
  const user = await userService.verifyUser(key);
  if (user) {
    res.status(201).json({
      data: user,
    });
  } else {
    res.status(401).send("There was no such token.");
  }
});

router.route("/reset").post(async (req, res) => {
  const { key, password } = req.body;
  try {
    const user = await userService.findUserByResetToken(key);
    if (user) {
      console.log(user._id);
      const updatedUser = await userService.updatePassword(user._id, password);
      if (updatedUser) {
        res.status(201).json({
          data: updatedUser,
        });
      }
    }
  } catch (e) {
    res.status(401).send("Unable to reset password due to invalid token.");
  }
});

exports.router = router;
