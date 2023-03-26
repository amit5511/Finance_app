const app=require('./app');
const path=require('path')

//configure dot env
const dotenv = require("dotenv");
dotenv.config({ path: "server/configure/.env" });


const cors=require('cors');
app.use(cors({
    credentials: true,
    origin:['http://localhost:3000'],
   
   
}));

//mogodb connection
const db_connection = require('./configure/dbConnection');
const URL=process.env.db_URL;

db_connection(URL);









const PORT=process.env.PORT
// server setup
app.listen(PORT,()=>{
    console.log(`Server is runing on PORT : ${PORT}`)
})