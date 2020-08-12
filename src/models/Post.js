const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true,
    },
    picUrl :{
        type: String,
        required: true,
    },
    likes:[
        {
            type: ObjectId,
            ref: "User"
        }
    ],
    comments:[
        {
            text: String,
            postedBy: {
                type: ObjectId,
                ref: "User"
            }
        }
    ],
    postedBy :{
        type: ObjectId,
        ref: "User"
    }
})

const PostModel = mongoose.model('Post',schema)

module.exports = PostModel