module.exports = (image,name) => {
    const splitedName = image.name.split(".");
    const imageType = splitedName[splitedName.length - 1];
    const fileName = `${name}-${Date.now()}.${imageType}`;
    return fileName;
}