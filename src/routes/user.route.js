const express = require("express");
const router = express.Router();
const UserRoute = express();
const { RegisterUser, SignInUser, VerifyEmail} = require("../controller/user.controller");

router.post("/register", RegisterUser);
router.post("/signin", SignInUser);
router.get('/verifyemail/:id', VerifyEmail);

UserRoute.use("/user", router);

module.exports = UserRoute;
