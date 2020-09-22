module.exports = async(req,res,tags) => {
    const multer = require('multer')
    const cloudinary = require('cloudinary').v2
    const path = require('path')
    const imageType = require('../helpers/imageType')
    
    const upload = multer({dest:'src/images/'}).single('image')

    return new Promise(async(resolve, reject) => {
        if(!req.files){
            return reject('Image must not be empty')
        }
        const image = req.files.image;
        const fileName = imageType(image,req.user._id)

        await image.mv(`./src/images/${tags}/${fileName}`)
        const img = path.join(`./src/images/${tags}/${fileName}`)

        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME, 
            api_key: process.env.CLOUD_KEY, 
            api_secret: process.env.CLOUD_SECRET, 
        })

        const uniqeName = new Date().toISOString()
        cloudinary.uploader.upload(img,{
            public_id:`${tags}/${uniqeName}`,tags:tags
        },function(err,result){
            if(err){
                return reject(err);
            }
            return resolve(result.url)
        })
    })
}