const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator")

const RegisterUser = (req, res) => {
  //required
  const { name, email, password,petname } = req.body;
  try {
    //check to fill all fields
    if (!name || !email || !password || !petname) {
      console.log(name);
      return res.status(422).send({
        message: "Filed must not be empty",
      });
    }
    else if(!validator.isEmail(email)){
        return res.status(422).send({
            message: "Email is not valid",
          });
    }
    //find existing user in database
    UserModel.findOne({ email }).then((savedUser) => {
      //check if user is already exists
      if (savedUser) {
        return res.status(422).send({ message: "user already exists" });
      }
      //hash password and save user to database
      bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new UserModel({
            email,
            password: hashedPassword,
            name,
            petname
          });
          user.save().then(() => {
            res.status(200).send({ message: "success" ,user});
          });
        })
        .catch((err) => {
          res.send({ error: err });
        });
    });
  } catch (error) {
    res.send({ error });
  }
};

const SignInUser = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(422)
      .send({ message: "Email or password must not be empty" });

  UserModel.findOne({ email }).then((user) => {
    if (!user)return res.status(404).send({ message: "Email is not valid" });
    bcrypt.compare(password, user.password).then((result) => {
        if (result) {
          const { _id, name, email,isEmailVerified,petname } = user;
          const token = jwt.sign({ _id }, process.env.JWT_KEY);
          res.status(200).send({
            message: "success",
            token,
            user: {
              _id,
              name,
              email,
              petname,
              isEmailVerified
            },
          });
        } else {
          res.status(422).send({
            message: "email or password incorrect",
          });
        }
      })
      .catch((err) => {
        res.send({ error: err });
      });
  });
};

module.exports = { RegisterUser, SignInUser };
