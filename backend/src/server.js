
import app from "./app.js";
import dotenv from "dotenv";

import { dbConnect } from "./config/db.js";
import job from "./config/cron.js";

dotenv.config(
    {
        path: "./.env",

    }
)



const startserver = async () => {
    try {
        await dbConnect()

        app.listen(process.env.PORT, () => {
            console.log("Server is running on port:", process.env.PORT)

            // ✅ Start cron ONLY after server + DB are up
            if (process.env.ENABLE_CRON !== "false") {
                job.start();
                console.log("[cron] Ping job started (every 14 min)");
            } else {
                console.log("[cron] Cron disabled via ENABLE_CRON=false");
            }
        })




    } catch (error) {
        console.log("Soemthing wents wrong in start server", error)

    }
}



const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down...`);
    cronJob.stop();
    if (server) {
        server.close(() => {
            console.log("HTTP server closed.");
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startserver()