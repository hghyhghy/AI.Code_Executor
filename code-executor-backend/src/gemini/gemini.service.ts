

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiService {
    private genAI:GoogleGenerativeAI;

    constructor(){
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not defined');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async  executeCode(code:string,language:string){
        try {
            
            const model  =  this.genAI.getGenerativeModel({model:"gemini-1.5-pro-002"})
            const prompt =  `Execute the following ${language} code and provide the output:\n\n${code}`;
            const result  =  await model.generateContent(prompt)
            const response  =  await result.response
            let output  = response.text()
            output = output.replace(/```[\s\S]*?\n([\s\S]*?)\n```/, '$1').trim()
            return output
        } catch (error) {
            console.error("Gemini API error",error)
            return 'Error executing code'
            
        }
    }

    
}
