const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { sendEmail } = require("../helpers/email");
const { baseUrl } = require("../helpers/base-url");
const imageType = require("../helpers/imageType");
const PostModel = require("../models/Post");
const uploadImage = require("../helpers/cloudinary");

const RegisterUser = (req, res) => {
  //required

  const { name, email, password, petname } = req.body;

  try {
    //check to fill all fields
    if (!name || !email || !password || !petname) {
      return res.status(422).send({
        status: false,
        message: "Field must not be empty",
      });
    } else if (!validator.isEmail(email)) {
      return res.status(422).send({
        status: false,
        message: "Email is not valid",
      });
    }
    //find existing user in database
    UserModel.findOne({ email }).then((savedUser) => {
      //check if user is already exists
      if (savedUser) {
        return res
          .status(422)
          .send({ status: false, message: "user already exists" });
      }
      //move image
      let profilePic =
        "https://res.cloudinary.com/febryar/image/upload/v1598796112/no_avatar_weaizx.jpg";
      if (req.files && req.files.image) {
        const image = req.files.image;
        const fileName = imageType(image, name);
        image.mv(`./src/images/profile/${fileName}`);
        profilePic = `${baseUrl}image/profile/${fileName}`;
      }
      //hash password and save user to database
      bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new UserModel({
            email,
            password: hashedPassword,
            name,
            petname,
            isEmailVerified: false,
            profilePic,
            followers: [],
            following: [],
          });
          user.save().then((result) => {
            sendEmail(result);
            res.status(200).send({
              status: true,
              message: "success, check your email",
              user,
            });
          });
        })
        .catch((err) => {
          res.send({ status: false, message: err });
        });
    });
  } catch (error) {
    res.send({ status: false, message: error });
  }
};

const SignInUser = (req, res) => {
  const { email, password } = req.body;
  console.log(email + password);
  if (!email || !password)
    return res.status(422).send({
      status: false,
      message: "Email or password must not be empty",
    });

  UserModel.findOne({ email }).then((user) => {
    if (!user)
      return res
        .status(404)
        .send({ status: false, message: "Email is not valid" });
    bcrypt
      .compare(password, user.password)
      .then((result) => {
        if (result) {
          const { _id, isEmailVerified } = user;
          const token = jwt.sign({ _id }, process.env.JWT_KEY);
          if (!isEmailVerified) {
            return res.send({
              status: false,
              message: "Email must be verified",
            });
          } else {
            user.password = undefined;
            // user.profilePic = user.profilePic.replace('http://localhost:3000/','http://1d78b8f32a1e.ngrok.io/');
            return res.status(200).send({
              status: true,
              message: "success",
              token,
              user,
            });
          }
        }
        if (!result) {
          res.status(422).send({
            status: false,
            message: "email or password incorrect",
          });
        }
      })
      .catch((err) => {
        res.send({ status: false, message: err });
      });
  });
};

const VerifyEmail = async (req, res) => {
  const { id } = req.params;
  UserModel.findByIdAndUpdate(id, {
    $set: { isEmailVerified: true },
  }).exec((err, post) => {
    if (err || !post)
      return res.send({ status: false, message: "User not found" });
    res.send("Email Verification Success");
  });
};

const FollowUser = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  let isFollowed = true;
  try {
    const updateFollowers = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        $addToSet: { followers: userId },
      }
    );
    await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: { following: id },
      }
    );
    if (!updateFollowers) {
      res.send({
        status: false,
        message: "user that you want to follow not found",
      });
    }
    res.send({ status: true, message: "sucess", isFollowed });
  } catch (error) {
    res.send({ status: false, message: error });
  }
};

const UnfollowUser = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  let isFollowed = false;

  const updateFollowers = await UserModel.findOneAndUpdate(
    { _id: id },
    {
      $pull: { followers: userId },
    }
  );
  await UserModel.findByIdAndUpdate(
    { _id: userId },
    {
      $pull: { following: id },
    }
  );
  if (!updateFollowers) {
    return res.send({
      status: false,
      message: "user that you want to unfollow not found",
    });
  }
  return res.send({ status: true, message: "success", isFollowed });
};

const EditProfile = async (req, res) => {
  const userId = req.user._id;
  try {
    let hashedPassword;
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(req.body.password, 12);
      req.body.password = hashedPassword;
    } else {
      hashedPassword = undefined;
    }
    if (!req.files) {
      const user = await UserModel.findByIdAndUpdate(
        { _id: userId },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!user) return res.send({ status: false, message: "User not found" });
      res.send({
        status: true,
        message: "success changed profile",
        user: user,
      });
    } else {
      // const image = req.files.image;
      // const fileName = imageType(image, req.user.name);
      // image.mv(`./src/images/profile/${fileName}`);
      const imageUrl = await uploadImage(req, res, "profile");
      await UserModel.findByIdAndUpdate({ _id: userId }, req.body, {
        new: true,
        runValidators: true,
      });

      const update = await UserModel.findByIdAndUpdate(
        { _id: userId },
        { profilePic: imageUrl },
        {
          new: true,
          runValidators: true,
        }
      );

      res.send({
        status: true,
        message: "success changed profile",
        user: update,
      });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: false, message: error });
  }
};

const SearchUser = async (req, res) => {
  try {
    const user = await UserModel.find(
      { name: { $regex: req.query.user } },
      "name petname profilePic"
    );
    if (user.length === 0) {
      res.send({ status: false, message: "User not found" });
    }

    res.send({ status: true, message: "success", users: user });
  } catch (error) {
    res.send({ status: false, message: error });
  }
};

const UserProfile = async (req, res) => {
  const { id } = req.params;
  _Profile(req, res, id)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
};

const MyProfile = async (req, res) => {
  const userId = req.user._id;
  _Profile(req, res, req.user._id)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
};

async function _Profile(req, res, id) {
  try {
    const user = await UserModel.findById({ _id: id }).lean();
    const userPost = await PostModel.find({ postedBy: id })
      .populate("postedBy", "name profilePic")
      .populate("comments.postedBy", "name profilePic")
      .sort({ createdAt: -1 })
      .lean();

    user.password = undefined;
    await Promise.all(
      userPost.map(i=>{
        i.isLiked = i.likes.some(j=> j.toString() === req.user._id.toString());
      })
    )    
    res.send({
      status: true,
      message: "success",
      user: {
        detail: user,
        posts: userPost,
      },
    });
  } catch (error) {
    res.send({ status: false, message: error });
  }
}

module.exports = {
  RegisterUser,
  SignInUser,
  VerifyEmail,
  FollowUser,
  UnfollowUser,
  EditProfile,
  SearchUser,
  UserProfile,
  MyProfile,
};
