const nodemailer = require('nodemailer')

const sendEmail = ()=>{
    const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        service:'gmail',
        port: 465,
        secure: true,
        auth:{
            type: "OAuth2",
            user:process.env.EMAIL,
            pass:process.env.PASSWORD
        }
    })
    const mailOptions = {
        from:'febrymuhammad80@gmail.com',
        to: 'febryardiansyah27@gmail.com',
        subject: 'Email Verification',
        html: '<h1>Welcome</h1><p>That was easy!</p>'
    }
    transporter.sendMail(mailOptions,(err,info) =>{
        if(err) {
            console.log(err);
        }
        console.log('email sent to : '+info);
    })
}
sendEmail()
module.exports = {sendEmail}