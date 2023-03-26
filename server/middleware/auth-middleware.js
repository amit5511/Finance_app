const User = require('../models/user_model');
const tokenService = require('../services/token-service')
class Auth_middleware {


    async isAuth(req, res, next) {
        try {
            const { accessToken } = req.cookies;
            if (!accessToken || accessToken == null) {
                throw new Error("Please login to access resources!!");
            }
            else {
                const { _id } = await tokenService.verifyAccessToken(accessToken);
                const user = await User.findById(_id);
                req.user = user;
                next();
            }
        } catch (error) {
                res.status(401).json({
                success: false,
                message: error.message
            })
        }
    }
}

module.exports = new Auth_middleware();