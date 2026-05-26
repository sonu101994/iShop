const jwt=require("jsonwebtoken");
const UserModel=require("../models/UserModel");
const {message}=require("../library/helper");

const AuthUser=async(req,res,next)=>{
    try {
        const authHeader=req.headers.authorization;
        if (!authHeader) {
            return res.send(message.general_error("no token found"));
        }

        const token =authHeader.startsWith("Bearer")
            ?authHeader.split(" ")[1]
            :authHeader;

            const decoded=jwt.verify(token,process.env.JWT_SECRET);

            const user=await UserModel.findById(decoded.id);
            if (!user) {
                return res.send(message.general_error("user not found"));
            }

            if(!user.status){
                return res.send(message.general_error("account blocked"));
            }

            req.user=user;
            next();
    } catch (error) {
        return res.send(message.general_error("token invalid or expired"));
    }
};

module.exports=AuthUser;

