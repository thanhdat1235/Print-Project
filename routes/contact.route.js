const express = require("express");
const router = express.Router();

const contactController = require("../app/controllers/ContactController");

router.delete("/delete/:id", contactController.deleteContact);

router.post("/create", contactController.create);

module.exports = router;
