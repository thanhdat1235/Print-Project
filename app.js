require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: "*",
  exposedHeaders: "Authorization",
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(bodyParser.json());

app.use(express.json());

// Logic goes here

module.exports = app;
