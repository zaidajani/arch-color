# ⚡️ BrandForge AI — AI Logo Branding Suite

BrandForge AI is a hackathon-ready web application that generates professional logos with brand color psychology insights and scalable design outputs.

## 🚀 Tech Stack

- **Framework**: Next.js 15+ (App Router, TypeScript)
- **AI**: OpenAI (GPT-4o for brand analysis, DALL-E 3 for logo generation)
- **Styling**: Vanilla CSS with Premium Design Tokens
- **Animations**: Framer Motion & Canvas Confetti
- **Icons**: Lucide React

## 🛠️ Setup Instructions

1.  **Clone & Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Configuration**:
    Create a `.env.local` file in the root directory and add your OpenAI API key:
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    ```

3.  **Run Locally**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to start forging IDs.

## ✨ Core Features

1.  **Brand Input Form**: Collect brand name, industry, personality, and preferred vibes.
2.  **AI Logo Generation**: Generates clean, minimalist, vector-style logos using DALL-E 3.
3.  **Color Psychology Panel**: Instant analysis of the brand's primary and secondary colors with their psychological meanings.
4.  **Premium UI**: Glassmorphic cards, smooth loading states, and responsive design.
5.  **Export Options**: High-resolution PNG downloads for immediate use.

## 🎨 Design Philosophy

- **Scalability**: All logos are designed with safe-zones and minimalist elements.
- **Modern Aesthetics**: Utilizes `Outfit` and `Plus Jakarta Sans` for a high-end feel.
- **Context Aware**: GPT-4o analyzes the industry context before prompting DALL-E to ensure relevant symbolism.

---

Built with ❤️ for the Hackathon.
