const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Account Holder name required"],
        minLength:3
    },
    bank_name:{
        type:String,
        required:[true,"Bankname is required"]
    },
    ifsc:{
        type:String,
        required:[true,"IFSC is required"]
    },
    account_no:{
        type:String,
        required:[true,"Account number is required"],
        unique:[true,"Account number not unique"]
    },
    type:{
        type:String,
        required:[true,"Account type is required"],
        default:"savings"
    }
})

const AccountDetails = mongoose.model("AccountDetails",accountSchema);
module.exports=AccountDetails;