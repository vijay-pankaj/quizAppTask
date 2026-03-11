import express from 'express'
import authRoutes from "./src/routes/authRoutes.js"
import adminRoutes from "./src/routes/adminRoutes.js";
import clientRoutes from "./src/routes/clientRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js"
import dotenv from "dotenv";
import cors from "cors"
dotenv.config();

const app = express()
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Quiz Platform API Running")
})

const PORT = process.env.PORT || 9000

app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/student", studentRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})