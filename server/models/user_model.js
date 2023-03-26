const mongoose = require('mongoose');
const { isEmail,isStrongPassword } = require('validator')
const bcryptjs = require('bcryptjs')
const crypto =require('crypto')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: [true, "User already exists"],
    validate: [isEmail, 'Invalid Email']
  },
  password: {
    type: String,
    required: true,
    validate:[isStrongPassword,"Weak password :{ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}"]

  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}
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
  return await  bcryptjs.compare(entred_password, this.password);
}

//generating reset password token
userSchema.methods.getResetPasswordToken =async function () {

  const resetToken = await crypto.randomBytes(20).toString("hex");
  //hashing and adding the reset password to userschema
  this.resetPasswordToken =await crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //password expire in 5 minutes
  this.resetPasswordExpire = Date.now() + 5 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;