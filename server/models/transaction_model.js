const mongoose =require('mongoose');



const transactionSchema = new mongoose.Schema({

    transactions:[{
        amount:{type :String,
            require:true,
        },
        transactionAt:{
           type:Date,
           default:Date.now()
        },
        transactionId:{
            type:String,
            default:"None",
            require:true
        },
        status:{
         type:String,
         default:"processing",
         required:true,
        }
     }],
     bankDetails:{
        type:mongoose.Schema.ObjectId,
        ref:"AccountDetails",
        required:true
     },
     user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
     }
})

const Transactions=  mongoose.model("Transactions",transactionSchema);
module.exports=Transactions;