import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();



const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
// console.log(allowedOrigins);
// console.log("Allowed origins:", allowedOrigins);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) {
                // Allow requests with no origin (like mobile apps or curl requests)
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                // Allow specific origins
                callback(null, true);
            } else {
                // If you want to allow all origins
                callback(null, true);
            }
        },
        credentials: true, // Allow cookies and credentials
    })
);




app.use(express.static("public"));
app.use(express.json({ limit: "1600mb" }));
app.use(express.urlencoded({ extended: true, limit: "1600mb" }));
app.use(cookieParser());

import allroutes from './src/routes/index.js';

app.use('/', allroutes);

export { app };
