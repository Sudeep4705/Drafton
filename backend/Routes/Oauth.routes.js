import express from "express";
import OauthClient from "../Utils/googleOauth.js";
import { google } from "googleapis";
const router = express.Router();

router.get("/google", async (req, res) => {
  try {
    const authUrl = OauthClient.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.send"],
    });
    console.log(authUrl);
    
    res.redirect(authUrl);
  } catch (error) {
    return res.status(500).json({ message: "intenal server error" });
  }
});

router.get("/google/callback",async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await OauthClient.getToken(code);
    OauthClient.setCredentials(tokens)
    console.log(tokens);
    // creating the gmail api service and providing the version and ouathclient bcz i holds the accesstoken and refreshtoken
    const gmail = google.gmail({
      version:"v1",
      auth:OauthClient
    })
    const aiEmail ="Hi im goat, I noticed your company and wanted to reach out"
    const rawEmail = `To:${"recipentemail"}
    ${aiEmail}
    `
    return res.json({message:"Google Oauth Successfull "})
  } catch (error) {
    return res.status(500).json({ message: "intenal server error" });
  }
});


export default router;
