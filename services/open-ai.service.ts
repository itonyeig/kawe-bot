import OpenAI from 'openai';
import { Book } from "../interface/kawe.interface";

export interface QuestionsAnswers {
    question: string;
    answer: string;
}[]

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

export  async function getBookRecommendations(childAge: string | number, bookList: string[], orderHistory: string[], questionsAnswers: QuestionsAnswers[], childName: string): Promise<string> {
    
  
    try {
     // Prepare the prompt for OpenAI
     const prompt = `Based on the specific details provided, recommend books for a child, ensuring that each recommendation comes exclusively from the provided Book List, which primarily consists of African-themed books. Include a concise reason for each recommendation, focusing on the child's age, previous order history, and their questions and answers. Where appropriate, use the child's name, ${childName}, in the reasoning to create a more personalized response. Use the 👉 symbol for each recommendation.

     - Child's Name: ${childName}
     - Age: ${childAge}
     - Order History: ${orderHistory.join(', ')}
     - Questions and Answers: ${questionsAnswers.map(qa => qa.question + ': ' + qa.answer).join('\n')}
     - Book List (Only select from these, focusing on African themes): ${bookList.join(', ')}
     
     Important: It is crucial to recommend books only from the Book List, with a focus on African themes. Where it adds personalization and relevance, include ${childName} in the rationale for the recommendations. Avoid suggesting any books not on the list.

     Recommendations: `;

        console.log ('gpt prompt ', prompt)

        console.log('\n\n:::waiting for response from gpt:::')
    
      const response = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-3.5-turbo",
    });
    const recommendation = response.choices[0].message.content;
    console.log("gpt response :", recommendation)
      return recommendation as string
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      throw error;
    }
  }