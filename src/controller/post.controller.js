const PostModel = require("../models/Post");
const UserModel = require("../models/User");
const { baseUrl } = require("../helpers/base-url");
const moment = require("moment");
const multer = require("multer");
const uploadImage = require("../helpers/cloudinary");

class PostController {
  AllPost = async (req, res) => {
    try {
      const allpost = await PostModel.find()
        .populate("postedBy", "name profilePic")
        .populate("comments.postedBy", "name profilePic")
        .sort({ createdAt: -1 })
        .lean();
      res.send({
        status: true,
        message: "success",
        allpost,
      });
    } catch (error) {
      res.send({ status: false, error });
    }
  };

  CreatePost = async (req, res) => {
    const { caption } = req.body;

    if (!caption) {
      return res.status(422).send({
        status: false,
        message: "Caption must not be empty",
      });
    }

    const createdAt = new Date().getTime();
    req.user.password = undefined;
    req.user.isEmailVerified = undefined;
    req.user.profilePic = undefined;
    req.user.followers = undefined;
    req.user.following = undefined;

    try {
      const imageUrl = await uploadImage(req, res, "post");

      const post = new PostModel({
        caption,
        imageUrl: imageUrl,
        postedBy: req.user,
        createdAt: createdAt,
      });

      const result = await await post.save();
      res.send({
        status: true,
        message: "success",
        result,
      });
    } catch (error) {
      res.send({ status: false, error });
    }
  };

  DeletePost = async (req, res) => {
    const id = req.params.id;
    PostModel.findOne({ _id: id }).exec((err, post) => {
      if (err || !post) {
        return res.send({ message: "Item not found" });
      }
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then((val) =>
            res.send({
              status: true,
              message: "success",
              deletedPost: val,
            })
          )
          .catch((err) => res.send({ status: false, message: err }));
      }
    });
  };

  EditPost = async (req, res) => {
    const { postId, caption } = req.body;
    PostModel.findByIdAndUpdate(postId, {
      $set: { caption: caption },
    }).exec((err, post) => {
      if (err || !post) {
        console.log(err);
        return res.send({ status: false, message: "item not found" });
      }
      res.send({ status: true, message: "success changed post" });
    });
  };

  MyPost = async (req, res) => {
    const userId = req.user.id;
    try {
      const result = await PostModel.find({ postedBy: userId })
        .populate("postedBy", "name profilePic")
        .populate("comments.postedBy", "name")
        .sort({ createdAt: -1 })
        .lean();
      res.send({ status: true, message: "success", result });
    } catch (error) {
      res.send({ status: false, message: error });
    }
  };

  LikePost = async (req, res) => {
    const userId = req.user._id;
    const { postId } = req.body;
    if (!postId) {
      res.send({ message: "require postId" });
    }
    PostModel.findByIdAndUpdate(
      postId,
      {
        $addToSet: { likes: userId },
      },
      {
        new: true,
      }
    ).exec((err, post) => {
      if (err || !post) {
        return res.send({ status: false, message: "Item not found" });
      }
      let isLiked = true;
      return res.send({
        status: true,
        message: "success",
        isLiked,
        result: post,
      });
    });
  };
  UnlikePost = async (req, res) => {
    const userId = req.user._id;
    const { postId } = req.body;
    if (!postId) {
      res.send({ message: "require postId" });
    }
    PostModel.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: userId },
      },
      {
        new: true,
      }
    ).exec((err, post) => {
      let isLiked = false;
      if (err || !post) {
        return res.send({ status: false, message: "Item not found" });
      }
      return res.send({
        status: true,
        message: "success",
        isLiked,
        result: post,
      });
    });
  };
  Comment = async (req, res) => {
    const { postId } = req.body;
    const userId = req.user._id;
    const comment = {
      text: req.body.text,
      postedBy: userId,
    };
    PostModel.findByIdAndUpdate(
      postId,
      {
        $push: { comments: comment },
      },
      {
        new: true,
      }
    ).exec((err, post) => {
      if (err) {
        return res.send({ status: false, message: err });
      }
      return res.send({ status: true, message: "success", result: post });
    });
  };
  DeleteComment = async (req, res) => {
    const { postId, commentId } = req.body;
    PostModel.findByIdAndUpdate(
      postId,
      {
        $pull: { comments: { _id: commentId } },
      },
      {
        new: true,
      }
    ).exec((err, post) => {
      if (err) {
        return res.send({ status: false, message: "Item not found" });
      }
      return res.send({ status: true, message: "success", post });
    });
  };
  GetPostByFollowing = async (req, res) => {
    const userId = req.user._id;

    try {
      const user = await UserModel.findById({
        _id: userId,
      });
      if (user.following.length === 0) {
        res.send({ status: "false", message: "no post" });
      }
      let followingPostUser = [];
      await Promise.all(
        user.following.map(async (i) => {
          const post = await PostModel.find({ postedBy: i })
            .populate("postedBy", "name profilePic")
            .populate("comments.postedBy", "name profilePic")
            .sort({ createdAt: -1 })
            .lean();
          followingPostUser.push(...post);
          followingPostUser.map((j) => {
            // j.imageUrl = j.imageUrl.replace('http://localhost:3000/','http://6db487588f77.ngrok.io/')
            // j.postedBy.profilePic = j.postedBy.profilePic.replace('http://localhost:3000/','http://6db487588f77.ngrok.io/')
            j.createdAt = moment(j.createdAt).fromNow();
            j.isLiked = j.likes.some(
              (like) => like.toString() === userId.toString()
            );
          });
        })
      );
      // console.log(isLiked);
      res.send({ status: true, message: "success", followingPostUser });
    } catch (error) {
      res.send({ status: false, message: error });
    }
  };
  GetDetailPost = async (req, res) => {
    const id = req.params.id;
    const userId = req.user._id;
    try {
      const post = await PostModel.findById({ _id: id })
        .populate("postedBy", "name profilePic")
        .populate("comments.postedBy", "name profilePic")
        .lean();
      if(!post)res.send({status:false, message:'post not found'})

      post.isLiked = post.likes.some((id)=> id.toString() === userId.toString())

      res.send({status:true, message:'success',post});
    } catch (error) {
      res.send({status:false, message:error})
    }
  };
}

module.exports = new PostController();
