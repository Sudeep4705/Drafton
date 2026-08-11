import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import UserRoute from "./Routes/user.routes.js"
import TemplateRoute from "./Routes/template.routes.js"
import RecipientRoute from "./Routes/recipient.routes.js"
import EmailGenerateRoute from "./Routes/emailgenerate.routes.js"
import OauthRoute from "./Routes/Oauth.routes.js"
dotenv.config()
const app = express();


// middleware
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({origin:"http://localhost:5173",credentials:true}))
app.use(cookieParser())

// routes
app.use("/auth",OauthRoute)
app.use("/user",UserRoute)
app.use("/template",TemplateRoute)
app.use("/recipient",RecipientRoute)
app.use("/email",EmailGenerateRoute)


// server
app.listen(5555, () => {
  console.log("SERVER IS LISTENING ON PORT 5555");
});
