const mongoose = require("mongoose");

mongoose
  .connect(process.env.MODE == 'PRODUCTION' ?process.env.MONGODB_PROD:process.env.MONGODB_DEV, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((response) => console.log("successfully connected to mongoDB"))
  .catch((err) => console.log(err));
