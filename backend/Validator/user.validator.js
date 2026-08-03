import * as z from "zod"; 

export const registerValidate = z.object({
    name:z.string(),
    email:z.string().email(),
    password:z.string().min(8).max(20)
})


export const loginValidate = z.object({
    email:z.string().email(),
    password:z.string().min(8).max(20)
})



