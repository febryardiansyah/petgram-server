const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const {sendEmail} = require("../helpers/email")
const {baseUrl} = require("../helpers/base-url")

const RegisterUser = (req, res) => {
  //required
  const {image} = req.files
  const { name, email, password, petname } = req.body;

  const splitedName = image.name.split(".")
  const imageType = splitedName[splitedName.length - 1]
  const fileName = `${name}-${Date.now()}.${imageType}`
  image.mv(`../images/${fileName}`)
  try {
    //check to fill all fields
    console.log(name);
    if (!name || !email || !password || !petname) {
      return res.status(422).send({
        status:false,
        message: "Field must not be empty",
      });
    } else if (!validator.isEmail(email)) {
      return res.status(422).send({
        status:false,
        message: "Email is not valid",
      });
    }
    //find existing user in database
    UserModel.findOne({ email }).then((savedUser) => {
      //check if user is already exists
      if (savedUser) {
        return res.status(422).send({ status:false, message: "user already exists" });
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
            isEmailVerified : false,
            profilePic: `${baseUrl}/images/${fileName}`
          });
          user.save().then((result) => {
            sendEmail(result)
            res.status(200).send({status:true, message: "success, check your email", user });
          });
        })
        .catch((err) => {
          res.send({status:false, message: err });
        });
    });
  } catch (error) {
    res.send({status:false,message: error });
  }
};

const SignInUser = (req, res) => {
  const { email, password } = req.body;
  console.log(email+password);
  if (!email || !password)
    return res
      .status(422)
      .send({ 
        status:false,
        message: "Email or password must not be empty" });

  UserModel.findOne({ email }).then((user) => {
    if (!user) return res.status(404).send({ status:false,message: "Email is not valid" });
    bcrypt
      .compare(password, user.password)
      .then((result) => {
        if (result) {
          const { _id, name, email, isEmailVerified, petname } = user;
          const token = jwt.sign({ _id }, process.env.JWT_KEY);
          if(!isEmailVerified){
            return res.send({status:false,message:'Email must be verified'})
          }else {
            return res.status(200).send({
              status:true,
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
        if(!result){
          res.status(422).send({
            status:false,
            message: "email or password incorrect",
          });
        }
      })
      .catch((err) => {
        res.send({status:false, message: err });
      });
  });
};

const VerifyEmail = async(req,res)=>{
  const {id} = req.params;
  UserModel.findByIdAndUpdate(id,{
    $set:{isEmailVerified:true}
  }).exec((err, post)=>{
    if(err || !post) return res.send({ message:'User not found'})
    res.send({message: "Email Verification Success",})
  })
}
module.exports = { RegisterUser, SignInUser, VerifyEmail };
