import OpenAI from 'openai'
import type { Question, Evaluation } from '@/types'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true,
})

const MODEL = 'llama-3.3-70b-versatile'

export async function generateQuestions(jobDescription: string): Promise<Question[]> {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert technical recruiter and interviewer. Your task is to analyze a job description and generate realistic interview questions.

Return ONLY valid JSON. No preamble, no markdown, no explanation. Just the JSON object.

The JSON must have this exact structure:
{
  "questions": [
    { "id": "1", "category": "Technical", "text": "..." },
    { "id": "2", "category": "Behavioral", "text": "..." },
    { "id": "3", "category": "Role-specific", "text": "..." }
  ]
}

Category must be exactly one of: "Technical", "Behavioral", "Role-specific".
Generate 12-15 questions total, distributed across all three categories.
Make the questions specific to the job description provided.`,
      },
      {
        role: 'user',
        content: `Job Description:\n\n${jobDescription}`,
      },
    ],
    temperature: 0.7,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from API')

  const parsed = JSON.parse(content) as { questions: Question[] }
  return parsed.questions
}

export async function evaluateAnswer(
  question: string,
  answer: string,
): Promise<Evaluation> {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert interview coach evaluating candidate answers.

Return ONLY valid JSON. No preamble, no markdown, no explanation. Just the JSON object.

The JSON must have this exact structure:
{
  "score": <number 1-10>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "suggestedAnswer": "A well-structured, complete answer that demonstrates the ideal response..."
}

Be honest but constructive. The score should reflect the actual quality of the answer.
Provide 2-3 strengths and 2-3 weaknesses. The suggested answer should be specific and substantive.`,
      },
      {
        role: 'user',
        content: `Interview Question: ${question}\n\nCandidate Answer: ${answer}`,
      },
    ],
    temperature: 0.5,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from API')

  return JSON.parse(content) as Evaluation
}
