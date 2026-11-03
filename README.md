# 🚀 OpSauce

**Never Miss the Opportunity Meant for You.**

OpSauce is a premium, AI-powered student opportunity discovery and application-assistance platform. It helps students find scholarships, internships, fellowships, and competitive exams, and provides an intelligent assistant to help them prepare high-quality applications.

---

## ✨ Key Features

### 🔍 Smart Discovery
- **AI-Powered Recommendations**: A personalisation engine that ranks opportunities based on your field of study, interests, and career goals.
- **Eligibility Analysis**: Instant, honest assessment of whether you meet the stated criteria for any opportunity.
- **Opportunity Catalog**: A structured database of diverse opportunities with real-time deadline tracking.

### ✍️ AI Application Assistant (**NovaMind 5.8**)
- **On-Device AI**: Powered by Ollama, ensuring your personal data never leaves your machine.
- **Smart Drafting**: Generate honest, profile-grounded drafts for SOPs and motivation letters.
- **Readiness Check**: A document vault analysis that tells you exactly what's missing (e.g., "Upload a verified Aadhaar card").
- **Application Reviewer**: An AI audit of your final draft with a Readiness Score (0-100) and actionable improvement tips.

### 🛠️ Student Vault
- **Document Management**: Securely store and verify identity proofs, marksheets, and certificates.
- **Personalised Profile**: A detailed academic and professional profile that powers the AI's accuracy.
- **Application Pipeline**: Track your progress from "Preparing" $\rightarrow$ "Ready" $\rightarrow$ "Submitted" $\rightarrow$ "Result".

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS.
- **Animations**: Framer Motion for premium micro-interactions.
- **Database**: Prisma ORM with SQLite (Development) / PostgreSQL (Production).
- **Authentication**: Secure JWT-based sessions via `jose` and `bcryptjs`.
- **AI Engine**: Ollama (OpenAI-compatible API) running local LLMs (e.g., `llama3.1`).

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [Ollama](https://ollama.com/) (For AI features)

### 2. Installation
\`\`\`bash
# Clone the repository
git clone <repo-url>
cd "OpSauce"

# Install dependencies
npm install
\`\`\`

### 3. AI Setup (Optional)
To enable NovaMind 5.8, ensure Ollama is running and pull the model:
\`\`\`bash
ollama pull llama3.1
\`\`\`

### 4. Environment Configuration
Create a \`.env\` file in the root directory:
\`\`\`env
DATABASE_URL="file:./dev.db"
AI_ENABLED=true
OLLAMA_BASE_URL="http://localhost:11434"
AI_MODEL="llama3.1"
AI_DISPLAY_NAME="NovaMind 5.8"
\`\`\`

### 5. Launch
\`\`\`bash
# Initialize database
npx prisma migrate dev
npm run seed

# Start development server
npm run dev
\`\`\`

---

## 📐 Architecture

### AI Logic Flow
The system uses a **Transparent Fallback Architecture**:
1. **AI Layer**: Tries to call the local Ollama model with structured JSON prompts.
2. **Validation Layer**: Zod validates the AI output to ensure it matches the required schema.
3. **Heuristic Layer**: If the AI is offline, slow, or returns invalid data, the system seamlessly switches to a rule-based heuristic in \`src/lib/ai.ts\`.

### Data Flow
- **User $\rightarrow$ Server Action $\rightarrow$ Prisma $\rightarrow$ Database**.
- All AI operations are performed on the server side via server actions to keep API keys (if any) and logic secure.

---

## 👥 Developers
- **Prakrati Jain**

© 2026 OpSauce. All rights reserved.
