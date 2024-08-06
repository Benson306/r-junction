let mongoose = require('mongoose');

let UsersSchema =  new mongoose.Schema({
    email : String,
    password: String,
    first_name : String,
    last_name : String,
    company_name: String,
    role : String,
    created_at : String,
    email_confirmation : Boolean,
    otp: String
});

let UsersModel = mongoose.model('users', UsersSchema);
module.exports = UsersModel;