let mongoose = require('mongoose');

const WorkExperienceSchema = new mongoose.Schema({
    role: String,
    company_name: String,
    description: String,
    location: String,
    startMonth: String,
    endMonth: String
})

const EducationSchema = new mongoose.Schema({
    institution_name: String,
    course_title: String,
    level: String,
    location: String,
    startMonth: String,
    endMonth: String
})

let CandidateProfileSchema =  new mongoose.Schema({
    user_id : String,
    professional_summary: String,
    industry: [String],
    skills: [String],
    work_experience : [WorkExperienceSchema],
    education: [EducationSchema],
    portfolio_links : [String],
    cv: String
});

let CandidateProfileModel = mongoose.model('candidate_profile', CandidateProfileSchema);
module.exports = CandidateProfileModel;