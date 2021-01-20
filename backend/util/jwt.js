const expressJwt = require("express-jwt");

function authJwt() {
  const secret = process.env.PRIVATE_KEY;
  return expressJwt({
    secret: secret,
    algorithms: ["HS256"],
  });
}

module.exports = authJwt;
