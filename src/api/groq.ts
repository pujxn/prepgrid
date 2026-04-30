import OpenAI from 'openai'
import type { Question, Evaluation } from '@/types'

export const IS_MOCK = !import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY === 'your_groq_api_key_here'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_GROQ_API_KEY ?? 'mock',
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true,
})

const MODEL = 'llama-3.3-70b-versatile'

const MOCK_QUESTIONS: Question[] = [
  { id: '1', category: 'Technical', text: 'Explain the difference between a process and a thread, and when you would use one over the other.' },
  { id: '2', category: 'Technical', text: 'How does garbage collection work in a language of your choice, and what are common pitfalls?' },
  { id: '3', category: 'Technical', text: 'Walk me through how you would design a URL shortener like bit.ly.' },
  { id: '4', category: 'Technical', text: 'What is the difference between SQL and NoSQL databases, and how do you decide which to use?' },
  { id: '5', category: 'Technical', text: 'Describe how you would optimize a slow database query.' },
  { id: '6', category: 'Behavioral', text: 'Tell me about a time you disagreed with a technical decision made by your team. How did you handle it?' },
  { id: '7', category: 'Behavioral', text: 'Describe a situation where you had to learn a new technology quickly under pressure.' },
  { id: '8', category: 'Behavioral', text: 'Give me an example of a project where something went wrong and how you recovered.' },
  { id: '9', category: 'Behavioral', text: 'How do you prioritize when you have multiple deadlines competing for your time?' },
  { id: '10', category: 'Role-specific', text: 'What experience do you have with CI/CD pipelines, and what tools have you used?' },
  { id: '11', category: 'Role-specific', text: 'How have you approached code reviews — both giving and receiving feedback?' },
  { id: '12', category: 'Role-specific', text: 'Describe your experience working in an agile team. What worked well and what didn\'t?' },
  { id: '13', category: 'Role-specific', text: 'What does good documentation look like to you, and how do you make time for it?' },
]

const MOCK_FOLLOW_UP_QUESTION =
  "That's a good point — can you walk me through a specific example where you had to make a difficult trade-off, and how you communicated the decision to stakeholders?"

const MOCK_FOLLOW_UP_FEEDBACK =
  "Good instinct to ground your answer in a concrete example. To strengthen this further, try to quantify the impact — for instance, 'we shipped two weeks early but spent three sprints on cleanup' gives the interviewer a clearer picture of the trade-off you navigated and shows self-awareness about consequences."

const MOCK_EVALUATION: Evaluation = {
  score: 7,
  strengths: [
    'Clear and structured response that directly addresses the question.',
    'Good use of a concrete example to illustrate your point.',
  ],
  weaknesses: [
    'Could elaborate more on the outcome and what you learned from the experience.',
    'Missing quantifiable impact — numbers or metrics would strengthen the answer.',
  ],
  suggestedAnswer:
    'A strong answer would start with a brief context-setting sentence, describe the specific challenge using the STAR method (Situation, Task, Action, Result), quantify the outcome where possible, and close with a reflection on what you learned or would do differently.',
}

export async function generateQuestions(jobDescription: string): Promise<Question[]> {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 800))
    return MOCK_QUESTIONS
  }

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

  let parsed: { questions: Question[] }
  try {
    parsed = JSON.parse(content) as { questions: Question[] }
  } catch {
    throw new Error('The AI returned an unexpected response. Please try again.')
  }

  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error('No questions were returned. Try a more detailed job description.')
  }

  return parsed.questions
}

export async function evaluateAnswer(
  question: string,
  answer: string,
): Promise<Evaluation> {
  if (IS_MOCK) {
    void question
    void answer
    await new Promise((r) => setTimeout(r, 1000))
    return MOCK_EVALUATION
  }

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

  let parsed: Evaluation
  try {
    parsed = JSON.parse(content) as Evaluation
  } catch {
    throw new Error('The AI returned an unexpected response. Please try again.')
  }

  if (typeof parsed.score !== 'number' || !Array.isArray(parsed.strengths) || !Array.isArray(parsed.weaknesses)) {
    throw new Error('Evaluation response was malformed. Please try again.')
  }

  return parsed
}

export async function generateFollowUp(question: string, answer: string): Promise<string> {
  if (IS_MOCK) {
    void question
    void answer
    await new Promise((r) => setTimeout(r, 700))
    return MOCK_FOLLOW_UP_QUESTION
  }

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an interviewer conducting a live interview. Based on the candidate's answer, generate one sharp follow-up question that probes deeper — targeting a gap, an assumption, or an area they glossed over. Return only the follow-up question as plain text. No preamble, no explanation.`,
      },
      {
        role: 'user',
        content: `Original question: ${question}\n\nCandidate's answer: ${answer}`,
      },
    ],
    temperature: 0.7,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from API')
  return content.trim()
}

export async function evaluateFollowUpAnswer(
  originalQuestion: string,
  followUpQuestion: string,
  followUpAnswer: string,
): Promise<string> {
  if (IS_MOCK) {
    void originalQuestion
    void followUpQuestion
    void followUpAnswer
    await new Promise((r) => setTimeout(r, 800))
    return MOCK_FOLLOW_UP_FEEDBACK
  }

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an interview coach giving concise feedback on a follow-up answer. Write 2-3 sentences of coaching: what worked, what to sharpen. Be direct and specific. Return plain text only.`,
      },
      {
        role: 'user',
        content: `Original question: ${originalQuestion}\nFollow-up question: ${followUpQuestion}\nCandidate's answer: ${followUpAnswer}`,
      },
    ],
    temperature: 0.5,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from API')
  return content.trim()
}
