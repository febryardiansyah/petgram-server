const express = require('express')
const {CreatePost,EditPost,DeletePost,AllPost} = require('../controller/post.controller')
const router = express.Router()
const PostRoute = express()
const requireLogin = require('../middleware/requireLogin')

router.get('/allpost',requireLogin,AllPost)
router.post('/createpost',requireLogin,CreatePost)
router.put('/editpost',requireLogin,EditPost)
router.delete('/deletepost/:id',requireLogin,DeletePost)

PostRoute.use('/post',router)

module.exports = PostRoute