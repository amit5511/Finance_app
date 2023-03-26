const router = require('express').Router();
const {register,login,loadUser,logOutUser,
    resetPasswordToken,
    resetPassword
}=require('../controller/userController');
const authMiddleware = require('../middleware/auth-middleware');

//login signup route
router.route('/register').post(register);
router.route('/login').post(login);

//load user
router.route('/load-user').get(authMiddleware.isAuth,loadUser);

//Reset password link
router.route('/resetpasswordlink').post(resetPasswordToken)

//reset route
router.route('/password/reset/:token').put(resetPassword);

//logout user
router.route('/logout-user').get(logOutUser);











module.exports=router