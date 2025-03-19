import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "your-api-key-here" });

// Generate questions based on a subject and topic
export async function generateQuestions(subject: string, topic: string, difficulty: string = "medium", count: number = 5): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert Romanian Bacalaureat exam tutor. Generate ${count} multiple-choice questions about ${topic} for the ${subject} subject. The difficulty level should be ${difficulty}. Each question should have 4 options with only one correct answer. Format your response as a JSON array where each question is an object with: "question", "options" (array of 4 strings), "correctAnswer" (index 0-3), and "explanation".`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [];
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions. Please try again later.");
  }
}

// Generate an explanation for a particular concept
export async function generateExplanation(subject: string, concept: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert Romanian Bacalaureat exam tutor. Provide a clear, concise explanation of the concept, with examples relevant to the Romanian curriculum."
        },
        {
          role: "user",
          content: `Please explain the concept of "${concept}" in the subject of ${subject}, as it relates to the Romanian Bacalaureat exam.`
        }
      ]
    });

    return response.choices[0].message.content || "No explanation available.";
  } catch (error) {
    console.error("Error generating explanation:", error);
    return "Failed to generate an explanation. Please try again later.";
  }
}

// Analyze a student's answer to a free-response question
export async function analyzeAnswer(question: string, studentAnswer: string, subject: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert Romanian Bacalaureat exam grader. Analyze the student's answer and provide feedback based on the Romanian grading criteria for the Bacalaureat exam."
        },
        {
          role: "user",
          content: `Question: ${question}\n\nStudent's Answer: ${studentAnswer}\n\nSubject: ${subject}\n\nPlease analyze this answer and provide: (1) a score out of 10, (2) specific feedback on strengths, (3) areas for improvement, and (4) a model answer that would receive full marks. Return the response as a JSON object.`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error analyzing answer:", error);
    return {
      score: 0,
      feedback: "Failed to analyze your answer. Please try again later.",
      strengths: [],
      improvements: [],
      modelAnswer: ""
    };
  }
}

// Generate personalized study recommendations 
export async function generateStudyPlan(userId: number, userPerformance: any): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert Romanian Bacalaureat exam tutor. Generate a personalized study plan based on the student's performance data. The plan should include specific topics to focus on and time recommendations."
        },
        {
          role: "user",
          content: `Here is the student's performance data: ${JSON.stringify(userPerformance)}. Generate a study plan for today with 4 specific tasks. Return as a JSON object with an array of tasks, each with a title, description, duration (in minutes), priority (boolean), and whether it's recommended based on weak areas (boolean).`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating study plan:", error);
    return {
      tasks: [
        {
          title: "Review your weakest subject",
          description: "Focus on topics you scored lowest on in your recent tests",
          duration: 30,
          priority: true,
          recommended: true
        }
      ]
    };
  }
}

// Process chat messages from the AI assistant
export async function processAiChat(messages: any[]): Promise<string> {
  try {
    const formattedMessages = messages.map(msg => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.content
    }));

    // Add system message at the beginning
    formattedMessages.unshift({
      role: "system",
      content: "You are a helpful AI assistant for Romanian Bacalaureat exam preparation. Provide concise, accurate information about Romanian curriculum subjects including Romanian Language and Literature, Mathematics, English, Biology, Chemistry, Physics, History, and Geography. When explaining concepts, use examples relevant to the Romanian educational system. Keep explanations clear and appropriate for high school students."
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: formattedMessages
    });

    return response.choices[0].message.content || "I don't have an answer for that right now.";
  } catch (error) {
    console.error("Error processing AI chat:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
}
