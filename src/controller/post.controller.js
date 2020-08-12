const PostModel = require('../models/Post')

const AllPost = async (req,res)=>{
    const allpost = await PostModel.find()
    res.send({
        message:'success',
        allpost})
}
const CreatePost = async (req,res) =>{
    const {title,body,picUrl} = req.body
    if(!title || !body || !picUrl){
        return res.status(422).send({
            message: 'Filed must not be empty'
        })
    }
    req.user.password = undefined
    const post = new PostModel({
        title,body,picUrl,postedBy:req.user
    })
    try {
        const result = await post.save()
        res.send({
            message:'success',
            result
        })
    } catch (error) {
        res.send({error})
    }   
}

const DeletePost = async (req,res) =>{
    const id = req.params.id
    PostModel.findOne({_id:id}).exec((err,post) =>{
        if(err || !post){
            return res.send({message:'Item not found'})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
            post.remove().then((val)=>res.send({
                message:'success',
                deletedPost:val
            })).catch(err=>res.send({message:err}))
        }
    })
    
}

const EditPost = async (req,res) =>{
    
}
const MyPost = async (req,res) =>{
}

module.exports = {CreatePost,AllPost,EditPost,DeletePost}