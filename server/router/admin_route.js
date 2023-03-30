const router = require('express').Router();
const { allocatedAmount, getAllUser,locekdAmount
,getUser,getWithdraw_request,
changeStatus,block_request_change} = require('../controller/adminController');
const AuthMiddleware = require('../middleware/auth-middleware');


//set alloated Amount
router.route('/setallocated_amount/:user_Id')
.post(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,allocatedAmount);

//set locked amount
router.route('/setlocked_amount/:user_Id')
.post(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,locekdAmount);

// process withdaw req
router.route('/changed-status/:user_Id')
.put(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,changeStatus);

//all register user
router.route('/all-user')
.get(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,getAllUser);

//get a single user
router.route('/get-user/:user_Id').get(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,getUser)

//check withdraw request
router.route('/withdraw-request').get(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,getWithdraw_request);

//block user
router.route('/change-block-status/:user_Id').get(AuthMiddleware.isAuth,AuthMiddleware.isAdmin,block_request_change);







module.exports=router;