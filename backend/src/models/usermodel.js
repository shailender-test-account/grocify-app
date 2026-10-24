import mongoose from "mongoose";
import bcrypt from "bcrypt"


const Userschema=new mongoose.Schema(
    {
         username:{
            type:String,
            required:[true,"Username is required"],
            trim:true

         },

         email:{
            type:String,
            required:[true,"Email is required"],
            trim:true,
            unique:true
            
         },

         password:{
            type:String,
            required:[true,"Password is required"]

         },

         isVerified:{
            type:Boolean,
            default:false
         },

         role:{
            type:String,
            enum:["customer","admin"],
            default:"cutsomer",
            required:true

         },


          fcmToken:{
            type:String,
            default:null

         }

       

    },{
        timestamps:true
    }
)


Userschema.index({email:1, createdAt:-1});
Userschema.index({role:1, isVerified:1});


Userschema.pre("save",async function (){
    if(!this.isModified("password")) return;

    this.password=await bcrypt.hash(this.password,10)
})


export const Usermodel=mongoose.model("user",Userschema);