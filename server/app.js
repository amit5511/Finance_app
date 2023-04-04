const express=require('express');
const app=express();
const bodyParser =require('body-parser');
const fileUpload =require('express-fileupload')



//cookies setup
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cors=require('cors');
app.use(cors({
    credentials: true,
    origin:['http://localhost:4200','http://localhost:3000','http://localhost:8080'],
   
   
}));



//middleware parses incoming requests with JSON
app.use(express.urlencoded({extended:false}));
app.use(express.json({limit: '50mb'}));

app.use(bodyParser.urlencoded({limit: '50mb',extended:true}));
app.use(fileUpload());

//user route setup
const user_router = require('./router/user_route');
app.use('/api/v1',user_router);

//admin route setup
const admin_router=require('./router/admin_route');
app.use('/api/v1/admin',admin_router);


app.get('*',(req,res)=>{
    res.status(201).json({
        success:true,
        message:"Running fine"
    })
})


module.exports=app;