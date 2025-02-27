module.exports = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DB_URL,
  jwt: {
    alg: {alg: "HS256"},
    iss: "chat_app",
    exp: "24h",
    secret: new TextEncoder().encode(
      "cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2"
    ),
  },
};
