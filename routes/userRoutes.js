const { Router } = require("express");
const userController = require("../controllers/userController");
const { userAuth, doctorAuth } = require("../middlewares/authMiddlewares");

const router = Router();

router.post("/login", userController.forcelogin);
router.get("/logout", userController.logout);
router.get("/checkuser", userController.checkuser);
router.post("/user/new", userController.register);
router.get("/users", doctorAuth, userController.getall);
router.get("/doctors", userAuth, userController.getalldoctors);
router.get("/tickets", userAuth, userController.getusertickets);

module.exports = router;
