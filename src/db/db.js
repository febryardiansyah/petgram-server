const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
})
mongoose.connection.on('connected',()=>{
    console.log('successfully connected to mongoDB');
})
mongoose.connection.on('error',(err)=>{
    console.log(err);
})