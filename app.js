let express = require('express');
let app = express();

require('dotenv').config();
app.use(express.json());

let cors = require('cors');
app.use(cors());

let mongoose = require('mongoose');
let mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

let UsersController = require('./Controllers/UsersController');
app.use('/', UsersController);

let port = process.env.PORT || 5000;

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})