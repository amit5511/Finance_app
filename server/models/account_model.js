const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    accountHolderName: {
        type: String,
        required: [true, "Account Holder name required"],
        minLength: 3
    },
    bankName: {
        type: String,
        required: [true, "Bankname is required"]
    },
    ifsc: {
        type: String,
        required: [true, "IFSC is required"]
    },
    accountNo: {
        type: String,
        required: [true, "Account number is required"]
    },
    accountType: {
        type: String,
        required: [true, "Account type is required"],
        default: "savings"
    },


    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        
        ref: "User",
        select: false
    },


})

const AccountDetails = mongoose.model("AccountDetails", accountSchema);
module.exports = AccountDetails;