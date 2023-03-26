const mongoose =require('mongoose');


const db_connection=async(URL)=>{
    try {
      
      
        await mongoose.connect(URL,{
            useNewUrlParser: true,
            useUnifiedTopology:false
        
        });
        console.log("database connected")
    } catch (error) {
        console.log(error.message);
    }}



module.exports=db_connection;