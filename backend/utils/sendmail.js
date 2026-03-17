const nodemailer = require('nodemailer')

const sendMail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls:{
            rejectUnauthorized:false,
        },
    })

    await transporter.sendMail({
        from: `"Auth System" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    })
}

module.exports = sendMail