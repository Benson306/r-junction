let express = require('express');
let app = express.Router();
let bodyParser = require('body-parser');
const urlEncoded = bodyParser.urlencoded({ extended: false});
const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authMiddleware');
const UsersModel = require('../Models/UsersModel');
const saltRounds = process.env.SALT_ROUNDS;
const someOtherPlainText = 'rjunctioneer';
const crypto = require('crypto');
const nodemailer = require('nodemailer');

function generateRandomNumber() {
    const seed = Date.now();
    const random = Math.floor(seed * Math.random() * 90000) + 10000;
    return random % 90000 + 10000; // Ensures a 5-digit number
}

function generateStrongPassword(email) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedTime = `${year}${month}${day}${hours}${minutes}${seconds}`;
    const seed = email + formattedTime + generateRandomNumber();
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    const password = hash.substring(0, 8);
    return password;
}

const REG_EMAIL_TEMPLATE  = (otp) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome onboard</title>
        <style>
          .container {
            margin-top: 10px;
          }
  
          .logo {
            font-weight: bold;
            padding: 20px;
            text-align: center;
          }
  
          .title {
            padding: 20px;
            text-align: center;
            background-color: #EEF2FE;
            font-weight: bold;
            font-size: 28px;
          }
  
          .content {
            text-align: center;
            background-color: #FAFAFA;
            padding: 20px;
          }
  
          .credentials {
            display: flex;
            justify-content: center;
            margin: 0 auto;
            margin-bottom: 30px;
          }
  
          table {
            font-weight: bold;
            padding: 15px;
            margin: 0 auto;
            margin-top: 20px;
            text-align: left;
            width: 30%;
          }
  
          table td {
            padding-right: 10px;
            font-weight: lighter;
            font-size: 16px;
          }
  
          .sign {
            display: flex;
            justify-content: center;
            color: black;
          }
  
          .signin-btn {
            background-color: #C8F761;
            text-align: center;
            padding: 10px;
            border-radius: 5px;
            display: block;
            margin: 0 auto;
            text-decoration: none;
            color: black;
            width: 30%;
          }
  
          .footer {
            background-color: black;
            text-align: center;
            color: white;
            padding: 30px;
            margin-top: 20px;
          }
  
          .footer p {
            margin: 0;
          }
  
          .disclaimer {
            font-size: 12px;
            margin-top: 20px;
          }
        </style>
      </head>
  
      <body>
        <div class="container">
  
          <div class="title">Welcome to Recruitment Junction</div>
  
          <div class="content">
            <p>We are happy to have you onboard.</p>
            <p>Here is your OTP:</p>
  
            <div class="credentials">
              <table>
                  <td>OTP:</td>
                  <td>${otp}</td>
                </tr>
              </table>
            </div>
  
            <div class="sign">
              <a href="#" class="signin-btn">Sign In</a>
            </div>
          </div>
  
          <div class="footer">
            <p>Recruitment Junction</p>
            <p class="disclaimer">Please do not reply to this email. This mailbox is not monitored.</p>
          </div>
        </div>
      </body>
  
      </html>
      `;
}

const RESET_PASSWORD_TEMPLATE  = (reset_token) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
      <style>
        .container {
          margin-top: 10px;
        }

        .logo {
          font-weight: bold;
          padding: 20px;
          text-align: center;
        }

        .title {
          padding: 20px;
          text-align: center;
          background-color: #EEF2FE;
          font-weight: bold;
          font-size: 28px;
        }

        .content {
          text-align: center;
          background-color: #FAFAFA;
          padding: 20px;
        }

        .credentials {
          display: flex;
          justify-content: center;
          margin: 0 auto;
          margin-bottom: 30px;
        }

        table {
          font-weight: bold;
          padding: 15px;
          margin: 0 auto;
          margin-top: 20px;
          text-align: left;
          width: 30%;
        }

        table td {
          padding-right: 10px;
          font-weight: lighter;
          font-size: 16px;
        }

        .sign {
          display: flex;
          justify-content: center;
          color: black;
        }

        .signin-btn {
          background-color: #C8F761;
          text-align: center;
          padding: 10px;
          border-radius: 5px;
          display: block;
          margin: 0 auto;
          text-decoration: none;
          color: black;
          width: 30%;
        }

        .footer {
          background-color: black;
          text-align: center;
          color: white;
          padding: 30px;
          margin-top: 20px;
        }

        .footer p {
          margin: 0;
        }

        .disclaimer {
          font-size: 12px;
          margin-top: 20px;
        }
      </style>
    </head>

    <body>
      <div class="container">

        <div class="title">Reset Password</div>

        <div class="content">
          <p>Here is your one time password:</p>

          <div class="credentials">
            <table>
                <td>${reset_token}</td>
              </tr>
            </table>
          </div>

          <div class="sign">
            <a href="#" class="signin-btn">Sign In</a>
          </div>
        </div>

        <div class="footer">
          <p>Recruitment Junction</p>
          <p class="disclaimer">Please do not reply to this email. This mailbox is not monitored.</p>
        </div>
      </div>
    </body>

    </html>
    `;
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth : {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const SEND_MAIL = async (mailDetails, callback) => {
    try {
        const info = await transporter.sendMail(mailDetails);
        callback(info);
    }catch( error ) {
        console.log(error);
    }
}

app.post('/signup', urlEncoded, (req, res)=>{
    let email = req.body.email;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let password = req.body.password;
    let role = req.body.role;
    let company_name = req.body.company_name;
    let otp = generateStrongPassword(email);
    let currentDate = new Date();
    let date = currentDate.toLocaleDateString('en-GB');

    UsersModel.find({ email : email})
    .then(data => {
        if(data.length > 0){
            res.status(409).json({ message:'Email has been used' });
        }else{
            bcrypt.hash(password, parseInt(saltRounds, 10), function(err, hash){
                UsersModel({ 
                    email, 
                    password: hash, 
                    email_confirmation: false, 
                    company_name, 
                    first_name, 
                    last_name, 
                    role, 
                    otp,
                    default_password: false,
                    created_at: date
                }).save()
                .then((result)=>{
                    const options = { 
                        from: `Recruitment Junction <${process.env.EMAIL_USER}>`,
                        to: `${email}`,
                        subject: "Welcome to Recruitment Junction",
                        html: REG_EMAIL_TEMPLATE(otp)
                    }
                    SEND_MAIL( options, (info)=>{
                        console.log("Email sent successfully");
                        res.json('Signed up succesfully');
                    });
                })
                .catch((err)=>{
                    console.log(err);
                    res.status(500).json("Failed. Server Error");
                })
            })
        }
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).json("Failed. Server Error");
    })

});

