const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { authAdminRole, authManagerRole } = require("../middleware/authenRoles");

const adminController = require("../app/controllers/AdminController");

router.delete("/delete-many", adminController.deleteMany);

router.post("/reset-password/:email", adminController.resetPassword);

router.put("/forgotpassword", adminController.forgotpassword);

router.post("/verify-otp/:email", adminController.verify);

router.delete("/delete/:id", auth, authAdminRole, adminController.deleteOne);

router.put("/update/:id", auth, authManagerRole, adminController.updateUser);

router.get("/user/:id", auth, adminController.findOne);

router.post("/logout", auth, adminController.logout);

router.post("/login", adminController.login);

router.post("/register", adminController.register);

router.get("/", auth, adminController.getAll);

module.exports = router;
