const app=require('./app');
const path=require('path')

//configure dot env
const dotenv = require("dotenv");
dotenv.config({ path: "server/configure/.env" });



//mogodb connection
const db_connection = require('./configure/dbConnection');
const URL=process.env.db_URL;

db_connection(URL);



//configure cloudinary
const cloudinary =require('cloudinary');
cloudinary.config({
  cloud_name:process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET

})





const PORT=process.env.PORT
// server setup
app.listen(PORT,()=>{
    console.log(`Server is runing on PORT : ${PORT}`)
})