const express = require("express");
const router = express.Router();
const UserRoute = express();
const requireLogin = require("../middleware/requireLogin");
const {
  RegisterUser,
  SignInUser,
  VerifyEmail,
  FollowUser,
  EditProfile,
  SearchUser,
  UserProfile
} = require("../controller/user.controller");

router.post("/register", RegisterUser);
router.post("/signin", SignInUser);
router.get("/verifyemail/:id", VerifyEmail);
router.put("/follow/:id", requireLogin, FollowUser);
router.put("/editprofile", requireLogin, EditProfile);
router.get("/search",requireLogin, SearchUser);
router.get("/me",requireLogin, UserProfile);

UserRoute.use("/user", router);

module.exports = UserRoute;
