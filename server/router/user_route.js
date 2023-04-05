const router = require('express').Router();
const {register,login,loadUser,logOutUser,
    resetPasswordToken,
    resetPassword,
    addaccount,
    withdrawRequest,
    allTransactions,addKyc, updateKyc,
    getaccount,
    updateaccount,
    getKyc//,getbeneficiaries,addbeneficiarie,updatebeneficiarie,deletebeneficiarie
}=require('../controller/userController');
const authMiddleware = require('../middleware/auth-middleware');

//register route
router.route('/register').post(register);

//login route
router.route('/login').post(login);

//load user
router.route('/load-user').get(authMiddleware.isAuth,loadUser);

//Reset password link
router.route('/resetpasswordlink').post(resetPasswordToken)

//reset password  route
router.route('/password/reset/:token').put(resetPassword);

//logout user
router.route('/logout-user').get(logOutUser);

//get bank account details
router.route('/account').get(authMiddleware.isAuth,getaccount);

//bank account setup
router.route('/add-account').post(authMiddleware.isAuth,addaccount);

//edit bank details
router.route('/update-account').put(authMiddleware.isAuth,updateaccount);

//get kyc deatils
router.route('/kyc').get(authMiddleware.isAuth,getKyc);

//kyc add(Aadhaar, PAN and DOB)
router.route('/add-kyc').post(authMiddleware.isAuth,addKyc);

//kyc update
router.route('/update-kyc').put(authMiddleware.isAuth,updateKyc);




//See all transactions
router.route('/all-transactions').get(authMiddleware.isAuth,allTransactions);

//withdraw request
router.route('/withdrawrequest').get(authMiddleware.isAuth,withdrawRequest);





module.exports=router