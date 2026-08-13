import Groq from "groq-sdk"
const groq = new Groq({
    apiKey:process.env.GROQ_API_KEY
})

export async function generateEmail(prompt){
    const response =  await groq.chat.completions.create({
        model:"llama-3.1-8b-instant",
        messages:[
            {
                role:"user",
                content:`generate cold email to seeking the job oppertunites using this context ${prompt}`
            }
        ]
    })
    return response.choices[0].message.content;
}


