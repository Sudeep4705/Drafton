import express from "express";
import userVerify from "../Middleware/verifyuser.middleware.js";
import { Prisma, PrismaClient } from "@prisma/client";
const router = express.Router();
const prisma = new PrismaClient();

router.post("/", userVerify, async (req, res) => {
  try {
    const { templateName, templateContent } = req.body;
    if (!templateContent || !templateName) {
      return res.status(400).json({ message: "Invalid data" });
    }
    const user = req.user;
    if (!user) {
      return res.status(403).json({ message: "Please login" });
    }
    const templatedata = await prisma.template.create({
      data: {
        templateName: templateName,
        templateContent: templateContent,
        userId: user.id,
      },
    });
    return res.status(201).json({ message: "Template added", templatedata });
  } catch (error) {
    return res.status(500).json({ message: "intenal server error" });
  }
});

router.get("/", userVerify, async (req, res) => {
  try {
    const id = req.user.id;
    const getTemplate = await prisma.template.findMany({
      where: {
        userId: id,
      },
    });
    res.status(200).json({ data: getTemplate });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "intenal server error" });
  }
});

router.get("/:id", userVerify,async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id
    const getTemplateByid = await prisma.template.findUnique({
      where: {
        id: Number(id),
      },
    });
    if(!getTemplateByid){
         return res.status(404).json({message:"Template not found"})
    }
       if(getTemplateByid.userId!=userId){
        return res.status(403).json({message:"Unauthorized access"})
    }
    return res.status(200).json({ data: getTemplateByid });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
});


router.put("/:id",userVerify,async(req,res)=>{
    try{
        const id = req.params.id
    const userId = req.user.id
    const {templateName,templateContent} =  req.body
    if(!templateContent.trim() || !templateName.trim()){
        return res.status(400).json({message:"Invalid data"})
    }
    const checkUser = await prisma.template.findUnique({
        where:{
            id:Number(id)
        }
    })
     if(!checkUser){
         return res.status(404).json({message:"Template not found"})
    }
    if(userId!==checkUser.userId){
         return res.status(403).json({message:"Unauthorized access"})
    }
    const updateTemplate = await prisma.template.update({
        where:{
            id:Number(id)
        },
        data:{
            templateName,templateContent
        }
    })
    return res.status(200).json({data:updateTemplate})
    }catch(error){
            res.status(500).json({ message: "internal server error" });
    }
})


router.delete("/:id",userVerify,async(req,res)=>{
    try{
          const id = req.params.id
    const userId =  req.user.id

       const checkUser = await prisma.template.findUnique({
        where:{
            id:Number(id)
        }
    })
     if(!checkUser){
         return res.status(404).json({message:"Template not found"})
    }
      if(userId!==checkUser.userId){
         return res.status(403).json({message:"Unauthorized access"})
    }
    const deleteTemplate = await prisma.template.delete({
        where:{
            id:Number(id)
        }
    })
    return res.status(200).json({message:"Template deleted",data:deleteTemplate})
    }catch(error){
          res.status(500).json({ message: "internal server error" });
    }
})


export default router;
