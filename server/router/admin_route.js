const router = require('express').Router();
const { allocatedAmount, getAllUser,locekdAmount
,getUser,getWithdraw_request,
changeStatus,block_request_change, deleteUser,singleUserKyc,
userBankDetails,userTransactions,allUserTransactions,allUserBankdetails,
allUserBankings
} = require('../controller/adminController');
const AuthMiddleware = require('../middleware/auth-middleware');


//set alloated Amount
router.route('/setallocated_amount/:user_Id')
.post(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,allocatedAmount);

//set locked amount
router.route('/setlocked_amount/:user_Id')
.post(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,locekdAmount);

// for process of withdraw request
router.route('/changed-status/:user_Id')
.put(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,changeStatus);

//all register user
router.route('/all-user')
.get(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,getAllUser);

//get bank details all users
router.route('/allUser-bankdetails').get(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,allUserBankdetails)

//get transaction details all user
// router.route('/allUser-transactions').get(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,allUserTransactions)

//Banking- all users' (Name/email/banking: authorized amount, locked amount, auto: withdrawable amount, disbursed amount.
router.route('/allUser-banking').get(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,allUserBankings)


//get a single user
router.route('/get-user/:user_Id').get(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,getUser)

//get single user bank details
router.route('/user-bankdetails/:user_Id').get(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,userBankDetails)

//get single user transiction history
router.route('/user-transationHistory/:user_Id').get(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,userTransactions)
//get single user kyc
router.route('/kyc-details/:user_Id').get(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,singleUserKyc);

//check withdraw request
router.route('/withdraw-request').get(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,getWithdraw_request);

//block user
router.route('/change-block-status/:user_Id').put(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,block_request_change);

//delete user
router.route('/delete-User/:user_Id').delete(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,deleteUser);






module.exports=router;