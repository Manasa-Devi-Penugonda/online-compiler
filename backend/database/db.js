const mongoose = require('mongoose')
require('dotenv').config()
const DBconnection = async() =>{
    const MONGODB_URL = process.env.MONGODB_URL
    // console.log(MONGODB_URL)
    try{
        await mongoose.connect(MONGODB_URL)
        console.log("DB connected successfully")
    }catch(error){
        console.log("Error while db connection", error)
    }
}


module.exports ={DBconnection}