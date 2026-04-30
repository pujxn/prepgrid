# PrepGrid

AI-powered interview prep. Paste a job description, get a tailored set of interview questions, practice your answers, and receive structured feedback.

## Features

- **Question generation** — analyzes a job description and generates 12–15 questions grouped into Technical, Behavioral, and Role-specific categories
- **Answer practice** — type your answer to any question in a focused, distraction-free editor
- **AI evaluation** — get a score out of 10, 2–3 strengths, 2–3 weaknesses, and a suggested better answer
- **Session persistence** — move between questions freely without losing your answers

## Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- TanStack Query
- Groq API (`llama-3.3-70b-versatile`) via the OpenAI-compatible client

## Getting started

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the project root:

```
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Get a free API key at [console.groq.com](https://console.groq.com).

3. Start the dev server:

```bash
npm run dev
```
