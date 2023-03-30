const crypto = require('crypto');
class OtpService{


    async generateotp(){
         
        const otp= crypto.randomInt(1000,9999);
        return otp;
    }
}

module.exports=new OtpService();