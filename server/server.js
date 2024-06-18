require('dotenv').config();
const mongoose = require('mongoose')
const express= require('express');
const cors = require('cors');
const cookieparser=require('cookie-parser');
const postroute= require('./routes/Post.js');

const app=express(); //backend framework good for single root, support api requests

app.use(cors()) //cross origin platform connect backend to frontend

//for data transmission
app.use(express.json()); //to parse json info from http request to frontend

app.use(cookieparser()) //middleware parse cookies like jwt
app.use('/api/post', postroute);
// Use the bodyParser middleware to parse incoming JSON data and set it max req limit

const connect=async()=>{
    try{
       await mongoose.connect(process.env.MONGODB);
       console.log('listening on port 4000,connected to database ');
    }
    catch(e){
        console.log('error connecting to database' ,e); 
    }
}
app.listen(process.env.PORT,()=>{
    connect();
})

