const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.send({ message: "You must be log in" });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, process.env.JWT_KEY, (err, result) => {
    if (err) {
      res.status(500).send({ message: "You must be log in" });
    }
    const { _id } = result;
    UserModel.findById({ _id })
      .then((user) => {
        if (user == null) {
          return res.send({ message: "User not exist" });
        }
        console.log(user);
        req.user = user;
        next();
      })
      .catch((err) => {
        res.send({ message: "User not exist" });
      });
  });
};
