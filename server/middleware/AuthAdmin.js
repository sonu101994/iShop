const jwt=require("jsonwebtoken");
const AdminModel=require("../models/AdminModel");
const {message}=require("../library/helper");

const AuthAdmin=(roles=[])=>{
    return async (req,res,next)=>{
        try {
            const authHeader=req.headers.authorization;
            if (!authHeader) {
                return res.send(message.general_error("No Token Found"));
            }

            const token=authHeader.startsWith("Bearer")
                ?authHeader.split(" ")[1]
                :authHeader;

                const decoded=jwt.verify(token,process.env.JWT_SECRET);

                const admin=await AdminModel.findById(decoded.id);

                if(!admin){
                    return res.send(message.general_error("admin not found"));
                }

                if(roles.length&&!roles.includes(admin.role)){
                    return res.send(message.general_error("access denied"));
                }
                req.admin=admin;
                next();

        } catch (error) {
            console.log(error);
              return res.send({ flag: 0, msg: "Token invalid or expired" });
        }
    }
}

module.exports=AuthAdmin;