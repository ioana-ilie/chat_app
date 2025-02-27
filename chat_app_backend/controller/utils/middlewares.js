const jose = require("jose");
const { jwt } = require("../../config");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send({ error: "Missing token" });
    const { payload } = await jose.jwtVerify(req.headers.authorization, jwt.secret);
    req.userId = payload.sub;
    next();
  } catch (error) {
    console.log(error)
    return res.status(403).send({ error: "Unauthorized" });
  }
};

module.exports = auth;
