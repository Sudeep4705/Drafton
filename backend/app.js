import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import UserRoute from "./Routes/user.routes.js"
dotenv.config()
const app = express();


// middleware
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({origin:"http://localhost:5173",credentials:true}))


// routes
app.use("/user",UserRoute)


// server
app.listen(5555, () => {
  console.log("SERVER IS LISTENING ON PORT 5555");
});
