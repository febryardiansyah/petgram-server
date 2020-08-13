const express = require("express");
const router = express.Router();
const UserRoute = express();
const { RegisterUser, SignInUser } = require("../controller/user.controller");

router.post("/register", RegisterUser);
router.post("/signin", SignInUser);

UserRoute.use("/user", router);

module.exports = UserRoute;
