const crypto = require('crypto')
const tokenService = require('../services/token-service')
const User = require('../models/user_model')
const { sendEmail } = require('../utils/sendEmail')
const AccountDetails = require('../models/account_model')
const Transactions = require('../models/transaction_Model')
const cloudinary = require('cloudinary');
//configure dot env
const dotenv = require("dotenv");
const Userkyc = require('../models/userKyc_model')
dotenv.config({ path: "../configure/.env" });



const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {

            throw new Error("Please entre all fildes !!")
        } else {
            //checking user is register or not

            let user = await User.findOne({ email: email }).select("+password")

            if (!user)
                throw new Error("User Not Found!!")

            //checking password is correct or not
            const isMatch = await user.comparePassword(password);

            if (!isMatch)
                throw new Error("Incorrect Email or Password ");

            //generating access token
            const { accessToken } = tokenService.generateToken({ _id: user._id });
            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
                sameSite: process.env.dev === "development" ? true : "none",
                secure: process.env.dev === "development" ? false : true,
            })

            user = {
                name: user.name,
                email: user.email,
                avatar: user.avatar.url,
                allottedAmount: user.allocatedAmount,
                locekdAmount: user.locekdAmount,
                withdrawableamount: user.withdrawableamount,
                disbursedAmount: user.disbursedAmount,
                isAdmin: user.isAdmin,
                isBlock: user.isBlock,
                _id: user._id,
                createdAt: user.createdAt
            }

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
        const { email, password, name, confirmPassword, avatar } = req.body

        if (!email || !password || !name || !confirmPassword || !avatar)
            throw new Error("Please entre all fildes !!")

        if (password !== confirmPassword)
            throw new Error("Password not matched")

        let user = await User.findOne({ email: email });
        if (user)
            throw new Error("User already registered !!")

        let myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
            crop: 'scale'
        })
        console.log("dh")
        user = await User.create({
            email, password, name, avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            }
        })




        const { accessToken } = tokenService.generateToken({ _id: user._id });

        //cookies expires in 1 year
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            sameSite: process.env.dev === "development" ? true : "none",
            secure: process.env.dev === "development" ? false : true
        })

        user = {
            name: user.name,
            email: user.email,
            avatar: user.avatar.url,
            allottedAmount: user.allocatedAmount,
            locekdAmount: user.locekdAmount,
            withdrawableamount: user.withdrawableamount,
            disbursedAmount: user.disbursedAmount,
            isAdmin: user.isAdmin,
            isBlock: user.isBlock,
            _id: user._id,
            createdAt: user.createdAt
        }

        res.status(201).json({
            user,
            message: "User Register successfully",
            success: true
        })


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
        const user = await User.findById(_id)
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

        res.cookie('accessToken', "", {
            expireIn: Date.now(),
            httpOnly: true,
            sameSite: process.env.dev === "development" ? true : "none",
            secure: process.env.dev === "development" ? false : true

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
        const { password, confirmPassword, email } = req.body;
        if (!token)
            throw new Error("Invalid Token")
        if (!password || !confirmPassword)
            throw new Error("Password and confirmPassword reuired")
        if (password !== confirmPassword)
            throw new Error("Passwords do not match")
        if (!email)
            throw new Error("Email not found");

        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({ email: email });
        if (!user)
            throw new Error("Reset Password token is invalid time expire");
        if (user.resetPasswordToken !== resetPasswordToken)
            throw new Error("Invalid token");
        if (user.resetPasswordExpire < Date.now())
            throw new Error("Time expire");
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const { accessToken } = tokenService.generateToken({ _id: user._id });

        //cookie expire in 30day
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            sameSite: process.env.dev === "development" ? true : "none",
            secure: process.env.dev === "development" ? false : true,


        })

        res.status(201).json({
            user,
            message: "Password reset successfully",
            success: true
        })
    } catch (error) {
        res.status(401).json({
            success: false,

            message: error.message
        })
    }
}

