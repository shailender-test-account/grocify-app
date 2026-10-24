import express from "express";
import { logincontroller, registercontroller, verifyOtp } from "../controllers/authcontrollers.js";
import { authRateLimiter } from "../middlewares/ratelimiter.js";
import { validate } from "../middlewares/validateRequest.js";
import { loginSchema, registerSchema, verifyOtpSchema } from "../validations/authschema.js";

const Userrouter=express.Router();

Userrouter.route("/register").post(authRateLimiter,validate(registerSchema),registercontroller);
Userrouter.route("/verify-otp").post(authRateLimiter,validate(verifyOtpSchema),verifyOtp);
Userrouter.route("/login").post(authRateLimiter,validate(loginSchema),logincontroller);


export default Userrouter;
