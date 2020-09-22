const nodemailer = require('nodemailer')
const template = require('./email-template')
const resetPassTemplate = require('./reset-pass-template');

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
        to: `${data.name} <${data.email}>`,
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

const resetPasswordEmail = (data,showPassword) =>{
    const transporter = nodemailer.createTransport({
        service:'gmail',    
        auth:{
            user:'akununtukkirimemail@gmail.com',
            pass:'QFbb(`DUTJZw^"h\((9~H9:'
        }
    })
    const mailOptions = {
        from:'Petgram <febrymuhammad80@gmail.com>',
        to: `${data.name} <${data.email}>`,
        subject: 'Reset Password',
        html: `${resetPassTemplate(showPassword)}`
    }
    transporter.sendMail(mailOptions,(err,info) =>{
        if(err) {
            console.log(err);
        }
        console.log('email sent to : '+info);
    })
}

module.exports = {sendEmail,resetPasswordEmail}