const { Router } = require("express");
const ticketController = require("../controllers/ticketController");
const { doctorAuth, userAuth } = require("../middlewares/authMiddlewares");

const router = Router();

router.post("/new", userAuth, ticketController.newticket);

module.exports = router;
