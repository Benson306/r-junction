let express = require('express');
let app = express.Router();
let bodyParser = require('body-parser');
const urlEncoded = bodyParser.urlencoded({ extended: false});
const verifyToken = require('../middleware/authMiddleware');
const JobsModel = require('../Models/JobsModel');

function getCurrentDate(){
    let currentDate = new Date();
    return currentDate.toLocaleDateString('en-GB');
}

app.post('/post_job', urlEncoded, (req, res)=>{
    const { 
        employer_id,
        title,
        industry,
        skills,
        description,
        location,
        minimum_salary,
        maximum_salary,
        expires_on,
        keywords 
    } = req.body;

    let currentDate = getCurrentDate();

    JobsModel({
        posted_on: currentDate,
        employer_id,
        title,
        industry,
        skills,
        description,
        location,
        minimum_salary,
        maximum_salary,
        expires_on,
        keywords
    }).save()
    .then(()=>{
        res.json("Success");
    })
    .catch(()=>{
        res.status(500).json("Failed. Server Error");
    })
});

app.put('/update_job/:id', urlEncoded, (req, res)=>{
    const job_id = req.params.id;
    const {
        title,
        industry,
        skills,
        description,
        location,
        minimum_salary,
        maximum_salary,
        expires_on,
        keywords 
    } = req.body;

    JobsModel.findByIdAndUpdate(job_id, {
        title,
        industry,
        skills,
        description,
        location,
        minimum_salary,
        maximum_salary,
        expires_on,
        keywords
    },{ new: true })
    .then(()=>{
        res.json("Success");
    })
    .catch(()=>{
        res.status(500).json("Failed. Server Error");
    })
});

app.delete('/delete_job/:id', urlEncoded, (req, res)=>{
    const jobId = req.params.id;

    JobsModel.findByIdAndDelete(jobId)
    .then(()=>{
        res.json("Success");
    })
    .catch(()=>{
        res.status(500).json("Failed. Server Error")
    })
});

app.get('/my_jobs/:id', urlEncoded, (req, res)=>{
    JobsModel.find({ employer_id: req.params.id})
    .then(data => {
        res.json(data);
    })
    .catch(err =>{
        res.status(500).json("Failed. Server Error");
    })
});

module.exports = app;