const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { sendEmail } = require("../helpers/email");
const { baseUrl } = require("../helpers/base-url");
const imageType = require("../helpers/imageType");

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
      let profilePic = `${baseUrl}image/profile/no-pic.jpg`;
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
          const { _id, name, email, isEmailVerified, petname } = user;
          const token = jwt.sign({ _id }, process.env.JWT_KEY);
          if (!isEmailVerified) {
            return res.send({
              status: false,
              message: "Email must be verified",
            });
          } else {
            return res.status(200).send({
              status: true,
              message: "success",
              token,
              user: {
                _id,
                name,
                email,
                petname,
                isEmailVerified,
              },
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
    res.send({ status: true, message: "sucess" });
  } catch (error) {
    res.send({ status: false, message: error });
  }
};

const EditProfile = async (req, res) => {
  const userId = req.user._id;
  try {
    if (!req.body.password) {
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
      const hashedPassword = await bcrypt.hash(req.body.password, 12);
      req.body.password = hashedPassword;
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
    }
  } catch (error) {
    console.log(error);
    res.send({ status: false, message: error.message });
  }
};

const ChangeProfilePic = async (req, res) => {
  const userId = req.user._id;
  if (!req.files) {
    res.send({ status: false, message: "Field must not be empty" });
  }
  try {
    const image = req.files.image;
    const fileName = imageType(image, req.user.name);
    const user = await UserModel.findByIdAndUpdate(
      { _id: userId },
      { profilePic: `${baseUrl}image/profile/${fileName}` },
      { new: true, runValidators: true }
    );
    if (!user) return res.send({ status: false, message: "User not found" });
    image.mv(`./src/images/profile/${fileName}`);
    res.send({
      status: true,
      message: "success changed profile picture",
      result: user.profilePic,
    });
  } catch (error) {
    console.log(error);
    res.send({ status: false, message: error.message });
  }
};

module.exports = {
  RegisterUser,
  SignInUser,
  VerifyEmail,
  FollowUser,
  EditProfile,
  ChangeProfilePic,
};
