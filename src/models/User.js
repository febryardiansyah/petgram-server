const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim:true
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength:6,
    },
    petname :{
        type: String,
        required: true,
    },
    isEmailVerified:Boolean,
})

const UserModel = mongoose.model('User',userSchema)

module.exports = UserModel