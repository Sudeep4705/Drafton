

const validate = (validator)=>{
    console.log("validate hit");
    return (req,res,next)=>{
        const result  =  validator.safeParse(req.body)     
        if(result.success){
            req.body = result.data
        }else{
           return res.status(400).json(result.error.issues[0].message)
        }
        next()
    }
}

export default validate