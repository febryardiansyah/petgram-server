const express = require("express");
const PostController = require("../controller/post.controller");
const router = express.Router();
const PostRoute = express();
const requireLogin = require("../middleware/requireLogin");

router.get("/allpost", requireLogin, PostController.AllPost);
router.post("/createpost", requireLogin,PostController.CreatePost);
router.put("/editpost", requireLogin, PostController.EditPost);
router.delete("/deletepost/:id", requireLogin, PostController.DeletePost);
router.get("/me", requireLogin, PostController.MyPost);
router.put("/like", requireLogin, PostController.LikePost);
router.put("/unlike", requireLogin, PostController.UnlikePost);
router.put("/comment", requireLogin, PostController.Comment);
router.put("/deletecomment", requireLogin, PostController.DeleteComment);
router.get("/followingpost", PostController.GetPostByFollowing);

PostRoute.use("/post", router);

module.exports = PostRoute;
