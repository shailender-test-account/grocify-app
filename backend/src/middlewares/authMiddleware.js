import jwt from "jsonwebtoken";
import { Usermodel } from "../models/usermodel.js";

export const authenticateuser = async(req, res, next) => {
    try {

        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log("token in auth is",token)
        }


        if(!token){
            return res.status(401).json(
                {
                    message:"Authentication failed ! Please login",
                    success:false
                }
            )
        }

        const decoded=await jwt.verify(token,process.env.JWT_SECRET)
        const user=await Usermodel.findOne({_id:decoded.id});
        if(!user){
            return res.status(401).json(
                {
                    message:"Authentication failed ! Please register now",
                    success:true
                }
            )
        }

        req.user=user;

        next();







    } catch (error) {
        res.status(500).json(
            {
                message:`Something wents wrong in authentication:${error}`,
                success:false
            }
        )

    }


}


export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }
    next();
  };
};