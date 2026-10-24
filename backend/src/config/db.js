import mongoose from "mongoose";
export const dbConnect=async()=>{
    try {

        console.log(process.env.MONGO_URI)

        const conn=await mongoose.connect(process.env.MONGO_URI,{
            maxPoolSize: 10,
        });
        console.log("Mongodb connected successfully:",conn.connections[0].host)

        

        
    } catch (error) {
        console.log("Mongodb db connection error in sbconnect",error)
        process.exit(1)
        
    }
}