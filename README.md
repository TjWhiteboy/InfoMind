# 🧠 Infomind

> **"I can't go back to reading news the old way."**

An AI-native news experience built for the **Economic Times Gen AI Hackathon 2026**. Infomind transforms how people consume business news — with personalized feeds, AI-powered summaries, real-time chat about articles, and full Tamil language support.

---

## 🌐 Live Demo

> 🚀 **[https://infomind-eight.vercel.app/](https://infomind-eight.vercel.app/)**

Click the link above to access the live deployed version of Infomind. No installation needed — open it in any browser.

---

## 📌 Table of Contents

- [Live Demo](#live-demo)
- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [User Flow](#user-flow)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Team](#team)

---

## 📖 About the Project

Business news in 2026 is still delivered like it's 2005 — static text articles, one-size-fits-all homepage, same format for everyone.

**Infomind** solves this by giving every user a personalized, AI-powered news experience based on their profession:

| Persona | Focus |
|---|---|
| 📈 Investor | Markets, finance, economy, stocks |
| 🚀 Founder | Startups, funding, tech, innovation |
| 🎓 Student | Science, education, research, discoveries |
| 💼 Professional | Business, policy, corporate, governance |

---

## ✨ Features

### 🔴 Must Have
- **Persona-based news feed** — different news for different professions
- **Category filter** — All, Markets, Startups, Economy, Tech, Policy, Business
- **AI Summary** — 4-5 bullet points from any article in seconds
- **Why It Matters** — persona-aware real-world impact analysis
- **Chat with article** — ask any question, get AI answers based on the article

### 🟡 Should Have
- **Sentiment badges** — 🟢 Positive / 🔴 Negative / 🟡 Neutral on every card
- **News Navigator** — select 3-5 articles, get one unified AI briefing
- **Saved articles** — bookmark articles to a personal saved feed

### 🟢 Nice to Have
- **What to Watch Next** — AI predicts 3 follow-up stories to track
- **Tamil language support** — full vernacular experience (EN / தமிழ்)

### ⭐ Wow Factor
- **"Old Way vs AI Way" toggle** — instantly shows judges the contrast between raw article text and the full AI experience

---

## 🛠 Tech Stack

### Frontend (Member 1)
| Tool | Purpose |
|---|---|
| React + Vite | UI framework |
| Tailwind CSS | Styling |
| React Router | Page navigation |
| Axios | API calls |

### Backend (Member 2)
| Tool | Purpose |
|---|---|
| Node.js + Express | Web server |
| Axios | NewsAPI + OpenAI calls |
| dotenv | Environment variable management |
| cors | Cross-origin requests |
| nodemon | Dev auto-restart |

### APIs
| API | Purpose |
|---|---|
| NewsAPI | Fetching live Indian business news |
| OpenAI (gpt-4o-mini) | All AI features — summary, impact, chat, sentiment |

---

## 📁 Project Structure

```
infomind-backend/
├── controllers/
│   ├── newsController.js      # Fetches + caches news from NewsAPI
│   └── aiController.js        # Handles all AI endpoint logic
├── middleware/
│   └── errorHandler.js        # Global error handler
├── prompts/
│   └── prompts.js             # All AI prompt templates
├── routes/
│   ├── newsRoutes.js          # GET /api/news
│   └── aiRoutes.js            # POST /api/summary, /impact, /chat, etc.
├── services/
│   └── aiService.js           # Single OpenAI API call function
├── .env                       # API keys (not committed)
├── .gitignore
├── package.json
└── server.js                  # Entry point
```

---

## 🔄 User Flow

```
START
  │
  ▼
Open Infomind → Register / Login (Enter details + Profession)
  │
  ▼
JWT Authentication → Home Page (All News)
  │
  ├──→ Select Category (Tech / Business / etc.) → Filtered News
  │
  └──→ Scroll Infinite Feed → More Articles Load
  │
  ▼
Click on Article → News Detail Page
  │
  ├──→ Save Article → Saved Feed Page
  │
  ├──→ Use AI Features (Summary / Chat / Impact / Watch Next)
  │         │
  │         └──→ AI Response Shown
  │
  └──→ Watch Next → Next Article Opens
  │
  ▼
My Feed Page (Profession-based personalized news)
  │
  ▼
Profile Page → Update Info / Upload Photo / Delete Account
  │
  ▼
Logout → END
```

---

## 📡 API Endpoints

### News

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| GET | `/api/news?persona=investor&category=business` | Fetch news filtered by persona and category |

### AI Features

| Method | Endpoint | Input | Output |
|---|---|---|---|
| POST | `/api/summary` | `{ content, lang }` | `{ bullets[] }` |
| POST | `/api/impact` | `{ content, persona, lang }` | `{ impact }` |
| POST | `/api/chat` | `{ content, message, persona, lang, history[] }` | `{ reply }` |
| POST | `/api/sentiment` | `{ title, description }` | `{ sentiment, score }` |
| POST | `/api/watchnext` | `{ content }` | `{ predictions[] }` |
| POST | `/api/navigator` | `{ articles[] }` | `{ summary, insights[], questions[] }` |
| POST | `/api/translate` | `{ text, targetLang }` | `{ translatedText }` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm
- A free [NewsAPI key](https://newsapi.org/register)
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/infomind.git
cd infomind

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Fill in your API keys in .env

# 4. Start the development server
npm run dev
```

Server runs on `http://localhost:5000`

### Test the API

```bash
# Health check
curl http://localhost:5000/api/health

# Get news for investor persona
curl http://localhost:5000/api/news?persona=investor

# Summarize an article
curl -X POST http://localhost:5000/api/summary \
  -H "Content-Type: application/json" \
  -d '{"content": "Article text here...", "lang": "en"}'
```

---

## 🔑 Environment Variables

Create a `.env` file in the root of the project:

```env
NEWS_API_KEY=your_newsapi_key_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

| Variable | Where to get it |
|---|---|
| `NEWS_API_KEY` | [newsapi.org/register](https://newsapi.org/register) — free plan |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

> ⚠️ Never commit your `.env` file to GitHub. It is already added to `.gitignore`.

---

## 👥 Team

| Member | Role | Responsibilities |
|---|---|---|
| Member 1 | Frontend + UX | React UI, Pages, Components, Styling, Interactions |
| Member 2 | Backend + AI | Node.js, Express, NewsAPI, OpenAI, All AI Endpoints |

---

## 📊 Feature Priority

| Priority | Feature | Effort |
|---|---|---|
| 🔴 Must Have | Persona-based feed + category filter | Low |
| 🔴 Must Have | AI Summary + Why It Matters | Low |
| 🔴 Must Have | Chat panel per article | Medium |
| 🟡 Should Have | Sentiment badges on cards | Very Low |
| 🟡 Should Have | News Navigator | Medium |
| 🟢 Nice to Have | What to Watch Next predictions | Low |
| 🟢 Nice to Have | Tamil language toggle | Medium |
| ⭐ Wow Factor | Old Way vs AI Way toggle | Very Low |

---

## 🎯 Demo Flow for Judges

> Hit every requirement in under 3 minutes:

1. Open app → Persona selector appears → Pick **Investor**
2. See personalized business feed with sentiment badges
3. Click article → Toggle **"Old Way vs AI Way"** → Judges see the contrast immediately
4. Click **"Generate Summary"** → bullet points appear instantly
5. Click **"Why It Matters"** → investor-tailored impact shown
6. Ask a question in chat → persona-aware AI reply
7. Go back → Select 3 articles → **"Build My Briefing"** → Navigator page
8. Toggle language to **தமிழ்** → Everything switches to Tamil

---

## 📄 License

This project was built for the **Economic Times Gen AI Hackathon 2026**.

---

<p align="center">Built with ❤️ for ET Gen AI Hackathon 2026 — Infomind</p>
