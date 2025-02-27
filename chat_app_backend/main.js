require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./controller/index");
const mongoose = require("mongoose");
const { port, dbUrl } = require("./config");

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(port);

mongoose.connect(dbUrl).then(() => console.log("Connected!"));
