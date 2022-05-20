const express = require("express");
const router = express.Router();

const postController = require("../app/controllers/PostController");

router.use("/", postController.post);

module.exports = router;
