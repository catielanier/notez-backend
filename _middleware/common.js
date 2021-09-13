const bodyParser = require("body-parser");
const cors = require("cors");

const corsOptions = {
  origin: [
    "https://checkthenotez.com",
    "https://www.checkthenotez.com",
    "http://localhost:3000",
  ],
};

exports.handleBodyRequestParsing = (router) => {
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());
  router.use(cors(corsOptions));
};
