require('dotenv').config();//for importing the secure varible values
const mongoose = require('mongoose');   

const connectDB=()=>{
    //Database connection
    mongoose.connect(process.env.MONGO_CONNECTION_URL,{useNewUrlParser:true,useCreateIndex:true,useFindAndModify:true,useUnifiedTopology:true})
const connection = mongoose.connection;

connection.once('open',()=>{
    console.log('Databse connected');
}).catch(err=>{
    console.log("connection failed");
})

}

module.exports=connectDB;