app.post('/login', urlEncoded, (req, res)=>{
  const { email, password } = req.body;

  UsersModel.findOne({ email : email})
  .then(result => {
    if(result){
      bcrypt.compare(password, result.password, function(err, hash){
        if(hash){
          const token = jwt.sign({ userId: result._id}, process.env.MASTER_KEY,{
            expiresIn: '1d'
          })
          res.json({ token: token, email_confirmation: result.email_confirmation, default_password: result.default_password});
        }else{
          res.status(401).json("Authentication Failed.");
        }
      })
    }else{
      res.status(401).json("Authentication Failed.");
    }
  })
  .catch(err => {
    res.status(500).json("Failed. Server Error");
  })
});

app.post('/confirm_email', urlEncoded, (req,res)=>{
  const { userId, otp } = req.body;

  UsersModel.findOne({ _id : userId })
  .then( result => {
    if(result){
      if(result.otp === otp){
        UsersModel.findByIdAndUpdate(userId, { email_confirmation: true  } , { new: true})
        .then(()=>{
          res.json("Success");
        })
        .catch(err => {
          res.status(500).json("Failed. Server error");
        })
      }else{
        res.status(401).json("Confirmation failed");
      }
    }else{
      res.status(400).json("User is not registered");
    }
  })
  .catch(err => {
    res.status(500).json("Failed. Server error");
  })
});

app.post('/change_password', urlEncoded, (req, res)=>{
  const { userId, currentPassword, newPassword } = req.body;

  UsersModel.findOne({ _id: userId})
  .then( result => {
    if(result){
      bcrypt.compare(currentPassword, result.password, (err, success)=>{
        if(success){
          bcrypt.hash(newPassword, parseInt(saltRounds, 10), function(err, hash){
            UsersModel.findByIdAndUpdate(userId, { password: hash }, { new: true })
            .then(()=>{
              res.json("Success");
            })
            .catch(()=>{
              res.status(500).json("Password change failed");
            })
          })
        }else{
          res.status(401).json("Password change failed");
        }
      })
    }else{
      res.status(400).json("Password change failed");
    }
  })
  .catch(err => {
    res.status(500).json("Failed. Server Error");
  })
});

app.post('/initiate_reset_password', urlEncoded, (req, res)=>{
  const { email } = req.body;
  let otp = generateStrongPassword(email);

  UsersModel.findOne({ email })
  .then(result => {
    if(result){
      bcrypt.hash(otp, parseInt(saltRounds, 10), function(err, hash){
        UsersModel.findByIdAndUpdate(result._id, { password: hash, default_password: true },{ new: true })
        .then(()=>{
          const options = { 
              from: `Recruitment Junction <${process.env.EMAIL_USER}>`,
              to: `${email}`,
              subject: "Reset Password",
              html: RESET_PASSWORD_TEMPLATE(otp)
          }
  
          SEND_MAIL( options, (info)=>{
              console.log("Reset email sent successfully");
              res.json('Success. Check your email for new password');
          });
        })
        .catch(err => {
          res.status(500).json("Failed. Server Error");
        })
      })
      
    }else{
      res.status(400).json("User is not registred");
    }
  })
  .catch(err =>{
    res.status(500).json("Failed. Server Error");
  })
});

module.exports = app;