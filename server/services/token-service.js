const jwt  = require('jsonwebtoken');
//configure dot env
const dotenv = require("dotenv");
dotenv.config({ path: "server/configure/.env" });
//getting access token secret
const accesstokensecreat=process.env.access_token_secret;

class TokenService{ 
    //generate access token

     generateToken(payload){
      
         const accessToken =jwt.sign(payload,accesstokensecreat,{
            expiresIn:'1y'
        })
         return {accessToken};
    }
   //verify access token
    async verifyAccessToken(token)
    {  
        return  jwt.verify(token,accesstokensecreat);
    }

}


module.exports= new TokenService();