import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // or ./db depending on file location
import router from "./routes/AllRoutes.js";
import cors from 'cors';

dotenv.config(); // Load environment variables
// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
//app.use(cors({ origin: "http://localhost:3000" })); // Replace with your frontend URL

app.use(express.json()); // Parse JSON request bodies
app.use("/api/users", router); // use routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



