const nodemailer = require('nodemailer')
const template = require('./email-template')

const sendEmail = (data)=>{
    const transporter = nodemailer.createTransport({
        service:'gmail',    
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASSWORD
        }
    })
    const mailOptions = {
        from:'Petgram <febrymuhammad80@gmail.com>',
        to: '<febryardiansyah27@gmail.com>',
        subject: 'Email Verification',
        html: `${template(data)}`
    }
    transporter.sendMail(mailOptions,(err,info) =>{
        if(err) {
            console.log(err);
        }
        console.log('email sent to : '+info);
    })
}
module.exports = {sendEmail}