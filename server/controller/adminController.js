const AccountDetails = require("../models/account_model");
const Transactions = require("../models/transaction_Model");
const Userkyc = require("../models/userKyc_model");
const User = require("../models/user_model");
const cloudinary =require('cloudinary')

const allocatedAmount = async (req, res) => {
    try {
        const userId = req.params.user_Id;
        const { amount } = req.body;
        if (!userId || !amount)
            throw new Error("All field require!!")

        const user = await User.findById({ _id: userId });
        if (!user)
            throw new Error("User not found");
        user.allocatedAmount = amount;
        await user.save();

        res.status(201).json({

            success: true,
            message: "Alloated amount set successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        }
        )
    }
}

const locekdAmount = async (req, res) => {
    try {
        const userId = req.params.user_Id;
        const { amount } = req.body;
        if (!userId || !amount)
            throw new Error("All field require!!")

        const user = await User.findById({ _id: userId });
        if (!user)
            throw new Error("User not found");
        if (user.locekdAmount > allocatedAmount)
            throw new Error("Locked amount can't grater than allocatedAmount ");
        user.locekdAmount = amount;
        user.withdrawableamount = user.allocatedAmount - amount
        await user.save();

        res.status(201).json({

            success: true,
            message: "Locked amount set successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        }
        )
    }
}

const getAllUser = async (req, res) => {
    try {
        let user = await User.find();

        const users = [];

        user.map(data => {
            userObject = {
                registration_Date: data.createdAt,
                name: data.name,
                email: data.email
            }
            users.push(userObject)
        })

        res.status(201).json({
            success: true,
            message: "All Users",
            users
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getUser = async (req, res) => {
    try {
        const userid = req.params.user_Id
        const user = await User.findOne({ _id: userid });
        res.status(201).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const getWithdraw_request = async (req, res) => {
    try {
        // let users = await User.find({}).select("+bankDetails").populate("bankDetails").exec();
        let transactions = await Transactions.find().populate("bankDetails").populate("user");
        const withdrawRquest = [];
        for (i = 0; i < transactions.length; i++) {
            const transaction = transactions[i];
            if (transaction.transactions[0].status != "Credited to the beneficiary") {

                transaction.bankDetails.beneficiaries = undefined;
                const userObject = {
                    name: transaction.user.name,
                    email: transaction.user.email,
                    withdrawableamount: transaction.transactions[0].amount,
                    status: transaction.transactions[0].status,
                    date: transaction.transactions[0].transactionAt,
                    bankDetails: transaction.bankDetails
                }
                withdrawRquest.push(userObject);
            }
        }


        res.status(201).json({
            success: true,
            message: "Withdrawable amount request",
            withdrawRquest
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

const changeStatus = async (req, res) => {
    try {
        const userId = req.params.user_Id;
        if (!userId)
            throw new Error("User id not found!!")

        const user = await User.findById({ _id: userId });
        if (!user)
            throw new Error("User not found");
        //if withdraw request not found
        const Transaction = await Transactions.findOne({ user: user._id });
        if (!Transaction)
            throw new Error("Withdraw request not found");

        let withdrawrequest = Transaction.transactions[0]

        //console.log(withdrawrequest)
        if (withdrawrequest && withdrawrequest.status == "Credited to the beneficiary") {
            return res.status(401).json({
                success: false,
                message: `Amount already ${withdrawrequest.status}`
            })
        }



        let status = withdrawrequest.status == "processing" ? "Processed" : "Credited to the beneficiary"
        withdrawrequest.status = status;
        if (status == "Credited to the beneficiary") {

            user.disbursedAmount += withdrawrequest.amount

        } else {
            //if processed
            withdrawrequest.status = "Processed";
        }

        await user.save();
        await Transaction.save();

        res.status(201).json({
           
            success: true,
            message: withdrawrequest.status = "Processed" ? "Status update successfully" :
                "Credited to the beneficiary"
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        }
        )
    }
}

const block_request_change = async (req, res) => {
    try {
        const userid = req.params.user_Id
        const user = await User.findById({ _id: userid });
        user.isBlock = user.isBlock == "true" ? "false" : "true"
        await user.save();
        res.status(201).json({
            success: true,
            message: "User Block Status chnage successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const deleteUser = async (req, res) => {
    try {


        const userid = req.params.user_Id
        const user = await User.findOne({ _id: userid });
        if (!user)
            throw new Error("User not Exist");

        //delete picture from cloudinary
        const imageId = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imageId);
        await AccountDetails.findOneAndDelete({ user: userid })
        await Userkyc.findOneAndDelete({ user: userid })
        await Transactions.findOneAndDelete({ user: userid })
        await User.findOneAndDelete({ _id: userid })

        res.status(201).json({
            success: true,
            message: "User deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const singleUserKyc = async (req, res) => {
    try {
        const userId = req.params.user_Id;

        const kyc = await Userkyc.find({ user: userId });
        if (!kyc)
            throw new Error("Kyc not completed");

        res.status(201).json({
            success: true,
            message: "User kyc fetch successfully",
            kyc
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const userBankDetails = async (req, res) => {
    try {
        const userId = req.params.user_Id;
        const bankDetail = await AccountDetails.findOne({ user: userId });
        if (!bankDetail)
            throw new Error("Bank details not found");
        bankDetail.beneficiaries = undefined;
        res.status(200).json({
            success: true,
            message: "Bank details found",
            bankDetail
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const userTransactions = async (req, res) => {
    try {
        const userId = req.params.user_Id;
        let transactionDetails = await Transactions.findOne({ user: userId });
        if (!transactionDetails)
            throw new Error("Transactions not found");
        transactionDetails = transactionDetails.transactions
        res.status(200).json({
            success: true,
            message: "Transactions details found",
            transactionDetails
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const allUserBankdetailsfunction = async (req, res) => {
    try {
        const allUsersBankDetails = await AccountDetails.find({}).select("+user").populate("user").exec();
        allUsersBankDetails.beneficiaries = undefined;

        const alluserbankdetails = [];

        for (i = 0; i < allUsersBankDetails.length; i++) {
            const {
                accountHolderName,
                bankName,
                ifsc,
                accountNo,
                accountType } = allUsersBankDetails[i];
            const { name, email } = allUsersBankDetails[i].user
            alluserbankdetails.push({
                name, email,
                accountHolderName,
                bankName,
                ifsc,
                accountNo,
                accountType
            })
        }


        res.status(200).json({
            success: true,
            alluserbankdetails
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const allUserTransactions = async (req, res) => {
    try {
        const allUsersTransactions = await Transactions.find();
        res.status(201).json({
            success: true,
            allUsersTransactions
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const allUserBankings = async (req, res) => {
    try {
        const users = await User.find({});
        //Banking- all users' (Name/email/banking: authorized amount, 
        //locked amount, auto: withdrawable amount, disbursed amount.
        const usersBanking = [];
        for (i = 0; i < users.length; i++) {
            let user = users[i];
            const userBanking = {
                name: user.name,
                email: user.email,
                allocatedAmount: user.allocatedAmount,
                locekdAmount: user.locekdAmount,
                withdrawableamount: user.withdrawableamount,
                disbursedAmount: user.disbursedAmount
            }
            usersBanking.push(userBanking)
        }
        res.status(200).json({
            success: true,
            usersBanking
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
module.exports = {
    allUserBankings,
    changeStatus, allocatedAmount, locekdAmount, getAllUser, getUser
    , getWithdraw_request, block_request_change, deleteUser, singleUserKyc,
    userBankDetails, userTransactions, allUserTransactions, allUserBankdetails: allUserBankdetailsfunction
}