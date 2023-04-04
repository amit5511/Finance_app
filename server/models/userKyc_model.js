const mongoose = require('mongoose');


const userKycSchema = new mongoose.Schema({
 
    aadhaarId: {
      type: String,
      required: true
    },
    panId: {
      type: String,
      required: true
    },
    dob: {
      type: String,
      required: true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        required:true,
        unique:true,
        ref:"User",
        select:false
    }
  },
)


const Userkyc = mongoose.model("Userkyc", userKycSchema);
module.exports = Userkyc;