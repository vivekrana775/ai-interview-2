# AI Interview System

![System Architecture]

A Next.js application that automates technical interviews by generating context-aware questions from job descriptions and candidate CVs, with real-time evaluation and scoring.

## System Architecture

     UI as Frontend (Next.js)
     API as Serverless API
     AI as Groq (Llama3-70b)
     DB as LocalStorage

    UI->>API: Submit JD + CV
    API->>AI: Generate first question
    AI-->>UI: Display Q1
    loop 5 Questions
        UI->>API: Send answer + timing
        API->>AI: Generate follow-up
        AI-->>UI: Next question
    end
    UI->>API: Request evaluation
    API->>AI: Full analysis
    AI-->>UI: Return scores + feedback

### Installation

1. Clone the repository:

\`\`\`bash
git clone git@github.com:vivekrana775/ai-interview-2.git
cd ai-interview-2
\`\`\`

2. Install dependencies:

\`\`\`bash
yarn
\`\`\`

3. Create a `.env` file in the root directory with your GROQ API key:

\`\`\`
GROQ_API_KEY = your_groq_api_key_here
BACKEND_URL = https://codedogsapi.vercel.app
\`\`\`

4. Run the development server:

\`\`\`bash
yarn run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

Run the test suite with:

\`\`\`bash
yarn test
\`\`\`

## Project Structure

\`\`\`
/
├── app/ # Next.js App Router
│ ├── api/ # API routes
│ ├── interview/ # Interview pages
│ └── ...
├── components/ # React components
├── lib/ # Utility functions
│ └── ai.ts # AI integration functions
└── ...
\`\`\`

## AI Integration

The application uses GROQ's AI models for:

1. Generating personalized interview questions
2. Conducting the interview with follow-up questions
3. Analyzing resumes against job descriptions
4. Scoring interviews based on responses and timing data
