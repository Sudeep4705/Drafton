import express from "express";
import OauthClient from "../Utils/googleOauth.js";
import { google } from "googleapis";
import crypto  from "crypto"
const router = express.Router();

const statecode =  crypto.randomBytes(32).toString("hex")

router.get("/google", async (req, res) => {
  try {
    const authUrl = OauthClient.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.send"],
      state:statecode
    });
    console.log(authUrl);
    res.redirect(authUrl);
  } catch (error) {
    return res.status(500).json({ message: "intenal server error" });
  }
});
export async function gmailservice(encodedEmail){
      // creating the gmail api service and providing the version and ouathclient bcz i holds the accesstoken and refreshtoken
    const gmail = google.gmail({
      version:"v1",
      auth:OauthClient
    })  
  const response =  await gmail.users.messages.send({
    userId:"me",
    requestBody:{
      raw:encodedEmail
    }
  })
  return response;
}

router.get("/google/callback",async (req, res) => {
  try {
    const { code,state } = req.query;
    if(state!==statecode){
      return res.status(403).json({message:"Forbidden"})
    }
    const { tokens } = await OauthClient.getToken(code);
    OauthClient.setCredentials(tokens)
    return res.json({message:"Google Oauth Successfull"})
  } catch (error) {
    return res.status(500).json({ message: "intenal server error" });
  }
});


export default router;
