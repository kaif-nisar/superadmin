import express from "express";
import { configDotenv } from "dotenv";

configDotenv();
const app = express();

app.use(express.static('public'))

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

export default app;