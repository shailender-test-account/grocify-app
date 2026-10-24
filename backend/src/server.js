
import app from "./app.js";
import dotenv from "dotenv";

import { dbConnect } from "./config/db.js";

dotenv.config(
    {
        path:"./.env",
        
    }
)



const startserver=async()=>{
    try {
       await dbConnect()

       app.listen(process.env.PORT,()=>{
         console.log("Server is running on port:",process.env.PORT)
       })



        
    } catch (error) {
        console.log("Soemthing wents wrong in start server",error)
        
    }
}

startserver()