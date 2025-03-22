
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
@Injectable()
export class InterviewGeminiService {

    private genAi:GoogleGenerativeAI;
    constructor(){
        const apikey=process.env.GEMINI_API_KEY1
        if(!apikey){
            throw new  Error("Api key not found")
        }
        this.genAi = new GoogleGenerativeAI(apikey)
    }

    async generateBlog(topic:string,wordLimit:number, language:string) : Promise<string>{
        try {
            
            const model =  this.genAi.getGenerativeModel({model:"gemini-1.5-pro-002"})
            const prompt = `Write a detailed and informative blog post on "${topic}" for interview preparation in **${language}**. 
            Include:
            - Key topics to focus on
            - Common interview questions related to "${topic}"
            - Expert tips and strategies for success
            - Additional resources for further study
            Ensure the blog is structured professionally with headings and paragraphs.
            The response should be within **${wordLimit} words**.`;

            const result =  await model.generateContent(prompt)
            const response = await result.response
            let blogContent =  await response.text()
            blogContent = blogContent.replace(/```[\s\S]*?\n([\s\S]*?)\n```/, '$1').trim();
            return blogContent
        } catch (error) {
            console.error("Gemini API error:", error);
            return "Error generating blog content";
        }
    }
}
