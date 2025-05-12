# Dynamic Interview Assistant

A Next.js application that uses AI to conduct personalized job interviews based on job descriptions and candidate CVs, with comprehensive scoring and analysis.

## Features

- Upload job descriptions and candidate CVs
- Generate personalized interview questions
- Conduct dynamic interviews with follow-up questions
- Track response times for each question
- Provide comprehensive scoring and analysis
- Analyze resume match against job requirements

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- GROQ AI integration
- Vercel deployment

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- GROQ API key

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
