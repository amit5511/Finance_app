const mongoose = require('mongoose');
const { isEmail, isStrongPassword } = require('validator')
const bcryptjs = require('bcryptjs')
const crypto = require('crypto');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: [3, "Name Shout grater than 3 character"]
  },
  email: {
    type: String,
    required: true,
    unique: [true, "User already exists"],
    validate: [isEmail, 'Invalid Email']
  },
  // phone:{
  //   type:String,
  //   require:true,
  //unique:true,
  // },
  password: {
    type: String,
    required: true,
    validate: [isStrongPassword, "Weak password :{ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}"],
    select: false

  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  allocatedAmount: {
    type: String,
    default: 0

  },
  locekdAmount: {
    type: String,
    default: 0
  },
  withdrawableamount: {
    type: String,
    default: 0
  },
  disbursedAmount:{
    type: Number,
    default: 0
  },
 
  isAdmin: {
    type: String,
    default: "user",
    
    
  },
  isBlock: {
    type: String,
    default: "false"
  },
  bankDetails:{
    type:mongoose.Schema.ObjectId,
    ref:"AccountDetails",
    select:false,
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
},
{timestamps: true}
)

//before saving data hash the password
userSchema.pre("save", async function (next) {

  if (this.isModified("password")) {
    //if modified
    this.password = await bcryptjs.hash(this.password, 10);
  }
  next();
});

//compare password
userSchema.methods.comparePassword = async function (entred_password) {

  return await bcryptjs.compare(entred_password, this.password);
}

//generating reset password token
userSchema.methods.getResetPasswordToken = async function () {

  const resetToken = await crypto.randomBytes(20).toString("hex");
  //hashing and adding the reset password to userschema
  this.resetPasswordToken = await crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //password expire in 5 minutes
  this.resetPasswordExpire = Date.now() + 5 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;