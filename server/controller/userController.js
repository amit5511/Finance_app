const crypto=require('crypto')
const tokenService = require('../services/token-service')
const User = require('../models/user_model')
const { sendEmail } = require('../utils/sendEmail')





const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {

            throw new Error("Please entre all fildes !!")
        } else {
            //checking user is register or not
            let user = await User.findOne({ email: email });
            if (!user)
                throw new Error("User Not Found!!")

            //checking password is correct or not
            const isMatch = await user.comparePassword(password);
           
            if (!isMatch)
                throw new Error("Incorrect Email or Password ");

            //generating access token
            const { accessToken } = tokenService.generateToken({ _id: user._id });
            res.cookie('accessToken', accessToken, {
                expireIn: 1000 * 60 * 60 * 30 * 24,
                httpOnly: true
            })
            res.status(201).json({
                user,
                message: "User login successfully",
                success: true
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    } 
}

const register = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body

        if (!email || !password || !confirmPassword) {
            throw new Error("Please entre all fildes !!")
        } else {
            if (password !== confirmPassword)
                throw new Error("Passwords do not match")

            const user = await User.create({ email, password })

            const { accessToken } = tokenService.generateToken({ _id: user._id });
           
            //cookies expires in 1 year
            res.cookie('accessToken', accessToken, {
                expireIn: 1000 * 60 * 60 * 30 * 24,
                httpOnly: true
            })
            res.status(201).json({
                user,
                message: "User Register successfully",
                success: true
            })
        }

    } catch (error) {

        res.status(401).json({
            success: false,
            message: error.message
        })
    }
}

const loadUser = async (req, res) => {

    try {

        const { _id } = req.user;
        const user = await User.findById(_id);
        res.status(201).json({
            user,
            success: true,
        })
    } catch (error) {

        res.status(401).json({
            success: false,

            message: error.message
        });
    }
}

const logOutUser = async (req, res) => {
    try {

        res.cookie('accessToken',"", {
            expireIn: Date.now(),
            httpOnly: true
        })
       

        res.status(201).json({
            success: true,
            message: "LogOut Succesfully"
        })
        //console.log("Good")

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in Logout"
        })
    }
}



//user reset password controller
const resetPasswordToken = async (req, res) => {
    try {
        //  console.log("hello")
        const { email } = req.body;
        if (!email)
            throw new Error("All fildes require");

        //checking user in database
        const user = await User.findOne({ email: email });
        if (!user)
            throw new Error("User Not Found!!");

        //generate reset token
        const resetpasswordToken = await user.getResetPasswordToken();
        await user.save();

        //valid for production level 
        const resetPasswordUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetpasswordToken}`;
        // console.log(resetPasswordUrl)
        //user in development level
       // const url=`http://localhost:8000/api/v1/password/reset/${resetpasswordToken}`
       // const resetPasswordUrl = `Your password reset token is :- \n\n ${url} \n\n If you have not requested thsi email then please ignore it `;

        //send otp on user email
        const options = {
            email: email,
            subject: "Reset Password Libk",
            message: resetPasswordUrl
        }
        await sendEmail(options);

        res.status(201).json({
            "success": true,
            "message": "Reset Link send on your email",
        })
    }
    catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


const resetPassword = async (req, res) => {
    try {
        const token = req.params.token;
        const{password,confirmPassword,email}=req.body;
        if (!token)
            throw new Error("Invalid Token")
        if(!password||!confirmPassword)
         throw new Error("Password and confirmPassword reuired")
         if(password!==confirmPassword)
         throw new Error("Passwords do not match") 
        if(!email)
            throw new Error("Email not found") ;   
            
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({email:email});
        if(!user)
          throw new Error("Reset Password token is invalid time expire");
          if(user.resetPasswordToken!==resetPasswordToken)
              throw new Error("Invalid token");
          if(user.resetPasswordExpire<Date.now())
            throw new Error("Time expire");
          user.password = password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpire = undefined;
          await user.save();  

        const { accessToken } = tokenService.generateToken({ _id: user._id });

       res.cookie('accessToken', accessToken, {
            expireIn: 1000 * 60 * 60 * 30 * 24,
            httpOnly: true
        })

        res.status(201).json({
            user,
            message:"Password reset successfully",
            success: true
        })
    } catch (error) {
        res.status(401).json({
            success: false,
          
            message: error.message
        })
    }
}

module.exports = {
    register, loadUser, login,logOutUser,
    resetPassword,resetPasswordToken


}