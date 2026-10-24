import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redisclient from "../config/redis.js";
import { Usermodel } from "../models/usermodel.js";
import { sendOtpEmail } from "../services/emailservice.js";



const generatetoken = (email, _id, role) => {
    return jwt.sign(
        {
            id: _id,
            role: role,
            email: email
        },
        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }
    )

}

export const registercontroller = async (req, res) => {
    try {

        const { username, email, password, role, fcmToken } = req.body;

        if ([username, email, password, role].some((field) => {
            field.trim() === ""

        })) {
            return res.status(400).json(
                {
                    message: "All fileds are required",
                    success: false
                }
            )
        }


        const existinguser = await Usermodel.findOne({ email });
        if (existinguser) {
            res.status(400).json(
                {
                    message: "User already exist ! Please login",
                    success: false
                }
            )
        }

        const otp =Math.floor(100000 + Math.random() * 900000);

        const payload = JSON.stringify({ username, email, password,role, fcmToken, otp });
        await redisclient.set(`Temp_user:${email}`, payload, "EX", 600);
       



        // await send otp 
        await sendOtpEmail(email, otp);
        res.status(200).json(
            {
                message: "OTP sent successfully please check your email",
                success: true
            }
        )












    } catch (error) {
        return res.status(500).json(
            {
                message: `Something wents wrong in send otp in resister:${error}`,
                success: false
            }
        )

    }

}


export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const cachedData = await redisclient.get(`Temp_user:${email}`);
       
       
        if (!cachedData) {
            return res.status(400).json({ success: false, message: 'OTP expired or invalid session' });
        }

        const { username, password,role, fcmToken, otp: storedOtp } = JSON.parse(cachedData);
        
        if (storedOtp !== Number(otp)) {
            return res.status(400).json({ success: false, message: 'Invalid OTP code' });
        }

        const newUser = await Usermodel.create({
            username,
            email,
            role,
            password,
            fcmToken,
            isVerified: true,
        });

        await redisclient.del(`temp_user:${email}`);

        const token = generatetoken(newUser.email, newUser._id, newUser.role);

        return res.status(200).json(
            {
                message: "User verified successfully",
                success: true,
                token,
                user: newUser
            }
        )






    } catch (error) {
        return res.status(500).json(
            {
                message: `Something wents wrong:${error}`,
                success: false
            }
        )

    }

}




export const logincontroller = async (req, res) => {
    try {
        const { email, password, fcmToken } = req.body;

        const user = await Usermodel.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found ! Please register now' });
        }

        const ismatchpassword = await bcrypt.compare(password, user.password)


        if (!ismatchpassword) {
            return res.status(400).json(
                {
                    message: "Invalid email or password",
                    success: false
                }
            )
        }



        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: 'Please verify your account first' });
        }

        if (fcmToken) {
            user.fcmToken = fcmToken;
            await user.save();
        }

        const token = generatetoken(user.email, user._id, user.role);

        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        return res.status(500).json(
            {
                message: `Something wents wrong in login:${error}`,
                success: true
            }
        )
    }
};