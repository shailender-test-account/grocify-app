import express from "express";
import { globalRateLimiter } from "./middlewares/ratelimiter.js";
import Userrouter from "./routes/authroutes.js";
import dotenv from "dotenv"
import cors from "cors";

dotenv.config(
    {
        path:"./.env"
    }
)






const app=express();






app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static("public"));
app.use(globalRateLimiter);


app.use("/api/v1/auth",Userrouter)


export default app;
