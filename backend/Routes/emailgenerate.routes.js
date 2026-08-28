import express from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import verifyUser from "../Middleware/verifyuser.middleware.js";
import { google } from "googleapis";
import { generateEmail } from "../Utils/llm.js";
const router = express.Router();
const prisma = new PrismaClient();
router.post("/generate", verifyUser, async (req, res) => {
  try {
    const userid = req.user.id;
    const { templateId } = req.body;
    if (!templateId) {
      return res.status(400).json({ message: "invalid data" });
    }
    const IstemplateUser = await prisma.template.findUnique({
      where: {
        id: templateId,
      },
    });
    if (!IstemplateUser) {
      return res.status(404).json({ message: "template not found" });
    }
    if (IstemplateUser.userId !== userid) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    const IsrecipinetUser = await prisma.recipient.findMany({
      where: {
        userId: userid,
      },
    });
    console.log(IsrecipinetUser);
    if (IsrecipinetUser.length === 0) {
      return res.status(404).json({ message: "recipinet not found" });
    }
    const Recipient = IsrecipinetUser[0];
    const prompt = `
You are an assistant that writes personalized professional cold emails.
Recipient name: ${Recipient.name}
Company name: ${Recipient.companyName}
Use the following template as the basis for the email:
${IstemplateUser.templateContent}
Generate a professional and personalized cold email for this recipient.
Rules:
- Personalize the email using the recipient's name and company name.
- Follow the intent and structure of the provided template.
- Keep it concise and professional.
- Do not explain what you did.
- Do not provide analysis.
- Do not provide a list of objectives.
- Return only the final email.
- Include a subject line.
Output only the email.
`;
    const response = await generateEmail(prompt);
    return res
      .status(200)
      .json({ message: "Email generated successfully", email: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const oauthClient =  new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)


router.post("/send/:id", verifyUser, async (req, res) => {
  let CurrRecipient;
  try {
    console.log("im at send email");  
    const id = req.user.id;
    const ApprovedTemplate = Number(req.params.id);
    if (!ApprovedTemplate) {
      return res.status(404).json({ message: "Template Not found" });
    }
    const IstemplateUser = await prisma.template.findFirst({
      where: {
        userId: id,
        id: ApprovedTemplate,
      },
    });
    if (!IstemplateUser) {
      return res.status(403).json({ message: "Unauthorised access" });
    }
    const recipients = await prisma.recipient.findMany({
      where: {
        status: "PENDING",
        userId: id,
      },
    });
    if (recipients.length === 0) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    CurrRecipient =recipients[0]

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const access_token = user.googleAccessToken;
    const refresh_token = user.googleRefreshToken;

    if (!access_token || !refresh_token) {
      return res
        .status(400)
        .json({ message: "Please connect the email first" });
    }

    oauthClient.setCredentials({
      access_token: access_token,
      refresh_token: refresh_token,
    });

    console.log(recipients[0]);
const aiEmail = IstemplateUser.templateContent;

const rawEmail = `To: ${recipients[0].email}
Subject: Hello from Drafton

${aiEmail}`;
    console.log(rawEmail);
    const encodedEmail = Buffer.from(rawEmail).toString("base64url");
    console.log(encodedEmail);
     const gmail = google.gmail({
    version: "v1",
    auth: oauthClient,
  });
  await prisma.sendHistory.create({
  data:{
    userId:id,
    recipientId:CurrRecipient.id
  }
})
  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedEmail,
    },
  });
await prisma.recipient.update({
  where:{
    id:CurrRecipient.id
  },data:{
    status:"SENT"
  }
})

    return res.status(200).json({ template: IstemplateUser });
  } catch (error) {
    console.log(error);
    if(CurrRecipient){
      await prisma.recipient.update({
    where:{
    id:CurrRecipient.id
  },data:{
    status:"FAILED"
  }
})
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
