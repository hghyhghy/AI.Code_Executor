import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ExamGeminiService {
  private genAi: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY2;
    if (!apiKey) {
      throw new Error('Google API key is not found');
    }
    this.genAi = new GoogleGenerativeAI(apiKey);
  }

  async generateExamQuestions(topic: string): Promise<any[]> {
    try {
      const model = this.genAi.getGenerativeModel({ model: 'gemini-1.5-pro-002' });

      const prompt = `
        Generate exactly **5 multiple-choice questions** for a student examination on "${topic}".
        Each question must include:
        - A **question**.
        - Four **answer choices** (A, B, C, D).
        - The **correct answer**.

        Respond **only** in JSON format:
        {
          "questions": [
            { 
              "question": "What is ...?", 
              "options": ["A", "B", "C", "D"], 
              "answer": "A" 
            },
            ...
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response.text();

      // **Sanitize response to remove markdown artifacts**
      const cleanedResponse = response.trim().replace(/```json|```/g, '');

      // **Parse JSON safely**
      const parsedData = JSON.parse(cleanedResponse);
      if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
        throw new Error('Invalid response format from Gemini API');
      }

      return parsedData.questions;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new InternalServerErrorException('Failed to generate exam questions');
    }
  }

  async evaluateAnswers(questions: any[], studentAnswers: any[]): Promise<number> {
    try {
      const model = this.genAi.getGenerativeModel({ model: 'gemini-1.5-pro-002' });

      const prompt = `
        Evaluate the following student's answers based on the correct solutions.
        Return only a JSON response with a **"score"** (number of correct answers out of 5).

        Questions: ${JSON.stringify(questions)}
        Student Answers: ${JSON.stringify(studentAnswers)}

        Respond in this exact format:
        {
          "score": 4
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response.text();

      // **Sanitize response**
      const cleanedResponse = response.trim().replace(/```json|```/g, '');

      // **Parse JSON safely**
      const { score } = JSON.parse(cleanedResponse);

      if (typeof score !== 'number' || score < 0 || score > 5) {
        throw new Error('Invalid score format received');
      }

      return score;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new InternalServerErrorException('Failed to evaluate exam answers');
    }
  }
}
