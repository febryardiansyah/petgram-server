const tf = require('@tensorflow/tfjs')
const mobilenet = require('@tensorflow-models/mobilenet')
const tfNode = require('@tensorflow/tfjs-node')
const fs = require('fs')

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
        const uniqeName = new Date().toISOString()
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME, 
            api_key: process.env.CLOUD_KEY, 
            api_secret: process.env.CLOUD_SECRET, 
        })
        
        if(tags === 'post'){
            const result = await imageClassification(img)
            if(!result){
                return reject('image is not pet')
            }
            cloudinary.uploader.upload(img,{
                public_id:`${tags}/${uniqeName}`,tags:tags
            },function(err,result){
                if(err){
                    return reject(err);
                }
                return resolve(result.url)
            })
        }

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

const readImage = (imagePath) => {
    const imageBuffer = fs.readFileSync(imagePath)
    const tfImage = tfNode.node.decodeImage(imageBuffer)
    return tfImage;
}

const imageClassification = async(imagePath) =>{
    const image = readImage(imagePath);
    return new Promise(async(resolve, reject) => {
        try {
            const mobilenetModel = await mobilenet.load();
            const predic = await mobilenetModel.classify(image);
            console.log(predic);
            const result = await predic.map(i=>{
                const classname = i.className;
                if(classname.includes('cat') || classname.includes('dog') || classname.includes('rabbit')){
                    return true;
                }
                return false;
            })
            return resolve(result[0]);
        } catch (error) {
            return reject(error);
        }
    })
}