const crypto=require('crypto')
const tokenService = require('../services/token-service')
const User = require('../models/user_model')
const { sendEmail } = require('../utils/sendEmail')
const AccountDetails = require('../models/account_model')





const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {

            throw new Error("Please entre all fildes !!")
        } else {
            //checking user is register or not
            
            let user = await User.findOne({ email: email }).select("+password")
            .populate('bank_details').exec();
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
        const { email,password,name } = req.body

        if (!email||!password||!name) {
            throw new Error("Please entre all fildes !!")
        } else {
             let user= await User.findOne({email:email});
             if(!user){
                user = await User.create({ email,password,name})
             }else
             throw new Error("User already registered !!")
                 
           
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
        const user = await User.findById(_id).populate('bank_details').exec();
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
            httpOnly: true,
           
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
        const Url = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetpasswordToken}`;
        // console.log(resetPasswordUrl)
        //user in development level
       // const url=`http://localhost:8000/api/v1/password/reset/${resetpasswordToken}`
       const resetPasswordUrl = `Your password reset token is :- \n\n ${Url} \n\n Expire in 5 minutes If you have not requested thsi email then please ignore it `;

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
            httpOnly: true,
           
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

//user account add
const addaccount=async(req,res)=>{
    try {
        const {name,bank_name,ifsc,account_no,type}=req.body;
        if(!name||!bank_name||!ifsc||!account_no||!type)
             throw new Error("All Field required");
        // if(type!=="current"||type!=="savings")
        //     {   console.log(type)
        //         throw new Error("Account type only can be current or savings");}
         
    
       
        if(req.user.bank_details) 
            throw new Error("Bank details already added");
        //add account
          const account = await AccountDetails.create({
            name,
            bank_name,
            ifsc,
            account_no,
            type
          });
          
          let user=await User.findById({_id:req.user._id});
            user.bank_details=account._id;
           await user.save();

         res.status(201).json({
            success:true,
            message:"Account added successfully"
         })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const withdrawRequest=async(req,res)=>{
    try {
        
        const _id=req.user._id;

        let user = await User.findById(_id);
        if(!user.bank_details)
        throw new Error("Add your Bank account");

        if(!user.available_to_withdraw||user.available_to_withdraw<=0)
           throw new Error("Insufficient Withdraw balance");
          
           if(user.withdraw_request.length!=0)
               {
                return res.status(401).json({
                    success:false,
                    message:"Amount already in processing"
                })
               }
               const data={
                amount:user.available_to_withdraw,

               }
            user.withdraw_request=[data];
            user.available_to_withdraw=0;
            await user.save();
            res.status(201).json({
                user,
                success:true,
                message:"Your withdraw request in processing"
            })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

module.exports = {
    register, loadUser, login,logOutUser,
    resetPassword,resetPasswordToken,
    addaccount,
    withdrawRequest


}