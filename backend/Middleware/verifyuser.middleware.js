import jwt from "jsonwebtoken"

const verifyUser = (req,res,next)=>{
    try{
            const token = req.cookies.token
    if(!token){
        return res.status(400).json("Unauthorized access")
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    req.user=decoded
    next()
    }
    catch(error){
        console.log(error);
        return res.status(400).json("something wrong")
    }


}


export default verifyUser