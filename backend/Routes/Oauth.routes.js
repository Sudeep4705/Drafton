import express from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import OauthClient from "../Utils/googleOauth.js";
import { google } from "googleapis";
import crypto from "crypto";
const prisma = new PrismaClient();
const router = express.Router();
import verifyUser from "../Middleware/verifyuser.middleware.js";
const statecode = crypto.randomBytes(32).toString("hex");

router.get("/google", async (req, res) => {
  try {
    const authUrl = OauthClient.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.send"],
      state: statecode,
      prompt:"consent"
    });
    
    console.log(authUrl);
    res.redirect(authUrl);
  } catch (error){
    return res.status(500).json({ message: "intenal server error" });
  }
});


router.get("/google/callback", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("user",userId); 
    const { code, state } = req.query;
    if (state !== statecode) {
      return res.status(403).json({ message: "Forbidden" });
    }
    console.log(state);
    
    const { tokens } = await OauthClient.getToken(code);
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
      },
    });
    OauthClient.setCredentials(tokens);
    return res.json({ message: "Google Oauth Successfull" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "intenal server error" });
  }
});

export default router;
