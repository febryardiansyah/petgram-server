const tf = require('@tensorflow/tfjs')
const mobilenet = require('@tensorflow-models/mobilenet')
const tfNode = require('@tensorflow/tfjs-node')
const fs = require('fs')
const axios = require('axios').default;
const cheerio = require('cheerio')

module.exports = async(req,res,tags) => {
    const cloudinary = require('cloudinary').v2
    const path = require('path')
    const imageType = require('../helpers/imageType')
    const PetSpecies = [];

    try {
        const response = await axios.get('https://dogtime.com/dog-breeds/profiles')
        const $ = cheerio.load(response.data)
        $('.article-crumbs > .list-item').map((i,el)=>{
          PetSpecies.push($(el).text())
        })
      } catch (error) {
        console.log(error);
      }
    
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
            const result = await imageClassification(img,PetSpecies)
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

const imageClassification = async(imagePath,PetSpecies) =>{
    const image = readImage(imagePath);
    return new Promise(async(resolve, reject) => {
        try {
            const mobilenetModel = await mobilenet.load();
            const predictions = await mobilenetModel.classify(image);
            
            console.log(predictions);
            const name1 = nameCase(predictions[0].className.toString());
            const name2 = nameCase(predictions[1].className.toString());
            const name3 = nameCase(predictions[2].className.toString());

            let result = false;

            for(let i of PetSpecies){
                if(name1.search(i) !== -1 || name2.search(i) !== -1 || name3.search(i) !== -1){
                    result = true;
                    break;
                }
                if(name1.includes('Cat') || name2.includes('Cat') || name3.includes('Cat')){
                    result = true;
                    break;
                  }
              }

            return resolve(result);
        } catch (error) {
            return reject(error);
        }
    })
}

const nameCase = (name) =>{
    var splitName = name.toLowerCase().split(' ')
    for(let i = 0; i < splitName.length;i++){
      splitName[i] = splitName[i].charAt(0).toUpperCase() + splitName[i].substring(1)
    }
    return splitName.join(' ')
}