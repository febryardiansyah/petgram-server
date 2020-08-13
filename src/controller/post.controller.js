const PostModel = require("../models/Post");

class PostController {

  AllPost = async (req, res) => {
    try {
        const allpost = await PostModel.find();
        res.send({
        message: "success",
        allpost,
        });
    } catch (error) {
        res.send({ error });
    }
  };

  CreatePost = async (req, res) => {
    const { title, body, picUrl } = req.body;
    if (!title || !body || !picUrl) {
      return res.status(422).send({
        message: "Filed must not be empty",
      });
    }
    const now = new Date().getTime();
    const date = now ;
    req.user.password = undefined;
    const post = new PostModel({
      title,
      body,
      picUrl,
      postedBy: req.user,
      createdAt:date
    });
    try {
      const result = await post.save();
      res.send({
        message: "success",
        result,
      });
    } catch (error) {
      res.send({ error });
    }
  };

  DeletePost = async (req, res) => {
    const id = req.params.id;
    PostModel.findOne({ _id: id }).exec((err, post) => {
      if (err || !post) {
        return res.send({ message: "Item not found" });
      }
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then((val) =>
            res.send({
              message: "success",
              deletedPost: val,
            })
          )
          .catch((err) => res.send({ message: err }));
      }
    });
  };

  EditPost = async (req, res) => {
    const { postId, title, body } = req.body;
    PostModel.findByIdAndUpdate(postId, {
      $set: { title: title, body: body },
    }).exec((err, post) => {
      if (err || !post) {
        console.log(err);
        return res.send({ message: "item not found" });
      }
      res.send({ message: "success" });
    });
  };

  MyPost = async (req, res) => {
      const userId = req.user.id;
      try {
        const result = await PostModel.find({postedBy: userId})
        res.send({message: "success",result})
      } catch (error) {
          res.send({error})
      }
  };

  LikePost = async (req, res) => {
      const userId = req.user._id
      const {postId} = req.body
      if(!postId){
          res.send({message:'require postId'})
      }
    //   PostModel.findById({_id:postId}).exec((err,post) => {
    //       for(let i of post.likes){
    //           if(i.toString() === userId.toString()){
    //               console.log(`${i} : \t ${userId}`);
    //               return res.send({message:'already liked'})
    //           }
    //           const newLikes = new PostModel({likes:userId})
    //           newLikes.save().then(result=>{
    //             res.send({result})
    //           }).catch(err=>{res.send(err)})
              
    //       }
    //   })
      PostModel.findByIdAndUpdate(postId,{
          $push: {likes:userId},
      },{
          new:true
      }).exec((err,post)=>{
          if(err || !post){
             return res.send({message:'Item not found',})
          }
          return res.send({message: "success",result:post})
      })
  }
  UnlikePost = async (req, res)=>{
    const userId = req.user._id
    const {postId} = req.body
    if(!postId){
        res.send({message:'require postId'})
    }
    PostModel.findByIdAndUpdate(postId,{
        $pull: {likes:userId},
    },{
        new:true
    }).exec((err,post)=>{
        if(err || !post){
           return res.send({message:'Item not found',})
        }
        return res.send({message: "success",result:post})
    })
  }
  Comment = async (req, res) => {
      const {postId} = req.body
      const userId = req.user._id
      const comment ={
          text: req.body.text,
          postedBy: userId
      }
      PostModel.findByIdAndUpdate(postId,{
          $push:{comments:comment}
      },{
          new:true
      }).exec((err,post)=>{
          if(err){
              res.send({message:err})
          }
          res.send({message:'success',result:post})
      })
  }
  DeleteComment = async (req, res) => {
    const {postId,commentId} = req.body
    try {
      PostModel.findByIdAndUpdate(postId,{
        $pull:{comments:{_id:commentId}}
      },{
        new:true
      }).exec((err,post)=>{
        if(!post){
          res.send({message: 'Item not found'})
        }
        res.send({message:'success',post})
      })
    } catch (error) {
      res.json({message:error})
    }
  }
}

module.exports = new PostController();
