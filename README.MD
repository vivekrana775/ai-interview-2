# AI Interview System

![System Architecture](https://i.imgur.com/JyQ8X9E.png)

A Next.js application that automates technical interviews by generating context-aware questions from job descriptions and candidate CVs, with real-time evaluation and scoring.

## Key Features

- 🎯 **JD/CV-Powered Questions** - Generates technical/behavioral questions tailored to both job requirements and candidate background
- ⏱ **Timing Analytics** - Measures response times and incorporates them into scoring
- 📊 **5-Dimension Evaluation** - Scores candidates on Technical, Communication, Problem-Solving, Cultural Fit, and Responsiveness
- 🔄 **Adaptive Follow-ups** - Dynamically adjusts questions based on previous answers
- 📱 **Responsive Interface** - Works across desktop and mobile devices

## System Architecture

```mermaid
sequenceDiagram
    participant UI as Frontend (Next.js)
    participant API as Serverless API
    participant AI as Groq (Llama3-70b)
    participant DB as LocalStorage

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
git clone https://github.com/yourusername/dynamic-interview-assistant.git
cd dynamic-interview-assistant
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install

# or

yarn

# or

pnpm install
\`\`\`

3. Create a `.env.local` file in the root directory with your GROQ API key:

\`\`\`
GROQ_API_KEY=your_groq_api_key_here
\`\`\`

4. Run the development server:

\`\`\`bash
npm run dev

# or

yarn dev

# or

pnpm dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application is deployed on Vercel. You can deploy your own instance by clicking the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fdynamic-interview-assistant)

Make sure to add your GROQ API key as an environment variable in the Vercel dashboard.

## Testing

Run the test suite with:

\`\`\`bash
npm test

# or

yarn test

# or

pnpm test
\`\`\`

The test suite includes:

- Form validation tests
- AI integration tests
- Timing data capture tests
- Chat interface tests

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
├── **tests**/ # Test files
└── ...
\`\`\`

## AI Integration

The application uses GROQ's AI models for:

1. Generating personalized interview questions
2. Conducting the interview with follow-up questions
3. Analyzing resumes against job descriptions
4. Scoring interviews based on responses and timing data

See the [AI Integration Documentation](./docs/ai-integration.md) for more details.
```
