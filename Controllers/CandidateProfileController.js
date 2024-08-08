let express = require('express');
let app = express.Router();
let bodyParser = require('body-parser');
const urlEncoded = bodyParser.urlencoded({ extended: false});
const verifyToken = require('../middleware/authMiddleware');
const CandidateProfileModel = require('../Models/CandidateProfileModel');
const multer = require('multer'); // For handling file uploads
const fs = require('fs'); // For working with the file system
const path = require('path'); // For handling file paths

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './uploads');
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

app.get('/candidate_profile/:id', (req, res)=>{
    CandidateProfileModel.findOne({ user_id : req.params.id})
    .then((data)=>{
        res.json(data);
    })
    .catch(err => {
        res.status(500).json("Failed. Server Error");
    })
});

app.post('/create_profile', urlEncoded, upload.single("resume"), (req, res)=>{
    let requestBody = JSON.parse(req.body.data);
    let {
        user_id,
        professional_summary,
        industry,
        skills,
        work_experience,
        education,
        portfolio_links
    } = requestBody;

    let cv = req.file.filename;

    CandidateProfileModel.find({ user_id: user_id })
    .then(result => {
        if(result.length > 0){
            res.status(400).json("User profile exists");
        }else{
            CandidateProfileModel({
                user_id,
                professional_summary,
                industry,
                skills,
                work_experience,
                education,
                portfolio_links,
                cv
            }).save()
            .then(()=>{
                res.json("Success");
            })
            .catch(err => {
                res.status(500).json("Failed. Server Error")
            })
        }
    })
    .catch(err => {
        res.status(500).json("Failed. Server Error")
    })
});

app.put('/update_profile_with_cv/:id', urlEncoded, upload.single("resume"), (req, res)=>{
    let requestBody = JSON.parse(req.body.data);
    let {
        professional_summary,
        industry,
        skills,
        work_experience,
        education,
        portfolio_links
    } = requestBody;

    let cv = req.file.filename;
    
    CandidateProfileModel.findByIdAndUpdate(req.params.id, {
        professional_summary,
        industry,
        skills,
        work_experience,
        education,
        portfolio_links,
        cv
    }, { new: true })
    .then(()=>{
        res.json("Success");
    })
    .catch(err => {
        res.status(500).json("Failed. Server Error")
    })
});

app.put('/update_profile_without_cv/:id', urlEncoded, (req, res)=>{
    let {
        professional_summary,
        industry,
        skills,
        work_experience,
        education,
        portfolio_links
    } = req.body;
    
    CandidateProfileModel.findByIdAndUpdate(req.params.id, {
        professional_summary,
        industry,
        skills,
        work_experience,
        education,
        portfolio_links
    }, { new: true })
    .then(()=>{
        res.json("Success");
    })
    .catch(err => {
        res.status(500).json("Failed. Server Error")
    })
});

module.exports = app;