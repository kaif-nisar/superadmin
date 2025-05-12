import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import Connect_DB  from "./src/db/index.js";
import  userRouter from "./src/routes/user.routes.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";

configDotenv();
const app = express();

// मिडलवेयर्स
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// राउट्स
app.use("/api/v1/user", userRouter);




// Sample route to verify token
app.get('/api/verify-token', verifyJWT, (req, res) => {
    res.json({ isAuthorized: true, user: req.user });
});


// Sample protected route
app.get('/api/protected', verifyJWT, (req, res) => {
    res.json({ message: 'This is a protected route.', user: req.user });
}); 


// डेटाबेस कनेक्शन
Connect_DB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed:", err);
    });























    
export default app;