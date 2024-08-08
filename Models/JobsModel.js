let mongoose = require('mongoose');

let JobsSchema =  new mongoose.Schema({
    employer_id : String,
    title: String,
    industry: [String],
    skills: [String],
    description : String,
    location : String,
    minimum_salary: Number,
    maximum_salary : Number,
    posted_on : String,
    top_job : Boolean,
    expires_on: String,
    keywords: [String]
});

let JobsModel = mongoose.model('jobs', JobsSchema);
module.exports = JobsModel;