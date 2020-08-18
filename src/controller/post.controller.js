const PostModel = require("../models/Post");
const UserModel = require("../models/User");
const { baseUrl } = require("../helpers/base-url");

class PostController {
  AllPost = async (req, res) => {
    try {
      const allpost = await PostModel.find();
      res.send({
        message: "success",
        allpost,
      });
    } catch (error) {
      res.send({ error });
    }
  };

  CreatePost = async (req, res) => {
    const { image } = req.files;
    const { title, body } = req.body;

    const splitedName = image.name.split(".");
    const imageType = splitedName[splitedName.length - 1];
    const fileName = `${req.user._id}-${Date.now()}.${imageType}`;
    if (!title || !body || !image) {
      return res.status(422).send({
        message: "Field must not be empty",
      });
    }
    const date = new Date().getTime();
    image.mv(`./src/images/post/${fileName}`);
    req.user.password = undefined;
    req.user.isEmailVerified = undefined;
    req.user.profilePic = undefined;
    req.user.followers = undefined;
    req.user.following = undefined;
    const post = new PostModel({
      title,
      body,
      imageUrl: `${baseUrl}image/post/${fileName}`,
      postedBy: req.user,
      createdAt: date,
    });
    try {
      const result = await (await post.save())
      res.send({
        message: "success",
        result,
      });
    } catch (error) {
      res.send({ error });
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
              message: "success",
              deletedPost: val,
            })
          )
          .catch((err) => res.send({ message: err }));
      }
    });
  };

  EditPost = async (req, res) => {
    const { postId, title, body } = req.body;
    PostModel.findByIdAndUpdate(postId, {
      $set: { title: title, body: body },
    }).exec((err, post) => {
      if (err || !post) {
        console.log(err);
        return res.send({ message: "item not found" });
      }
      res.send({ message: "success" });
    });
  };

  MyPost = async (req, res) => {
    const userId = req.user.id;
    try {
      const result = await PostModel.find({ postedBy: userId });
      res.send({ message: "success", result });
    } catch (error) {
      res.send({ error });
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
        return res.send({ message: "Item not found" });
      }
      return res.send({ message: "success", result: post });
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
      if (err || !post) {
        return res.send({ message: "Item not found" });
      }
      return res.send({ message: "success", result: post });
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
        return res.send({ message: err });
      }
      return res.send({ message: "success", result: post });
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
        return res.send({ message: "Item not found" });
      }
      return res.send({ message: "success", post });
    });
  };
  GetPostByFollowing = async (req, res) => {
    const userId = req.user._id;
    try {
      const user = await UserModel.findById({
        _id: userId,
      });
      if (user.following.length === 0) {
        res.send({ message: "you must follow someone" });
      }
      let followingPostUser = [];
      await Promise.all(
        user.following.map(async (i) => {
          const post = await PostModel.find({ postedBy: i })
            .sort({ createdAt: -1 })
            .lean();
          followingPostUser.push(...post);
          console.log(followingPostUser);
        })
      );
      res.send({ message: "success", followingPostUser });
    } catch (error) {
      res.send({ message: error });
    }
  };
}

module.exports = new PostController();
