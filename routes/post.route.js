const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { authAdminRole, authManagerRole } = require("../middleware/authenRoles");

const postController = require("../app/controllers/PostController");

router.delete("/delete", auth, authManagerRole, postController.delete);

router.put("/update/:id", auth, authManagerRole, postController.updatePost);

router.post("/create", auth, authManagerRole, postController.createPost);

router.get("/", auth, postController.getAll);

module.exports = router;
