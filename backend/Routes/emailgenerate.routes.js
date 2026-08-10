import express from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import verifyUser from "../Middleware/verifyuser.middleware.js";
import { testgroq } from "../Utils/llm.js";
const router = express.Router();
const prisma = new PrismaClient();
router.post("/generate",verifyUser,async(req,res)=>{
    try{
        const userid =  req.user.id
         const {templateId,recipientId} =  req.body
          if(!templateId || !recipientId){
            return res.status(400).json({message:"invalid data"})
         }
         const IstemplateUser = await prisma.template.findUnique({
            where:{
                id:templateId
            }
         })
         if(!IstemplateUser){
            return res.status(404).json({message:"template not found"})
         }
         if(IstemplateUser.userId!==userid){
            return res.status(403).json({message:"Unauthorized access"})
         }
         const IsrecipinetUser = await prisma.recipient.findUnique({
            where:{
                id:recipientId
            }
         })
         if(!IsrecipinetUser){
        return res.status(404).json({message:"recipinet not found"})
         }
        if(IsrecipinetUser.userId!==userid){
        return res.status(403).json({message:"Unauthorized access"})
         } 
const prompt = `
You are an assistant that writes personalized professional cold emails.
Recipient name: ${IsrecipinetUser.name}
Company name: ${IsrecipinetUser.companyName}
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
const response = await testgroq(prompt)
    return res.status(200).json({message:"Email generated successfully",email:response})
    }   
    catch(error){
        console.log(error);
        res.status(500).json({message:"Internal server error"})
    }
})

export default router;