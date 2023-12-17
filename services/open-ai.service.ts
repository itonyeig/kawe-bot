import OpenAI from 'openai';

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
     const prompt = `Based on the details provided for ${childAge}-year-old ${childName}, recommend suitable books from the provided African-themed Book List. For each recommendation, include a concise rationale focusing on Amamda's age, interests, and previous reading history. Ensure the recommendations are engaging and appropriate for her developmental stage. Use the 👉 symbol for each recommendation.

     - Child's Name: ${childName}
     - Age: ${childAge}
     - Order History: ${orderHistory.join(', ')}
     - Questions and Answers: ${questionsAnswers.map(qa => qa.question + ': ' + qa.answer).join('\n')}
     - Book List (Only select from these, focusing on African themes): ${bookList.join(', ')}
     
     Important: It is crucial to recommend books only from the Book List, with a focus on African themes. Where it adds personalization and relevance, include ${childName} in the rationale for the recommendations. Avoid suggesting any books not on the list Avoiding andy aditional text outside of book and concise recommendation rationale.
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