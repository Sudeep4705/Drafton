import express from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import verifyUser from "../Middleware/verifyuser.middleware.js";
import upload from "../Middleware/uploads.middleware.js";
import xlsx from "xlsx";
const router = express.Router();
const prisma = new PrismaClient();

router.post("/", verifyUser, async (req, res) => {
  try {
    const { name, email, companyName } = req.body;
    const userid = req.user.id;
    if (!name?.trim() || !email?.trim() || !companyName?.trim()) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const existingRecipient = await prisma.recipient.findFirst({
      where: {
        email: email,
        companyName: companyName,
        userId: userid,
      },
    });

    if (existingRecipient) {
      return res.status(409).json({ message: "Recipient already exist" });
    }
    const recipient = await prisma.recipient.create({
      data: {
        name,
        email,
        companyName,
        userId: userid,
      },
    });
    res.status(201).json({ data: recipient });
  } catch (error) {
    return res.status(500).json({ message: "Intenal server error" });
  }
});

router.get("/", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const allRecipient = await prisma.recipient.findMany({
      where: {
        userId: userId,
      },
    });
    return res
      .status(200)
      .json({ data: allRecipient, message: "Recipient fetched Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Intenal server error" });
  }
});

router.get("/:id", verifyUser, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const recipientByid = await prisma.recipient.findUnique({
      where: {
        id: Number(id),
      },
    });
    if (!recipientByid) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    if (recipientByid.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    return res.status(200).json({ data: recipientByid });
  } catch (error) {
    return res.status(500).json({ message: "Intenal server error" });
  }
});

router.put("/:id", verifyUser, async (req, res) => {
  try {
    const { companyName, email } = req.body;
    if (!email?.trim() || !companyName?.trim()) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const id = Number(req.params.id);
    console.log(id);
    const userId = req.user.id;
    const recipientByid = await prisma.recipient.findUnique({
      where: {
        id: id,
      },
    });
    console.log(recipientByid);

    if (!recipientByid) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    if (recipientByid.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    const existingRecipient = await prisma.recipient.findFirst({
      where: {
        companyName: companyName,
        email: email,
        userId: userId,
        id: {
          not: id,
        },
      },
    });
    if (existingRecipient) {
      return res.status(409).json({ message: "Recipent already exist" });
    }
    const updatedRecipient = await prisma.recipient.update({
      where: {
        id: id,
      },
      data: {
        companyName: companyName,
        email: email,
      },
    });
    return res
      .status(200)
      .json({ data: updatedRecipient, message: "Updated successfully " });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Intenal server error" });
  }
});

router.delete("/:id", verifyUser, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const recipientByid = await prisma.recipient.findUnique({
      where: {
        id: id,
      },
    });
    if (!recipientByid) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    if (recipientByid.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    const deletedRecipient = await prisma.recipient.delete({
      where: {
        id,
      },
    });
    return res.status(200).json({
      message: "Recipient deleted successfully",
      data: deletedRecipient,
    });
  } catch (error) {
    return res.status(500).json({ message: "Intenal server error" });
  }
});

router.post("/upload",verifyUser, upload.single("file"), async (req, res) => {
  try{
      const userid = req.user.id
  if(!req.file){
    return res.status(400).json({message:"Please upload an excel file"})
  }
  const workbook = xlsx.read(req.file.buffer);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName]
  const jsonSheets = xlsx.utils.sheet_to_json(worksheet);
  const newRecipient = jsonSheets.map((recipient)=>{
  const newobj = {name:recipient.Name,
    companyName:recipient["Company Name"],
    email:recipient["Email Address"],
    userid:userid
  }
   return newobj
  })
  const allRecipient = await prisma.recipient.createMany({
    data:newRecipient,
    skipDuplicates:true
  })
  
  res.json({ message: "Recipient imported successfully",count:allRecipient.count});
  }
  catch(error){
    return res.status(500).json({ message: "Intenal server error" });
  }

});

export default router;
