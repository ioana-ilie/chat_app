const jose = require("jose");
const crypto = require("crypto");
const { User } = require("../../entity");
const { jwt } = require("../../config");

const handleServerErrors = (res, error, status = 500) => {
  console.error(error);
  res.status(status).send({ error: error.message || "Internal server error" });
};

handleValidationErrors = (res, validation) => {
  return res.status(400).send({ errors: validation.error.errors });
};

const generateToken = async (userId, username) => {
  return await new jose.SignJWT({ username })
    .setProtectedHeader(jwt.alg)
    .setIssuedAt()
    .setIssuer(jwt.iss)
    .setSubject(userId)
    .setExpirationTime(jwt.exp)
    .sign(jwt.secret);
};

const generateGuestUsername = async () => {
  let username;
  let existingUser;
  do {
    const randomNum = crypto.randomInt(1, 10000);
    username = `Guest${randomNum}`;
    existingUser = await User.findOne({ username });
  } while (existingUser);
  return username;
};

module.exports = {
  handleServerErrors,
  handleValidationErrors,
  generateToken,
  generateGuestUsername,
};
