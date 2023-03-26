const express=require('express');
const app=express();


//cookies setup
const cookieParser = require("cookie-parser");
app.use(cookieParser());



//middleware parses incoming requests with JSON
app.use(express.urlencoded({extended:false}));
app.use(express.json({limit: '50mb'}));



//user route setup
const user_router = require('./router/user_route');
app.use('/api/v1',user_router);


app.get('*',(req,res)=>{
    res.status(201).json({
        success:true,
        message:"Runing fine"
    })
})


module.exports=app;