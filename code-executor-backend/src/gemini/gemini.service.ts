

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

    async  suggestCode(language:string, currentCode:string):Promise<string>{
        try {
            const model =   this.genAI.getGenerativeModel({model:"gemini-1.5-pro-002"})
            const prompt = `The user is writing code in ${language}. Here is their current code:\n\n${currentCode}\n\nThey are stuck and need help completing or improving it. Provide only the relevant code without any extra explanation.`;

            const result =  await model.generateContent(prompt)
            const responseText =  result.response.text()

            const match  =  responseText.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
            const extractCode =  match ?  match[1].trim() : responseText.trim()
            return extractCode;
            
        } catch (error) {
            console.error("Gemini API error:", error);
            return "Error generating code suggestion";
        }
    }

    
}
