import express from "express";
import OauthClient from "../Utils/googleOauth.js";
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

router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await OauthClient.getToken(code);
    console.log(tokens);
  } catch (error) {
    return res.status(500).json({ message: "intenal server error" });
  }
});

export default router;
