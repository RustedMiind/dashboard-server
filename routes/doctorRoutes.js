const { Router } = require("express");
const doctorController = require("../controllers/doctorController");
const { doctorAuth } = require("../middlewares/authMiddlewares");
// const { adminAuth } = require("../middlewares/authMiddlewares");

const router = Router();

router.post("/login", doctorController.login);
router.post("/update", doctorController.update);
router.post("/register", doctorController.register);
router.get("/check", doctorController.checkdoctor);
router.get("/newtickets", doctorController.getnewtickets);
router.get("/approveticket/:id", doctorAuth, doctorController.approveticket);
router.get("/deleteticket/:id", doctorAuth, doctorController.deleteTicket);

module.exports = router;