//get account details
const getaccount = async (req, res) => {
    try {
        const bankDetails = await AccountDetails.findOne({ user: req.user._id });

        if (!bankDetails)
            throw new Error("Account details not Found")

        bankDetails.beneficiaries = undefined;

        res.status(200).json({
            success: true,
            message: "Account details found",
            bankDetails
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}
//add user account
const addaccount = async (req, res) => {
    try {
        const { accountHolderName, bankName, ifsc, accountNo, accountType } = req.body;
        if (!accountHolderName || !bankName || !ifsc || !accountNo || !accountType)
            throw new Error("All Field required");
        if (accountType === "current" || accountType === "savings") {


            let bankDetails = await AccountDetails.findOne({ user: req.user._id })

            if (bankDetails)
                throw new Error("Bank details already added");
            //add account

            bankDetails = await AccountDetails.create({
                accountHolderName,
                bankName,
                ifsc,
                accountNo,
                accountType,
                user: req.user._id
            });

            const user = await User.findById(req.user._id);
            user.bankDetails = bankDetails._id;
            await user.save();

            bankDetails.beneficiaries = undefined;
            res.status(201).json({
                success: true,
                message: "Account added successfully",
                bankDetails
            })
        } else
            throw new Error("Account type only can be current or savings");

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//update user account
const updateaccount = async (req, res) => {
    try {
        const { accountHolderName, bankName, ifsc, accountNo, accountType } = req.body;
        if (!accountHolderName || !bankName || !ifsc || !accountNo || !accountType)
            throw new Error("All  fileds required");
        if (accountType === "current" || accountType === "savings") {
            const bankDetails = await AccountDetails.findOne({ user: req.user._id })
            if (!bankDetails)
                throw new Error("Bank details not found");

            //update account


            bankDetails.accountHolderName = accountHolderName;
            bankDetails.bankName = bankName;
            bankDetails.ifsc = ifsc;
            bankDetails.accountNo = accountNo;
            bankDetails.accountType = accountType;

            await bankDetails.save();


            bankDetails.beneficiaries = undefined;
            res.status(201).json({
                success: true,
                bankDetails,
                message: "Account updated successfully"
            })
        } else
            throw new Error("Account type only can be current or savings");

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


//with draw request
const withdrawRequest = async (req, res) => {
    try {

        const _id = req.user._id;

        let user = await User.findById(_id).select("+bankDetails");

        //finding user account details
        const bankDetails = await AccountDetails.findOne({ user: user._id })
        if (!bankDetails)
            throw new Error("Add your Bank account");

        if (user.withdrawableamount <= 0)
            throw new Error("Insufficient Withdraw balance");
        console.log("hello")
        const Transaction = await Transactions.findOne({ user: _id });
        //if user doinf transaction first time
        //console.log(user)
        if (!Transaction) {
            await Transactions.create({
                bankDetails: user.bankDetails,
                user: user._id
            });
            Transaction.transactions = []

        }
        let withdrawrequest = Transaction.transactions;

        const newTransaction = {
            amount: user.withdrawableamount,

        }
        withdrawrequest.unshift(newTransaction);
        user.withdrawableamount = 0;
        user.locekdAmount = 0;


        await Transaction.save();
        await user.save();
        res.status(201).json({
            user,
            success: true,
            message: "Your withdraw request in processing"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//get all transaction
const allTransactions = async (req, res) => {
    try {

        let transactions = await Transactions.findOne({ user: req.user._id })
        if (!transactions)
            throw new Error("No Transaction found");
        transactions = transactions.transactions
        res.status(200).json({
            success: true,
            transactions
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//get kyc details
const getKyc = async (req, res) => {
    try {

        const kyc = await Userkyc.findOne({ user: req.user._id })
        if (!kyc)
            throw new Error("Kyc not completed");

        res.status(200).json({
            success: true,
            message: "Kyc Details",
            kyc
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
//add kyc
const addKyc = async (req, res) => {
    try {

        const { aadhaarId, panId, dob } = req.body;
        if (!aadhaarId || !panId || !dob)
            throw new Error("All details reuired")

        let userkyc = await Userkyc.findOne({ user: req.user._id })
        if (userkyc)
            throw new Error("Kyc Already Completed");

        // MM/DD/YY : '10/16/1995'
        console.log(dob);
        userkyc = await Userkyc.create({ aadhaarId, panId, dob, user: req.user._id })

        res.status(200).json({
            success: true,
            message: "User Kyc Added successfully",
            userkyc
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//update kyc
const updateKyc = async (req, res) => {
    try {

        const { aadhaarId, panId, dob } = req.body;
        if (!aadhaarId || !panId || !dob)
            throw new Error("All details reuired")

        const userkyc = await Userkyc.findOne({ user: req.user._id })
        if (!userkyc)
            throw new Error("Kyc not Completed");


        userkyc.dob = dob;
        userkyc.aadhaarId = aadhaarId;
        userkyc.panId = panId
        await userkyc.save();

        res.status(200).json({
            success: true,
            message: "User Kyc Updated successfully",
            userkyc
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// const getbeneficiaries = async (req, res) => {
//     try {
//         let beneficiaries = await AccountDetails.findOne({ user: req.user._id });
//         beneficiaries = beneficiaries.beneficiaries;
//         res.status(200).json({
//             success: true,
//             beneficiaries
//         })
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }


// const addbeneficiarie = async (req, res) => {
//     try {
//         const { accountHolderName, bankName, ifsc, accountNo, accountType } = req.body;
//         if (!accountHolderName || !bankName || !ifsc || !accountNo || !accountType)
//             throw new Error("All filed required");
//         if (accountType === "current" || accountType === "savings") {

//             const bankDetails = await AccountDetails.findOne({ user: req.user._id })
//             if (!bankDetails)
//                 throw new Error("Fistely add bank account to add beneficiarie");

//             //add beneficiaries
//             const data = {
//                 accountHolderName, bankName, ifsc, accountNo, accountType
//             }

//             bankDetails.beneficiaries.unshift(data);
//             await bankDetails.save();

//             res.status(201).json({
//                 success: true,
//                 beneficiaries: bankDetails.beneficiaries,
//                 message: "Beneficiarie added successfully"
//             })
//         } else
//             throw new Error("Account type only can be current or savings");

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }



// const updatebeneficiarie = async (req, res) => {
//     try {
//         const beneficiarieId = req.params.beneficiarie_id;
//         const { accountHolderName, bankName, ifsc, accountNo, accountType } = req.body;
//         if (!accountHolderName || !bankName || !ifsc ||!accountNo || !accountType)
//             throw new Error("All fileds required");
//         if (accountType && (accountType === "current" || accountType === "savings")){
//             const bankDetails = await AccountDetails.findOne({ user: req.user._id })

//             const beneficiarie = bankDetails.beneficiaries.filter(data => data._id == beneficiarieId)[0];
//             if (!beneficiarie)
//                 throw new Error("Beneficiarie not found");

//             //update beneficiaries
//             // console.log(beneficiarie)
//             beneficiarie.accountHolderName = accountHolderName;
//             beneficiarie.bankName = bankName;
//             beneficiarie.ifscifsc
//             beneficiarie.accountNo = accountNo;
//             beneficiarie.accountType = accountType

//             await bankDetails.save();

//             res.status(201).json({
//                 success: true,
//                 beneficiaries: bankDetails.beneficiaries,
//                 message: "Beneficiarie updated successfully"
//             })
//         } else
//             throw new Error("Account type only can be current or savings");


//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }




// const deletebeneficiarie = async (req, res) => {
//     try {
//         const beneficiarieId = req.params.beneficiarie_id;
//         const bankDetails = await AccountDetails.findOne({ user: req.user._id });
//         const updatedbeneficiarie = bankDetails.beneficiaries.filter(data => data._id != beneficiarieId);

//         if (bankDetails.beneficiaries.length==updatedbeneficiarie.length)
//                 throw new Error("Beneficiarie not found");

//         bankDetails.beneficiaries = updatedbeneficiarie;
//        // console.log( bankDetails)

//         await bankDetails.save();

//         res.status(200).json({
//             success: true,
//             beneficiaries: updatedbeneficiarie,
//             message: "Beneficiarie deleted successfully"
//         })
//     } catch (error) {
//         console.log(error)
//         res.status(404).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

module.exports = {
    register, loadUser, login, logOutUser,
    resetPassword, resetPasswordToken,
    addaccount,
    withdrawRequest,
    allTransactions,
    updateKyc
    , addKyc, getaccount, updateaccount,
    getKyc
   // , addbeneficiarie, getbeneficiaries, deletebeneficiarie, updatebeneficiarie
}