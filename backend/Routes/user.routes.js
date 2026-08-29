import express from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import validate from "../Middleware/validate.middleware.js";
import { registerValidate } from "../Validator/user.validator.js";
import { loginValidate } from "../Validator/user.validator.js";
import jwt from "jsonwebtoken";
import bcypt from "bcrypt";
const prisma = new PrismaClient();
const router = express.Router();

router.post("/register", validate(registerValidate), async (req, res) => {
  try {
    let { name, email, password } = req.body;
    let checkemail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (checkemail) {
      return res.status(403).json("Email already exist try to login");
    }
    const hashedPassword = await bcypt.hash(password, 10);
    const userdata = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    const token = jwt.sign({ id: userdata.id }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.json(userdata);
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.post("/login", validate(loginValidate), async (req, res) => {
  try {
    let { email, password } = req.body;
    const checkemail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!checkemail) {
      return res.status(401).json("Email or Password in invalid");
    }
    const checkpassword = await bcypt.compare(password, checkemail.password);
    if (!checkpassword) {
      return res.status(401).json("Email or Password in invalid");
    }
    const token = jwt.sign({ id: checkemail.id }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    return res.status(200).json("login successfully");
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  return res.status(200).json("logout sucessfully");
});

// router.get("/users",async(req,res)=>{
//     const data = await prisma.user.findMany({
//         select:{
//           name:true,
//           email:true
//         }
//     })
//     res.json(data)
// })

// router.get("/users",async(req,res)=>{
//     const id = req.query.id
//     const data = await prisma.user.findUnique({
//         where:{
//             id:Number(id)
//         },select:{
//             name:true
//         }
//     })
//     res.json(data)
// })

// router.put("/users/:id",async(req,res)=>{
//     let {id} = req.params
//     const updateddata  = await prisma.user.update({
//         where:{
//             id:Number(id)
//         },
//         data:{
//             name:"sudeep"
//         }
//     })
//     res.json(updateddata)
// })

// router.delete("/users/:id",async(req,res)=>{
//     let {id} = req.params
//     const updateddata  = awai prisma.user.delete({
//         where:{
//             id:Number(id)
//         }
//     })
//     res.json(updateddata)
// })

export default router;
