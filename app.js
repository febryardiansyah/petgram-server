require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const UserRoute = require('./src/routes/user.route')
const PostRoute = require('./src/routes/post.route')
const requireLogin = require('./src/middleware/requireLogin')
require('./src/db/db')

app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(UserRoute)
app.use(PostRoute)

//testing requiredLogin middleware
app.use('/test',requireLogin,(req,res) => {
    res.send({message:'success'})
})

app.listen(port,()=>{
    console.log('server listening on port :'+port)
})